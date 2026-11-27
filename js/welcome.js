// "Sign up with Google" pop-up for signed-out visitors, and the header link for signed-in ones.
import { backend, configured } from './backend.js';
import { $, h, say, friendly } from './ui.js';

const KEY = 'mo2it-welcome-closed';
const closed = () => { try { return sessionStorage.getItem(KEY); } catch { return false; } };
const remember = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* private window */ } };

export async function welcome(page) {
  if (!configured) return;
  let api, user;
  try { api = await backend(); user = await api.currentUser(); } catch { return; }    // offline: stay quiet
  api.onUser(u => { const link = $('#nav a[href="login.html"]'); if (link) link.textContent = u ? 'My profile' : 'Client login'; });
  if (user || closed() || ['quote', 'contact', 'login', 'portal', 'admin', 'privacy', 'terms'].includes(page)) return;

  setTimeout(async () => {
    if (await api.currentUser()) return;
    const status = h('p', { className: 'status', role: 'status' });
    const google = h('button', { type: 'button', className: 'btn big', textContent: 'Continue with Google' });
    const later = h('button', { type: 'button', className: 'link', textContent: 'Not now' });
    const box = h('dialog', { className: 'welcome', ariaLabel: 'Create your free profile' },
      h('img', { src: 'assets/logo-navy.jpg', alt: 'Mo2IT Technologies', width: 1033, height: 490 }),
      h('div', {}, h('h2', { textContent: 'Create your free profile' }),
        h('p', { textContent: 'Message the team, track your requests and download your quotations.' }),
        google, h('a', { className: 'btn big line', href: 'login.html', textContent: 'Use email instead' }), later,
        h('p', { className: 'hint' }, 'By continuing you agree to our ', h('a', { href: 'terms.html', textContent: 'terms' }), ' and ', h('a', { href: 'privacy.html', textContent: 'privacy policy' }), '.'), status));
    later.onclick = () => box.close();
    box.addEventListener('close', () => { remember(); box.remove(); });
    google.onclick = async () => {
      google.disabled = true; say(status, 'Opening Google…');
      try { await api.google(); box.close(); location.href = 'portal.html'; }
      catch (err) { say(status, friendly(err), true); google.disabled = false; }
    };
    document.body.append(box); box.showModal();
  }, 2500);
}
