// Public content. The database wins; the starter content in data.js is used while a list is empty or offline.
import { DEFAULTS } from './data.js';
import { backend, configured } from './backend.js';

export const sorted = list => list.sort((a, b) => (a.order || 0) - (b.order || 0) || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
export async function load(name) {
  const fallback = DEFAULTS[name];
  if (!configured) return fallback;
  try {
    const timeout = new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 5000));
    const list = await Promise.race([backend().then(api => api.list(name)), timeout]);
    return list.length ? sorted(list) : fallback;
  } catch (err) { console.warn(`Using starter content for ${name}:`, err.message); return fallback; }
}
export const groupByCategory = list => list.reduce((m, s) => m.set(s.category || 'Other', [...(m.get(s.category || 'Other') || []), s]), new Map());
export const safeImage = src => typeof src === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(src) ? src : '';
export const safeLink = url => typeof url === 'string' && /^https?:\/\//i.test(url) ? url : '';
// "ends" is a yyyy-mm-dd date; the promotion shows through the whole of that day.
export const live = p => p.active !== false && (!p.ends || new Date(p.ends + 'T23:59:59') >= new Date());
