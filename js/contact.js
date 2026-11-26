import { CONTACT } from './data.js';
import { $, h, waLink } from './ui.js';
import { wireForm, base } from './forms.js';
import { paintIcons } from './icons.js';
const way = (icon, label, value, href) => {
  const a = h('a', { className: 'way', href }, h('span', {}, h('b', { textContent: label }), value));
  a.dataset.icon = icon; if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
  return a;
};
$('#contact-details').append(h('h2', { textContent: 'Reach us directly' }),
  way('chat', 'WhatsApp', 'Chat to us', waLink(CONTACT.phone)),
  way('call', 'Phone', CONTACT.phone, 'tel:' + CONTACT.phone),
  way('mail', 'Email', CONTACT.email, 'mailto:' + CONTACT.email));
paintIcons($('#contact-details'));
wireForm($('#contact'), f => ({ ...base(f), kind: 'contact', type: 'Contact message', services: [], estimate: '', date: '' }),
  'Message sent. We will get back to you.');
