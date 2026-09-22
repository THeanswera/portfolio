// Проверка вёрстки: слова не должны наезжать друг на друга и вылезать за сетку.
//
// Повод: на демо «ТехРемонт» в css/style.css список селекторов остался без
// закрывающей скобки, и ссылки в крошках, подвале и контактах получили
// position: absolute — текст уехал к левому краю и наложился на заголовки.
// Такое видно не на каждой странице и не на каждой ширине, поэтому проверка
// сравнивает прямоугольники текста в браузере и находит все места сразу.
//
// Запуск:
//   node scripts/check-layout.mjs                        # все сайты репозитория
//   node scripts/check-layout.mjs --site remont           # только демо «ТехРемонт»
//   node scripts/check-layout.mjs --site remont --widths 1440,1024,768,390,320
//   node scripts/check-layout.mjs --base https://rootlost.ru/remont --paths /,/prices.html
//   node scripts/check-layout.mjs --site remont --shots .tmp-layout
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { closePage, goto, launchBrowser, openPage, screenshot, waitForBrowser } from './lib/cdp.mjs';
import { DOUBLED_WORDS_PROBE, FREEZE_MOTION, LAYOUT_PROBE } from './lib/layout.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PORT = 4231;
const CDP = 9371;

/** Сайты репозитория: папка сборки и, при необходимости, список страниц. */
const SITES = [
  {
    id: 'remont',
    name: 'ТехРемонт — rootlost.ru/remont/',
    dir: path.join(root, 'demos', 'remont'),
  },
  {
    id: 'forma',
    name: 'Форма — masterskaya-forma.ru',
    dir: path.resolve(root, '..', 'masterskaya-forma', 'dist'),
  },
  {
    id: 'portfolio',
    name: 'Портфолио — rootlost.ru',
    dir: path.join(root, 'dist'),
  },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const args = process.argv.slice(2);
const argValue = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const problems = [];
const report = [];

function note(text) {
  problems.push(text);
}

/** Все HTML-страницы папки: адрес получается из пути к файлу. */
async function listPages(dir) {
  const found = [];

  async function walk(current, prefix) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        await walk(full, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.html')) {
        // Служебные файлы сборки портфолио в проверку не идут.
        if (entry.name === 'render.html') continue;
        const source = await readFile(full, 'utf8').catch(() => '');
        // Страница-перенаправление уведёт браузер на другой адрес: проверять её
        // разбором вёрстки нельзя, иначе результат будет от чужой страницы.
        if (/http-equiv=["']?refresh/i.test(source)) continue;
        found.push(prefix + entry.name);
      }
    }
  }

  await walk(dir, '/');
  return found
    .map((file) => (file.endsWith('/index.html') ? file.slice(0, -'index.html'.length) : file))
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b, 'ru')));
}

function startServer(dir) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
    let file = path.join(dir, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    try {
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
      response.end(data);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('нет');
    }
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

async function captureFullPage(client, file) {
  const metrics = await client.send('Page.getLayoutMetrics');
  const size = metrics.cssContentSize ?? metrics.contentSize;
  await mkdir(path.dirname(file), { recursive: true });
  await screenshot(client, file, {
    x: 0,
    y: 0,
    width: Math.ceil(size.width),
    height: Math.ceil(size.height),
    scale: 1,
  });
}

const requested = (argValue('--site') ?? SITES.map((site) => site.id).join(','))
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const BASE = argValue('--base');
const WIDTHS = (argValue('--widths') ?? '1440,1024,768,390,320')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value > 0);
const SHOTS = argValue('--shots');
const OUT = argValue('--out');
/** Сужение набора страниц: и для чужого адреса, и для локальной сборки. */
const ONLY_PATHS = argValue('--paths')
  ? argValue('--paths').split(',').map((value) => value.trim()).filter(Boolean)
  : null;

const browserSites = BASE
  ? [
      {
        id: 'live',
        name: BASE,
        dir: null,
        pages: (argValue('--paths') ?? '/').split(',').map((value) => value.trim()),
      },
    ]
  : SITES.filter((site) => requested.includes(site.id));

if (browserSites.length === 0) {
  console.log(`Неизвестный сайт. Доступны: ${SITES.map((site) => site.id).join(', ')}`);
  process.exit(1);
}

