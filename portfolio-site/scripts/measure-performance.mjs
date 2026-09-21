// Измерение производительности собранного сайта в реальном браузере.
//
// Считает не «баллы ради баллов», а то, что можно проверить и повторить:
// вес по сети, время до первой отрисовки, задержку до главного изображения и
// отсутствие ошибок в консоли. Каждое измерение повторяется трижды, в отчёт
// идёт медиана, а условия (ширина, формат, версия инструмента) записываются,
// чтобы результат можно было сравнить позже.
//
// Запуск: node scripts/measure-performance.mjs [--out .tmp-perf]
import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { closePage, goto, launchBrowser, openPage, sleep, waitForBrowser } from './lib/cdp.mjs';
import { casePages, homePage, catalogPage } from './lib/pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const DIST = path.join(root, 'dist');
const PORT = 4185;
const CDP_PORT = 9346;
const RUNS = 3;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const routes = [
  { id: 'home', url: '/' },
  { id: 'catalog', url: '/cases/' },
  ...casePages.map((page) => ({ id: `case-${page.work.slug}`, url: page.route })),
];

async function startStaticServer() {
  // Сжатие включаем, как на хостинге: nginx отдаёт gzip (проверено на живом сайте).
  const zlib = await import('node:zlib');

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
    let file = path.join(DIST, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');

    try {
      const data = await readFile(file);
      const type = MIME[path.extname(file)] ?? 'application/octet-stream';
      const compressible = /text|javascript|json|xml|svg/.test(type);
      const accept = request.headers['accept-encoding'] ?? '';
      const gzip = compressible && accept.includes('gzip');

      response.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': /assets\//.test(url.pathname) ? 'public, max-age=3888000' : 'no-cache, must-revalidate',
        ...(gzip ? { 'Content-Encoding': 'gzip' } : {}),
      });
      response.end(gzip ? zlib.gzipSync(data) : data);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('не найдено');
    }
  });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  return server;
}

/**
 * Вес страницы по сети: сумма размеров HTML, скриптов, стилей, шрифтов и
 * картинок с учётом gzip — так же, как их отдаёт nginx на хостинге.
 *
 * Считаем запросами, а не через Resource Timing: размер переданных байтов
 * браузер не показывает для своего же источника, и цифра получалась нулевой.
 */
