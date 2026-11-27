import { CONTACT } from './data.js';
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Builds elements with textContent only, so client text can never run as code.
export function h(tag, props = {}, ...kids) {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...kids.filter(k => k !== null && k !== undefined && k !== false));
  return el;
}
export const when = t => t?.seconds ? new Date(t.seconds * 1000).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }) : '';
export const waLink = (phone, text = '') => {
  let n = String(phone).replace(/\D/g, '');
  if (n.startsWith('0')) n = '27' + n.slice(1);
  return `https://wa.me/${n}${text ? '?text=' + encodeURIComponent(text) : ''}`;
};
export function say(el, message, bad = false) { el.textContent = message; el.classList.toggle('bad', bad); }
export function friendly(err) {
  const map = {
    'auth/invalid-credential': 'Email or password is wrong.',
    'auth/email-already-in-use': 'That email already has a profile. Sign in instead.',
    'auth/weak-password': 'Use a password of at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.',
    'permission-denied': 'You do not have access to do that.',
    'auth/popup-closed-by-user': 'The Google window was closed before you finished.',
    'auth/cancelled-popup-request': 'The Google window was closed before you finished.',
    'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
    'auth/unauthorized-domain': 'Google sign-in is not set up for this web address yet.',
    'auth/operation-not-allowed': 'This sign-in method is not switched on yet.',
    'auth/account-exists-with-different-credential': 'That email already has a profile. Sign in with your password.'
  };
  return map[err?.code] || 'That did not work. Try again, or email ' + CONTACT.email + '.';
}
export function chatList(box, messages, mine) {
  box.replaceChildren(...(messages.length ? messages.map(m =>
    h('div', { className: 'msg' + (m.from === mine ? ' mine' : '') },
      h('p', { textContent: m.text }),
      h('small', { textContent: `${m.from === mine ? 'You' : m.from === 'admin' ? 'Mo2IT team' : 'Client'}, ${when(m.createdAt)}` })))
    : [h('p', { className: 'hint', textContent: 'No messages yet.' })]));
  box.scrollTop = box.scrollHeight;
}
