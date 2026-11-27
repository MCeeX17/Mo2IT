// Draws a quotation on canvas, then saves it as an A4 PDF or a PNG image. No libraries needed.
import { CONTACT, rand } from './data.js';
import { h } from './ui.js';

const W = 1240, H = 1754, M = 90, NAVY = '#14233c', GOLD = '#d4a63c', GREY = '#55627a';
export const makeRef = (d = new Date()) => 'MO2-' + d.toISOString().slice(2, 10).replace(/-/g, '') + '-' +
  Array.from(crypto.getRandomValues(new Uint8Array(3)), b => b.toString(16).padStart(2, '0')).join('').slice(0, 5).toUpperCase();
const stamp = d => d.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ' (SAST)';
const loadLogo = () => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = 'assets/logo-navy.jpg'; });

async function draw(q) {
  await document.fonts?.ready;
  const logo = await loadLogo(), pages = [];
  const created = q.createdAt?.seconds ? new Date(q.createdAt.seconds * 1000) : new Date(q.createdAt || Date.now());
  let g, y;
  const text = (s, x, ty, { size = 26, weight = 500, color = NAVY, align = 'left', head = false } = {}) => {
    g.font = `${weight} ${size}px ${head ? 'Sora' : 'Jakarta'}, sans-serif`; g.fillStyle = color; g.textAlign = align; g.fillText(s, x, ty);
  };
  function page() {
    const c = h('canvas', { width: W, height: H }); g = c.getContext('2d'); pages.push(c);
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.fillStyle = GOLD; g.fillRect(0, H - 22, W, 22);
    text(`${q.ref}   Page ${pages.length}`, W - M, H - 50, { size: 20, color: GREY, align: 'right' });
    text(`${CONTACT.phone}   ${CONTACT.email}`, M, H - 50, { size: 20, color: GREY });
    y = 110;
  }
  const room = need => { if (y + need > H - 110) page(); };
  function wrap(s, width, size, weight = 500) {
    g.font = `${weight} ${size}px Jakarta, sans-serif`;
    const out = [];
    for (const para of String(s ?? '').split('\n')) {
      let line = '';
      for (let word of para.split(/\s+/)) {
        while (g.measureText(word).width > width) {               // break very long words
          let n = word.length - 1; while (n > 1 && g.measureText(word.slice(0, n)).width > width) n--;
          if (line) { out.push(line); line = ''; }
          out.push(word.slice(0, n)); word = word.slice(n);
        }
        const next = line ? line + ' ' + word : word;
        if (g.measureText(next).width > width) { out.push(line); line = word; } else line = next;
      }
      out.push(line);
    }
    return out;
  }
  const block = (s, opts = {}) => { const size = opts.size || 26; for (const l of wrap(s, W - 2 * M, size, opts.weight)) { room(size * 1.55); text(l, M, y, opts); y += size * 1.55; } };
  const heading = s => { room(110); y += 30; text(s, M, y, { size: 32, weight: 700, head: true }); g.fillStyle = GOLD; g.fillRect(M, y + 16, 70, 5); y += 66; };

  page();
  g.fillStyle = '#1d2c40'; g.fillRect(0, 0, W, 330);
  if (logo) { const lh = 330, lw = logo.width * lh / logo.height; g.drawImage(logo, 0, 0, lw, lh);
    const fade = g.createLinearGradient(lw - 120, 0, lw, 0); fade.addColorStop(0, 'rgba(29,44,64,0)'); fade.addColorStop(1, '#1d2c40'); g.fillStyle = fade; g.fillRect(lw - 120, 0, 121, lh); }
  else text('Mo2IT Technologies', M, 180, { size: 48, weight: 700, color: '#fff', head: true });
  text('Quotation', W - M, 140, { size: 52, weight: 800, color: '#f4d67e', align: 'right', head: true });
  text(q.ref, W - M, 195, { size: 26, weight: 700, color: '#fff', align: 'right' });
  g.fillStyle = GOLD; g.fillRect(0, 330, W, 8);
  y = 400;
  text('Created ' + stamp(created), M, y, { size: 24, color: GREY }); y += 30;
  heading('Prepared for');
  block(q.name, { weight: 800, size: 32 }); block(`Mobile: ${q.phone}`); block(`Email: ${q.email}`);
  heading('What you are looking for'); block(q.type, { weight: 700 });
  heading('Services');
  const items = Array.isArray(q.items) ? q.items : [];
  let once = 0, month = 0;
  if (items.length) {
    for (const it of items) {
      const price = Number(it.price) || 0, lines = wrap(it.name, 700, 26, 600);
      it.monthly ? month += price : once += price;
      room(lines.length * 40 + 30);
      text(rand(price) + (it.monthly ? ' a month' : ''), W - M, y, { weight: 700, align: 'right' });
      for (const l of lines) { text(l, M, y, { weight: 600 }); y += 40; }
      g.fillStyle = '#dfe5ee'; g.fillRect(M, y - 18, W - 2 * M, 2); y += 22;
    }
    room(150); y += 20;
    g.fillStyle = '#fff3cd'; g.fillRect(M, y - 36, W - 2 * M, month ? 120 : 70);
    text('Estimated total, from', M + 24, y + 8, { weight: 700 });
    text(rand(once), W - M - 24, y + 10, { size: 40, weight: 800, align: 'right', head: true });
    if (month) { y += 52; text('Monthly, from', M + 24, y + 8, { weight: 700 }); text(rand(month) + ' a month', W - M - 24, y + 8, { size: 30, weight: 800, align: 'right', head: true }); }
    y += 90;
  } else block('No listed services selected. We will confirm the price with you.');
  heading('Your description'); block(q.message);
  if (q.date) { y += 14; block('Preferred date for a call: ' + q.date, { weight: 700 }); }
  y += 20;
  block('This is an estimate based on starting prices. The final price and scope are confirmed with you before any work starts.', { size: 22, color: GREY });
  room(120); y += 50; text('Thank you, and have a nice day!', W / 2, y, { size: 36, weight: 800, align: 'center', head: true });
  return pages;
}

