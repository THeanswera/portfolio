/**
 * Диагностика переполнения: показывает самые широкие элементы и их родителей.
 * Запуск: node scripts/debug-overflow.mjs <path> <width>
 */
import { withBrowser } from './cdp.mjs';
import { startServer } from './lib/server.mjs';

const path = process.argv[2] ?? '/';
const width = Number(process.argv[3] ?? 360);
const port = Number(process.argv[4] ?? 4174);

const local = await startServer({ root: 'dist', port });
const browser = await withBrowser({ port: 9340 });

try {
  const page = await browser.open(`${local.url}${path}`, { width, height: 800 });
  const report = await page.evaluate(`(() => {
    const doc = document.documentElement;
    const rows = [];
    document.querySelectorAll('body *').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > doc.clientWidth + 0.5) {
        rows.push({
          tag: el.tagName.toLowerCase(),
          cls: (typeof el.className === 'string' ? el.className : '').slice(0, 46),
          w: Math.round(rect.width),
          left: Math.round(rect.left),
          parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + (typeof el.parentElement.className === 'string' ? el.parentElement.className.slice(0, 26) : '') : '',
        });
      }
    });
    return JSON.stringify({ clientWidth: doc.clientWidth, scrollWidth: doc.scrollWidth, body: Math.round(document.body.getBoundingClientRect().width), rows: rows.slice(0, 14) }, null, 1);
  })()`);
  console.log(report);
  await page.close();
} finally {
  await browser.close();
  await local.close();
}
