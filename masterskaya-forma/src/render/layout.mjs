/** Каркас страницы: <head>, шапка, подвал, мелкие блоки. */
import { site, nav } from '../data/site.mjs';
import { icon } from './icons.mjs';

/** Ссылка с учётом base — работает и в корне домена, и в подпапке. */
export const u = (path) => `${site.base}${path}`;

const escapeAttr = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export function head({ title, description, path, jsonLd }) {
  const full = title ? `${title} — ${site.legalName}` : `${site.legalName}: кухни и мебель на заказ по вашим размерам`;
  const canonical = `${site.url}${path}`;

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${full}</title>
<script>document.documentElement.classList.add('js')</script>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#111312">
<meta name="format-detection" content="telephone=no">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.legalName}">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="${escapeAttr(full)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}${site.ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${u('/assets/fonts/golos-text-cyrillic-var.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/assets/fonts/ibm-plex-mono-cyrillic-400.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u('/assets/css/app.css')}">
${jsonLd ? `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>` : ''}`;
}

function header(current) {
  return `<a class="skip" href="#main">Перейти к содержанию</a>
<header class="header">
  <div class="container header__inner">
    <a class="logo" href="${u('/')}" aria-label="${site.legalName} — на главную">
      <span class="logo__mark" aria-hidden="true">${site.mark}</span>
      <span class="logo__text">
        <span class="logo__name">${site.name}</span>
        <span class="logo__note">${site.tagline}</span>
      </span>
    </a>

    <nav class="nav" aria-label="Основная навигация">
      ${nav
        .map(
          (item) =>
            `<a href="${u(item.href)}"${item.href === current ? ' aria-current="page"' : ''}>${item.label}</a>`,
        )
        .join('\n      ')}
    </nav>

    <a class="header__phone mono" href="tel:${site.phoneHref}">${site.phone}</a>
    <a class="btn btn--primary btn--small header__cta" href="${u('/configurator/')}">Собрать кухню</a>

    <button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Меню">
      <span></span><span></span>
    </button>
  </div>
</header>

<div class="menu" id="mobile-menu" data-open="false">
  ${nav.map((item) => `<a href="${u(item.href)}">${item.label}</a>`).join('\n  ')}
  <div class="menu__foot">
    <p><a class="mono" href="tel:${site.phoneHref}">${site.phone}</a></p>
    <p><a class="mono" href="mailto:${site.email}">${site.email}</a></p>
    <p>${site.hours}</p>
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
          <span class="logo__mark" aria-hidden="true">${site.mark}</span>
          <span class="logo__text">
            <span class="logo__name">${site.name}</span>
            <span class="logo__note">${site.tagline}</span>
          </span>
        </a>
        <p class="text-soft" style="margin-top:16px;max-width:34ch;font-size:14.5px">
          Делаем кухни, шкафы и столы по индивидуальным размерам. Свой цех, замер, доставка и сборка.
        </p>
      </div>

      <div class="footer__col">
        <h3>Разделы</h3>
        <ul>
          ${nav.map((item) => `<li><a href="${u(item.href)}">${item.label}</a></li>`).join('\n          ')}
        </ul>
      </div>

      <div class="footer__col">
        <h3>Материалы</h3>
        <ul>
          <li><a href="${u('/materials/#facades')}">Фасады</a></li>
          <li><a href="${u('/materials/#worktops')}">Столешницы</a></li>
          <li><a href="${u('/materials/#fittings')}">Фурнитура</a></li>
          <li><a href="${u('/materials/#price')}">Как считается цена</a></li>
        </ul>
      </div>

      <div class="footer__col">
        <h3>Контакты</h3>
        <ul>
          <li><a class="mono" href="tel:${site.phoneHref}">${site.phone}</a></li>
          <li><a class="mono" href="mailto:${site.email}">${site.email}</a></li>
          <li><a href="${site.telegram}" rel="noreferrer" target="_blank">Telegram ${site.telegramHandle}</a></li>
          <li class="text-soft">${site.address}</li>
          <li class="text-soft">${site.hours}</li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <span>© ${year} ${site.legalName}. Изготовление мебели на заказ.</span>
      <span>
        <a href="${u('/privacy/')}">Политика конфиденциальности</a>
        · <button type="button" class="link" data-cookie-open style="background:none;border:0;padding:0;cursor:pointer">Настройки cookie</button>
      </span>
    </div>
  </div>
</footer>`;
}

/** Уведомление об использовании cookie. */
function cookieBanner() {
  return `<aside class="cookie" data-cookie hidden aria-label="Использование cookie">
  <p>
    Сайт использует cookie: они нужны, чтобы работал конфигуратор и запоминались настройки.
    Аналитики и рекламных трекеров здесь нет — подробности в
    <a class="link" href="${u('/privacy/')}">политике конфиденциальности</a>.
  </p>
  <div class="cookie__actions">
    <button class="btn btn--primary btn--small" type="button" data-cookie-choice="all">Принять</button>
    <button class="btn btn--ghost btn--small" type="button" data-cookie-choice="necessary">Только необходимые</button>
  </div>
</aside>`;
}

/** Окно заявки: открывается кнопками «Отправить расчёт» и «Обсудить проект». */
function leadModal() {
  return `<div class="modal" data-lead hidden>
  <div class="modal__backdrop" data-lead-close></div>
  <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="lead-title">
    <button class="modal__close" type="button" data-lead-close aria-label="Закрыть окно">${icon('close', { size: 18 })}</button>

    <p class="label">Заявка</p>
    <h2 class="modal__title" id="lead-title">Отправить расчёт</h2>
    <p class="modal__lead">
      Мы получим вашу конфигурацию целиком — состав, материалы и расчёт.
      Ответим в течение рабочего дня, обычно быстрее.
    </p>

    <form class="modal__form" data-lead-form novalidate>
      <input type="text" name="honey" tabindex="-1" autocomplete="off" class="visually-hidden" aria-hidden="true">
      <label class="field-label"><span>Как вас зовут</span>
        <input class="field" type="text" name="name" required autocomplete="name" placeholder="Имя">
      </label>
      <label class="field-label"><span>Telegram, телефон или e-mail</span>
        <input class="field" type="text" name="contact" required placeholder="@nickname, +7… или почта">
      </label>
      <label class="field-label"><span>Комментарий <span class="text-soft">(не обязательно)</span></span>
        <textarea class="field field--area" name="comment" placeholder="Сроки, пожелания, особенности помещения"></textarea>
      </label>

      <p class="label">Что уйдёт вместе с заявкой</p>
      <div class="modal__summary" data-lead-summary></div>

      <label class="check">
        <input type="checkbox" name="consent" required>
        <span>Согласен на обработку данных по <a class="link" href="${u('/privacy/')}" target="_blank" rel="noreferrer">политике конфиденциальности</a></span>
      </label>

      <button class="btn btn--primary" type="submit">Отправить заявку</button>
      <p class="modal__status" data-lead-status role="status"></p>
      <p class="modal__direct mono">
        Или сразу: <a class="link" href="${site.telegram}" target="_blank" rel="noreferrer">Telegram ${site.telegramHandle}</a>
        · <a class="link" href="mailto:${site.email}">${site.email}</a>
      </p>
    </form>
  </div>
</div>`;
}

/** Полная страница. */
export function page({ title, description, path, body, jsonLd }) {
  return `<!doctype html>
<html lang="ru">
<head>
${head({ title, description, path, jsonLd })}
</head>
<body>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
${cookieBanner()}
${leadModal()}
<script type="module" src="${u('/assets/js/app.js')}"></script>
</body>
</html>
`;
}

/** Заголовок секции: надзаголовок, заголовок и пояснение. */
export function sectionHead({ label, title, text, id }) {
  return `<div class="head">
  <div>
    ${label ? `<p class="label">${label}</p>` : ''}
    <h2${id ? ` id="${id}"` : ''}${label ? ' style="margin-top:14px"' : ''}>${title}</h2>
  </div>
  ${text ? `<div class="head__aside"><p>${text}</p></div>` : ''}
</div>`;
}

/** Хлебные крошки. */
export function crumbs(items) {
  return `<nav class="crumbs" aria-label="Хлебные крошки">
  ${items.map((item, index) => (index === items.length - 1 ? `<span aria-current="page">${item.label}</span>` : `<a href="${u(item.href)}">${item.label}</a><span aria-hidden="true">/</span>`)).join('\n  ')}
</nav>`;
}
