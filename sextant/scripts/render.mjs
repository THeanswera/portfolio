/**
 * Офлайн-рендер кадров для сайта: headless Chrome рисует ту же самую сцену,
 * что крутится на страницах, и отдаёт PNG. Так галерея механизма — это
 * настоящие снимки модели, а не картинки из интернета.
 *
 * Запуск: node scripts/render.mjs [--only calibre-top] [--list]
 */
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.CHROME_BIN,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!CHROME) {
  console.error('Не найден Chrome.');
  process.exit(1);
}

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];

/* Пути считаем от папки скрипта: сборку зовут и из корня репозитория. */
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'src/assets/img');
const TMP_DIR = path.join(ROOT, '.tmp-render');
const PORT = 4187;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Список кадров. view — ракурс: [поворот, наклон, расстояние].
 * time — момент, на котором замирает механизм (мс).
 */
const SHOTS = [
  { id: 'calibre-plan', width: 1400, height: 1400, view: [0.0, 0.16, 5.2], time: 300, background: 'studio' },
  { id: 'calibre-top', width: 1400, height: 1400, view: [0.62, 0.72, 5.6], time: 1450, background: 'studio' },
  { id: 'calibre-macro', width: 1600, height: 1000, view: [0.95, 1.05, 3.0], time: 900, background: 'studio' },
  { id: 'calibre-balance', width: 1600, height: 1000, view: [0.35, 1.15, 2.0], time: 1750, background: 'studio' },
  { id: 'calibre-train', width: 1600, height: 1000, view: [1.32, 1.1, 2.7], time: 1200, background: 'studio' },
  { id: 'calibre-barrel', width: 1600, height: 1000, view: [-0.5, 1.0, 2.4], time: 640, background: 'studio' },
  { id: 'calibre-escapement', width: 1600, height: 1000, view: [0.05, 1.0, 1.55], time: 2100, background: 'studio' },
  { id: 'calibre-profile', width: 1600, height: 1000, view: [1.62, 1.5, 4.6], time: 1100, background: 'studio' },

  /* Часы целиком: три модели коллекции и развороты корпуса. */
  { id: 'watch-greenwich', width: 1600, height: 1600, mode: 'watch', view: [0.4, 1.02, 8.6], time: 1450, background: 'studio', watch: { size: 38, caseKind: 'steel', dialKind: 'midnight', strapTone: 0x4a3a2c } },
  { id: 'watch-pulkovo', width: 1600, height: 1600, mode: 'watch', view: [0.4, 1.02, 8.8], time: 1720, background: 'studio', watch: { size: 40, caseKind: 'steelBrushed', dialKind: 'opal', strapTone: 0x4a3a2c } },
  { id: 'watch-azimuth', width: 1600, height: 1600, mode: 'watch', view: [0.4, 1.02, 9.0], time: 2050, background: 'studio', watch: { size: 42, caseKind: 'dlc', dialKind: 'graphite', strapTone: 0x1b1f26 } },
  { id: 'watch-caseback', width: 1600, height: 1100, mode: 'watch', view: [0.2, 2.2, 6.4], time: 1200, background: 'studio', watch: { size: 40, caseKind: 'steel', dialKind: 'midnight', showStrap: false } },
  { id: 'watch-profile', width: 1600, height: 1100, mode: 'watch', view: [1.55, 1.45, 7.8], time: 900, background: 'studio', watch: { size: 38, caseKind: 'steel', dialKind: 'midnight', strapTone: 0x2a2320 } },
  { id: 'watch-gold', width: 1600, height: 1100, mode: 'watch', view: [0.5, 0.95, 6.2], time: 1400, background: 'studio', watch: { size: 38, caseKind: 'gold', dialKind: 'salmon', strapTone: 0x3a2a1e, showStrap: false } },

  /* Картинка для соцсетей: та же сцена с подписями поверх. */
  {
    id: 'og', out: 'og.png', width: 1200, height: 630, format: 'png', overlay: true,
    view: [0.52, 1.02, 8.2], time: 1500, background: 'og',
    watch: { size: 40, caseKind: 'steel', dialKind: 'midnight', showStrap: false },
  },
];

