/**
 * Снимок страницы для визуального просмотра и разбора дефектов.
 *
 * Запуск: node scripts/shot.mjs <адрес> <файл.png> [ширина] [высота] [--full] [--at <селектор>]
 *
 *   --full        снять страницу целиком, дождавшись всех картинок
 *   --at <sel>    прокрутить к элементу и снять только экран
 *
 * Ленивые картинки перед съёмкой принудительно переводятся в eager: иначе
 * на полном кадре ниже первого экрана остаются пустые прямоугольники.
 */
import { writeFile } from 'node:fs/promises';
import { withBrowser, sleep } from './cdp.mjs';

const args = process.argv.slice(2);
const [url, out, width = '1440', height = '900'] = args;
const full = args.includes('--full');
const atIndex = args.indexOf('--at');
const at = atIndex === -1 ? null : args[atIndex + 1];

if (!url || !out) {
  console.error('Запуск: node scripts/shot.mjs <адрес> <файл.png> [ширина] [высота] [--full] [--at <селектор>]');
  process.exit(1);
}

const browser = await withBrowser({ port: 9366 });

try {
  const page = await browser.open(url, { width: Number(width), height: Number(height) });
  await page.evaluate(`document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-in'))`);

  if (at) {
    await page.evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(at)});
      if (!node) return false;
      window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 120);
      return true;
    })()`);
  } else if (full) {
    await page.evaluate(`document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; })`);

    /* Прокрутка как человек: с паузами, чтобы сцены и картинки успели появиться. */
    await page.evaluate(`(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      window.scrollTo(0, 0);
    })()`);

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const pending = await page.evaluate('[...document.images].filter((img) => !img.complete).length');
      if (pending === 0) break;
      await sleep(500);
    }
  }

  await sleep(2400);

  const shot = await page.client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
    ...(full
      ? {
          clip: {
            x: 0,
            y: 0,
            width: Number(width),
            height: Math.min(await page.evaluate('document.body.scrollHeight'), 14000),
            scale: 1,
          },
        }
      : {}),
  });

  await writeFile(out, Buffer.from(shot.data, 'base64'));
  console.log('saved', out);
} finally {
  await browser.close();
}