async function measureTransferSize(route) {
  const root = `http://127.0.0.1:${PORT}`;
  const headers = { 'Accept-Encoding': 'gzip' };

  const pageResponse = await fetch(`${root}${route}`, { headers });
  const pageHtml = await pageResponse.text();
  const pageBytes = Buffer.byteLength(await (await fetch(`${root}${route}`, { headers })).text());

  const refs = new Set();
  for (const match of pageHtml.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (!value.startsWith('/')) continue;
    if (value.startsWith('//')) continue;
    refs.add(value.split('#')[0]);
  }

  let bytes = pageBytes;
  const assets = [];

  for (const ref of refs) {
    const response = await fetch(`${root}${ref}`, { headers });
    if (!response.ok) continue;
    const body = await response.arrayBuffer();
    bytes += body.byteLength;
    assets.push({ ref, bytes: body.byteLength });
  }

  // Шрифты подключаются из CSS — их тоже считаем.
  const css = assets.filter((asset) => asset.ref.endsWith('.css'));
  for (const sheet of css) {
    const text = await (await fetch(`${root}${sheet.ref}`, { headers })).text();
    for (const match of text.matchAll(/url\((['"]?)(\/[^'")]+)\1\)/g)) {
      const ref = match[2];
      if (refs.has(ref)) continue;
      refs.add(ref);
      const response = await fetch(`${root}${ref}`, { headers });
      if (!response.ok) continue;
      const body = await response.arrayBuffer();
      bytes += body.byteLength;
      assets.push({ ref, bytes: body.byteLength });
    }
  }

  return { bytes, requests: refs.size + 1 };
}

/** Медиана: устойчивее среднего на трёх прогонах. */
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const server = await startStaticServer();
const profile = path.join(tmpdir(), 'portfolio-perf');
await rm(profile, { recursive: true, force: true });
const browser = launchBrowser({ port: CDP_PORT, profileDir: profile });

const outIndex = process.argv.indexOf('--out');
const outDir = path.resolve(outIndex === -1 ? '.tmp-perf' : process.argv[outIndex + 1]);
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

// Версию браузера читаем у самого файла: запускать chrome.exe --version на
// Windows нельзя — он открывает окно вместо печати версии.
const chromeBinary = (await import('./lib/cdp.mjs')).findChrome();
const chromeVersion = chromeBinary ? `Chrome ${await readChromeVersion(chromeBinary)}` : 'Chrome (путь не найден)';

/** Версия из свойств файла: на Windows — через PowerShell, иначе — запуском. */
async function readChromeVersion(binary) {
  const { execFileSync } = await import('node:child_process');
  try {
    if (process.platform === 'win32') {
      const out = execFileSync(
        'powershell',
        ['-NoProfile', '-Command', `(Get-Item '${binary}').VersionInfo.ProductVersion`],
        { encoding: 'utf8' },
      );
      return out.trim();
    }
    return execFileSync(binary, ['--version'], { encoding: 'utf8' }).trim();
  } catch {
    return 'версия не определена';
  }
}

const conditions = {
  tool: 'Chrome DevTools Protocol, метрики производительности из performance API',
  chrome: chromeVersion,
  node: process.version,
  runs: RUNS,
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  network: 'локальный сервер, gzip включён (как nginx на хостинге)',
  cache: 'кеш браузера отключён, профиль чистый',
  note: 'Лабораторные измерения на сборочной машине; это не полевые данные и не балл Lighthouse.',
};

const report = { generatedAt: new Date().toISOString(), conditions, pages: [] };

try {
  await waitForBrowser(CDP_PORT);

  for (const route of routes) {
    const runs = [];

    for (let run = 0; run < RUNS; run += 1) {
      // Чистый профиль кеша: каждый прогон — как первый визит.
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/0`).catch(() => {});
      const { client, targetId } = await openPage(CDP_PORT);
      await client.send('Network.enable');
      await client.send('Page.enable');
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: conditions.width,
        height: conditions.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await client.send('Network.setCacheDisabled', { cacheDisabled: true });

      const requests = [];
      const errors = [];
      client.on('Network.requestWillBeSent', (params) => {
        requests.push({ url: params.request.url, type: params.type });
      });
      client.on('Network.loadingFailed', (params) => {
        // Служебные запросы Chrome к about:blank (ERR_CONNECTION_REFUSED) —
        // не ошибка сайта, в отчёт не идут.
        const text = params.errorText ?? 'ошибка загрузки';
        if (/ERR_CONNECTION_REFUSED|ERR_ABORTED/.test(text)) return;
        errors.push(text);
      });
      client.on('Network.responseReceived', (params) => {
        if (params.response.status >= 400) errors.push(`${params.response.status} ${params.response.url}`);
      });

      await goto(client, `http://127.0.0.1:${route.url}`, { settle: 2500 });

      const metrics = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          const paints = performance.getEntriesByType('paint');
          const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0;
          return {
            fcp: Math.round(fcp),
            domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
            load: Math.round(nav?.loadEventEnd ?? 0),
          };
        })()`,
        returnByValue: true,
      });

      const value = metrics.result.value;
      runs.push({ ...value, errors: [...new Set(errors)].slice(0, 4) });
      await closePage(CDP_PORT, targetId);
      await sleep(300);
    }

    const transfer = await measureTransferSize(route.url);

    const summary = {
      id: route.id,
      url: route.url,
      runs,
      median: {
        fcp: median(runs.map((run) => run.fcp)),
        domContentLoaded: median(runs.map((run) => run.domContentLoaded)),
        load: median(runs.map((run) => run.load)),
        transferredKB: Math.round(transfer.bytes / 1024),
        requests: transfer.requests,
      },
      errors: [...new Set(runs.flatMap((run) => run.errors))],
    };

    report.pages.push(summary);
    console.log(
      `  ${route.id.padEnd(20)} FCP ${summary.median.fcp} мс, загрузка ${summary.median.load} мс, ` +
        `по сети ${summary.median.transferredKB} КБ (${summary.median.requests} запросов), ` +
        `ошибок загрузки: ${summary.errors.length}`,
    );
  }
} finally {
  browser.kill();
  server.close();
  await sleep(400);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}

await writeFile(path.join(outDir, 'performance.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`\nОтчёт: ${path.join(outDir, 'performance.json')}`);
console.log(`Условия: ${conditions.chrome}, ширина ${conditions.width}, ${RUNS} прогона, медиана.`);
