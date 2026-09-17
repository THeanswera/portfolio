// Визуальный аудит собранного сайта: пустые провалы между блоками, контент,
// который не появился, однотонные «пустые» картинки и переполнение по горизонтали.
// Запуск: node scripts/audit-visual.mjs [--only case] [--keep] [--shots]
import { createServer } from 'node:http';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser, waitForBrowser, openPage, closePage, goto, evaluate, screenshot, sleep } from './lib/cdp.mjs';
import { GAP_PROBE, SECTION_PROBE, SCROLL_THROUGH, REVEAL_ALL, HUMAN_SCROLL_PROBE, IMAGE_PROBE } from './lib/audit.mjs';

const PORT = 4181;
const CDP_PORT = 9339;
const DIST = path.resolve('dist');
const SHOTS = path.resolve('.tmp-audit');
const SHOTS_ENABLED = process.argv.includes('--shots');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

const PAGES = [
  { id: 'home', url: '/index.html', widths: [1440, 768, 360] },
  { id: 'case-forma', url: '/case.html?work=forma', widths: [1440, 768, 360] },
  { id: 'case-kitstroy', url: '/case.html?work=kitstroy', widths: [1440] },
  { id: 'case-technoremont', url: '/case.html?work=technoremont', widths: [1440] },
  { id: 'case-sincere', url: '/case.html?work=sincere', widths: [1440] },
  { id: 'case-sertexity', url: '/case.html?work=sertexity', widths: [1440] },
  { id: 'privacy', url: '/privacy.html', widths: [1440] },
  { id: 'case-missing', url: '/case.html?work=unknown', widths: [1440] },
];

/** Чужой сайт проверяется тем же разбором: node scripts/audit-visual.mjs --base <адрес> --paths /,/projects/ */
const BASE_PAGES = [
  { id: 'base-home', url: '/', widths: [1440] },
  { id: 'base-configurator', url: '/configurator/', widths: [1440] },
  { id: 'base-projects', url: '/projects/', widths: [1440] },
  { id: 'base-materials', url: '/materials/', widths: [1440] },
  { id: 'base-production', url: '/production/', widths: [1440] },
  { id: 'base-contacts', url: '/contacts/', widths: [1440] },
  { id: 'base-privacy', url: '/privacy/', widths: [1440] },
];

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];
const baseIndex = args.indexOf('--base');
/** Локальная сборка портфолио по умолчанию; `--base http://127.0.0.1:4173` — чужой сайт. */
const BASE = baseIndex === -1 ? null : args[baseIndex + 1];
const pathsIndex = args.indexOf('--paths');
const customPaths = pathsIndex === -1 ? null : args[pathsIndex + 1].split(',').map((value) => value.trim());
const widthsIndex = args.indexOf('--widths');
const customWidths = widthsIndex === -1 ? null : args[widthsIndex + 1].split(',').map(Number);
/** Промежуток между секциями в ритме сайта: 120 px отступа сверху и снизу плюс запас. */
const minGapIndex = args.indexOf('--min-gap');
const MIN_GAP = minGapIndex === -1 ? 280 : Number(args[minGapIndex + 1]);

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const filePath = path.join(DIST, decodeURIComponent(url.pathname));
    try {
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  return server;
}

await rm(SHOTS, { recursive: true, force: true });
await mkdir(SHOTS, { recursive: true });
await mkdir(path.resolve('.tmp-audit-profile'), { recursive: true });

const server = await startStaticServer();
const browser = launchBrowser({ port: CDP_PORT, profileDir: path.resolve('.tmp-audit-profile') });
const report = { generatedAt: new Date().toISOString(), pages: [] };

const basePages = customPaths
  ? customPaths.map((url) => ({
      id: `base-${url.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root'}`,
      url,
      widths: customWidths ?? [1440],
    }))
  : BASE_PAGES;

const pages = only
  ? [...PAGES, ...basePages].filter((page) => page.id === only)
  : BASE
    ? basePages
    : PAGES;

// `--widths 1440,768` сужает набор ширин у выбранных страниц.
if (customWidths) for (const page of pages) page.widths = customWidths;
/** Блоки, которые не появились, и битые картинки — это дефекты, из-за них проверка падает. */
const defects = [];
/** Большие промежутки и не появившиеся блоки: предупреждения с адресом и высотой. */
const gaps = [];
const unseen = [];

