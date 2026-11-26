import { backend, configured } from './backend.js';
import { $, h, say, friendly, when, chatList } from './ui.js';

if (!configured) location.replace('login.html');
else {
  const api = await backend().catch(err => { location.replace('login.html'); throw err; });
  const user = await api.currentUser();
  if (!user) location.replace('login.html');
  else {
    $('#app').hidden = false;
    const chatStatus = $('#chat-status'), pf = $('#profile');
    const fail = err => { console.error(err); say(chatStatus, friendly(err), true); };
    let profile = {};
    $('#logout').onclick = async () => { await api.logout(); location.replace('login.html'); };
    pf.onsubmit = async e => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(pf));
      try { await api.saveProfile(user.uid, { ...v, email: user.email }); profile = v; say($('.status', pf), 'Details saved.'); }
      catch (err) { say($('.status', pf), friendly(err), true); }
    };
    $('#send').onsubmit = async e => {
      e.preventDefault();
      const box = $('#text'), text = box.value.trim(); if (!text) return;
      box.value = '';
      try { await api.sendMessage(user.uid, text, 'client', { name: profile.name || user.email, email: user.email, phone: profile.phone || '' }); say(chatStatus, ''); }
      catch (err) { box.value = text; fail(err); }
    };
    api.watchMessages(user.uid, list => chatList($('#chat'), list, 'client'), fail);
    try {
      profile = await api.getProfile(user.uid) || {};
      for (const k of ['name', 'phone', 'company']) pf.elements[k].value = profile[k] || '';
      const list = await api.myRequests(user.uid);
      $('#mine').replaceChildren(...(list.length ? list.map(r => h('article', { className: 'card' },
        h('h3', { textContent: r.type }), h('p', { className: 'hint', textContent: `${when(r.createdAt)}. Status: ${r.status}` }), h('p', { textContent: r.message })))
        : [h('p', { className: 'hint', textContent: 'Requests you send while signed in show up here.' })]));
    } catch (err) { fail(err); }
  }
}
