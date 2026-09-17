/**
 * Скриншоты локального сайта через Chrome DevTools Protocol.
 * Нужны, чтобы смотреть на реальный рендер, а не на разметку.
 *
 * Запуск: node scripts/shots.mjs [--url http://127.0.0.1:4173/] [--w 1440,768,360] [--full] [--sel .hero]
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

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
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const has = (name) => args.includes(`--${name}`);

const url = arg('url', 'http://127.0.0.1:4173/');
const widths = arg('w', '1440')
  .split(',')
  .map((value) => Number(value.trim()));
const wantFull = has('full');
const selector = arg('sel', '');
const tag = arg('tag', 'home');
const height = Number(arg('h', 900));
const scale = Number(arg('scale', 1));

const PORT = Number(arg('port', 9334));
const tmpDir = path.resolve('.tmp-shots');
const profileDir = path.join(tmpDir, 'profile');
const outDir = path.join(tmpDir, tag);
await rm(outDir, { recursive: true, force: true });
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
  for (let attempt = 0; attempt < 60; attempt += 1) {
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

/** Убирает уведомление о cookie и включает все блоки, спрятанные до скролла. */
const PREPARE = `
  (() => {
    try { localStorage.setItem('forma-cookie', 'all'); } catch {}
    document.querySelector('[data-cookie]')?.remove();
    document.querySelectorAll('.head, .card, .promise, .step, .cta, .facts__item, .faq details, .split__aside, .note-line')
      .forEach((el) => { el.classList.add('is-in'); el.style.transitionDelay = '0ms'; });
    return true;
  })()`;

async function capture({ width }) {
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' }).then((res) =>
    res.json(),
  );
  const client = await connect(target.webSocketDebuggerUrl);

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const problems = [];
  const onConsole = (event) => {
    const message = event.params;
    if (message.type === 'error') problems.push(message.args.map((a) => a.value ?? a.description).join(' '));
  };

  await client.send('Page.navigate', { url });
  await sleep(2600);
  await client.send('Runtime.evaluate', { expression: PREPARE });
  await sleep(500);

  const clickSelector = arg('click', '');
  if (clickSelector) {
    await client.send('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(clickSelector)})?.click()`,
    });
    await sleep(700);
  }

  // Проверка переполнения по горизонтали.
  const overflow = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const doc = document.documentElement;
      const wide = [...document.querySelectorAll('body *')].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && (rect.right > doc.clientWidth + 1 || rect.left < -1);
      }).slice(0, 6).map((el) => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : ''));
      return JSON.stringify({ scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, wide });
    })()`,
    returnByValue: true,
  });

  const metrics = await client.send('Page.getLayoutMetrics');

  let clip;
  if (selector) {
    const box = await client.send('Runtime.evaluate', {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return ''; const r = el.getBoundingClientRect(); return JSON.stringify({x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height}); })()`,
      returnByValue: true,
    });
    clip = box.result.value ? JSON.parse(box.result.value) : null;
    if (clip) clip = { ...clip, scale };
  } else if (wantFull) {
    const size = metrics.cssContentSize;
    clip = { x: 0, y: 0, width: size.width, height: Math.min(size.height, 9000), scale };
  } else {
    clip = { x: 0, y: 0, width, height, scale };
  }

  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: Boolean(wantFull || selector),
    ...(clip ? { clip } : {}),
  });

  client.close();
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`).catch(() => {});

  return { data: shot.data, overflow: JSON.parse(overflow.result.value), height: clip?.height ?? height };
}

try {
  await waitForBrowser();

  for (const width of widths) {
    process.stdout.write(`→ ${tag} @ ${width}\n`);
    const result = await capture({ width });
    const file = path.join(outDir, `${tag}-${width}${wantFull ? '-full' : ''}${selector ? '-crop' : ''}.png`);
    await writeFile(file, Buffer.from(result.data, 'base64'));
    const { scrollWidth, clientWidth, wide } = result.overflow;
    const status = scrollWidth > clientWidth ? `ПЕРЕПОЛНЕНИЕ ${scrollWidth} > ${clientWidth}` : 'ширина в порядке';
    console.log(`  ${status}; высота кадра ${Math.round(result.height)}; ${path.relative(process.cwd(), file)}`);
    if (wide.length) console.log(`  за краем: ${wide.join(', ')}`);
  }
} finally {
  browser.kill();
  await sleep(400);
  console.log('Готово.');
}
