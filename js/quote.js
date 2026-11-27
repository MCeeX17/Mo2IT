import { rand } from './data.js';
import { $, $$, h } from './ui.js';
import { wireForm, base } from './forms.js';
import { load, groupByCategory } from './content.js';
import { backend, configured } from './backend.js';
import { makeRef } from './quotation.js';

const form = $('#quote'), submit = $('[type=submit]', form);
const params = new URLSearchParams(location.search);
submit.disabled = true; $('#options').textContent = 'Loading services…';
form.addEventListener('submit', e => e.preventDefault());
let shown = 0, frame, items = [];
function count(to) {
  cancelAnimationFrame(frame);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown = to; $('#total').value = rand(to); return; }
  const from = shown, start = performance.now();
  const step = t => { const k = Math.max(0, Math.min(1, (t - start) / 450)); shown = Math.round(from + (to - from) * k); $('#total').value = rand(shown); if (k < 1) frame = requestAnimationFrame(step); };
  frame = requestAnimationFrame(step);
}
const chosen = () => $$('[name=service]:checked').map(c => items.find(s => s.id === c.value));
const sum = list => list.reduce((t, s) => t + (Number(s.price) || 0), 0);
function estimate() {
  const list = chosen(), once = sum(list.filter(s => !s.monthly)), month = sum(list.filter(s => s.monthly));
  $('#lines').replaceChildren(...(list.length ? list.map(s => h('li', { textContent: s.name })) : [h('li', { textContent: 'Nothing added yet.' })]));
  count(once);
  $('#monthly').textContent = month ? `Plus from ${rand(month)} a month` : '';
  const custom = form.elements.type.value === 'custom';
  $('#custom-wrap').hidden = !custom; form.elements.custom.required = custom;
  return { list, once, month };
}

items = await load('services');
$('#options').replaceChildren(...[...groupByCategory(items)].map(([title, group]) => h('div', { className: 'group' }, h('h3', { textContent: title }),
  ...group.map(s => h('label', { className: 'check option' },
    h('input', { type: 'checkbox', name: 'service', value: s.id, checked: s.id === params.get('add') }),
    h('span', { textContent: s.name }), h('b', { textContent: rand(s.price) + (s.monthly ? ' pm' : '') }))))));
if (params.get('type')) form.elements.type.value = params.get('type');
if (params.get('promo')) form.elements.message.value = `I would like the promotion: ${params.get('promo').slice(0, 100)}\n`;
form.addEventListener('change', estimate);
estimate(); submit.disabled = false;
const d = new Date(); form.elements.date.min = new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

wireForm(form, f => {
  const { list, once, month } = estimate(), type = form.elements.type;
  return { ...base(f), kind: 'quote', ref: makeRef(),
    type: type.value === 'custom' ? 'Custom: ' + f.get('custom').trim() : type.selectedOptions[0].text,
    services: list.map(s => s.name),
    items: list.map(s => ({ name: String(s.name), price: Number(s.price) || 0, monthly: Boolean(s.monthly) })),
    estimate: list.length ? `From ${rand(once)}${month ? ` plus ${rand(month)} a month` : ''}` : '',
    date: f.get('date') || '' };
}, 'Booking request sent. We will contact you to confirm.', $('#result'));

// Signed-in clients get their details filled in.
if (configured) backend().then(async api => {
  const user = await api.currentUser(); if (!user) return;
  const p = await api.getProfile(user.uid) || {};
  for (const [k, v] of Object.entries({ name: p.name, phone: p.phone, email: user.email })) if (v && !form.elements[k].value) form.elements[k].value = v;
}).catch(() => {});
