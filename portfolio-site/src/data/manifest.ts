/**
 * Единый список страниц сайта: адреса, заголовки, описания и признак индексации.
 *
 * Источник один для всех: из этих данных собираются статические страницы
 * (scripts/prerender.mjs), карта сайта (scripts/generate-meta.mjs), ссылки в
 * разметке (src/data/pages.ts) и проверки (scripts/check-seo.mjs). Раньше
 * адреса и метаданные жили в трёх местах отдельно и расходились.
 *
 * Тексты кейсов здесь не дублируются: их берут из src/data/site.ts.
 */
export const manifest = {
  origin: 'https://rootlost.ru',

  home: {
    route: '/',
    file: 'index.html',
    title: 'Александра Мельникова — верстка и разработка сайтов',
    description:
      'Верстаю сайты по макету и собираю их под ключ: лендинги, корпоративные сайты, темы WordPress. Адаптив, семантика, выкладка на хостинг и поддержка.',
    heading: 'Сайты, которые не ломаются на телефоне',
    updated: '2026-09-21',
    changefreq: 'monthly',
    priority: '1.0',
    noindex: false,
    inSitemap: true,
  },

  catalog: {
    route: '/cases/',
    file: 'cases/index.html',
    title: 'Кейсы — разборы проектов | Александра Мельникова',
    description:
      'Шесть разобранных проектов: лендинги, корпоративные сайты, тема WordPress, конфигураторы и 3D. По каждому кейсу — задача, решения, экраны и стек.',
    heading: 'Кейсы',
    updated: '2026-09-21',
    changefreq: 'monthly',
    priority: '0.7',
    noindex: false,
    inSitemap: true,
  },

  privacy: {
    route: '/privacy.html',
    file: 'privacy.html',
    title: 'Политика конфиденциальности — Александра Мельникова',
    description:
      'Как сайт-портфолио обрабатывает персональные данные: какие данные собираются, зачем, сколько хранятся и как отозвать согласие.',
    heading: 'Политика конфиденциальности',
    updated: '2026-09-21',
    changefreq: 'yearly',
    priority: '0.3',
    // Политику не выводим в поиск: она нужна посетителю, а не выдаче.
    noindex: true,
    inSitemap: false,
  },

  notFound: {
    route: '/404.html',
    file: '404.html',
    title: 'Страница не найдена — Александра Мельникова',
    description: 'Такого адреса на сайте нет. Ссылки на портфолио и контакты.',
    heading: 'Такой страницы нет',
    updated: '2026-09-21',
    changefreq: 'yearly',
    priority: '0.1',
    noindex: true,
    inSitemap: false,
  },

  /** Опубликованные кейсы. id совпадает с id в данных сайта. */
  cases: [
    {
      id: 'sextant',
      slug: 'sextant',
      titleSuffix: 'сайт часовой мануфактуры с 3D-механикой',
      ogImage: 'https://rootlost.ru/og/sextant.jpg',
      updated: '2026-09-21',
    },
    {
      id: 'forma',
      slug: 'forma',
      titleSuffix: 'сайт мастерской мебели с конфигуратором',
      ogImage: 'https://rootlost.ru/og/forma.jpg',
      updated: '2026-09-21',
    },
    {
      id: 'kitstroy',
      slug: 'kitstroy',
      titleSuffix: 'сайт инженерной компании на WordPress',
      ogImage: 'https://rootlost.ru/og/kitstroy.jpg',
      updated: '2026-09-21',
    },
    {
      id: 'technoremont',
      slug: 'technoremont',
      titleSuffix: 'многостраничный сайт сервисного центра',
      ogImage: 'https://rootlost.ru/og/technoremont.jpg',
      updated: '2026-09-21',
    },
    {
      id: 'sincere',
      slug: 'sincere',
      titleSuffix: 'сайт-портфолио фотографа на WordPress',
      ogImage: 'https://rootlost.ru/og/sincere.jpg',
      updated: '2026-09-21',
    },
    {
      id: 'sertexity',
      slug: 'sertexity',
      titleSuffix: 'промо-сайт платформы арбитража',
      ogImage: 'https://rootlost.ru/og/sertexity.jpg',
      updated: '2026-09-21',
    },
  ],
} as const;

export type Manifest = typeof manifest;
