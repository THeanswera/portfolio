/**
 * Установка сгенерированных изображений вместо процедурных рендеров.
 *
 * Кладёте файлы в sextant/generated/ под именами из списка ниже, запускаете
 * `node scripts/install-images.mjs` — скрипт обрезает картинку по центру
 * до нужных пропорций, приводит к нужному размеру и сохраняет в
 * src/assets/img/ в формате webp. Прежние рендеры уходят в renders-backup/.
 *
 * Конвертация идёт через тот же headless-браузер, что и рендер: во-первых,
 * никаких зависимостей, во-вторых, поддержка webp и цветовых профилей
 * ровно такая же, как у браузера посетителя.
 *
 * Запуск: node scripts/install-images.mjs [--dry-run] [--restore]
 */
import { mkdir, readdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'generated');
const TARGET_DIR = path.join(ROOT, 'src/assets/img');
const BACKUP_DIR = path.join(TARGET_DIR, 'renders-backup');
const TMP_DIR = path.join(ROOT, '.tmp-install');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const restore = args.includes('--restore');

/**
 * Что куда кладём. Ширина и высота — предельный размер: картинка обрезается
 * по центру до этих пропорций, но вверх не растягивается. Если исходник
 * меньше, размер остаётся исходным — иначе снимок становится мыльным.
 */
const TARGETS = [
  { name: 'watch-greenwich', width: 1600, height: 1600, note: 'ГРИНВИЧ 38, сталь, «полярная ночь»' },
  { name: 'watch-pulkovo', width: 1600, height: 1600, note: 'ПУЛКОВО 40, открытый баланс на 6 часах' },
  { name: 'watch-azimuth', width: 1600, height: 1600, note: 'АЗИМУТ 42, титан с покрытием DLC' },
  { name: 'watch-caseback', width: 1600, height: 1000, note: 'задняя крышка из сапфира, виден механизм' },
  { name: 'watch-profile', width: 1600, height: 1000, note: 'профиль корпуса' },
  { name: 'watch-gold', width: 1600, height: 1000, note: 'золотая версия, циферблат «лосось»' },
  { name: 'calibre-plan', width: 1600, height: 1000, note: 'механизм, вид сверху' },
  { name: 'calibre-top', width: 1600, height: 1000, note: 'механизм под прозрачным циферблатом' },
  { name: 'calibre-macro', width: 1600, height: 1000, note: 'мосты: женевские полосы и англаж' },
  { name: 'calibre-balance', width: 1600, height: 1000, note: 'баланс и спираль Бреге' },
  { name: 'calibre-train', width: 1600, height: 1000, note: 'колёсная передача' },
  { name: 'calibre-barrel', width: 1600, height: 1000, note: 'барабан и заводная пружина' },
  { name: 'calibre-escapement', width: 1600, height: 1000, note: 'анкерная вилка и палеты' },
  { name: 'calibre-profile', width: 1600, height: 1000, note: 'механизм сбоку, четыре уровня деталей' },
  { name: 'calibre-open', width: 1600, height: 1000, note: 'анкерный ход в собранных часах' },
  { name: 'calibre-bench', width: 1600, height: 1000, note: 'часы и барабан рядом' },
  { name: 'watch-open-dial', width: 1600, height: 1000, note: 'открытый циферблат: виден ход колёс' },
];

const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* --- Восстановление прежних рендеров ------------------------------------ */

if (restore) {
  if (!existsSync(BACKUP_DIR)) {
    console.error('Резервных копий нет: восстанавливать нечего.');
    process.exit(1);
  }

  const files = await readdir(BACKUP_DIR);
  for (const file of files) {
    await copyFile(path.join(BACKUP_DIR, file), path.join(TARGET_DIR, file));
    console.log(`← вернул ${file}`);
  }
  console.log(`\nВосстановлено файлов: ${files.length}.`);
  process.exit(0);
}

/* --- Что нашли в generated/ --------------------------------------------- */

await mkdir(SOURCE_DIR, { recursive: true });

const available = await readdir(SOURCE_DIR).catch(() => []);
const findSource = (name) => {
  const match = available.find((file) => {
    const ext = path.extname(file).toLowerCase();
    return EXTENSIONS.includes(ext) && path.basename(file, ext).toLowerCase() === name;
  });
  return match ? path.join(SOURCE_DIR, match) : null;
};

const plan = TARGETS.map((target) => ({ ...target, source: findSource(target.name) }));
const found = plan.filter((item) => item.source);
const missing = plan.filter((item) => !item.source);

console.log(`Папка с картинками: ${path.relative(ROOT, SOURCE_DIR)}`);
console.log(`Найдено файлов: ${found.length} из ${TARGETS.length}\n`);

for (const item of plan) {
  const mark = item.source ? '✓' : '·';
  const size = `${item.width}×${item.height}`.padEnd(11);
  console.log(`${mark} ${item.name.padEnd(22)} ${size} ${item.note}`);
}

