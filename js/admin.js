import { backend, configured } from './backend.js';
import { $, $$, h, say, friendly, when, waLink, chatList } from './ui.js';

const login = $('#admin-login'), dash = $('#dash'), dashStatus = $('#dash-status');
const fail = err => { console.error(err); say(dashStatus, friendly(err), true); };

if (!configured) {
  $('#offline').hidden = false;
  $('#offline').textContent = 'Connect Firebase to turn on admin login. Follow the steps in README.md.';
} else {
  login.onsubmit = e => e.preventDefault();
  const api = await backend().catch(err => {
    $('#offline').hidden = false; $('#offline').textContent = 'Could not reach the sign-in service. Check your connection and reload the page.';
    throw err;
  });
  let stops = [], stopChat, active;
  const stopAll = () => { stops.forEach(s => s()); stops = []; stopChat?.(); stopChat = active = null; };

  login.onsubmit = async e => {
    e.preventDefault(); say($('.status', login), 'Signing in…');
    try {
      const { user } = await api.login(login.elements.email.value, login.elements.password.value);
      if (!await api.isAdmin(user.uid)) { await api.logout(); return say($('.status', login), 'This account is not an admin.', true); }
      login.reset(); say($('.status', login), '');
    } catch (err) { say($('.status', login), friendly(err), true); }
  };
  api.onUser(async user => {
    let ok = false;
    try { ok = Boolean(user) && await api.isAdmin(user.uid); } catch (err) { console.error(err); }
    stopAll(); login.hidden = ok; dash.hidden = !ok;
    if (!ok) { for (const id of ['#inbox', '#threads', '#chat']) $(id).replaceChildren(); return; }
    stops = [api.watchRequests(showRequests, fail), api.watchThreads(showThreads, fail)];
  });
  $('#logout').onclick = () => api.logout();
  $$('[data-tab]').forEach(b => b.onclick = () => {
    $$('[data-tab]').forEach(x => x.ariaPressed = String(x === b));
    for (const id of ['inbox', 'chats']) $('#' + id).hidden = id !== b.dataset.tab;
    if (b.dataset.tab === 'chats' && active) api.markRead(active).catch(fail);
  });

  function showRequests(list) {
    const fresh = list.filter(r => r.status === 'new').length;
    $('#new-count').textContent = fresh ? `(${fresh} new)` : '';
    $('#inbox').replaceChildren(...(list.length ? list.map(r => {
      const status = h('select', { ariaLabel: 'Status for ' + r.name }, ...['new', 'in progress', 'done'].map(s => h('option', { value: s, textContent: s })));
      status.value = r.status;
      status.onchange = () => api.setStatus(r.id, status.value).catch(fail);
      const remove = h('button', { className: 'link', type: 'button', textContent: 'Delete' });
      remove.onclick = () => confirm(`Delete the request from ${r.name}? This cannot be undone.`) && api.deleteRequest(r.id).catch(fail);
      return h('article', { className: 'card ' + (r.status === 'new' ? 'new' : '') },
        h('h3', { textContent: `${r.name}: ${r.type}` }),
        h('p', { className: 'hint', textContent: when(r.createdAt) + (r.uid ? ', has a client profile' : '') }),
        h('p', { className: 'body', textContent: r.message }),
        r.services?.length ? h('p', { textContent: 'Services: ' + r.services.join(', ') }) : null,
        r.estimate ? h('p', { textContent: 'Estimate shown: ' + r.estimate }) : null,
        r.date ? h('p', { textContent: 'Preferred call date: ' + r.date }) : null,
        h('div', { className: 'row' },
          h('a', { href: 'mailto:' + encodeURIComponent(r.email).replace('%40', '@'), textContent: r.email }),
          h('a', { href: waLink(r.phone), target: '_blank', rel: 'noopener', textContent: 'WhatsApp ' + r.phone }),
          status, remove));
    }) : [h('p', { className: 'hint', textContent: 'No requests yet.' })]));
  }

  function showThreads(list) {
    const unread = list.filter(t => t.unread && (t.id !== active || $('#chats').hidden)).length;
    $('#unread-count').textContent = unread ? `(${unread} unread)` : '';
    $('#threads').replaceChildren(...(list.length ? list.map(t => {
      const b = h('button', { type: 'button', className: 'thread' + (t.unread ? ' new' : ''), ariaPressed: String(t.id === active) },
        h('strong', { textContent: t.name || t.email || 'Client' }), h('span', { textContent: t.lastMessage || '' }));
      b.onclick = () => open(t, b);
      return b;
    }) : [h('p', { className: 'hint', textContent: 'No client messages yet.' })]));
    // keep the open chat marked as read when new messages arrive
    if (list.some(t => t.id === active && t.unread) && !$('#chats').hidden) api.markRead(active).catch(fail);
  }

  function open(t, button) {
    stopChat?.(); active = t.id;
    $$('.thread').forEach(x => x.ariaPressed = String(x === button));
    $('#who').textContent = [t.name, t.email, t.phone].filter(Boolean).join(', ');
    $('#send').hidden = false; $('#text').value = '';
    stopChat = api.watchMessages(t.id, list => chatList($('#chat'), list, 'admin'), fail);
    if (t.unread) api.markRead(t.id).catch(fail);
  }
  $('#send').onsubmit = async e => {
    e.preventDefault();
    const box = $('#text'), text = box.value.trim(), to = active; if (!text || !to) return;
    box.value = '';
    try { await api.sendMessage(to, text, 'admin'); } catch (err) { box.value = text; fail(err); }
  };
}
