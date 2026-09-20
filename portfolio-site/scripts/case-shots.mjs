// Полные скриншоты страниц для кейсов: высокие кадры, которые прокручиваются
// в рамке браузера, и отдельные экраны для разбора.
// Запуск: node scripts/case-shots.mjs [--only forma]
//
// Важно: перед снимком страница прокручивается целиком и блоки, которые появляются
// при скролле, раскрываются принудительно. Иначе высокий кадр снимается до появления
// секций и на нём остаются пустые однотонные полосы вместо контента.
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { SCROLL_THROUGH, REVEAL_ALL } from './lib/audit.mjs';
import { findFlatBands, emptyShare } from './lib/image-bands.mjs';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.CHROME_BIN,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!CHROME) {
  console.error('Не найден Chrome или Edge.');
  process.exit(1);
}

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];

/** Локальный адрес демо-сайта, если домен ещё не отвечает. */
const FORMA = process.env.FORMA_URL ?? 'https://masterskaya-forma.ru/';
const localRoot = path.resolve('..');

const TARGETS = [
  { id: 'forma', url: FORMA, wait: 3200 },
  { id: 'kitstroy', url: 'https://rootlost.online/', wait: 3200 },
  { id: 'technoremont', url: 'https://rootlost.ru/remont/', wait: 2600 },
  // Первый экран Sincere закреплён на всю высоту окна и не сообщает реальную высоту
  // документа: снимаем в окно повыше, иначе в кадре оказывается только шапка.
  { id: 'sincere', url: 'https://sincere-family.ru/', wait: 3200, heightScale: 1.6 },
  { id: 'sertexity', url: process.env.SERTEXITY_URL ?? 'https://masterskaya-forma.online/', wait: 3200 },
  /* «СЕКСТАНТ»: две 3D-сцены на страницах, поэтому ждём дольше. */
  { id: 'sextant', url: process.env.SEXTANT_URL ?? 'https://rootlost.ru/sextant/', wait: 5200 },
];

/** Дополнительные экраны для разбора кейсов. */
const EXTRA = [
  { id: 'forma', out: 'forma.webp', width: 1440, height: 900, url: FORMA },
  { id: 'forma', out: 'forma-configurator.webp', width: 1440, height: 1180, url: `${FORMA}configurator/` },
  { id: 'forma', out: 'forma-project.webp', width: 1440, height: 1000, url: `${FORMA}projects/kuhnya-s-ostrovom-v-barvihe/` },
  { id: 'forma', out: 'forma-mobile.webp', width: 390, height: 1180, url: FORMA },
  { id: 'sincere', out: 'sincere-album.webp', width: 1440, height: 1000, url: 'https://sincere-family.ru/pidzhak_album/' },
  { id: 'sincere', out: 'sincere.webp', width: 1440, height: 900, url: 'https://sincere-family.ru/' },
  { id: 'technoremont', out: 'technoremont.webp', width: 1440, height: 900, url: 'https://rootlost.ru/remont/' },
  { id: 'kitstroy', out: 'kitstroy.webp', width: 1440, height: 900, url: 'https://rootlost.online/' },
  { id: 'kitstroy', out: 'kitstroy-calculator.webp', width: 1440, height: 1000, url: 'https://rootlost.online/calculator/' },
  { id: 'kitstroy', out: 'kitstroy-portfolio.webp', width: 1440, height: 1000, url: 'https://rootlost.online/portfolio/' },
  /* Первый экран Sertexity переснимается с живого сайта: в кейсе долго висел
     кадр старого макета, который уже не совпадал с тем, что открывается. */
  { id: 'sertexity', out: 'sertexity.webp', width: 1440, height: 900, url: 'https://masterskaya-forma.online/' },
  { id: 'sertexity', out: 'sertexity-calculator.webp', width: 1440, height: 1000, url: 'https://masterskaya-forma.online/calculator/' },
  { id: 'sertexity', out: 'sertexity-markets.webp', width: 1440, height: 1000, url: 'https://masterskaya-forma.online/markets/' },
  { id: 'sextant', out: 'sextant.webp', width: 1440, height: 900, url: 'https://rootlost.ru/sextant/' },
  { id: 'sextant', out: 'sextant-calibre.webp', width: 1440, height: 1100, url: 'https://rootlost.ru/sextant/calibre/' },
  { id: 'sextant', out: 'sextant-configurator.webp', width: 1440, height: 1100, url: 'https://rootlost.ru/sextant/configurator/' },
  { id: 'sextant', out: 'sextant-collection.webp', width: 1440, height: 1100, url: 'https://rootlost.ru/sextant/collection/' },
  { id: 'sextant', out: 'sextant-mobile.webp', width: 390, height: 1180, url: 'https://rootlost.ru/sextant/' },
];

