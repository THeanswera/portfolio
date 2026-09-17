// Общий CDP-клиент: запуск headless-браузера, страницы и элементарные команды.
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

/** Пути к браузеру: сначала переменная окружения, потом типовые места по системам. */
export const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.CHROME_BIN,
  // Windows
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  // Linux (в том числе образы GitHub Actions)
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

export const findChrome = () => CHROME_CANDIDATES.find((candidate) => existsSync(candidate));

/** В контейнерах сборки у Chrome нет доступа к песочнице — добавляем флаги только там. */
export const CONTAINER_FLAGS = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function launchBrowser({ port = 9333, profileDir }) {
  const chrome = findChrome();
  if (!chrome) throw new Error('Не найден Chrome или Edge для проверки в браузере.');

  const browser = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      ...CONTAINER_FLAGS,
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  return browser;
}

export async function waitForBrowser(port, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      /* браузер ещё поднимается */
    }
    await sleep(250);
  }
  throw new Error('Браузер не запустился: порт отладки недоступен');
}

/** Минимальный CDP-клиент на нативном WebSocket. */
export function connect(wsUrl) {
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

export async function openPage(port) {
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
    method: 'PUT',
  }).then((res) => res.json());
  const client = await connect(target.webSocketDebuggerUrl);
  return { client, targetId: target.id };
}

export async function closePage(port, targetId) {
  await fetch(`http://127.0.0.1:${port}/json/close/${targetId}`).catch(() => {});
}

/** Навигация с ожиданием загрузки и дополнительной паузой на шрифты и картинки. */
export async function goto(client, url, { settle = 2200 } = {}) {
  await client.send('Page.enable');
  await client.send('Page.navigate', { url });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const { result } = await client.send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true,
    });
    if (result.value === 'complete') break;
    await sleep(200);
  }
  await sleep(settle);
}

export async function evaluate(client, expression) {
  const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text ?? 'Ошибка выполнения в браузере');
  return result.value;
}

export async function screenshot(client, file, clip) {
  const shot = await client.send('Page.captureScreenshot', {
    format: 'png',
    ...(clip
      ? { clip: { ...clip, scale: 1 }, captureBeyondViewport: true }
      : {}),
  });
  const { writeFile, mkdir } = await import('node:fs/promises');
  const path = await import('node:path');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(shot.data, 'base64'));
}
