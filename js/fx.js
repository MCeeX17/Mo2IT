// Motion and interaction. Everything still works if this does nothing.
import { $, $$ } from './ui.js';
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function effects() {
  // header shadow and reading progress
  const header = $('#site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', scrollY > 10);
    header.style.setProperty('--read', scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // spotlight that follows the pointer across cards
  addEventListener('pointermove', e => {
    const card = e.target.closest?.('.tile, .plan');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', e.clientX - r.left + 'px'); card.style.setProperty('--y', e.clientY - r.top + 'px');
  });

  // rotating word in the hero
  const word = $('#word');
  if (word && !calm) {
    const words = ['websites', 'mobile apps', 'online stores', 'software']; let i = 0;
    setInterval(() => { word.textContent = words[++i % words.length]; word.style.animation = 'none'; void word.offsetWidth; word.style.animation = ''; }, 2600);
  }

  // logo tilts toward the pointer
  const stage = $('#stage');
  if (stage && !calm) {
    const hero = stage.closest('section');
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / r.width));
      const y = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / r.height));
      stage.style.setProperty('--ry', x * 22 + 'deg'); stage.style.setProperty('--rx', -y * 16 + 'deg');
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });
  }

  const marquee = $('#marquee');
  if (marquee) {
    const run = ['Websites', 'Mobile apps', 'Prototype design', 'UI/UX design', 'Payment systems', 'Cloud services', 'Web hosting', 'Server management'].map(t => `<span>${t}</span>`).join('');
    marquee.innerHTML = run + run;
  }

  // reveal on scroll (content is visible by default; only off-screen items get hidden first)
  if (!calm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { threshold: .12 });
    $$('.reveal').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); } });
  }
  $$('canvas.net').forEach(network);
}

// connected dots that react to the pointer
function network(c) {
  const g = c.getContext('2d'), host = c.parentElement; let w, h, dots, visible = true, mx = -999, my = -999;
  function size() {
    const d = Math.min(devicePixelRatio, 2); w = host.clientWidth; h = host.clientHeight;
    c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0);
    dots = Array.from({ length: Math.min(70, Math.round(w * h / 13000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
    draw();
  }
  function line(a, b, max, color) {
    const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > max) return;
    g.strokeStyle = `rgba(${color},${(1 - d / max) * .5})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }
  function draw() {
    g.clearRect(0, 0, w, h);
    const rgb = getComputedStyle(c).getPropertyValue('--dot').trim() || '201,162,74';
    dots.forEach((p, i) => {
      g.fillStyle = `rgba(${rgb},.65)`; g.beginPath(); g.arc(p.x, p.y, 1.8, 0, 7); g.fill();
      for (let j = i + 1; j < dots.length; j++) line(p, dots[j], 120, rgb);
      line(p, { x: mx, y: my }, 190, rgb);
    });
  }
  function tick() {
    if (visible) { dots.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }); draw(); }
    requestAnimationFrame(tick);
  }
  new ResizeObserver(size).observe(host);
  host.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  host.addEventListener('pointerleave', () => mx = my = -999);
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(host);
  size(); if (!calm) tick();
}