/** Полоса длиннее этого значения в готовом кадре — повод переснять страницу. */
const BLANK_LIMIT = 320;
/** Если пустота занимает больше этой доли высоты, кадр снят до появления блоков. */
const EMPTY_SHARE_LIMIT = 0.6;
/** Полосы длиннее этого значения в готовом кадре просто перечисляем: у живых сайтов
 *  с крупными отступами такие промежутки между секциями — норма. */
const LONG_BAND = 380;

const PORT = 9337;
const tmpDir = path.resolve('.tmp-case-shots');
const profileDir = path.join(tmpDir, 'profile');
const outDir = path.resolve('public/shots');
await mkdir(outDir, { recursive: true });
await mkdir(profileDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function waitForBrowser() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return;
    } catch {
      /* ждём */
    }
    await sleep(250);
  }
  throw new Error('Браузер не запустился');
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    let nextId = 1;

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id);
      if (message.error) handler.reject(new Error(message.error.message));
      else handler.resolve(message.result);
    });
    socket.addEventListener('error', () => reject(new Error('Ошибка WebSocket')));
    socket.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          return new Promise((res, rej) => {
            pending.set(id, { resolve: res, reject: rej });
            socket.send(JSON.stringify({ id, method, params }));
          });
        },
        close: () => socket.close(),
      }),
    );
  });
}

/** Убираем баннеры cookie: они перекрывают низ страницы на полном кадре. */
const HIDE_COOKIE = `
  (() => {
    try { localStorage.setItem('forma-cookie', 'all'); localStorage.setItem('portfolio-cookie-consent', 'all'); } catch {}
    document.querySelectorAll('[data-cookie], [data-cookie-consent]').forEach((el) => {
      if (el.tagName !== 'BODY') el.remove();
    });
    return true;
  })()`;

async function evaluate(client, expression) {
  const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text ?? 'Ошибка выполнения в браузере');
  return result.value;
}

/**
 * Готовит страницу к съёмке: прокрутка целиком, раскрытие блоков, возврат наверх.
 * Возвращает высоту документа.
 */
async function preparePage(client, url, wait) {
  await client.send('Page.enable');
  await client.send('Page.navigate', { url });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ready = await evaluate(client, 'document.readyState');
    if (ready === 'complete') break;
    await sleep(200);
  }

  await sleep(wait);
  await evaluate(client, HIDE_COOKIE);
  await evaluate(client, SCROLL_THROUGH);
  await evaluate(client, REVEAL_ALL);
  await evaluate(client, 'window.scrollTo(0, 0)');
  await sleep(1200);

  const metrics = await client.send('Page.getLayoutMetrics');
  return Math.round(metrics.cssContentSize.height);
}

async function openTarget() {
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((res) =>
    res.json(),
  );
  const client = await connect(target.webSocketDebuggerUrl);
  return { client, target };
}

