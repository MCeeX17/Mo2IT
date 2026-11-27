// The add/edit form used by the admin for every kind of site content.
import { h, say, friendly } from './ui.js';
import { safeImage } from './content.js';

const order = ['order', 'Position (smaller shows first)', 'number'];
export const SCHEMAS = {
  services: { one: 'service', title: 'name', help: 'Services and prices appear on the Services page and in the quote builder.',
    fields: [['name', 'Service name', 'text', 100, true], ['category', 'Category', 'category', 60, true], ['price', 'Starting price in rand', 'number', 0, true], ['monthly', 'This price is per month', 'checkbox'], ['text', 'Short description', 'textarea', 300, true], order] },
  promotions: { one: 'promotion', title: 'title', help: 'Active promotions appear near the top of the home page.',
    fields: [['title', 'Title', 'text', 100, true], ['badge', 'Highlight, for example 10% off (optional)', 'text', 30], ['text', 'Details and conditions', 'textarea', 600, true], ['ends', 'Last day (optional)', 'date'], ['image', 'Picture (optional)', 'image'], ['active', 'Show on the website', 'checkbox'], order] },
  projects: { one: 'project', title: 'name', help: 'Projects appear on the Projects page. Only add work you have permission to show.',
    fields: [['name', 'Project name', 'text', 100, true], ['text', 'What it does', 'textarea', 600, true], ['link', 'Web address starting with https:// (optional)', 'url', 300], ['image', 'Picture (optional)', 'image'], order] },
  mastery: { one: 'skill', title: 'name', help: 'The things you excel at, shown on the home and About pages.',
    fields: [['name', 'Skill', 'text', 100, true], ['text', 'Short description', 'textarea', 300, true], order] },
  faqs: { one: 'question', title: 'q', help: 'Questions and answers shown on the home and FAQ pages.',
    fields: [['q', 'Question', 'text', 200, true], ['a', 'Answer', 'textarea', 1500, true], order] }
};

// Shrinks a chosen picture so it fits inside a database document (no paid file storage needed).
async function shrink(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  const img = await createImageBitmap(file);
  for (const [max, quality] of [[1000, .82], [800, .75], [640, .65], [480, .6]]) {
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = h('canvas', { width: Math.round(img.width * k), height: Math.round(img.height * k) }), g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    const url = c.toDataURL('image/jpeg', quality);
    if (url.length < 350000) return url;
  }
  throw new Error('That picture is too large. Choose a smaller one.');
}

export function editor(schema, item, list, { save, cancel }) {
  const status = h('p', { className: 'status', role: 'status' }), inputs = {};
  let image = safeImage(item?.image), busy = null;
  const fields = schema.fields.map(([key, label, type, max, required]) => {
    let input;
    if (type === 'textarea') input = h('textarea', { rows: 4 });
    else input = h('input', { type: type === 'image' ? 'file' : type === 'category' ? 'text' : type });
    input.name = key; input.required = Boolean(required); inputs[key] = input;
    if (max) input.maxLength = max;
    if (type === 'number') { input.min = 0; input.step = 1; }
    if (type === 'checkbox') {
      input.checked = item ? Boolean(item[key] ?? key === 'active') : key === 'active';
      return h('label', { className: 'check' }, input, h('span', { textContent: label }));
    }
    if (type === 'image') {
      input.accept = 'image/*';
      const preview = h('img', { className: 'preview', alt: 'Selected picture', src: image, hidden: !image });
      const clear = h('button', { type: 'button', className: 'link', textContent: 'Remove picture', hidden: !image });
      clear.onclick = () => { image = ''; input.value = ''; preview.hidden = clear.hidden = true; };
      input.onchange = () => { if (!input.files[0]) return; say(status, 'Preparing picture…');
        busy = shrink(input.files[0]).then(url => { image = url; preview.src = url; preview.hidden = clear.hidden = false; say(status, ''); })
          .catch(err => { input.value = ''; say(status, err.message, true); }); };
      return h('label', {}, label, input, preview, clear);
    }
    input.value = item?.[key] ?? (key === 'order' ? (Math.max(0, ...list.map(x => x.order || 0)) + 10) : '');
    if (type === 'category') {
      const options = h('datalist', { id: 'categories' }, ...[...new Set(['Websites', 'Mobile apps', 'Design', 'Cloud, hosting and servers', ...list.map(x => x.category).filter(Boolean)])].map(value => h('option', { value })));
      input.setAttribute('list', 'categories');
      return h('label', {}, label, input, options);
    }
    return h('label', {}, label, input);
  });
  const submit = h('button', { className: 'btn', textContent: item ? 'Save changes' : 'Add ' + schema.one });
  const stop = h('button', { type: 'button', className: 'link', textContent: 'Cancel', onclick: cancel });
  const form = h('form', { className: 'editor', method: 'post' }, h('h3', { textContent: (item ? 'Edit ' : 'New ') + schema.one }), ...fields, h('div', { className: 'row' }, submit, stop), status);
  form.onsubmit = async e => {
    e.preventDefault(); submit.disabled = true; await busy;
    const data = {};
    for (const [key, , type, , required] of schema.fields) {
      const el = inputs[key];
      data[key] = type === 'checkbox' ? el.checked : type === 'number' ? Number(el.value) || 0 : type === 'image' ? image : el.value.trim();
      if (required && data[key] === '') { submit.disabled = false; return say(status, 'Fill in every required field.', true); }
    }
    say(status, 'Saving…');
    try { await save(data); } catch (err) { console.error(err); say(status, friendly(err), true); submit.disabled = false; }
  };
  return form;
}
