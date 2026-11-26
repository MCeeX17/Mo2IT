import { CATALOGUE, rand } from './data.js';
import { $, $$, h } from './ui.js';
import { wireForm, base } from './forms.js';

const form = $('#quote'), items = CATALOGUE.flatMap(g => g.items);
$('#options').append(...CATALOGUE.map(g => h('div', { className: 'group' }, h('h3', { textContent: g.title }),
  ...g.items.map(s => h('label', { className: 'check option' },
    h('input', { type: 'checkbox', name: 'service', value: s.id }),
    h('span', { textContent: s.name }), h('b', { textContent: rand(s.price) + (s.monthly ? ' pm' : '') }))))));

const chosen = () => $$('[name=service]:checked').map(c => items.find(s => s.id === c.value));
const sum = list => list.reduce((t, s) => t + s.price, 0);
let shown = 0, frame;
function count(to) {
  cancelAnimationFrame(frame);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown = to; $('#total').value = rand(to); return; }
  const from = shown, start = performance.now();
  const step = t => { const k = Math.max(0, Math.min(1, (t - start) / 450)); shown = Math.round(from + (to - from) * k); $('#total').value = rand(shown); if (k < 1) frame = requestAnimationFrame(step); };
  frame = requestAnimationFrame(step);
}
function estimate() {
  const list = chosen(), once = sum(list.filter(s => !s.monthly)), month = sum(list.filter(s => s.monthly));
  $('#lines').replaceChildren(...(list.length ? list.map(s => h('li', { textContent: s.name })) : [h('li', { textContent: 'Nothing added yet.' })]));
  count(once);
  $('#monthly').textContent = month ? `Plus from ${rand(month)} a month` : '';
  const custom = form.elements.type.value === 'custom';
  $('#custom-wrap').hidden = !custom; form.elements.custom.required = custom;
  return { list, once, month };
}
const params = new URLSearchParams(location.search);
$$('[name=service]').forEach(c => c.checked = c.value === params.get('add'));
if (params.get('type')) form.elements.type.value = params.get('type');
form.addEventListener('change', estimate);
estimate();
const d = new Date(); form.elements.date.min = new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

wireForm(form, f => {
  const { list, once, month } = estimate(), type = form.elements.type;
  return { ...base(f), kind: 'quote',
    type: type.value === 'custom' ? 'Custom: ' + f.get('custom').trim() : type.selectedOptions[0].text,
    services: list.map(s => s.name),
    estimate: list.length ? `From ${rand(once)}${month ? ` plus ${rand(month)} a month` : ''}` : '',
    date: f.get('date') || '' };
}, 'Booking request sent. We will contact you to confirm.');
