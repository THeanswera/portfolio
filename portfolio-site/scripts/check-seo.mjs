// Проверка собранного сайта: адреса, метаданные, ссылки, карта сайта.
//
// Проверяет то, из-за чего кейсы не индексировались по отдельности: у всех
// шести страниц был один canonical, одинаковый title и отсутствие текста в
// исходном HTML. Скрипт читает готовые файлы dist — без запуска браузера,
// поэтому ловит и то, что видит робот без JavaScript.
//
// Запуск: node scripts/check-seo.mjs [папка-сборки]
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  allPages,
  casePages,
  homePage,
  notFoundPage,
  sitemapPages,
  siteInfo,
} from './lib/pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.resolve(process.argv[2] ?? path.join(root, 'dist'));

const problems = [];
const fail = (message) => problems.push(message);

async function collectHtml(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await collectHtml(path.join(dir, entry.name), rel)));
    else if (entry.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

/** Все файлы сборки: по ним проверяем, что ссылка ведёт на существующий файл. */
async function collectAll(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = new Set();
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      for (const nested of await collectAll(path.join(dir, entry.name), rel)) files.add(nested);
    } else {
      files.add(rel);
    }
  }
  return files;
}

const files = await collectHtml(dist);
const allFiles = await collectAll(dist);
const html = new Map();
for (const file of files) html.set(file, await readFile(path.join(dist, file), 'utf8'));

const attr = (source, pattern) => source.match(pattern)?.[1] ?? null;
const meaningful = (source) =>
  source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// 1. У каждой страницы свои title, description, canonical и один H1.
const seen = { titles: new Map(), canonicals: new Map() };

for (const page of [...allPages, notFoundPage]) {
  const source = html.get(page.file);
  if (!source) {
    fail(`нет файла ${page.file} — страница «${page.route}» не собрана`);
    continue;
  }

  const title = attr(source, /<title>([\s\S]*?)<\/title>/);
  const canonical = attr(source, /<link rel="canonical" href="([^"]+)"/);
  const description = attr(source, /<meta name="description" content="([^"]*)"/);
  const h1 = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1Count = (source.match(/<h1[\s>]/g) ?? []).length;
  const body = meaningful(source.replace(/[\s\S]*?<body[^>]*>/, ''));

  if (!title) fail(`${page.file}: нет <title>`);
  if (title !== page.title) fail(`${page.file}: title «${title}» не совпадает с manifest.json`);
  if (!description || description.length < 40) fail(`${page.file}: description пустой или короткий`);
  if (canonical !== page.canonical) fail(`${page.file}: canonical «${canonical}» вместо «${page.canonical}»`);

  if (!h1) fail(`${page.file}: нет <h1>`);
  if (h1Count !== 1) fail(`${page.file}: заголовков h1 — ${h1Count}, должен быть один`);

  if (body.length < 400) fail(`${page.file}: в исходном HTML почти нет текста (${body.length} символов)`);

  for (const [map, value, what] of [
    [seen.titles, title, 'title'],
    [seen.canonicals, canonical, 'canonical'],
  ]) {
    if (!value) continue;
    if (map.has(value)) fail(`${what} повторяется: ${page.file} и ${map.get(value)} → «${value}»`);
    else map.set(value, page.file);
  }

  // Метаданные для превью ссылок: og:url и og:image есть у каждой страницы.
  if (attr(source, /<meta property="og:url" content="([^"]+)"/) !== page.canonical) {
    fail(`${page.file}: og:url не совпадает с canonical`);
  }
  const ogImage = attr(source, /<meta property="og:image" content="([^"]+)"/);
  if (!ogImage || ogImage.includes('undefined')) {
    fail(`${page.file}: нет корректного og:image`);
  } else {
    // Адрес картинки должен вести на существующий файл сборки.
    const local = ogImage.replace(`${siteInfo.origin}/`, '');
    if (!allFiles.has(local)) fail(`${page.file}: og:image ведёт на несуществующий файл ${local}`);
  }
  if (!attr(source, /<meta property="og:title" content="([^"]+)"/)) fail(`${page.file}: нет og:title`);
  if (!attr(source, /<meta property="og:description" content="([^"]+)"/)) fail(`${page.file}: нет og:description`);

  const robots = attr(source, /<meta name="robots" content="([^"]+)"/);
  if (page.noindex ? !robots?.includes('noindex') : !robots?.includes('index')) {
    fail(`${page.file}: robots «${robots}» не соответствует manifest.json`);
  }
}

