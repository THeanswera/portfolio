/**
 * Показывает элементы, которые проверка считает вылезающими за экран.
 * Запуск: node scripts/debug-offenders.mjs <path> <width>
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
  await sleep(800);

  const report = await page.evaluate(`(() => {
    const doc = document.documentElement;
    const rows = [];
    const clipped = (el) => {
      let node = el.parentElement;
      while (node && node !== document.body) {
        const overflow = getComputedStyle(node).overflowX;
        if (overflow === 'hidden' || overflow === 'clip' || overflow === 'auto' || overflow === 'scroll') return true;
        node = node.parentElement;
      }
      return false;
    };

    document.querySelectorAll('body *').forEach((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (rect.width === 0 || style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return;
      if (el.closest('.form__honeypot, .skip, .screen-reader-text')) return;
      if (rect.right <= doc.clientWidth + 1 && rect.left >= -1) return;
      rows.push({
        tag: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''),
        w: Math.round(rect.width),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        clipped: clipped(el),
        parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + (typeof el.parentElement.className === 'string' ? el.parentElement.className.split(' ')[0] : '') : '',
        text: (el.textContent || '').trim().slice(0, 24),
      });
    });

    return JSON.stringify({ clientWidth: doc.clientWidth, scrollWidth: doc.scrollWidth, clientHeight: doc.clientHeight, innerHeight: window.innerHeight, rows: rows.slice(0, 10) }, null, 1);
  })()`);

  console.log(report);
  await page.close();
} finally {
  await browser.close();
  await local.close();
}
