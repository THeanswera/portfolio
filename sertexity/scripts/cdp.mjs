/** Общий запуск Chrome и минимальный CDP-клиент для скриптов проверки. */
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const CHROME_CANDIDATES = [
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
const CONTAINER_FLAGS = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    const listeners = [];
    let nextId = 1;

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const handler = pending.get(message.id);
        if (!handler) return;
        pending.delete(message.id);
        if (message.error) handler.reject(new Error(message.error.message));
        else handler.resolve(message.result);
        return;
      }
      listeners.forEach((listener) => listener(message));
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
        on: (listener) => listeners.push(listener),
        close: () => socket.close(),
      }),
    );
  });
}

/** Поднимает браузер, отдаёт функцию open(url) → клиент, затем закрывает всё. */
export async function withBrowser({ port = 9336, profile = '.tmp-check/profile' } = {}) {
  const chrome = findChrome();
  if (!chrome) throw new Error('Не найден Chrome или Edge.');

  await rm(path.dirname(path.resolve(profile)), { recursive: true, force: true });
  await mkdir(path.resolve(profile), { recursive: true });

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
      `--user-data-dir=${path.resolve(profile)}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) break;
    } catch {
      /* браузер ещё поднимается */
    }
    await sleep(250);
  }

  const open = async (url, { width = 1440, height = 900 } = {}) => {
    const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((res) =>
      res.json(),
    );
    const client = await connect(target.webSocketDebuggerUrl);
    const problems = [];
    const failed = [];

    client.on((message) => {
      if (message.method === 'Runtime.exceptionThrown') {
        problems.push(message.params.exceptionDetails.exception?.description ?? 'исключение');
      }
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        problems.push(message.params.args.map((arg) => arg.value ?? arg.description).join(' '));
      }
      if (message.method === 'Network.loadingFailed') {
        failed.push(`${message.params.type} ${message.params.errorText}`);
      }
      if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
        failed.push(`${message.params.response.status} ${message.params.response.url}`);
      }
    });

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');
    /* На узких ширинах включаем мобильную эмуляцию: так проверка совпадает
       с реальным телефоном, где полоса прокрутки не отнимает ширину. */
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 900,
    });
    await client.send('Page.navigate', { url });
    await sleep(2200);

    const evaluate = async (expression) => {
      const result = await client.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description ?? 'ошибка вычисления');
      }
      return result.result.value;
    };

    return {
      client,
      evaluate,
      problems,
      failed,
      close: async () => {
        client.close();
        await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
      },
    };
  };

  return {
    open,
    close: async () => {
      browser.kill();
      await sleep(400);
      await rm(path.dirname(path.resolve(profile)), { recursive: true, force: true });
    },
  };
}

/** Проверка горизонтального переполнения: только видимые элементы вне обрезанных блоков. */
export const OVERFLOW_PROBE = `(() => {
  const doc = document.documentElement;
  const clipped = (el) => {
    let node = el.parentElement;
    while (node && node !== document.body) {
      const overflow = getComputedStyle(node).overflowX;
      if (overflow === 'hidden' || overflow === 'clip' || overflow === 'auto' || overflow === 'scroll') return true;
      node = node.parentElement;
    }
    return false;
  };
  const wide = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (rect.width === 0 || style.visibility === 'hidden' || style.display === 'none') return false;
      if (Number(style.opacity) === 0) return false;
      /* Ловушка для спама и служебные ссылки уведены за экран намеренно. */
      if (el.closest('.form__honeypot, .skip, .screen-reader-text')) return false;
      if (clipped(el)) return false;
      return rect.right > doc.clientWidth + 1 || rect.left < -1;
    })
    .slice(0, 5)
    .map((el) => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join('.') : ''));
  return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, wide };
})()`;
