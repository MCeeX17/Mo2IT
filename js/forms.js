// Shared sending logic for the quote and contact forms.
import { backend, configured } from './backend.js';
import { CONTACT } from './data.js';
import { h, say, waLink, $ } from './ui.js';

export function wireForm(form, build, sentText) {
  const status = $('.status', form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.elements.website_url.value) return;            // spam bot trap
    const data = build(new FormData(form));
    if (!data.name || !data.message) return say(status, 'Fill in your name and a description.', true);

    const handOver = intro => {
      const text = [`Name: ${data.name}`, `Mobile: ${data.phone}`, `Email: ${data.email}`,
        `Looking for: ${data.type}`, data.services.length ? `Services: ${data.services.join(', ')}` : '',
        data.estimate ? `Estimate: ${data.estimate}` : '', data.date ? `Preferred date: ${data.date}` : '',
        '', data.message].filter((l, i) => l || i === 7).join('\n');
      status.replaceChildren(intro,
        h('a', { href: `mailto:${CONTACT.email}?subject=${encodeURIComponent('Website request from ' + data.name)}&body=${encodeURIComponent(text)}`, textContent: 'email' }), ' or ',
        h('a', { href: waLink(CONTACT.phone, text), target: '_blank', rel: 'noopener', textContent: 'WhatsApp' }), '.');
    };
    if (!configured) { status.classList.remove('bad'); return handOver('Your request is not sent yet. Choose how to send it: '); }
    const button = $('[type=submit]', form);
    button.disabled = true; say(status, 'Sending…');
    try {
      await (await backend()).createRequest(data);
      form.reset(); form.dispatchEvent(new Event('change'));
      say(status, sentText);
    } catch (err) { console.error(err); status.classList.add('bad'); handOver('We could not send this from the website. Send it by '); }
    button.disabled = false;
  });
}
export const base = f => Object.fromEntries(
  ['name', 'phone', 'email', 'message'].map(k => [k, String(f.get(k) || '').trim()]));