if (found.length === 0) {
  console.log('\nНичего не найдено. Положите картинки в папку generated/ — имена файлов указаны выше.');
  console.log('Промпты для генерации: sextant/ПРОМПТЫ-ДЛЯ-ГЕНЕРАЦИИ.md');
  process.exit(0);
}

if (dryRun) {
  console.log('\nПробный запуск: файлы не изменялись.');
  process.exit(0);
}

/* --- Браузер как конвертер ---------------------------------------------- */

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
  console.error('\nНе найден Chrome — им приводится размер и формат картинок.');
  process.exit(1);
}

await rm(TMP_DIR, { recursive: true, force: true });
await mkdir(TMP_DIR, { recursive: true });

const PORT = 4189;
const server = await startServer({ root: SOURCE_DIR, port: PORT });

const browser = spawn(
  CHROME,
  [
    '--headless=new',
    '--hide-scrollbars',
    '--no-first-run',
    '--disable-extensions',
    '--remote-debugging-port=9464',
    `--user-data-dir=${path.join(TMP_DIR, 'profile')}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

for (let attempt = 0; attempt < 80; attempt += 1) {
  try {
    const res = await fetch('http://127.0.0.1:9464/json/version');
    if (res.ok) break;
  } catch {
    /* браузер поднимается */
  }
  await sleep(250);
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

await mkdir(BACKUP_DIR, { recursive: true });

try {
  const target = await fetch('http://127.0.0.1:9464/json/new?about:blank', { method: 'PUT' }).then((res) => res.json());
  const client = await connect(target.webSocketDebuggerUrl);
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  /* Страница должна быть с того же адреса, что и картинки: иначе canvas
     считается «загрязнённым» и выгрузка в файл запрещена. */
  await client.send('Page.navigate', { url: `${server.url}/` });
  await sleep(500);

  let installed = 0;

  for (const item of found) {
    const fileName = path.basename(item.source);
    const isPng = item.name === 'og';
    const outName = `${item.name}${isPng ? '.png' : '.webp'}`;

    const expression = `(async () => {
      const image = new Image();
      image.crossOrigin = 'anonymous';

      const loaded = new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('файл не открылся по адресу ' + image.src));
      });

      image.src = ${JSON.stringify(`${server.url}/${encodeURIComponent(fileName)}`)};
      await loaded;
      if (image.decode) await image.decode().catch(() => {});

      const targetRatio = ${item.width} / ${item.height};
      const sourceRatio = image.naturalWidth / image.naturalHeight;

      /* Обрезаем по центру до нужных пропорций, потом масштабируем. */
      let sx = 0;
      let sy = 0;
      let sw = image.naturalWidth;
      let sh = image.naturalHeight;

      if (sourceRatio > targetRatio) {
        sw = Math.round(image.naturalHeight * targetRatio);
        sx = Math.round((image.naturalWidth - sw) / 2);
      } else {
        sh = Math.round(image.naturalWidth / targetRatio);
        sy = Math.round((image.naturalHeight - sh) / 2);
      }

      const canvas = document.createElement('canvas');
      /* Вверх не растягиваем: если исходник меньше цели, оставляем его размер. */
      const scale = Math.min(1, ${item.width} / sw);
      canvas.width = Math.round(sw * scale);
      canvas.height = Math.round(sh * scale);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      return {
        source: [image.naturalWidth, image.naturalHeight],
        result: [canvas.width, canvas.height],
        data: canvas.toDataURL(${isPng ? "'image/png'" : "'image/webp', 0.9"}),
      };
    })()`;

    const result = await client.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });

    if (result.exceptionDetails) {
      console.log(`✗ ${item.name}: ${result.exceptionDetails.exception?.description ?? 'не удалось прочитать файл'}`);
      continue;
    }

    const { source, result: output, data } = result.result.value;
    const buffer = Buffer.from(data.split(',')[1], 'base64');

    /* Прежний рендер сохраняем: к нему можно вернуться командой --restore. */
    const previous = path.join(TARGET_DIR, outName.replace(/\.png$/, '.webp'));
    if (existsSync(previous) && !existsSync(path.join(BACKUP_DIR, path.basename(previous)))) {
      await copyFile(previous, path.join(BACKUP_DIR, path.basename(previous)));
    }

    await writeFile(path.join(TARGET_DIR, outName), buffer);
    installed += 1;
    console.log(
      `✓ ${item.name.padEnd(22)} ${source[0]}×${source[1]} → ${output[0]}×${output[1]}, ` +
        `${(buffer.length / 1024).toFixed(0)} КБ`,
    );
  }

  client.close();
  await fetch(`http://127.0.0.1:9464/json/close/${target.id}`).catch(() => {});

  console.log(`\nУстановлено файлов: ${installed}. Прежние рендеры: ${path.relative(ROOT, BACKUP_DIR)}.`);

  if (missing.length) {
    console.log(`Остались процедурные рендеры (${missing.length}): ${missing.map((item) => item.name).join(', ')}.`);
  }
} finally {
  browser.kill();
  await sleep(300);
  await server.close();
  await rm(TMP_DIR, { recursive: true, force: true });
}
