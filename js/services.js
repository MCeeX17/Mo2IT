import { CATALOGUE, rand } from './data.js';
import { $, $$, h } from './ui.js';
import { paintIcons } from './icons.js';
const icons = { web: 'web', apps: 'phone', design: 'pen', cloud: 'cloud' };
const root = $('#catalogue');
const groups = CATALOGUE.map(group => h('section', { id: group.id },
  h('h2', { textContent: group.title }),
  h('ul', { className: 'prices' }, ...group.items.map(s => {
    const ico = h('span', { className: 'ico' }); ico.dataset.icon = s.id === 'payments' ? 'card' : s.id === 'server' ? 'server' : icons[group.id];
    return h('li', { className: 'plan' }, ico, h('h3', { textContent: s.name }), h('p', { textContent: s.text }),
      h('p', { className: 'price' }, h('small', { textContent: 'From ' }), rand(s.price), h('small', { textContent: s.monthly ? ' a month' : '' })),
      h('a', { className: 'btn', href: 'quote.html?add=' + s.id, textContent: 'Add to quote', ariaLabel: `Add ${s.name} to quote` }));
  }))));
const filters = [['all', 'All services'], ...CATALOGUE.map(g => [g.id, g.title])].map(([id, title]) => {
  const b = h('button', { type: 'button', textContent: title, ariaPressed: 'false' }); b.dataset.id = id; b.onclick = () => show(id); return b;
});
function show(id) {
  groups.forEach(g => g.hidden = id !== 'all' && g.id !== id);
  filters.forEach(b => b.ariaPressed = String(b.dataset.id === id));
}
root.append(h('div', { className: 'tabs filters' }, ...filters), ...groups);
paintIcons(root);
show(groups.some(g => '#' + g.id === location.hash) ? location.hash.slice(1) : 'all');
