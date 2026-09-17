// Полные скриншоты страниц для кейсов: высокие кадры, которые прокручиваются
// в рамке браузера, и отдельные экраны для разбора.
// Запуск: node scripts/case-shots.mjs [--only forma]
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

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
  { id: 'kitstroy', url: 'https://rootlost.ru/', wait: 3200 },
  { id: 'technoremont', url: 'https://rootlost.online/remont/', wait: 2600 },
  { id: 'sincere', url: 'https://sincere-family.ru/', wait: 3200 },
  { id: 'sertexity', url: pathToFileURL(path.join(localRoot, '0_verstka_po_maketu/index.html')).href, wait: 2600 },
];

/** Дополнительные экраны для разбора кейса «Форма». */
const EXTRA = [
  { id: 'forma', out: 'forma.webp', width: 1440, height: 900, url: FORMA },
  { id: 'forma', out: 'forma-configurator.webp', width: 1440, height: 1180, url: `${FORMA}configurator/` },
  { id: 'forma', out: 'forma-project.webp', width: 1440, height: 1000, url: `${FORMA}projects/kuhnya-s-ostrovom-v-barvihe/` },
  { id: 'forma', out: 'forma-mobile.webp', width: 390, height: 1180, url: FORMA },
];

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

/** Убираем баннеры cookie и принудительно показываем блоки, спрятанные до скролла. */
const PREPARE = `
  (() => {
    try { localStorage.setItem('forma-cookie', 'all'); localStorage.setItem('portfolio-cookie-consent', 'all'); } catch {}
    document.querySelectorAll('[data-cookie], [data-cookie-consent], .cookie, [class*="cookie"]').forEach((el) => {
      if (el.tagName !== 'BODY') el.remove();
    });
    document.querySelectorAll('[data-reveal], .is-in, [data-part]').forEach((el) => {
      el.classList.add('is-visible', 'is-in');
      el.style.transitionDelay = '0ms';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.frame__shot').forEach((img) => { img.style.animation = 'none'; });
    return true;
  })()`;

async function capture({ url, width, height, full, wait = 2800 }) {
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((res) =>
    res.json(),
  );
  const client = await connect(target.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await client.send('Page.navigate', { url });
  await sleep(wait);
  await client.send('Runtime.evaluate', { expression: PREPARE });
  await sleep(600);

  let clip = { x: 0, y: 0, width, height, scale: 1 };
  if (full) {
    const metrics = await client.send('Page.getLayoutMetrics');
    const size = metrics.cssContentSize;
    clip = { x: 0, y: 0, width: size.width, height: Math.min(size.height, 9000), scale: 1 };
  }

  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full,
    clip,
  });

  client.close();
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`).catch(() => {});
  return Buffer.from(shot.data, 'base64');
}

try {
  await waitForBrowser();

  const targets = only ? TARGETS.filter((item) => item.id === only) : TARGETS;
  const extras = only ? EXTRA.filter((item) => item.id === only) : EXTRA;

  for (const target of targets) {
    process.stdout.write(`→ ${target.id}: полная страница\n`);
    const png = await capture({ url: target.url, width: 1440, height: 1000, full: true, wait: target.wait });
    const out = path.join(outDir, `${target.id}-full.webp`);
    await sharp(png)
      .resize({ width: 1100, withoutEnlargement: true })
      .webp({ quality: 66 })
      .toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`  ✓ ${path.basename(out)} — ${meta.width}×${meta.height}, ${Math.round((await readFile(out)).length / 1024)} КБ`);
  }

  for (const item of extras) {
    process.stdout.write(`→ ${item.out}\n`);
    const png = await capture({ url: item.url, width: item.width, height: item.height, full: false });
    const out = path.join(outDir, item.out.replace('.webp', '.webp'));
    await sharp(png).webp({ quality: 74 }).toFile(out);
    console.log(`  ✓ ${path.basename(out)}, ${Math.round((await readFile(out)).length / 1024)} КБ`);
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