const blobOf = (canvas, type, q) => new Promise((ok, no) => canvas.toBlob(b => b ? ok(b) : no(new Error('Could not create file')), type, q));
// A minimal PDF: one full-page JPEG per A4 page.
async function toPdf(pages) {
  const enc = new TextEncoder(), parts = [], offsets = []; let size = 0;
  const put = d => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); size += b.length; };
  const obj = (n, ...body) => { offsets[n] = size; put(`${n} 0 obj\n`); body.forEach(put); put('\nendobj\n'); };
  put('%PDF-1.4\n');
  obj(1, '<</Type/Catalog/Pages 2 0 R>>');
  obj(2, `<</Type/Pages/Count ${pages.length}/Kids[${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}]>>`);
  for (const [i, c] of pages.entries()) {
    const n = 3 + i * 3, jpg = new Uint8Array(await (await blobOf(c, 'image/jpeg', .92)).arrayBuffer()), cmd = 'q 595 0 0 842 0 0 cm /I Do Q';
    obj(n, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</XObject<</I ${n + 2} 0 R>>>>/Contents ${n + 1} 0 R>>`);
    obj(n + 1, `<</Length ${cmd.length}>>stream\n${cmd}\nendstream`);
    obj(n + 2, `<</Type/XObject/Subtype/Image/Width ${W}/Height ${H}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>stream\n`, jpg, '\nendstream');
  }
  const xref = size, count = offsets.length;
  put(`xref\n0 ${count}\n0000000000 65535 f \n` + offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join(''));
  put(`trailer\n<</Size ${count}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}
async function toImage(pages) {
  if (pages.length === 1) return blobOf(pages[0], 'image/png');
  const all = h('canvas', { width: W, height: H * pages.length }), g = all.getContext('2d');
  pages.forEach((p, i) => g.drawImage(p, 0, i * H));
  return blobOf(all, 'image/png');
}
function save(blob, name) {
  const url = URL.createObjectURL(blob), a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function downloadButtons(q) {
  const data = { ...q, ref: q.ref || 'MO2-' + String(q.id || '').slice(0, 6).toUpperCase() };
  const note = h('p', { className: 'status', role: 'status' });
  const make = (label, ext, build) => {
    const b = h('button', { type: 'button', className: ext === 'pdf' ? 'btn' : 'btn line', textContent: label });
    b.onclick = async () => {
      b.disabled = true; note.textContent = 'Preparing your file…';
      try { save(await build(await draw(data)), `Mo2IT-quotation-${data.ref}.${ext}`); note.textContent = 'Downloaded. Check your downloads folder.'; }
      catch (err) { console.error(err); note.textContent = ext === 'pdf' ? 'The PDF did not work. Try “Save as image”.' : 'Could not save. Take a screenshot of this page.'; }
      b.disabled = false;
    };
    return b;
  };
  return h('div', { className: 'downloads' }, h('div', { className: 'row' }, make('Download PDF', 'pdf', toPdf), make('Save as image', 'png', toImage)), note);
}