// 2. Ссылки и якоря: цель должна существовать, а якорь — быть в целевом файле.
// Старый адрес case.html не проверяем: на хостинге его перенаправляет Apache,
// а сам файл помечен noindex — внутренних ссылок на него быть не должно, и это
// проверяется отдельно ниже.
function resolveHref(href, fromFile) {
  const [rawTarget, hash] = href.split('#');
  const target = (rawTarget ?? '').split('?')[0];

  // Якорь без пути — раздел текущей страницы.
  if (target === '') return { file: fromFile, hash };

  // Адрес от корня сайта: '/assets/app.js' и '/cases/sextant/'.
  const relative = target.replace(/^\/+/, '');
  const base = path.posix.dirname(fromFile);
  const joined = path.posix.join(base === '.' ? '' : base, relative);
  const resolved = path.posix.normalize(`./${joined}`).replace(/^\.\//, '');

  // '.' — это ссылка на корень сайта, то есть на главную страницу.
  if (resolved === '' || resolved === '.' || resolved.endsWith('/')) {
    return { file: `${resolved === '.' ? '' : resolved}index.html`, hash };
  }
  return { file: resolved, hash };
}

const idsByFile = new Map();
for (const [file, source] of html) {
  idsByFile.set(file, new Set([...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
}

let checkedLinks = 0;
for (const [file, source] of html) {
  // Старый адрес кейсов: сервер перенаправляет его, локально он открывается
  // скриптом — проверять его ссылки как обычную страницу смысла нет.
  if (file === 'case.html') continue;

  for (const match of source.matchAll(/\b(href|src)="([^"]+)"/g)) {
    const href = match[2];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(href)) continue;
    checkedLinks += 1;

    const { file: targetFile, hash } = resolveHref(href, file);
    if (!allFiles.has(targetFile)) {
      fail(`${file}: ссылка «${href}» ведёт на несуществующий файл ${targetFile}`);
      continue;
    }
    // Якорь проверяем только у ссылок на другие страницы сборки.
    if (hash && html.has(targetFile) && !idsByFile.get(targetFile).has(hash)) {
      fail(`${file}: ссылка «${href}» — в ${targetFile} нет элемента #${hash}`);
    }
  }
}

// 3. Карта сайта: только канонические страницы, и все они на месте.
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8').catch(() => null);
if (!sitemap) {
  fail('нет sitemap.xml');
} else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = sitemapPages.map((page) => page.canonical);

  for (const url of expected) {
    if (!locs.includes(url)) fail(`sitemap: нет канонического адреса ${url}`);
  }
  for (const url of locs) {
    if (!expected.includes(url)) fail(`sitemap: лишний адрес ${url}`);
  }
  if (/#|\?/.test(locs.join(' '))) fail('sitemap: адреса не должны содержать якорей и параметров');

  const lastmodOf = (url) => sitemap.match(new RegExp(`<loc>${url}</loc>\\s*<lastmod>([^<]+)</lastmod>`))?.[1];
  for (const page of sitemapPages) {
    if (lastmodOf(page.canonical) !== page.updated) {
      fail(`sitemap: lastmod для ${page.canonical} не совпадает с датой обновления страницы`);
    }
  }

  // Шесть кейсов обязаны быть в карте — это и было замечанием аудита.
  if (casePages.length !== 6) fail(`кейсов в сборке ${casePages.length}, ожидалось 6`);
  for (const page of casePages) {
    if (!locs.includes(page.canonical)) fail(`sitemap: кейс ${page.canonical} не попал в карту`);
  }
}

// 4. robots.txt и старые адреса.
const robotsTxt = await readFile(path.join(dist, 'robots.txt'), 'utf8').catch(() => null);
if (!robotsTxt) fail('нет robots.txt');
else {
  if (!/Sitemap:\s*https:\/\/rootlost\.ru\/sitemap\.xml/.test(robotsTxt)) fail('robots.txt: нет ссылки на карту сайта');
  if (!/Allow:\s*\//.test(robotsTxt)) fail('robots.txt: обход сайта не разрешён');
  if (/Disallow:\s*\/\s*$/m.test(robotsTxt)) fail('robots.txt: закрыт весь сайт');
  if (!/Disallow:\s*\/case\.html/.test(robotsTxt)) {
    fail('robots.txt: старый адрес кейсов не закрыт от индексации');
  }
}

// 5. Карта редиректов: старые адреса кейсов должны существовать в .htaccess.
// Правило проверяем здесь, потому что на хостинге оно не проверяется автоматически,
// а ошибка в нём отправляет посетителя не туда.
const htaccess = await readFile(path.join(dist, '.htaccess'), 'utf8').catch(() => null);
if (!htaccess) {
  fail('в сборке нет .htaccess — старые адреса кейсов не будут перенаправляться');
} else {
  for (const page of casePages) {
    const slug = page.work.slug;
    if (!new RegExp(`work=${slug}[^\\n]*\\n\\s*RewriteRule[^\\n]*\\/cases\\/${slug}\\/`).test(htaccess)) {
      fail(`.htaccess: нет постоянного перехода с /case.html?work=${slug} на /cases/${slug}/`);
    }
  }
  if (!/ErrorDocument 404 \/404\.html/.test(htaccess)) fail('.htaccess: страница ошибки не подключена');
  if (!/ErrorDocument 410 \/404\.html/.test(htaccess)) {
    fail('.htaccess: для удалённых адресов не подключена страница 410');
  }
  if (!/RewriteRule \^case\\\.html\$ \/cases\/ \[R=301,L\]/.test(htaccess)) {
    fail('.htaccess: старый адрес без параметра не ведёт в каталог кейсов');
  }
  if (!/THE_REQUEST[^\n]*index\\\.html/.test(htaccess)) fail('.htaccess: нет перехода с index.html на адрес каталога');

  // В поиске ещё видны адреса прежнего сайта на WordPress — они должны отвечать
  // 410 Gone, а не отдавать 404 «не найдено» и не вести на главную.
  const gone = [
    { pattern: '^services(/.*)?$', what: '/services/' },
    { pattern: '^20[0-9]{2}(/[0-9]{2})?(/.*)?$', what: 'записи блога по датам (/2026/03/11/hello-world/)' },
    { pattern: '^(category|tag|author)(/.*)?$', what: 'рубрики, метки и авторы' },
    { pattern: '^wp-login\\.php$', what: '/wp-login.php' },
  ];

  for (const rule of gone) {
    if (!htaccess.includes(rule.pattern)) fail(`.htaccess: нет ответа 410 для ${rule.what}`);
  }
  if (!/\^wp-sitemap\.\*\$ - \[G,L\]/.test(htaccess) && !htaccess.includes('^wp-sitemap.*$ - [G,L]')) {
    fail('.htaccess: карта сайта прежнего WordPress не закрыта');
  }
}

// 6. На главной и на страницах кейсов должны быть контакты без JavaScript.
for (const page of [homePage, ...casePages]) {
  const source = html.get(page.file) ?? '';
  if (!source.includes(siteInfo.telegram)) fail(`${page.file}: в исходном HTML нет ссылки на Telegram`);
  if (!source.includes(`mailto:${siteInfo.email}`)) fail(`${page.file}: в исходном HTML нет ссылки на почту`);
}

// 6. Страница 404 должна быть компактной и без чужих скриптов.
const notFound = html.get(notFoundPage.file);
if (notFound) {
  const size = Buffer.byteLength(notFound, 'utf8');
  if (size > 60_000) fail(`404.html весит ${(size / 1024).toFixed(0)} КБ — должно быть заметно меньше`);
  if (/reg\.ru|inregru/i.test(notFound)) fail('404.html содержит разметку хостинга');
  if (!/Ошибка 404/.test(notFound)) fail('404.html: нет понятного заголовка об ошибке');
}

// 7. Ни на одной странице не должно быть ссылок на старый общий адрес кейсов,
// а сам старый адрес не должен попадать в поиск.
for (const [file, source] of html) {
  if (file === 'case.html') continue;

  if (/href="[^"]*case\.html/.test(source)) {
    fail(`${file}: осталась ссылка на старый адрес case.html`);
  }
}

const legacy = html.get('case.html');
if (legacy) {
  if (!/name="robots" content="noindex/.test(legacy)) {
    fail('case.html: старый адрес должен быть закрыт от индексации (noindex)');
  }
  if (!/rel="canonical" href="https:\/\/rootlost\.ru\/cases\//.test(legacy)) {
    fail('case.html: canonical должен указывать на каталог кейсов');
  }
}

console.log(`Страниц: ${files.length}, проверено ссылок: ${checkedLinks}`);
if (problems.length === 0) {
  console.log('Замечаний нет: метаданные уникальны, карта сайта полная, ссылки и якоря на месте.');
  process.exit(0);
}

for (const problem of problems) console.log(`  ✗ ${problem}`);
console.log(`\nЗамечаний: ${problems.length}`);
process.exit(1);
