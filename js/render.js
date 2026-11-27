// Fills the promotions, mastery, FAQ and project areas on whichever page has them.
import { $, h } from './ui.js';
import { load, safeImage, safeLink, live } from './content.js';

const picture = (src, alt) => safeImage(src) ? h('img', { src: safeImage(src), alt, loading: 'lazy' }) : null;

export async function renderContent() {
  const promos = $('#promos'), mastery = $('#mastery'), faqs = $('#faqs'), projects = $('#projects');
  if (promos) load('promotions').then(list => {
    const shown = list.filter(live);
    promos.closest('section').hidden = !shown.length;
    promos.replaceChildren(...shown.map(p => h('article', { className: 'promo' }, picture(p.image, p.title),
      h('div', {}, p.badge ? h('span', { className: 'badge', textContent: p.badge }) : null,
        h('h3', { textContent: p.title }), h('p', { textContent: p.text }),
        p.ends ? h('small', { textContent: 'Ends ' + new Date(p.ends + 'T12:00').toLocaleDateString('en-ZA', { dateStyle: 'long' }) }) : null,
        h('a', { className: 'btn', href: 'quote.html?promo=' + encodeURIComponent(p.title), textContent: 'Claim this offer' })))));
  });
  if (mastery) load('mastery').then(list => mastery.replaceChildren(...list.map(m =>
    h('li', {}, h('h3', { textContent: m.name }), h('p', { textContent: m.text })))));
  if (faqs) load('faqs').then(list => faqs.replaceChildren(...list.map(f =>
    h('details', {}, h('summary', { textContent: f.q }), h('p', { textContent: f.a })))));
  if (projects) load('projects').then(list => {
    if (!list.length) return;                                  // keep the "coming soon" cards
    projects.replaceChildren(...list.map(p => h('article', { className: 'slot' },
      picture(p.image, p.name) || h('div', { className: 'shimmer' }),
      h('h2', { textContent: p.name }), h('p', { textContent: p.text }),
      safeLink(p.link) ? h('p', {}, h('a', { href: safeLink(p.link), target: '_blank', rel: 'noopener', textContent: 'Visit project' })) : null)));
  });
}
