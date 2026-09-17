// Проверка опубликованного сайта в реальном браузере.
// Запуск: node scripts/verify-live.mjs https://example.ru [папка-для-скриншотов]
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser, waitForBrowser, openPage, closePage, goto, evaluate, screenshot, sleep } from './lib/cdp.mjs';

const url = process.argv[2];
if (!url) {
  console.error('Укажите адрес: node scripts/verify-live.mjs https://example.ru [папка] [--expect "строка|строка"]');
  process.exit(1);
}
const outDir = path.resolve(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '.tmp-live');
const expectIndex = process.argv.indexOf('--expect');
const expected = expectIndex > 0 ? (process.argv[expectIndex + 1] ?? '').split('|').filter(Boolean) : [];

const PORT = 9336;
const profileDir = path.resolve('.tmp-live-profile');
await mkdir(profileDir, { recursive: true });
await mkdir(outDir, { recursive: true });

const browser = launchBrowser({ port: PORT, profileDir });

const probe = `(() => {
  const vw = document.documentElement.clientWidth;
  const isClipped = (el) => {
    let node = el.parentElement;
    while (node && node !== document.documentElement) {
      const ox = getComputedStyle(node).overflowX;
      if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') return true;
      node = node.parentElement;
    }
    return false;
  };
  const offenders = [];
  document.querySelectorAll('body *').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width || isClipped(el)) return;
    if (rect.right > vw + 1 || rect.left < -1) {
      offenders.push({ tag: el.tagName.toLowerCase(), cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60) });
    }
  });
  return {
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? '',
    sections: [...document.querySelectorAll('main section')].map((s) => s.id),
    hasHorizontalScroll: document.documentElement.scrollWidth > vw + 1,
    docScrollWidth: document.documentElement.scrollWidth,
    viewport: vw,
    offenders: offenders.slice(0, 5),
    images: [...document.querySelectorAll('img')].map((img) => ({
      src: img.getAttribute('src'),
      loaded: img.naturalWidth > 0,
    })),
    errors: window.__errors ?? [],
  };
})()`;

try {
  await waitForBrowser(PORT);
  const { client, targetId } = await openPage(PORT);

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__errors = [];
      addEventListener('error', (e) => window.__errors.push(String(e.message || e)));
      addEventListener('unhandledrejection', (e) => window.__errors.push('promise: ' + e.reason));`,
  });

  const results = [];
  for (const size of [
    { width: 1440, height: 900, mobile: false },
    { width: 360, height: 780, mobile: true },
  ]) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1,
      mobile: size.mobile,
    });
    await goto(client, url, { settle: 3200 });
    await evaluate(
      client,
      `(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 1500));
        return true;
      })()`,
    );
    const report = await evaluate(client, probe);
    const text = await evaluate(client, 'document.body.innerText');
    const expectations = expected.map((needle) => ({
      needle,
      found: String(text).includes(needle),
    }));
    results.push({ width: size.width, ...report, expectations });
    await screenshot(client, path.join(outDir, `live-${size.width}.png`));
  }

  console.log(JSON.stringify(results, null, 2));
  client.close();
  await closePage(PORT, targetId);
} finally {
  browser.kill();
  await sleep(400);
}
