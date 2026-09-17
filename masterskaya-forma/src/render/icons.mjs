/** Набор иконок: тонкие штриховые, 24 × 24, наследуют цвет текста. */
const paths = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  phone:
    '<path d="M6.5 3h3l1.6 4-2.1 1.5a12.5 12.5 0 0 0 6.5 6.5L17 12.9l4 1.6v3a2 2 0 0 1-2.2 2A17.2 17.2 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3z"/>',
  mail: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  shield: '<path d="M12 3l8 3v6c0 4.6-3.3 7.8-8 9-4.7-1.2-8-4.4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  ruler:
    '<path d="M3 15 15 3l6 6L9 21z"/><path d="m7 11 2 2M11 7l2 2M15 15l2 2M11 11l2 2M15 7l-2 2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
  truck:
    '<path d="M3 16V6h11v10"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
  calc: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15v3M8 18h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 13a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v4H3z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
};

export function icon(name, { size = 20, className = '', stroke = 1.6 } = {}) {
  const body = paths[name];
  if (!body) throw new Error(`Нет иконки «${name}»`);
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
