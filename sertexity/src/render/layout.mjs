/**
 * Общая оболочка страниц: документ, шапка, подвал, мета-теги и микроразметка.
 */
import { site, nav } from '../data/site.mjs';

export const u = (href) => `${site.base}${href}`;

export const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const escapeAttr = escapeHtml;

function header(current) {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="header" data-header>
  <div class="container header__inner">
    <a class="logo" href="${u('/')}" aria-label="${site.name} — home">
      <span class="logo__mark" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M4 20L11 6l4 8 3.2-6L24 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="11" cy="6" r="2.2" fill="currentColor"/>
        </svg>
      </span>
      <span class="logo__text">
        <span class="logo__name">${site.name}</span>
        <span class="logo__note">${site.tagline}</span>
      </span>
    </a>

    <nav class="nav" aria-label="Main navigation">
      ${nav
        .map(
          (item) =>
            `<a href="${u(item.href)}"${item.href === current ? ' aria-current="page"' : ''}>${item.label}</a>`,
        )
        .join('\n      ')}
    </nav>

    <a class="btn btn--primary btn--small header__cta" href="${u('/calculator/')}">
      <span>Start earning</span>
      <span class="btn__arrow" aria-hidden="true">→</span>
    </a>

    <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu">
      <span></span><span></span>
    </button>
  </div>
  <div class="header__progress" data-scroll-progress aria-hidden="true"></div>
</header>

<div class="menu" id="mobile-menu" data-open="false">
  ${nav.map((item) => `<a href="${u(item.href)}">${item.label}</a>`).join('\n  ')}
  <div class="menu__foot">
    <a class="btn btn--primary btn--block" href="${u('/calculator/')}">Start earning</a>
    <p class="mono text-soft">CIK ${site.cik}</p>
  </div>
</div>`;
}

function footer() {
  const year = new Date().getFullYear();

  return `<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__col">
        <a class="logo" href="${u('/')}">
          <span class="logo__mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M4 20L11 6l4 8 3.2-6L24 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="11" cy="6" r="2.2" fill="currentColor"/>
            </svg>
          </span>
          <span class="logo__text">
            <span class="logo__name">${site.name}</span>
            <span class="logo__note">${site.tagline}</span>
          </span>
        </a>
        <p class="text-soft footer__about">
          Cross-venue arbitrage engine: twelve exchanges, one order-book feed and automated execution
          with a time-box on every route.
        </p>
        <p class="footer__cik mono">SEC CIK ${site.cik}</p>
      </div>

      <div class="footer__col">
        <h3>Platform</h3>
        <ul>
          ${nav.map((item) => `<li><a href="${u(item.href)}">${item.label}</a></li>`).join('\n          ')}
        </ul>
      </div>

      <div class="footer__col">
        <h3>Account</h3>
        <ul>
          <li><a href="${u('/calculator/')}">Return calculator</a></li>
          <li><a href="${u('/how-it-works/')}">Risk controls</a></li>
          <li><a href="${u('/markets/')}">Exchange coverage</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h3>Contact</h3>
        <ul>
          <li><a class="mono" href="mailto:${site.email}">${site.email}</a></li>
          <li><a class="mono" href="${site.telegram}" target="_blank" rel="noopener noreferrer">${site.telegramHandle}</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <p>© ${year} ${site.legalName}. Demo build for a portfolio: the platform, numbers and CIK reference come from the original design mockup.</p>
      <p class="mono">No investment advice · Arbitrage carries risk</p>
    </div>
  </div>
</footer>`;
}

/**
 * Полный HTML документ.
 *
 * @param {{title: string, description: string, path: string, content: string, bodyClass?: string, jsonLd?: object}} options
 */
export function layout({ title, description, path, content, bodyClass = '', jsonLd = null }) {
  const canonical = `${site.url}${path}`;
  const full = `${title} — ${site.name}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(full)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#05070d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeAttr(site.name)}">
<meta property="og:title" content="${escapeAttr(full)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}${site.ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${u('/assets/fonts/inter-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/assets/fonts/jetbrains-mono-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u('/assets/css/app.css')}">
${jsonLd ? `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>` : ''}
</head>
<body class="${bodyClass}">
${header(path)}
<main id="main">
${content}
</main>
${footer()}
<script type="module" src="${u('/assets/js/app.js')}"></script>
</body>
</html>`;
}

/** Разметка микроразметки для страницы. */
export function pageSchema({ title, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${site.url}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: site.name,
      url: site.url,
    },
    disambiguatingDescription:
      'Portfolio demo build: the platform, its numbers and the CIK reference come from the original design mockup.',
  };
}
