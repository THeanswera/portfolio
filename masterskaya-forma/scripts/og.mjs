/**
 * OG-картинка 1200 × 630 для мессенджеров и соцсетей.
 * Собирается из настоящего чертежа сайта, а не рисуется отдельно.
 *
 * Запуск: node scripts/og.mjs
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { elevation } from '../src/assets/js/shared/drawing.js';
import { site } from '../src/data/site.mjs';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const CHROME = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!CHROME) {
  console.error('Не найден Chrome или Edge.');
  process.exit(1);
}

const PORT = 9338;
const tmpDir = path.resolve('.tmp-og');
await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });
await mkdir(path.resolve('public/assets/img'), { recursive: true });

const fontUrl = (file) => pathToFileURL(path.resolve('src/assets/fonts', file)).href;

const markup = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Golos Text'; font-weight: 400 900; font-display: block; src: url('${fontUrl('golos-text-cyrillic-var.woff2')}') format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-weight: 400; font-display: block; src: url('${fontUrl('ibm-plex-mono-cyrillic-400.woff2')}') format('woff2'); }
* { box-sizing: border-box; margin: 0; }
body {
  width: 1200px; height: 630px; padding: 54px 60px 44px;
  display: flex; flex-direction: column; justify-content: space-between;
  background: #111312; color: #F1EDE6; font-family: 'Golos Text', sans-serif;
  position: relative; overflow: hidden;
}
body::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px);
  background-size: 40px 40px;
}
.brand { display: flex; align-items: center; gap: 14px; }
.mark { display: grid; place-items: center; width: 46px; height: 46px; border: 1px solid #D9B268; color: #D9B268; font-family: 'IBM Plex Mono', monospace; font-size: 17px; }
.brand b { font-size: 25px; letter-spacing: -.02em; }
.brand span { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #6F7671; }
h1 { font-size: 58px; line-height: 1; letter-spacing: -.035em; font-weight: 700; max-width: 570px; }
h1 em { font-style: normal; color: #D9B268; }
.drawing { position: absolute; right: 40px; top: 104px; width: 520px; opacity: .96; }
.draw { position: relative; }
.draw__svg { width: 100%; height: auto; }
.draw__label { position: absolute; transform: translate(-50%, -50%); font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9AA19B; white-space: nowrap; }
.d-line { fill: none; stroke: #3B423D; stroke-width: 1; }
.d-line.d-dash { stroke-dasharray: 5 5; opacity: .6; }
.d-floor { stroke: #3B423D; stroke-width: 2; }
.d-dim { stroke: #6F7671; stroke-width: 1; opacity: .75; }
.d-handle { stroke: #00000052; stroke-width: 2; }
.d-tap { fill: none; stroke: #9AA19B; stroke-width: 2; }
.foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; border-top: 1px solid #2C322E; padding-top: 20px; }
.foot p { font-size: 20px; color: #9AA19B; max-width: 620px; }
.foot .meta { font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: #6F7671; text-align: right; }
.badge { position: absolute; left: 60px; top: 190px; display: inline-flex; align-items: center; gap: 10px; padding: 7px 14px; border: 1px solid #3B423D; border-radius: 100px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #9AA19B; }
.badge i { width: 7px; height: 7px; border-radius: 50%; background: #D9B268; }
</style></head>
<body>
  <div class="brand">
    <span class="mark">${site.mark}</span>
    <span><b>${site.name}</b><span>${site.tagline}</span></span>
  </div>

  <span class="badge"><i></i>живой расчёт в конфигураторе</span>

  <h1>Кухня по вашим размерам — <em>с ценой до звонка</em></h1>

  <div class="drawing">${elevation({ wall: 360, facadeHex: '#C39A6B', worktopHex: '#454A47', uid: 'og' })}</div>

  <div class="foot">
    <p>Конфигуратор считает цену и срок сразу: планировка, размеры, фасады, столешница, фурнитура.</p>
    <p class="meta">${site.url.replace('https://', '')}<br>${site.phone}</p>
  </div>
</body></html>`;

const htmlPath = path.join(tmpDir, 'og.html');
await writeFile(htmlPath, markup, 'utf8');

const profileDir = path.join(tmpDir, 'profile');
await mkdir(profileDir, { recursive: true });

const browser = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

try {
  await waitForBrowser();
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((res) =>
    res.json(),
  );

  const socket = new WebSocket(target.webSocketDebuggerUrl);
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

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve);
    socket.addEventListener('error', reject);
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(htmlPath).href });
  await sleep(2500);

  const shot = await send('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 88,
    clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
  });

  const out = path.resolve('public/assets/img/og.jpg');
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  console.log(`✓ ${path.relative(process.cwd(), out)}`);
} finally {
  browser.kill();
  await sleep(400);
  await rm(tmpDir, { recursive: true, force: true });
}