for (const site of browserSites) {
  if (!site.dir) continue;
  // Демо мастерской собирается в соседнем проекте: в CI он есть не всегда.
  // Отсутствующая папка — это «проверять нечего», а не дефект.
  if (!existsSync(site.dir)) {
    console.log(`\n${site.name}\n  пропуск: папка сборки не найдена (${site.dir})`);
    site.pages = [];
    site.skip = true;
    continue;
  }
  site.pages = await listPages(site.dir);
  if (ONLY_PATHS) site.pages = site.pages.filter((page) => ONLY_PATHS.includes(page));
  if (site.pages.length === 0) note(`${site.id}: нет собранных страниц (${site.dir})`);
}

const activeSites = browserSites.filter((site) => !site.skip);

launchBrowser({ port: CDP, profileDir: path.join(tmpdir(), 'portfolio-layout') });
await waitForBrowser(CDP);
const { client, targetId } = await openPage(CDP);
await client.send('Runtime.enable');
await client.send('Page.enable');

async function probe(expression) {
  const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) {
    throw new Error(
      String(exceptionDetails.exception?.description ?? exceptionDetails.text ?? 'ошибка в браузере')
        .split('\n')
        .slice(0, 3)
        .join(' | '),
    );
  }
  return result.value;
}

try {
  for (const site of activeSites) {
    const server = site.dir ? await startServer(site.dir) : null;
    console.log(`\n${site.name}`);

    for (const page of site.pages) {
      const url = site.dir ? `http://127.0.0.1:${PORT}${page}` : `${BASE}${page}`;
      const entry = { site: site.id, page, widths: [] };

      for (const width of WIDTHS) {
        await client.send('Emulation.setDeviceMetricsOverride', {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: width <= 480,
        });
        await goto(client, url, { settle: 1200 });
        await probe(FREEZE_MOTION);
        const layout = await probe(LAYOUT_PROBE);

        // Текст от ширины не зависит: повтор слов ищем один раз на страницу.
        const doubled = width === WIDTHS[0] ? await probe(DOUBLED_WORDS_PROBE) : [];
        const marks = [`${width}px: наложений ${layout.collisionCount}, за контейнером ${layout.outside.length}`];
        if (width === WIDTHS[0]) console.log(`  ${page.padEnd(20)} ${marks.join(' · ')}`);
        else console.log(`  ${' '.repeat(20)} ${marks.join(' · ')}`);

        for (const item of layout.collisions) {
          note(
            `${site.id} ${page} @${width}: «${item.a.text}» (${item.a.path}) наезжает на «${item.b.text}» ` +
              `(${item.b.path}) — ${item.overlap.w}×${item.overlap.h}px, ${item.overlap.ratio}% площади`,
          );
        }

        for (const item of layout.outside) {
          note(
            `${site.id} ${page} @${width}: «${item.text}» (${item.path}) выходит за контейнер ` +
              `${item.container} на ${item.overLeft + item.overRight}px`,
          );
        }

        for (const item of doubled) {
          note(`${site.id} ${page}: подряд идут одинаковые слова — «${item.phrase}» (${item.path})`);
        }

        if (layout.scrollWidth > layout.viewport + 1) {
          note(`${site.id} ${page} @${width}: горизонтальная прокрутка ${layout.scrollWidth} > ${layout.viewport}`);
        }

        entry.widths.push({ width, ...layout, doubled });

        if (SHOTS) {
          const name = `${site.id}-${width}-${(page === '/' ? 'index' : page.replace(/^\/|\.html$|\/$/g, '').replace(/\//g, '_'))}.png`;
          await captureFullPage(client, path.join(SHOTS, name));
        }
      }

      report.push(entry);
    }

    server?.close();
  }
} finally {
  await closePage(CDP, targetId);
  await new Promise((resolve) => setTimeout(resolve, 300));
}

if (OUT) {
  await mkdir(path.dirname(path.resolve(OUT)), { recursive: true });
  await writeFile(path.resolve(OUT), JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nОтчёт разбора: ${OUT}`);
}

if (problems.length === 0) {
  const pages = report.reduce((sum, entry) => sum + entry.widths.length, 0);
  console.log(`\nЗамечаний нет: ${pages} проверок, текст нигде не наезжает и не выходит за сетку.`);
  process.exit(0);
}

console.log('');
for (const problem of problems) console.log(`  ✗ ${problem}`);
console.log(`\nЗамечаний: ${problems.length}`);
process.exit(1);
