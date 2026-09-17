/**
 * Разбор конкретного блока: ширины детей и их родителей.
 * Запуск: node scripts/debug-block.mjs <path> <width> <селектор>
 */
import { withBrowser, sleep } from './cdp.mjs';
import { startServer } from './lib/server.mjs';

const path = process.argv[2] ?? '/';
const width = Number(process.argv[3] ?? 360);
const selector = process.argv[4] ?? '.hero__content';
const port = Number(process.argv[5] ?? 4174);

const local = await startServer({ root: 'dist', port });
const browser = await withBrowser({ port: 9340 });

try {
  const page = await browser.open(`${local.url}${path}`, { width, height: 800 });
  await sleep(600);

  const report = await page.evaluate(`(() => {
    const root = document.querySelector(${JSON.stringify(selector)});
    if (!root) return 'селектор не найден';

    const rows = [];
    const walk = (el, depth) => {
      const rect = el.getBoundingClientRect();
      rows.push({
        depth,
        tag: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''),
        w: Math.round(rect.width),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        minW: getComputedStyle(el).minWidth,
        display: getComputedStyle(el).display,
      });
      if (depth < 3) [...el.children].forEach((child) => walk(child, depth + 1));
    };

    walk(root, 0);
    const chain = [];
    let node = root;
    while (node && node !== document.documentElement) {
      chain.push(node.tagName.toLowerCase() + (typeof node.className === 'string' && node.className ? '.' + node.className.split(' ')[0] : '') + '=' + Math.round(node.getBoundingClientRect().width));
      node = node.parentElement;
    }

    return JSON.stringify({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, chain: chain.join(' < '), rows: rows.slice(0, 16) }, null, 1);
  })()`);

  console.log(report);
  await page.close();
} finally {
  await browser.close();
  await local.close();
}
