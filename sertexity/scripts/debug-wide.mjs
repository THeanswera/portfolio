/**
 * Поиск самого широкого элемента страницы: печатает цепочку родителей.
 * Запуск: node scripts/debug-wide.mjs <path> <width>
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
  await sleep(600);

  const report = await page.evaluate(`(() => {
    const limit = ${width};
    const rows = [];

    document.querySelectorAll('body *').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= limit + 0.5) return;
      const style = getComputedStyle(el);
      if (style.position === 'fixed') return;
      if (Number(style.opacity) === 0) return;

      let chain = [];
      let node = el;
      while (node && node !== document.documentElement) {
        const r = node.getBoundingClientRect();
        chain.push(node.tagName.toLowerCase() + (typeof node.className === 'string' && node.className ? '.' + node.className.split(' ')[0] : '') + '=' + Math.round(r.width));
        node = node.parentElement;
      }

      rows.push({ w: Math.round(rect.width), chain: chain.join(' < ') });
    });

    rows.sort((a, b) => b.w - a.w);
    return JSON.stringify({ clientWidth: document.documentElement.clientWidth, rows: rows.slice(0, 8) }, null, 1);
  })()`);

  console.log(report);
  await page.close();
} finally {
  await browser.close();
  await local.close();
}
