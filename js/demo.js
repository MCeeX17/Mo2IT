// Home page demos. They run only in the browser: nothing is charged, booked or sent.
import { $, $$, h } from './ui.js';
const stage = $('#demo-stage');
const button = (textContent, onclick, className = '') => h('button', { type: 'button', textContent, onclick, className });

const demos = {
  site: { title: 'A website that fits your brand', text: 'Pick a colour and switch between computer and phone view.', quote: 'type=website', draw() {
    const view = h('div', { className: 'browser' }, h('div', { className: 'chrome' }, h('i'), h('i'), h('i'), h('span', { textContent: 'yourbusiness.co.za' })),
      h('div', { className: 'page' }, h('div', { className: 'pnav' }, h('b', { textContent: 'Your Business' }), h('span', { textContent: 'Shop   About   Contact' })),
        h('div', { className: 'phero' }, h('strong', { textContent: 'Your headline goes here' }), h('em', { textContent: 'Book now' })),
        h('div', { className: 'pcards' }, h('u'), h('u'), h('u'))));
    const swatches = ['#2f6bff', '#0f9d75', '#e0533d', '#7b4ce0'].map((c, i) => {
      const b = button('', () => { view.style.setProperty('--brand', c); swatches.forEach(s => s.ariaPressed = String(s === b)); }, 'swatch');
      b.style.background = c; b.ariaLabel = 'Colour ' + ['blue', 'green', 'red', 'purple'][i]; b.ariaPressed = String(!i); return b;
    });
    const size = button('Phone view', () => { size.textContent = view.classList.toggle('narrowview') ? 'Computer view' : 'Phone view'; }, 'pill');
    return [h('div', { className: 'controls' }, ...swatches, size), view];
  } },
  app: { title: 'An app for bookings', text: 'Tap a time, then confirm.', quote: 'type=mobile', draw() {
    let picked; const note = h('p', { className: 'toast', textContent: 'Choose a time' });
    const confirm = button('Confirm booking', () => { note.textContent = `Booked for ${picked}. (Demo)`; note.classList.add('ok'); }, 'appbtn'); confirm.disabled = true;
    const slots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'].map(t => { const b = button(t, () => { picked = t; confirm.disabled = false; note.textContent = 'Selected ' + t; note.classList.remove('ok'); slots.forEach(s => s.ariaPressed = String(s === b)); }, 'slotbtn'); b.ariaPressed = 'false'; return b; });
    return [h('div', { className: 'device' }, h('b', { textContent: 'Book a visit' }), h('small', { textContent: 'Today' }), h('div', { className: 'slotgrid' }, ...slots), note, confirm)];
  } },
  shop: { title: 'A store that takes payments', text: 'Add items to the cart and try the checkout.', quote: 'add=payments', draw() {
    let total = 0; const out = h('strong', { textContent: 'R0' }), note = h('p', { className: 'toast', textContent: 'Your cart is empty' });
    const pay = button('Pay now', () => { note.textContent = `Payment of R${total} approved. (Demo, no money moved)`; note.classList.add('ok'); total = 0; out.textContent = 'R0'; pay.disabled = true; }, 'appbtn'); pay.disabled = true;
    const goods = [['T-shirt', 180, '#ffb347'], ['Cap', 120, '#5b8cff'], ['Hoodie', 420, '#37c99a']].map(([n, p, c]) => {
      const art = h('i'); art.style.background = c;
      return h('div', { className: 'good' }, art, h('span', { textContent: `${n}, R${p}` }), button('Add', () => { total += p; out.textContent = 'R' + total; pay.disabled = false; note.textContent = n + ' added'; note.classList.remove('ok'); }, 'pill'));
    });
    return [h('div', { className: 'shop' }, h('div', { className: 'goods' }, ...goods), h('div', { className: 'checkout' }, h('span', { textContent: 'Total' }), out, pay), note)];
  } },
  srv: { title: 'Hosting you do not have to babysit', text: 'Switch a server off and see how an alert could look.', quote: 'add=server', draw() {
    const note = h('p', { className: 'toast ok', textContent: 'All services running' }), on = [true, true, true];
    const rows = ['Website', 'Database', 'Backups'].map((n, i) => {
      const b = button('Running', () => { on[i] = !on[i]; b.textContent = on[i] ? 'Running' : 'Stopped'; row.classList.toggle('down', !on[i]);
        const down = on.filter(x => !x).length; note.textContent = down ? `Alert: ${down} service${down > 1 ? 's' : ''} stopped` : 'All services running'; note.classList.toggle('ok', !down); }, 'pill');
      b.ariaLabel = 'Toggle ' + n;
      const row = h('div', { className: 'srvrow' }, h('i'), h('span', { textContent: n }), h('div', { className: 'bars' }, ...Array.from({ length: 18 }, (_, k) => { const x = h('s'); x.style.animationDelay = k * -.17 + 's'; return x; })), b);
      return row;
    });
    return [h('div', { className: 'servers' }, ...rows, note)];
  } }
};
function show(key) {
  const d = demos[key]; stage.replaceChildren(...d.draw());
  $('#demo-title').textContent = d.title; $('#demo-text').textContent = d.text; $('#demo-cta').href = 'quote.html?' + d.quote;
  $$('[data-demo]').forEach(b => b.ariaPressed = String(b.dataset.demo === key));
}
$$('[data-demo]').forEach(b => b.onclick = () => show(b.dataset.demo));
show('site');