async function closeTarget(target, client) {
  client.close();
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`).catch(() => {});
}

/**
 * Снимает полную страницу. Если пустота занимает больше половины кадра, значит
 * блоки ещё не появились — съёмка повторяется.
 */
async function captureFull({ url, width, height, wait, heightScale = 1 }) {
  const frameHeight = Math.round(height * heightScale);
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { client, target } = await openTarget();
    try {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: frameHeight,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const docHeight = await preparePage(client, url, wait);
      const clip = { x: 0, y: 0, width, height: Math.min(docHeight, 20000), scale: 1 };
      const shot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
      const png = Buffer.from(shot.data, 'base64');
      const probe = await findFlatBands(png, { minRun: BLANK_LIMIT });
      const empty = emptyShare(probe.bands, probe.height);
      if (empty < EMPTY_SHARE_LIMIT || attempt === 2) {
        return { png, docHeight, bands: probe.bands, empty, attempt };
      }
      console.log(`  … пусто ${(empty * 100).toFixed(1)}% высоты — блоки не появились, повторная съёмка`);
    } finally {
      await closeTarget(target, client);
    }
    await sleep(800);
  }
  throw new Error('Не удалось снять страницу без пустых полос');
}

/**
 * Снимок первого экрана. Высота окна берётся больше обычной и без ограничения
 * `captureBeyondViewport`: некоторые сайты отдают всю страницу только в окно
 * нужной высоты и не сообщают реальную высоту документа.
 */
async function captureViewport({ url, width, height, wait }) {
  const tall = Math.round(height * 2.2);
  const { client, target } = await openTarget();
  try {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: tall,
      deviceScaleFactor: 1,
      mobile: width < 700,
    });
    await preparePage(client, url, wait);
    const shot = await client.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    return Buffer.from(shot.data, 'base64');
  } finally {
    await closeTarget(target, client);
  }
}

try {
  await waitForBrowser();

  const targets = only ? TARGETS.filter((item) => item.id === only) : TARGETS;
  const extras = only ? EXTRA.filter((item) => item.id === only) : EXTRA;

  let failed = 0;

  for (const target of targets) {
    process.stdout.write(`→ ${target.id}: полная страница\n`);
    const full = await captureFull({
      url: target.url,
      width: 1440,
      height: 1000,
      wait: target.wait,
      heightScale: target.heightScale ?? 1,
    });
    const out = path.join(outDir, `${target.id}-full.webp`);
    await sharp(full.png)
      .resize({ width: 1100, withoutEnlargement: true })
      .webp({ quality: 66 })
      .toFile(out);

    const webpBuffer = await readFile(out);
    const meta = await sharp(webpBuffer).metadata();
    const scale = (meta.width ?? 1100) / 1440;
    const check = await findFlatBands(webpBuffer, { minRun: Math.round(LONG_BAND * scale) });
    const empty = emptyShare(check.bands, check.height);

    console.log(
      `  ✓ ${path.basename(out)} — ${meta.width}×${meta.height}, ${Math.round(webpBuffer.length / 1024)} КБ, ` +
        `пусто ${(empty * 100).toFixed(1)}% высоты`,
    );
    if (empty > EMPTY_SHARE_LIMIT) {
      failed += 1;
      console.log('    × пустота больше половины кадра — блоки не появились');
    }
    for (const band of check.bands.filter((item) => item.px >= LONG_BAND * scale).slice(0, 5)) {
      console.log(
        `    · промежуток ${Math.round(band.px / scale)}px от ${((band.from / check.height) * 100).toFixed(1)}% — ${band.color}`,
      );
    }
  }

  for (const item of extras) {
    process.stdout.write(`→ ${item.out}\n`);
    const png = await captureViewport({
      url: item.url,
      width: item.width,
      height: item.height,
      wait: 2600,
    });
    const out = path.join(outDir, item.out);
    await sharp(png).webp({ quality: 74 }).toFile(out);
    const buffer = await readFile(out);
    console.log(`  ✓ ${path.basename(out)}, ${Math.round(buffer.length / 1024)} КБ`);
  }

  if (failed > 0) {
    console.error(`\nВнимание: у ${failed} полных снимков остались пустые полосы.`);
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`\nОшибка: ${error.message}`);
  process.exitCode = 1;
} finally {
  browser.kill();
  await sleep(400);
  await rm(tmpDir, { recursive: true, force: true });
  console.log('\nГотово.');
}
