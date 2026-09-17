// Скриншоты живой страницы для визуального разбора: снимает и «как есть» после
// обычной прокрутки, и с принудительно раскрытыми блоками.
// Запуск: node scripts/live-audit.mjs <url> --out <папка> --tag <имя> [--width 1440]
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser, waitForBrowser, openPage, closePage, goto, evaluate, sleep } from './lib/cdp.mjs';
import { SCROLL_THROUGH, REVEAL_ALL } from './lib/audit.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const url = args.find((value) => value.startsWith('http'));
const outDir = path.resolve(arg('out', '.tmp-live-audit'));
const tag = arg('tag', 'page');
const width = Number(arg('width', 1440));
const height = Number(arg('height', 900));

if (!url) {
  console.error('Использование: node scripts/live-audit.mjs <url> --out <папка> --tag <имя> [--width 1440]');
  process.exit(1);
}

const PORT = 9341;
const profileDir = path.resolve('.tmp-live-audit-profile');
await mkdir(outDir, { recursive: true });
await mkdir(profileDir, { recursive: true });

const sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = launchBrowser({ port: PORT, profileDir });

async function capture(client, name, { full = false, clip = null } = {}) {
  const metrics = await client.send('Page.getLayoutMetrics');
  const size = metrics.cssContentSize;
  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
    clip: clip ?? (full ? { x: 0, y: 0, width: size.width, height: Math.min(size.height, 12000), scale: 1 } : undefined),
  });
  const file = path.join(outDir, `${tag}-${name}.png`);
  await writeFile(file, Buffer.from(shot.data, 'base64'));
  console.log(`  ✓ ${path.relative(process.cwd(), file)} — ${Math.round(clip?.height ?? size.height)}px`);
  return size;
}

try {
  await waitForBrowser(PORT);
  const { client, targetId } = await openPage(PORT);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 900,
  });

  await goto(client, url, { settle: 2500 });
  await evaluate(client, SCROLL_THROUGH);
  await sleep(1200);

  const asIs = await evaluate(
    client,
    `(() => {
      const hidden = [...document.querySelectorAll('[data-reveal], .head, .card, .promise, .step, .cta, .facts__item, .split__aside, .note-line')]
        .filter((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return Number(s.opacity) < 0.05 && r.height > 20;
        })
        .map((el) => ({
          cls: (typeof el.className === 'string' ? el.className : '').split(/\\s+/).slice(0, 3).join(' '),
          top: Math.round(el.getBoundingClientRect().top + window.scrollY),
          h: Math.round(el.getBoundingClientRect().height),
          text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 50),
        }));
      return {
        height: document.documentElement.scrollHeight,
        errors: window.__errors ?? [],
        hidden,
      };
    })()`,
  );

  console.log(`\n${url} @ ${width}`);
  console.log(`  высота страницы: ${asIs.height}`);
  console.log(`  не появилось после прокрутки: ${asIs.hidden.length}`);
  asIs.hidden.slice(0, 15).forEach((item) => console.log(`    · ${item.top}px +${item.h}px ${item.cls || '—'} «${item.text}»`));

  await evaluate(client, 'window.scrollTo(0, 0)');
  await sleep(400);
  await capture(client, 'asis', { full: true });

  await evaluate(client, REVEAL_ALL);
  await evaluate(client, 'window.scrollTo(0, 0)');
  await sleep(800);
  await capture(client, 'revealed', { full: true });

  client.close();
  await closePage(PORT, targetId);
} finally {
  browser.kill();
  await sleep2(400);
}