const BACKGROUNDS = {
  studio: `radial-gradient(120% 90% at 50% 18%, #2a2d36 0%, #14161c 42%, #08090c 100%)`,
  dark: `radial-gradient(100% 80% at 50% 30%, #16181f 0%, #0a0b0f 60%, #050608 100%)`,
  og: `radial-gradient(80% 120% at 78% 40%, #2b2f38 0%, #14161c 45%, #0a0b0e 100%)`,
};

const harness = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<title>render</title>
<script type="importmap">{"imports":{"three":"./assets/vendor/three.module.min.js"}}</script>
<link rel="preconnect" href="/">
<link rel="stylesheet" href="./assets/fonts/fonts.css">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: var(--bg, #08090c); }
  #stage { position: fixed; inset: 0; }
  canvas { display: block; width: 100%; height: 100%; }
  /* Оптика кадра: мягкая зона резкости, виньетка и зерно — без них
     трёхмерная сцена читается как рисунок, а не как снимок. */
  .optics { position: fixed; inset: 0; pointer-events: none; }
  .optics--dof {
    backdrop-filter: blur(7px);
    -webkit-mask-image: radial-gradient(circle at 50% 47%, transparent 54%, black 100%);
    mask-image: radial-gradient(circle at 50% 47%, transparent 54%, black 100%);
  }
  .optics--vignette { background: radial-gradient(115% 92% at 50% 44%, transparent 38%, rgba(0,0,0,0.62) 100%); }
  .optics--grain {
    opacity: 0.34; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  }
  .og { position: fixed; inset: 0; display: none; align-content: center; gap: 14px; padding: 0 0 0 72px; }
  body[data-og="true"] .og { display: grid; }
  body[data-og="true"] #stage { left: 42%; }
  .og__brand { font-family: "Cormorant Garamond", serif; font-size: 64px; letter-spacing: 0.16em; color: #f4efe4; }
  .og__tag { font-family: "JetBrains Mono", monospace; font-size: 15px; letter-spacing: 0.24em; text-transform: uppercase; color: #c9a35c; }
  .og__title { max-width: 15ch; font-family: "Cormorant Garamond", serif; font-size: 34px; line-height: 1.15; color: #cfc6b6; }
</style></head>
<body>
<div id="stage"><canvas id="c" width="1200" height="1200"></canvas></div>
<div class="optics optics--dof"></div>
<div class="optics optics--grain"></div>
<div class="optics optics--vignette"></div>
<div class="og">
  <span class="og__tag">Часовая мануфактура · Санкт-Петербург</span>
  <span class="og__brand">СЕКСТАНТ</span>
  <span class="og__title">Калибр SXT-01: 218 деталей, 72 часа запаса хода</span>
</div>
<script type="module">
  import { mountCalibre, mountWatch } from './assets/js/gl/mount.js';

  const params = new URLSearchParams(location.search);
  const [theta, phi, distance] = (params.get('view') ?? '0.6,1.0,4.4').split(',').map(Number);
  const time = params.get('time') ? Number(params.get('time')) : null;
  const watchOptions = params.get('watch') ? JSON.parse(params.get('watch')) : null;

  document.documentElement.style.setProperty('--bg', ${JSON.stringify('PLACEHOLDER')});
  if (params.get('overlay')) document.body.dataset.og = 'true';

  try {
    const canvas = document.getElementById('c');
    const mounted = watchOptions
      ? mountWatch(canvas, { frozenTime: time, zoom: false, autoRotate: 0, watch: watchOptions })
      : mountCalibre(canvas, { frozenTime: time, zoom: false, autoRotate: 0 });
    mounted.stage.setView(theta, phi, distance);
    window.__mounted = mounted;
  } catch (error) {
    window.__error = String(error && error.stack ? error.stack : error);
  }

  let frames = 0;
  const tick = () => {
    frames += 1;
    window.__frames = frames;
    if (frames < 5) requestAnimationFrame(tick);
    else window.__ready = true;
  };
  requestAnimationFrame(tick);
</script>
</body></html>`;

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

/* --- Подготовка временной площадки ------------------------------------- */

await rm(TMP_DIR, { recursive: true, force: true });
await mkdir(TMP_DIR, { recursive: true });
await cp(path.join(ROOT, 'src/assets'), path.join(TMP_DIR, 'assets'), { recursive: true });
await cp(path.join(ROOT, 'src/vendor'), path.join(TMP_DIR, 'assets/vendor'), { recursive: true });

const server = await startServer({ root: TMP_DIR, port: PORT });

const browser = spawn(
  CHROME,
  [
    '--headless=new',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--remote-debugging-port=9462',
    `--user-data-dir=${path.join(TMP_DIR, 'profile')}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

for (let attempt = 0; attempt < 80; attempt += 1) {
  try {
    const res = await fetch('http://127.0.0.1:9462/json/version');
    if (res.ok) break;
  } catch {
    /* браузер поднимается */
  }
  await sleep(250);
}

await mkdir(OUT_DIR, { recursive: true });

const shots = only ? SHOTS.filter((shot) => shot.id === only) : SHOTS;
if (shots.length === 0) {
  console.error(`Нет кадра с именем ${only}. Доступные: ${SHOTS.map((shot) => shot.id).join(', ')}`);
}

try {
  for (const shot of shots) {
    process.stdout.write(`→ ${shot.id} ${shot.width}×${shot.height} … `);
    const started = Date.now();

    const target = await fetch('http://127.0.0.1:9462/json/new?about:blank', { method: 'PUT' }).then((res) => res.json());
    const client = await connect(target.webSocketDebuggerUrl);

    try {
      await client.send('Page.enable');
      await client.send('Runtime.enable');
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: shot.width,
        height: shot.height,
        deviceScaleFactor: 1,
        mobile: false,
      });

      const html = harness.replace('PLACEHOLDER', BACKGROUNDS[shot.background] ?? BACKGROUNDS.studio);
      await writeFile(path.join(TMP_DIR, 'render.html'), html);

      const url =
        `${server.url}/render.html?view=${shot.view.join(',')}&time=${shot.time ?? ''}` +
        (shot.watch ? `&watch=${encodeURIComponent(JSON.stringify(shot.watch))}` : '') +
        (shot.overlay ? '&overlay=1' : '');
      await client.send('Page.navigate', { url });

      let ready = false;
      for (let attempt = 0; attempt < 240; attempt += 1) {
        await sleep(250);
        const result = await client
          .send('Runtime.evaluate', { expression: 'Boolean(window.__ready)', returnByValue: true })
          .catch(() => null);
        if (result?.result?.value) {
          ready = true;
          break;
        }
      }

      if (!ready) {
        const error = await client
          .send('Runtime.evaluate', { expression: 'window.__error ?? "нет сигнала готовности"', returnByValue: true })
          .catch(() => null);
        console.log(`не дождались сцены: ${error?.result?.value ?? 'без подробностей'}`);
        continue;
      }

      /* Сцена могла не собраться: тогда кадр будет пустым, и молча
         сохранять его нельзя. */
      const failure = await client
        .send('Runtime.evaluate', { expression: 'window.__error ?? ""', returnByValue: true })
        .catch(() => null);

      if (failure?.result?.value) {
        console.log(`ошибка сцены: ${failure.result.value.split('\n')[0]}`);
        process.exitCode = 1;
        continue;
      }

      const screenshot = await client.send('Page.captureScreenshot', {
        format: shot.format ?? 'webp',
        quality: 86,
        clip: { x: 0, y: 0, width: shot.width, height: shot.height, scale: 1 },
      });

      const file = path.join(OUT_DIR, shot.out ?? `${shot.id}.webp`);
      await writeFile(file, Buffer.from(screenshot.data, 'base64'));
      console.log(`готово за ${((Date.now() - started) / 1000).toFixed(1)} с`);
    } finally {
      client.close();
      await fetch(`http://127.0.0.1:9462/json/close/${target.id}`).catch(() => {});
    }
  }
} catch (error) {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
} finally {
  browser.kill();
  await sleep(400);
  await server.close();
  await rm(TMP_DIR, { recursive: true, force: true });
  console.log('\nГотово.');
}
