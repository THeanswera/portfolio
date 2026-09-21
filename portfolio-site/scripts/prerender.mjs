// Сборка статических страниц: готовую разметку снимает headless-браузер,
// поэтому основной текст, H1 и ссылки видны в исходном HTML без JavaScript.
//
// Источник разметки — уже собранный dist (vite build), а не dev-сервер: иначе
// в страницы попадали бы /@vite/client, инлайн-стили Tailwind из режима
// разработки и ссылки на несуществующие файлы.
//
// Почему браузер, а не рендер в строку: страницы используют те же компоненты,
// что и раньше (шапка, квиз, наблюдатель появления), и вторая разметка
// разошлась бы с интерактивной. Ждём отрисовки — снимаем ровно тот DOM.
//
// Запуск (из npm run build): node scripts/prerender.mjs
import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import {
  closePage,
  CONTAINER_FLAGS,
  findChrome,
  goto,
  openPage,
  sleep,
  waitForBrowser,
} from './lib/cdp.mjs';
import { buildJobs, siteInfo } from './lib/pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');
// Профиль браузера лежит вне проекта: инструменты сборки следят за файлами
// рабочей папки и падают на заблокированном профиле Chrome (EBUSY на Cookies).
const tmp = path.join(tmpdir(), 'portfolio-prerender');
const PORT = 9344;
const APP_PORT = 5209;

const jobs = buildJobs();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

