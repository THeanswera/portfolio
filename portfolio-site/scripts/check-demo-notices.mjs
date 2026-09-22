// Проверка пометок о демонстрационном проекте на демо-сайтах.
//
// Аудит требовал обозначить демо явно: посетитель не должен читать гарантии и
// цены вымышленной компании как настоящие. Проверка смотрит на собранную
// страницу, а не на исходник, — иначе пропустит случай, когда пометка есть в
// шаблоне, но на страницу не попала.
//
// Запуск: node scripts/check-demo-notices.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { closePage, goto, launchBrowser, openPage, waitForBrowser } from './lib/cdp.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const PORT = 4212;
const CDP = 9362;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

/** Сайты для проверки: папка сборки и адреса страниц. */
const SITES = [
  {
    id: 'remont',
    name: 'ТехРемонт (rootlost.ru/remont/)',
    dir: path.join(root, 'demos', 'remont'),
    pages: ['/', '/prices.html', '/about.html'],
    // Обещаний реальной компании на демо быть не должно.
    forbidden: ['2014', '12 месяцев', 'гарантийный талон на 12', 'techremont.example'],
  },
  {
    id: 'forma',
    name: 'Форма (masterskaya-forma.ru)',
    dir: path.resolve(root, '..', 'masterskaya-forma', 'dist'),
    pages: ['/', '/configurator/', '/privacy/'],
    forbidden: [],
  },
];

const problems = [];

function startServer(dir) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
    let file = path.join(dir, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    try {
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end('нет');
    }
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

const profile = path.join(tmpdir(), 'portfolio-demo-notices');
launchBrowser({ port: CDP, profileDir: profile });
await waitForBrowser(CDP);
const { client, targetId } = await openPage(CDP);
await client.send('Runtime.enable');
await client.send('Page.enable');
await client.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

try {
  for (const site of SITES) {
    const server = await startServer(site.dir);
    console.log(`\n${site.name}`);

    for (const page of site.pages) {
      await goto(client, `http://127.0.0.1:${PORT}${page}`, { settle: 1600 });

      const state = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const notice = document.querySelector('.footer__demo');
          const style = notice ? getComputedStyle(notice) : null;
          const box = notice?.getBoundingClientRect();
          const text = document.body.textContent.split(/[ \\n\\t]+/).join(' ');
          return {
            notice: Boolean(notice),
            text: notice ? notice.textContent.split(/[ \\n\\t]+/).join(' ').trim() : '',
            color: style ? style.color : '',
            visible: box ? box.width > 100 && box.height > 24 : false,
            // Телефон-заглушка и признак «услуги не оказываются» должны быть рядом.
            mentionsDemo: /демонстрацион|вымышлен/i.test(text),
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        })()`,
        returnByValue: true,
      });

      const value = state.result.value;
      const marks = [];
      if (!value.notice) problems.push(`${site.id} ${page}: нет пометки .footer__demo`);
      if (!value.visible) problems.push(`${site.id} ${page}: пометка есть, но не видна (размер 0)`);
      if (value.notice && !value.mentionsDemo) problems.push(`${site.id} ${page}: в пометке нет слов о демонстрационном проекте`);
      if (value.overflow > 1) problems.push(`${site.id} ${page}: горизонтальное переполнение ${value.overflow}px`);
      if (value.notice) marks.push('пометка видна');
      if (value.overflow <= 1) marks.push('переполнения нет');

      console.log(`  ${page.padEnd(18)} ${marks.join(', ')}`);

      if (site.forbidden.length > 0) {
        const source = await readFile(
          path.join(site.dir, page === '/' ? 'index.html' : page.replace(/^\//, '')),
          'utf8',
        ).catch(() => '');
        for (const phrase of site.forbidden) {
          if (new RegExp(phrase, 'i').test(source)) {
            problems.push(`${site.id} ${page}: осталось «${phrase}»`);
          }
        }
      }
    }

    server.close();
  }
} finally {
  await closePage(CDP, targetId);
  await new Promise((resolve) => setTimeout(resolve, 300));
}

if (problems.length === 0) {
  console.log('\nЗамечаний нет: на демо-сайтах есть видимая пометка, лишних обещаний нет.');
  process.exit(0);
}

for (const problem of problems) console.log(`  ✗ ${problem}`);
console.log(`\nЗамечаний: ${problems.length}`);
process.exit(1);