try {
  await waitForBrowser(CDP_PORT);
  const { client, targetId } = await openPage(CDP_PORT);

  for (const page of pages) {
    for (const width of page.widths) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: width >= 1440 ? 900 : 800,
        deviceScaleFactor: 1,
        mobile: width < 900,
      });

      await goto(client, BASE ? `${BASE}${page.url}` : `http://127.0.0.1:${PORT}${page.url}`, { settle: 1200 });

      // Главная проверка: страница прокручивается как у человека и все блоки обязаны появиться.
      const stillHidden = await evaluate(client, HUMAN_SCROLL_PROBE);
      await evaluate(client, SCROLL_THROUGH);
      await evaluate(client, REVEAL_ALL);
      await evaluate(client, 'window.scrollTo(0, 0)');
      await sleep(900);

      // Снимок полной страницы делается первым и всегда в окне обычной высоты:
      // при высоком окне «липкие» элементы и полноэкранные секции считаются иначе,
      // и замеры промежутков начинают врать.
      if (SHOTS_ENABLED) {
        await screenshot(client, path.join(SHOTS, `${page.id}-${width}-page.png`));
      }

      const beforeReveal = await evaluate(client, GAP_PROBE);
      // Высота берётся из метрик: фиксированная высота вырезки добавляет в кадр
      // тысячи пикселей пустоты ниже подвала.
      const metrics = await client.send('Page.getLayoutMetrics');
      const contentHeight = Math.round(metrics.cssContentSize.height);
      const full = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: Math.min(contentHeight, 20000), scale: 1 },
      });
      const afterReveal = await evaluate(client, GAP_PROBE);
      const sections = await evaluate(client, SECTION_PROBE);
      const images = await evaluate(client, IMAGE_PROBE);

      const entry = { page: page.id, width, stillHidden, beforeReveal, afterReveal, sections, images };
      report.pages.push(entry);

      const label = `${page.id} @ ${width}`;
      for (const item of stillHidden) {
        defects.push(
          `${label}: не появился при обычной прокрутке блок на ${item.top}px высотой ${item.height}px «${item.text}»`,
        );
      }
      for (const src of images.broken) defects.push(`${label}: не загрузилась картинка ${src}`);
      for (const src of images.pending) defects.push(`${label}: картинка не догрузилась ${src}`);
      for (const item of stillHidden) unseen.push(`${label}: ${item.top}px «${item.text}»`);
      for (const gap of afterReveal.gaps) {
        if (gap.px >= MIN_GAP) {
          gaps.push(
            `${label}: ${gap.px}px между «${(gap.afterText || gap.afterCls).slice(0, 60)}» и «${(gap.beforeText || gap.beforeCls).slice(0, 60)}»`,
          );
        }
      }
      if (afterReveal.horizontalOverflow) {
        defects.push(
          `${label}: горизонтальное переполнение ${afterReveal.docScrollWidth} > ${afterReveal.viewport.width}`,
        );
      }

      if (SHOTS_ENABLED) {
        await writeFile(path.join(SHOTS, `${page.id}-${width}-full.png`), Buffer.from(full.data, 'base64'));
      }

      console.log(
        `→ ${label}: высота ${afterReveal.docHeight}, полос ${afterReveal.bands}, ` +
          `не появилось ${stillHidden.length}, провалов ≥140px ${afterReveal.gaps.length}`,
      );
    }
  }

  client.close();
  await closePage(CDP_PORT, targetId);
} finally {
  browser.kill();
  server.close();
  await sleep(400);
  await writeFile(path.join(SHOTS, 'audit.json'), JSON.stringify(report, null, 2), 'utf8');
  await rm(path.resolve('.tmp-audit-profile'), { recursive: true, force: true });
}

console.log('\n--- Дефекты ---');
if (defects.length === 0) console.log('нет');
else defects.forEach((line) => console.log(`• ${line}`));

console.log('\n--- Предупреждения ---');
const warnings = [...unseen, ...gaps];
if (warnings.length === 0) console.log('нет');
else {
  warnings.forEach((line) => console.log(`• ${line}`));
  console.log(`(порог промежутка ${MIN_GAP}px; ритм сайта даёт 120–240px между секциями — это норма)`);
}

console.log(`\nОтчёт: ${path.relative(process.cwd(), path.join(SHOTS, 'audit.json'))}`);
process.exitCode = defects.length > 0 ? 1 : 0;
