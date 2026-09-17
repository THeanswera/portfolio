// Скриншоты произвольных страниц: node scripts/shot-urls.mjs <outDir> <width> <url...>
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser, waitForBrowser, openPage, closePage, goto, evaluate, screenshot, sleep } from './lib/cdp.mjs';

const [outDirArg, widthArg, ...urls] = process.argv.slice(2);
if (!outDirArg || !widthArg || urls.length === 0) {
  console.error('Использование: node scripts/shot-urls.mjs <папка> <ширина> <url...>');
  process.exit(1);
}

const width = Number(widthArg);
const height = Math.round(width * 0.66);
const outDir = path.resolve(outDirArg);
const profileDir = path.resolve('.tmp-shoturls-profile');
await mkdir(outDir, { recursive: true });
await mkdir(profileDir, { recursive: true });

const PORT = 9337;
const browser = launchBrowser({ port: PORT, profileDir });

try {
  await waitForBrowser(PORT);
  const { client, targetId } = await openPage(PORT);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });

  let index = 0;
  for (const url of urls) {
    index += 1;
    const name = `${String(index).padStart(2, '0')}-${(url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '') || 'page').slice(0, 70)}.png`;
    await goto(client, url, { settle: 3000 });
    await evaluate(
      client,
      `(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 900));
        return true;
      })()`,
    );
    const full = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: Math.min(4200, await evaluate(client, 'document.documentElement.scrollHeight')), scale: 1 },
    });
    const { writeFile } = await import('node:fs/promises');
    await writeFile(path.join(outDir, name), Buffer.from(full.data, 'base64'));
    console.log(`✓ ${name}`);
  }

  client.close();
  await closePage(PORT, targetId);
} finally {
  browser.kill();
  await sleep(300);
}
