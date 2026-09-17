/**
 * Поиск источника переполнения по всей высоте страницы: прокручиваем и собираем виновников.
 * Запуск: node scripts/debug-overflow-scan.mjs <path> <width>
 */
import { withBrowser, sleep } from './cdp.mjs';
import { startServer } from './lib/server.mjs';

const path = process.argv[2] ?? '/';
const width = Number(process.argv[3] ?? 360);
const port = Number(process.argv[4] ?? 4174);

const local = await startServer({ root: 'dist', port });
const browser = await withBrowser({ port: 9340 });

try {
  const page = await browser.open(`${local.url}${path}`, { width, height: 800 });
  await sleep(400);

  const report = await page.evaluate(`(async () => {
    const step = window.innerHeight;
    const found = new Map();
    const doc = document.documentElement;

    for (let y = 0; y < doc.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));

      document.querySelectorAll('body *').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return;
        if (rect.right > doc.clientWidth + 1 || rect.width > doc.clientWidth + 1) {
          const key = el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.slice(0, 40) : '');
          if (!found.has(key)) {
            found.set(key, {
              key,
              w: Math.round(rect.width),
              right: Math.round(rect.right),
              parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + (typeof el.parentElement.className === 'string' ? el.parentElement.className.slice(0, 30) : '') : '',
            });
          }
        }
      });
    }

    window.scrollTo(0, 0);
    return JSON.stringify({ clientWidth: doc.clientWidth, scrollWidth: doc.scrollWidth, items: [...found.values()].slice(0, 12) }, null, 1);
  })()`);

  console.log(report);
  await page.close();
} finally {
  await browser.close();
  await local.close();
}
