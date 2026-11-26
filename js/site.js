import { CONTACT } from './data.js';
import { $, $$, h, waLink } from './ui.js';
import { paintIcons } from './icons.js';
import { effects } from './fx.js';

const page = document.body.dataset.page;
const links = [['index', 'Home'], ['services', 'Services'], ['projects', 'Projects'], ['about', 'About us'], ['contact', 'Contact'], ['login', 'Client login']];
const link = ([id, label]) => h('a', { href: id + '.html', textContent: label, ariaCurrent: id === page ? 'page' : null });

const nav = h('nav', { id: 'nav', ariaLabel: 'Main' }, ...links.map(link), h('a', { className: 'btn', href: 'quote.html', textContent: 'Get a quote' }));
const toggle = h('button', { className: 'menu', type: 'button', textContent: 'Menu', ariaExpanded: 'false' });
toggle.setAttribute('aria-controls', 'nav');
toggle.onclick = () => { toggle.ariaExpanded = String(nav.classList.toggle('open')); };
$('#site-header').append(h('div', { className: 'wrap bar' },
  h('a', { className: 'brand', href: 'index.html' }, h('img', { className: 'bmark', src: 'assets/mark.png', alt: '', width: 242, height: 384 }),
    h('img', { className: 'bword', src: 'assets/wordmark.png', alt: 'Mo2IT Technologies', width: 639, height: 129 })),
  toggle, nav));

// Footer. The logo here opens the admin login after 3 quick clicks.
const secret = h('img', { src: 'assets/logo-full.png', alt: 'Mo2IT Technologies, innovative solutions', className: 'footlogo', width: 916, height: 384, draggable: false });
let clicks = 0, timer;
secret.addEventListener('click', () => {
  clearTimeout(timer);
  if (++clicks === 3) { clicks = 0; location.href = 'admin.html'; return; }
  timer = setTimeout(() => clicks = 0, 800);
});
$('#site-footer').append(h('div', { className: 'wrap foot' },
  secret,
  h('div', {}, h('a', { href: 'tel:' + CONTACT.phone, textContent: CONTACT.phone }), h('a', { href: 'mailto:' + CONTACT.email, textContent: CONTACT.email }), h('a', { href: waLink(CONTACT.phone), target: '_blank', rel: 'noopener', textContent: 'WhatsApp us' })),
  h('div', {}, ...[['services', 'Services and prices'], ['quote', 'Get a quote'], ['about', 'About us'], ['privacy', 'Privacy policy']].map(link)),
  h('p', { textContent: `© ${new Date().getFullYear()} Mo2IT Technologies` })));

$$('[data-email]').forEach(a => { a.href = 'mailto:' + CONTACT.email; a.textContent = CONTACT.email; });
$$('[data-phone]').forEach(a => { a.href = 'tel:' + CONTACT.phone; a.textContent = CONTACT.phone; });

// floating WhatsApp button
if (!['admin', 'portal', 'quote'].includes(page)) {
  const wa = h('a', { className: 'float', href: waLink(CONTACT.phone, 'Hi Mo2IT, I would like to ask about'), target: '_blank', rel: 'noopener', ariaLabel: 'Chat to us on WhatsApp' });
  wa.dataset.icon = 'chat'; wa.append(h('span', { textContent: 'Chat to us' })); document.body.append(wa);
}
paintIcons();
effects();
