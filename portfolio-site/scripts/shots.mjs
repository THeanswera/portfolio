// Скриншоты работ и OG-картинка через Chrome DevTools Protocol:
// чистые кадры без cookie-баннеров, точный размер вьюпорта, WebP на выходе.
// Запуск: node scripts/shots.mjs
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const CHROME = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!CHROME) {
  console.error('Не найден Chrome или Edge для съёмки скриншотов.');
  process.exit(1);
}

const PORT = 9333;
const tmpDir = path.resolve('.tmp-shots');
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
  { stdio: 'ignore', detached: false },
);

async function waitForBrowser() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return;
    } catch {
      /* браузер ещё поднимается */
    }
    await sleep(250);
  }
  throw new Error('Браузер не запустился: порт отладки недоступен');
}

/** Минимальный CDP-клиент на нативном WebSocket. */
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

async function capture({ url, out, width, height, cleanup = true }) {
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then(
    (res) => res.json(),
  );
  const client = await connect(target.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await client.send('Page.navigate', { url });
  await sleep(4200);

  if (cleanup) {
    // Убираем cookie-баннеры и плавающие оверлеи, которые мешают кадру.
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const patterns = ['cookie', 'consent', 'gdpr', 'banner', 'popup', 'modal', 'chat', 'jivo', 'bitrix'];
          document.querySelectorAll('body *').forEach((el) => {
            const id = (el.id || '') + ' ' + (el.className && typeof el.className === 'string' ? el.className : '');
            const style = getComputedStyle(el);
            const floating = style.position === 'fixed' || style.position === 'sticky';
            const lower = id.toLowerCase();
            if (floating && patterns.some((p) => lower.includes(p)) && el.offsetHeight < window.innerHeight * 0.9) {
              el.remove();
            }
          });
          document.documentElement.style.overflow = 'hidden';
          return true;
        })()
      `,
    });
    await sleep(350);
  }

  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  client.close();
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`).catch(() => {});
}

const localRoot = path.resolve('..');
const targets = [
  { id: 'kitstroy', url: 'https://rootlost.ru/' },
  { id: 'sincere', url: 'https://sincere-family.ru/' },
  { id: 'wedding', url: 'https://odinzovi-svadba-pela-i-plyasala.ru/' },
  { id: 'technoremont', url: 'https://rootlost.online/remont/' },
  { id: 'sertexity', url: pathToFileURL(path.join(localRoot, '0_verstka_po_maketu/index.html')).href },
];

try {
  await waitForBrowser();

  for (const target of targets) {
    const png = path.join(tmpDir, `${target.id}.png`);
    process.stdout.write(`→ ${target.id}\n`);
    await capture({ ...target, out: png, width: 1440, height: 900 });
    if (!existsSync(png)) {
      console.error('  кадр не получен');
      continue;
    }
    const out = path.join(outDir, `${target.id}.webp`);
    await sharp(png)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(out);
    console.log(`  ✓ ${path.relative(process.cwd(), out)}`);
  }

  const ogHtml = path.join(tmpDir, 'og.html');
  await writeFile(ogHtml, ogMarkup(), 'utf8');
  const ogPng = path.join(tmpDir, 'og.png');
  console.log('→ OG-картинка');
  await capture({
    url: pathToFileURL(ogHtml).href,
    out: ogPng,
    width: 1200,
    height: 630,
    cleanup: false,
  });
  if (existsSync(ogPng)) {
    await sharp(ogPng).png({ compressionLevel: 9 }).toFile(path.resolve('public/og-image.png'));
    console.log('  ✓ public/og-image.png');
  }
} finally {
  browser.kill();
  await sleep(500);
  await rm(tmpDir, { recursive: true, force: true });
  console.log('\nГотово.');
}

function ogMarkup() {
  const cyrillic = pathToFileURL(path.resolve('src/fonts/playfair-display-cyrillic.woff2')).href;
  const latin = pathToFileURL(path.resolve('src/fonts/playfair-display-latin.woff2')).href;

  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Playfair Display'; font-weight: 400 900; font-display: block;
    src: url('${cyrillic}') format('woff2'); unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: 'Playfair Display'; font-weight: 400 900; font-display: block;
    src: url('${latin}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; background: #F4F1EA; color: #14120F;
    font-family: "Segoe UI", system-ui, sans-serif; padding: 56px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .marks::before, .marks::after {
    content: ''; position: absolute; width: 26px; height: 26px;
  }
  .marks::before { top: 26px; left: 26px; border-top: 3px solid #14120F; border-left: 3px solid #14120F; }
  .marks::after { bottom: 26px; right: 26px; border-bottom: 3px solid #14120F; border-right: 3px solid #14120F; }
  .label { font-family: Consolas, monospace; font-size: 16px; letter-spacing: .22em; text-transform: uppercase; color: #6e675e; display: flex; align-items: center; gap: 16px; }
  .label span.line { width: 44px; height: 2px; background: #D33A1C; }
  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 82px; font-weight: 800; letter-spacing: -.02em; line-height: 1.02; margin-top: 26px; max-width: 1000px; }
  h1 em { color: #D33A1C; }
  p { font-size: 21px; color: #6e675e; margin-top: 22px; max-width: 820px; line-height: 1.5; }
  .row { display: flex; align-items: center; justify-content: space-between; border-top: 2px solid #14120F; padding-top: 20px; }
  .name { font-family: 'Playfair Display', Georgia, serif; font-size: 27px; font-weight: 700; }
  .meta { font-family: Consolas, monospace; font-size: 15px; color: #6e675e; letter-spacing: .1em; text-transform: uppercase; }
  .stamp { position: absolute; right: 64px; top: 118px; border: 2px solid #D33A1C; color: #D33A1C;
    font-family: Consolas, monospace; font-size: 12px; letter-spacing: .18em; text-transform: uppercase;
    padding: 10px 14px; transform: rotate(-6deg); }
</style></head>
<body>
  <div class="marks"></div>
  <div class="stamp">проверено в браузере</div>
  <div>
    <div class="label"><span class="line"></span>Frontend developer · HTML · CSS · JS · WordPress</div>
    <h1>Сайты, которые <em>не&nbsp;ломаются</em> на&nbsp;телефоне</h1>
    <p>Лендинги, корпоративные сайты и темы WordPress — по макету, ТЗ или вашей идее.</p>
  </div>
  <div class="row">
    <span class="name">Александра Мельникова</span>
    <span class="meta">Telegram @melnikova_ad · aleksa.ponomareva2001@mail.ru</span>
  </div>
</body></html>`;
}
