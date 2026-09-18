/**
 * Общая оболочка страниц: <head>, шапка, подвал, микроразметка.
 * Ссылки внутри сайта строятся через u(), чтобы сайт работал и в подпапке.
 */
import { site, nav, footer } from '../data/content.mjs';

/**
 * Префикс адреса. Локально и в проверках сайт живёт в корне (пусто),
 * на хостинге публикуется в подпапку — тогда сборка идёт с SEXTANT_BASE=/sextant.
 */
export const BASE = process.env.SEXTANT_BASE ?? '';

export const u = (path = '/') => {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`.replace(/\/{2,}/g, '/');
};

const mark = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <circle cx="16" cy="16" r="14.2" fill="none" stroke="currentColor" stroke-width="1.1"/>
  <path d="M16 3.2v25.6M3.2 16h25.6" stroke="currentColor" stroke-width="0.6" opacity="0.45"/>
  <path d="M16 16 6.6 7.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M16 16l9.4-8.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="2.1" fill="currentColor"/>
</svg>`;

const header = `<header class="header" data-header>
  <div class="container header__inner">
    <a class="brand" href="${u('/')}" aria-label="${site.name} — на главную">
      ${mark}
      <span class="brand__text">
        <span class="brand__name">${site.name}</span>
        <span class="brand__tag">${site.tagline}</span>
      </span>
    </a>

    <nav class="nav" aria-label="Основная навигация">
      ${nav
        .map(
          (item) =>
            `<a class="nav__link" href="${u(item.href)}"${item.href === '/configurator/' ? ' data-accent="true"' : ''}>${item.label}</a>`,
        )
        .join('\n      ')}
    </nav>

    <div class="header__actions">
      <a class="header__phone mono" href="tel:${site.phoneHref}">${site.phone}</a>
      <a class="btn btn--ghost btn--small" href="${u('/contacts/')}">Записаться</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Меню">
        <span></span><span></span>
      </button>
    </div>
  </div>

  <div class="progress" data-scroll-progress aria-hidden="true"></div>
</header>

<div class="mobile-menu" id="mobile-menu" data-open="false">
  <nav class="mobile-menu__nav" aria-label="Мобильная навигация">
    ${nav.map((item) => `<a href="${u(item.href)}">${item.label}</a>`).join('\n    ')}
    <a href="${u('/contacts/')}">Контакты</a>
    <a href="${u('/gallery/')}">Галерея</a>
  </nav>
  <div class="mobile-menu__foot">
    <a class="mono" href="tel:${site.phoneHref}">${site.phone}</a>
    <span class="mono muted">${site.address}</span>
  </div>
</div>`;

const footerBlock = `<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="brand" href="${u('/')}">
          ${mark}
          <span class="brand__text">
            <span class="brand__name">${site.name}</span>
            <span class="brand__tag">${site.latin}</span>
          </span>
        </a>
        <p class="footer__note">${footer.note}</p>
      </div>

      ${footer.columns
        .map(
          (column) => `<nav class="footer__col" aria-label="${column.title}">
        <h2 class="footer__title">${column.title}</h2>
        <ul>${column.links.map((link) => `<li><a href="${u(link.href)}">${link.label}</a></li>`).join('')}</ul>
      </nav>`,
        )
        .join('\n      ')}
    </div>

    <div class="footer__bottom">
      <span class="mono">© ${new Date().getFullYear()} ${site.name} · ${site.address}</span>
      <span class="mono">${site.hours}</span>
    </div>
  </div>
</footer>`;

export function pageSchema({ title, description, path }) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${site.name} — ${site.tagline}`,
    url: `${site.url}${path === '/' ? '' : path}`,
    description,
    inLanguage: 'ru-RU',
    publisher: {
      '@type': 'Organization',
      name: site.name,
      email: site.email,
      telephone: site.phone,
    },
  });
}

/**
 * @param {object} options
 *   title, description, path — метаданные страницы
 *   content — разметка страницы
 *   scripts — какие сценарии подключать (main всегда, page — по необходимости)
 *   bodyClass — класс для стилей конкретной страницы
 */
export function layout({ title, description, path, content, page = null, bodyClass = '' }) {
  const fullTitle = path === '/' ? `${site.name} — ${title}` : `${title} · ${site.name}`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${site.url}${path === '/' ? '/' : path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${site.url}${path === '/' ? '/' : path}">
<meta property="og:image" content="${site.url}${site.ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0c0a08">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${u('/assets/fonts/cormorant-garamond-cyrillic.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/assets/fonts/golos-text-cyrillic.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u('/assets/css/app.css')}">
<script type="importmap">{"imports":{"three":"${u('/assets/vendor/three.module.min.js')}"}}</script>
<script type="application/ld+json">${pageSchema({ title, description, path })}</script>
</head>
<body class="${bodyClass}" data-page="${path}">
<div class="grain" aria-hidden="true"></div>

<div class="preloader" data-preloader>
  <div class="preloader__inner">
    <span class="preloader__mark">${mark}</span>
    <span class="preloader__name">${site.name}</span>
    <span class="preloader__count mono" data-preloader-count>0</span>
    <span class="preloader__line"><i></i></span>
  </div>
</div>

<a class="skip" href="#main">К содержанию</a>
${header}

<main id="main">
${content}
</main>

${footerBlock}

<div class="cursor" data-cursor aria-hidden="true"><span></span></div>

<script type="module" src="${u('/assets/js/main.js')}"></script>
${page ? `<script type="module" src="${u(`/assets/js/pages/${page}.js`)}"></script>` : ''}
</body>
</html>
`;
}
