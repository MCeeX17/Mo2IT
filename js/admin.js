import { backend, configured } from './backend.js';
import { $, $$, h, say, friendly, when, waLink, chatList } from './ui.js';
import { DEFAULTS, rand } from './data.js';
import { sorted, safeImage, live } from './content.js';
import { downloadButtons } from './quotation.js';
import { SCHEMAS, editor } from './editor.js';

const login = $('#admin-login'), dash = $('#dash'), dashStatus = $('#dash-status');
const fail = err => { console.error(err); say(dashStatus, friendly(err), true); };
const offline = text => { $('#offline').hidden = false; $('#offline').replaceChildren(text); };

if (!configured) offline('Connect Firebase to turn on admin login. Follow the steps in README.md.');
else {
  login.onsubmit = e => e.preventDefault();
  const api = await backend().catch(err => { offline('Could not reach the sign-in service. Check your connection and reload the page.'); throw err; });
  let stops = [], stopChat, active, requests = [], threads = [], profiles = [], filter = 'all', tab = 'overview', openId;
  const stopAll = () => { stops.forEach(s => s()); stops = []; stopChat?.(); stopChat = active = null; };
  const status = $('.status', login);

  async function signIn(how) {
    say(status, 'Signing in…');
    try { await how(); say(status, ''); } catch (err) { say(status, friendly(err), true); }
  }
  login.onsubmit = e => { e.preventDefault(); signIn(() => api.adminLogin(login.elements.email.value, login.elements.password.value)); };
  $('#admin-google').onclick = () => signIn(() => api.adminGoogle());

  api.onUser(async user => {
    let ok = false;
    try { ok = Boolean(user) && await api.isAdmin(user.uid); } catch (err) { console.error(err); }
    stopAll(); login.hidden = ok; dash.hidden = !ok; $('#offline').hidden = true;
    if (!ok) {
      $$('[data-live]').forEach(el => el.replaceChildren());
      if (user) {                                   // signed in, but not an admin yet: show exactly what to add
        const out = h('button', { type: 'button', className: 'link', textContent: 'Sign out' }); out.onclick = () => api.logout();
        $('#offline').hidden = false;
        $('#offline').replaceChildren(h('strong', { textContent: `${user.email} is not an admin yet.` }),
          h('p', { textContent: 'In Firebase: Firestore > admins collection > Add document. Use this as the Document ID, add a field role = admin, then reload.' }),
          h('code', { textContent: user.uid }), h('br'), out);
      }
      return;
    }
    login.reset();
    stops = [
      api.watchRequests(list => { requests = list; overview(); inbox(); }, fail),
      api.watchThreads(list => { threads = list; overview(); inbox(); if (active && tab === 'inbox' && list.some(t => t.id === active && t.unread)) api.markRead(active).catch(fail); }, fail),
      api.watchProfiles(list => { profiles = list; overview(); }, fail),
      ...Object.keys(SCHEMAS).map(name => content(name))
    ];
  });
  $('#logout').onclick = () => api.logout();

  function showTab(name) {
    tab = name;
    $$('[data-tab]').forEach(x => x.ariaPressed = String(x.dataset.tab === name));
    $$('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== name);
    if (name === 'inbox' && active) api.markRead(active).catch(fail);
    inbox();
  }
  $$('[data-tab]').forEach(b => b.onclick = () => showTab(b.dataset.tab));
  $$('[data-filter]').forEach(b => b.onclick = () => {
    filter = b.dataset.filter; $$('[data-filter]').forEach(x => x.ariaPressed = String(x === b)); inbox();
  });

  // ---------- Dashboard ----------
  function overview() {
    const week = Date.now() / 1000 - 7 * 86400;
    const quotes = requests.filter(r => r.kind === 'quote');
    const stats = [
      ['Registered clients', profiles.length],
      ['Signed in, last 7 days', profiles.filter(p => p.lastLogin?.seconds > week).length],
      ['Total sign-ins', profiles.reduce((n, p) => n + (Number(p.logins) || 0), 0)],
      ['Bookings and quotes', quotes.length],
      ['Waiting for a reply', requests.filter(r => r.status === 'new').length],
      ['Unread chats', threads.filter(t => t.unread).length]];
    $('#stats').replaceChildren(...stats.map(([label, n]) => h('div', { className: 'stat' }, h('strong', { textContent: n }), h('span', { textContent: label }))));

    const counts = Object.entries(quotes.reduce((m, r) => { const k = String(r.type).startsWith('Custom') ? 'Custom' : r.type; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
    $('#demand').replaceChildren(...(counts.length ? counts.map(([k, n]) => {
      const bar = h('i'); bar.style.width = n / counts[0][1] * 100 + '%';
      return h('div', { className: 'demand' }, h('span', { textContent: k }), h('div', {}, bar), h('b', { textContent: n }));
    }) : [h('p', { className: 'hint', textContent: 'No bookings yet.' })]));

    $('#bookings').replaceChildren(...(quotes.length ? [table(['Booked', 'Client', 'Asking for', 'Estimate', 'Status'], quotes.map(r => {
      const view = h('button', { type: 'button', className: 'link', textContent: r.name });
      view.onclick = () => { showTab('inbox'); openRequest(r.id); };
      return [when(r.createdAt), h('div', {}, view, h('small', { textContent: `${r.phone}, ${r.email}` })),
        h('div', {}, r.type, h('small', { textContent: (r.services || []).join(', ') })), r.estimate || 'To be quoted', statusPicker(r)];
    }))] : [h('p', { className: 'hint', textContent: 'Booked clients show up here.' })]));

    const clients = [...profiles].sort((a, b) => (b.lastLogin?.seconds || 0) - (a.lastLogin?.seconds || 0));
    $('#clients').replaceChildren(...(clients.length ? [table(['Client', 'Email', 'Mobile', 'Signs in with', 'Sign-ins', 'Last sign-in'],
      clients.map(p => [p.name || '(no name)', p.email, p.phone || '', p.provider === 'google.com' ? 'Google' : 'Email', p.logins || 0, when(p.lastLogin)]))]
      : [h('p', { className: 'hint', textContent: 'No client profiles yet.' })]));
  }
  function table(head, rows) {
    return h('div', { className: 'scroll' }, h('table', {},
      h('thead', {}, h('tr', {}, ...head.map(t => h('th', { textContent: t })))),
      h('tbody', {}, ...rows.map(r => h('tr', {}, ...r.map(c => h('td', {}, c)))))));
  }
  function statusPicker(r) {
    const s = h('select', { ariaLabel: 'Status for ' + r.name }, ...['new', 'in progress', 'done'].map(v => h('option', { value: v, textContent: v })));
    s.value = r.status; s.onchange = () => api.setStatus(r.id, s.value).catch(fail); return s;
  }

  // ---------- Inbox: quotes, contact messages and client chats ----------
  function inbox() {
    const unread = requests.filter(r => r.status === 'new').length + threads.filter(t => t.unread).length;
    $('#unread-count').textContent = unread ? `(${unread})` : '';
    const all = [
      ...requests.map(r => ({ id: r.id, kind: r.kind === 'quote' ? 'quote' : 'contact', title: r.name, sub: r.kind === 'quote' ? `Quote: ${r.type}` : r.message, time: r.createdAt, fresh: r.status === 'new' })),
      ...threads.map(t => ({ id: t.id, kind: 'chat', title: t.name || t.email || 'Client', sub: t.lastMessage, time: t.updatedAt, fresh: t.unread }))
    ].filter(x => filter === 'all' || x.kind === filter).sort((a, b) => (b.time?.seconds || 0) - (a.time?.seconds || 0));
    const names = { quote: 'Quote', contact: 'Message', chat: 'Chat' };
    $('#items').replaceChildren(...(all.length ? all.map(x => {
      const b = h('button', { type: 'button', className: 'thread' + (x.fresh ? ' new' : ''), ariaPressed: String(x.id === active || x.id === openId) },
        h('strong', { textContent: x.title }), h('span', { textContent: String(x.sub || '').slice(0, 90) }), h('small', { textContent: `${names[x.kind]}, ${when(x.time)}` }));
      b.onclick = () => x.kind === 'chat' ? openChat(x.id) : openRequest(x.id);
      return b;
    }) : [h('p', { className: 'hint', textContent: 'Nothing here yet.' })]));
    if (openId) detail(requests.find(r => r.id === openId));
  }
  function openRequest(id) { stopChat?.(); stopChat = active = null; openId = id; $('#chatbox').hidden = true; $('#detail').hidden = false; inbox(); }
  function detail(r) {
    if (!r) { openId = null; return $('#detail').replaceChildren(h('p', { className: 'hint', textContent: 'Select an item to read it.' })); }
    const remove = h('button', { className: 'link', type: 'button', textContent: 'Delete' });
    remove.onclick = () => confirm(`Delete the request from ${r.name}? This cannot be undone.`) && api.deleteRequest(r.id).catch(fail);
    $('#detail').replaceChildren(h('article', { className: 'card' },
      h('h3', { textContent: `${r.name}: ${r.type}` }),
      h('p', { className: 'hint', textContent: [r.ref, when(r.createdAt), r.uid ? 'has a client profile' : ''].filter(Boolean).join(', ') }),
      h('p', { className: 'body', textContent: r.message }),
      r.services?.length ? h('p', { textContent: 'Services: ' + r.services.join(', ') }) : null,
      r.estimate ? h('p', { textContent: 'Estimate shown: ' + r.estimate }) : null,
      r.date ? h('p', { textContent: 'Preferred call date: ' + r.date }) : null,
      h('div', { className: 'row' },
        h('a', { href: 'mailto:' + encodeURIComponent(r.email).replace('%40', '@'), textContent: r.email }),
        h('a', { href: waLink(r.phone), target: '_blank', rel: 'noopener', textContent: 'WhatsApp ' + r.phone }),
        statusPicker(r), remove),
      r.kind === 'quote' ? downloadButtons(r) : null));
  }
  function openChat(id) {
    const t = threads.find(x => x.id === id) || {};
    stopChat?.(); active = id; openId = null; $('#detail').hidden = true; $('#chatbox').hidden = false;
    $('#who').textContent = [t.name, t.email, t.phone].filter(Boolean).join(', '); $('#text').value = '';
    stopChat = api.watchMessages(id, list => chatList($('#chat'), list, 'admin'), fail);
    if (t.unread) api.markRead(id).catch(fail);
    inbox();
  }
  $('#send').onsubmit = async e => {
    e.preventDefault();
    const box = $('#text'), text = box.value.trim(), to = active; if (!text || !to) return;
    box.value = '';
    try { await api.sendMessage(to, text, 'admin'); } catch (err) { box.value = text; fail(err); }
  };

  // ---------- Content managers ----------
  function content(name) {
    const panel = $(`[data-panel="${name}"] [data-live]`), schema = SCHEMAS[name];
    let list = [];
    const form = h('div'), rows = h('div'), add = h('button', { type: 'button', className: 'btn', textContent: 'Add ' + schema.one });
    const edit = item => {
      form.replaceChildren(editor(schema, item, list, {
        save: async data => {
          // The first save on an empty list also copies the starter items, so they do not vanish from the site.
          if (!list.length && DEFAULTS[name].length) await api.seed(name, DEFAULTS[name]);
          await api.save(name, item?.id, item ? data : { ...data, createdAt: { seconds: Math.floor(Date.now() / 1000) } });
          form.replaceChildren(); say(dashStatus, 'Saved. The website now shows your change.');
        },
        cancel: () => form.replaceChildren()
      }));
      form.scrollIntoView({ block: 'nearest' }); form.querySelector('input,textarea')?.focus();
    };
    add.onclick = () => edit(null);
    panel.replaceChildren(h('p', { className: 'hint', textContent: schema.help }), add, form, rows);
    return api.watchList(name, data => {
      list = sorted(data);
      const starter = !list.length && DEFAULTS[name].length;
      const shown = starter ? DEFAULTS[name] : list;
      rows.replaceChildren(starter ? h('p', { className: 'notice', textContent: 'The website is showing starter content. Edit or add anything to save it to your database.' }) : '',
        ...(shown.length ? shown.map(item => {
          const change = h('button', { type: 'button', className: 'btn line', textContent: 'Edit' });
          change.onclick = () => edit(item);
          const remove = h('button', { type: 'button', className: 'link', textContent: 'Delete' });
          remove.onclick = async () => {
            if (!confirm(`Delete “${item[schema.title]}”? This cannot be undone.`)) return;
            try { if (starter) await api.seed(name, DEFAULTS[name]); await api.remove(name, item.id); say(dashStatus, 'Deleted.'); } catch (err) { fail(err); }
          };
          return h('div', { className: 'item' },
            safeImage(item.image) ? h('img', { src: item.image, alt: '' }) : null,
            h('div', {}, h('strong', { textContent: item[schema.title] }),
              h('span', { textContent: name === 'services' ? `${item.category}: ${rand(item.price)}${item.monthly ? ' a month' : ''}`
                : name === 'promotions' ? (live(item) ? 'Showing on the home page' : 'Hidden (switched off or ended)') : String(item.text || item.a || '').slice(0, 110) })),
            change, remove);
        }) : [h('p', { className: 'hint', textContent: `No ${name} yet.` })]));
    }, fail);
  }
}