/** Отдаёт собранный сайт так же, как это сделает хостинг: папка → index.html. */
function startStaticServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${APP_PORT}`);
    let file = path.join(dist, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');

    try {
      const body = await readFile(file);
      response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('не найдено');
    }
  });

  return new Promise((resolve) => server.listen(APP_PORT, '127.0.0.1', () => resolve(server)));
}

/** Путь от папки страницы до корня сайта: для главной '', для /cases/x/ — '../..'. */
function upToRoot(file) {
  const depth = file.split('/').length - 1;
  return depth === 0 ? '' : '../'.repeat(depth);
}

/** Ждём, пока React отрисует разметку внутри контейнера. */
async function waitForMarkup(client) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const { result } = await client.send('Runtime.evaluate', {
      expression: "document.getElementById('prerender-root')?.children.length ?? 0",
      returnByValue: true,
    });
    if (result.value > 0) return;
    await sleep(150);
  }
  throw new Error('Страница не отрисовалась за отведённое время');
}

/**
 * Страховка от «пустой полосы» вместо страницы: если разметка отрисовалась не
 * полностью, сборка должна упасть, а не выложить оболочку без текста.
 */
function assertContent(html, file) {
  if (!/<h1[\s>]/.test(html)) throw new Error(`${file}: в разметке нет <h1>`);
  if (!/<main[\s>]/.test(html)) throw new Error(`${file}: в разметке нет <main>`);

  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length < 500) throw new Error(`${file}: текста в разметке слишком мало (${text.length})`);
}

async function capture(client, url) {
  await goto(client, url, { settle: 1500 });
  await waitForMarkup(client);

  const { result } = await client.send('Runtime.evaluate', {
    expression: 'document.documentElement.outerHTML',
    returnByValue: true,
  });
  return result.value;
}

/**
 * Приводит адреса страницы к виду, который работает по любому URL.
 *
 * Ссылки в разметке абсолютные: '/privacy.html', '/cases/sextant/'. Это верно
 * для страниц, которые всегда лежат на своём месте, но неверно для страницы
 * ошибки — её отдаёт адрес вроде /nope, и абсолютный путь всё равно попадёт в
 * корень. Поэтому у вложенных страниц абсолютные адреса заменяются на путь от
 * их папки, а './x' (относительный от документа) — на '../x': так одна и та же
 * разметка не зависит от того, по какому адресу её открыли.
 */
function makeRefsRelative(html, up) {
  if (!up) return html;

  return html
    .replace(/(\b(?:href|src)=")\.\/(?!\.)/g, `$1${up}`)
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${up}`)
    .replace(/(<meta property="og:image" content=")\/(?!\/)/g, `$1${up}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Убирает служебные переносы и комментарии из снятой разметки.
 *
 * Правило одно: пробелы между тегами не несут смысла, а внутри текста — несут.
 * Поэтому сжимаем только последовательности «>…<» и не трогаем содержимое
 * textarea: там переносы — часть текста заявки.
 */
function minifyHtml(html) {
  const areas = [];

  // Текст в textarea сохраняем как есть.
  const guarded = html.replace(/(<textarea[^>]*>)([\s\S]*?)(<\/textarea>)/g, (_match, open, body, close) => {
    areas.push(body);
    return `${open}\u0000${areas.length - 1}\u0000${close}`;
  });

  const minified = guarded
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return minified.replace(/\u0000(\d+)\u0000/g, (_match, index) => areas[Number(index)]);
}

/**
 * Подставляет метаданные страницы: title, description, canonical, Open Graph.
 *
 * Заголовок в шаблоне есть, остального нет: description, canonical и og-теги
 * появляются здесь, поэтому одинаковых canonical у разных кейсов быть уже не
 * может — адрес страницы задан в manifest.ts, а не в общей разметке.
 */
function applyMeta(html, page) {
  const image = page.ogImage ?? `${siteInfo.origin}/og-image.png`;
  const ogTitle = page.ogTitle ?? page.title;
  const ogDescription = page.ogDescription ?? page.description;
  const robots = page.noindex
    ? '<meta name="robots" content="noindex, follow" />'
    : '<meta name="robots" content="index, follow" />';

  // Убираем прежние теги, если страница уже приходила с ними.
  let out = html
    .replace(/<meta\s+name="description"[^>]*>/g, '')
    .replace(/<meta\s+name="robots"[^>]*>/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>/g, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*>/g, '')
    .replace(/<meta\s+name="twitter:card"[^>]*>/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);

  const head = [
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${page.canonical}" />`,
    `<meta property="og:type" content="${page.kind === 'case' ? 'article' : 'website'}" />`,
    '<meta property="og:locale" content="ru_RU" />',
    `<meta property="og:site_name" content="${escapeHtml(siteInfo.name)}" />`,
    `<meta property="og:url" content="${page.canonical}" />`,
    `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    robots,
  ].join('\n    ');

  out = out.replace('</head>', `  ${head}\n  </head>`);

  return out;
}

const chrome = findChrome();
if (!chrome) {
  console.error('Не найден Chrome или Edge для сборки статических страниц.');
  process.exit(1);
}

try {
  await readFile(path.join(dist, 'render.html'));
} catch {
  console.error('Нет dist/render.html — сначала выполните vite build.');
  process.exit(1);
}

await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });

const server = await startStaticServer();
const browser = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    ...CONTAINER_FLAGS,
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(tmp, 'profile')}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let failed = false;

try {
  await waitForBrowser(PORT);
  const { client, targetId } = await openPage(PORT);

  for (const job of jobs) {
    const url = `http://127.0.0.1:${APP_PORT}/${job.url}`;
    const html = await capture(client, url);
    const up = upToRoot(job.file);
    const target = path.join(dist, job.file);

    await mkdir(path.dirname(target), { recursive: true });
    const output = minifyHtml(makeRefsRelative(applyMeta(html, job.page), up));
    assertContent(output, job.file);
    await writeFile(target, output, 'utf8');

    const size = (await readFile(target, 'utf8')).length / 1024;
    process.stdout.write(`  ${job.file.padEnd(32)} ${size.toFixed(1)} КБ\n`);
  }

  await closePage(PORT, targetId);
} catch (error) {
  failed = true;
  console.error(`\nСборка страниц не удалась: ${error.message}`);
} finally {
  browser.kill();
  server.close();
  // Профиль браузера может остаться заблокированным пару секунд после закрытия:
  // это не повод считать сборку неудачной.
  await sleep(400);
  await rm(tmp, { recursive: true, force: true }).catch(() => {});
}

if (failed) process.exit(1);
console.log(`\nСтатических страниц: ${jobs.length}`);
