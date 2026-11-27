import { rand } from './data.js';
import { $, h } from './ui.js';
import { paintIcons } from './icons.js';
import { load, groupByCategory } from './content.js';

const root = $('#catalogue');
root.replaceChildren(h('p', { className: 'hint', textContent: 'Loading services…' }));
const iconFor = s => s.id === 'payments' ? 'card' : /app|mobile/i.test(s.category) ? 'phone' : /design/i.test(s.category) ? 'pen' : /cloud|host|server/i.test(s.category) ? 'cloud' : 'web';
const groups = [...groupByCategory(await load('services'))].map(([title, items]) => {
  const section = h('section', {}, h('h2', { textContent: title }), h('ul', { className: 'prices' }, ...items.map(s => {
    const ico = h('span', { className: 'ico' }); ico.dataset.icon = iconFor(s);
    return h('li', { className: 'plan' }, ico, h('h3', { textContent: s.name }), h('p', { textContent: s.text }),
      h('p', { className: 'price' }, h('small', { textContent: 'From ' }), rand(s.price), h('small', { textContent: s.monthly ? ' a month' : '' })),
      h('a', { className: 'btn', href: 'quote.html?add=' + encodeURIComponent(s.id), textContent: 'Add to quote', ariaLabel: `Add ${s.name} to quote` }));
  })));
  section.dataset.title = title; return section;
});
const filters = ['All services', ...groups.map(g => g.dataset.title)].map((title, i) => {
  const b = h('button', { type: 'button', textContent: title, ariaPressed: String(!i) });
  b.onclick = () => { groups.forEach(g => g.hidden = i > 0 && g.dataset.title !== title); filters.forEach(x => x.ariaPressed = String(x === b)); };
  return b;
});
root.replaceChildren(h('div', { className: 'tabs filters' }, ...filters), ...groups);
paintIcons(root);
