// Small line icons drawn for this site.
const P = {
  web: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  pen: '<path d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/>',
  cloud: '<path d="M7 18a4 4 0 010-8 6 6 0 0111.5 1.5A3.3 3.3 0 0118 18z"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  chat: '<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
  grow: '<path d="M4 19l6-7 4 3 6-9M15 6h5v5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>',
  call: '<path d="M5 4h4l2 5-2.5 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>'
};
export const icon = n => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
export const paintIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach(e => { if (!e.querySelector('svg')) e.insertAdjacentHTML('afterbegin', icon(e.dataset.icon)); });
