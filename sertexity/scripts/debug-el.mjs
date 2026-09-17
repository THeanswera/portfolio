/**
 * Разбор одного элемента: размеры и вычисленные стили.
 * Запуск: node scripts/debug-el.mjs <path> <width> <селектор>
 */
import { withBrowser, sleep } from './cdp.mjs';
import { startServer } from './lib/server.mjs';

const path = process.argv[2] ?? '/';
const width = Number(process.argv[3] ?? 360);
const selector = process.argv[4] ?? 'a.btn';
const port = Number(process.argv[5] ?? 4174);

const local = await startServer({ root: 'dist', port });
const browser = await withBrowser({ port: 9340 });

try {
  const page = await browser.open(`${local.url}${path}`, { width, height: 800 });
  await sleep(600);

  const report = await page.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return 'не найдено';
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement.getBoundingClientRect();

    return JSON.stringify({
      rect: { w: Math.round(rect.width), left: Math.round(rect.left), right: Math.round(rect.right) },
      parent: { tag: el.parentElement.tagName, w: Math.round(parent.width), left: Math.round(parent.left), display: getComputedStyle(el.parentElement).display },
      style: {
        width: style.width,
        minWidth: style.minWidth,
        maxWidth: style.maxWidth,
        padding: style.paddingLeft + ' / ' + style.paddingRight,
        whiteSpace: style.whiteSpace,
        boxSizing: style.boxSizing,
        gridTemplate: style.gridTemplateColumns,
        justifySelf: style.justifySelf,
        writingMode: style.writingMode,
      },
      scrollWidth: el.scrollWidth,
      inner: [...el.children].map((child) => ({ tag: child.tagName, w: Math.round(child.getBoundingClientRect().width), text: (child.textContent || '').slice(0, 20) })),
    }, null, 1);
  })()`);

  console.log(report);
  await page.close();
} finally {
  await browser.close();
  await local.close();
}
