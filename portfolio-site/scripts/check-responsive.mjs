// Проверка собранного сайта в реальном браузере: переполнение, тап-цели,
// меню, квиз, ссылки и скриншоты ключевых экранов на 360 / 768 / 1440.
// Запуск: node scripts/check-responsive.mjs
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser, waitForBrowser, openPage, closePage, goto, evaluate, screenshot, sleep } from './lib/cdp.mjs';

const PORT = 4178;
const CDP_PORT = 9334;
const DIST = path.resolve('dist');
const SHOTS = path.resolve('.tmp-check');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    let filePath = path.join(DIST, decodeURIComponent(url.pathname));
    try {
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' });
      res.end(data);
    } catch {
      try {
        const html = await readFile(path.join(DIST, 'index.html'));
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(html);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    }
  });
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  return server;
}

const overflowProbe = `(() => {
  const vw = document.documentElement.clientWidth;
  const isClipped = (el) => {
    let node = el.parentElement;
    // body не считаем обрезкой: у него overflow-x: hidden как общая страховка.
    while (node && node !== document.body) {
      const ox = getComputedStyle(node).overflowX;
      if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') return true;
      node = node.parentElement;
    }
    return false;
  };
  const offenders = [];
  document.querySelectorAll('body *').forEach((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none') return;
    if (rect.width === 0) return;
    if (isClipped(el)) return;
    if (rect.right > vw + 1 || rect.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 80),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      });
    }
  });
  return {
    viewport: vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    hasHorizontalScroll: document.documentElement.scrollWidth > vw + 1,
    offenders: offenders.slice(0, 8),
    docHeight: document.documentElement.scrollHeight,
  };
})()`;

const tapProbe = `(() => {
  const small = [];
  document.querySelectorAll('a, button, textarea, input').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return;
    if (rect.height < 40 || rect.width < 40) {
      small.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
  });
  return small.slice(0, 12);
})()`;

const linksProbe = `(() => {
  const internal = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href'));
  const missing = internal.filter((href) => href !== '#' && !document.querySelector(href));
  const external = [...document.querySelectorAll('a[href^="http"]')].map((a) => ({
    href: a.getAttribute('href'),
    rel: a.getAttribute('rel') ?? '',
    target: a.getAttribute('target') ?? '',
  }));
  return { internalCount: internal.length, missing, external };
})()`;

const sectionsProbe = `(() => ({
  title: document.title,
  h1: document.querySelector('h1')?.textContent?.trim() ?? '',
  sectionIds: [...document.querySelectorAll('main section')].map((s) => s.id),
  h2Count: document.querySelectorAll('h2').length,
  images: [...document.querySelectorAll('img')].map((img) => ({
    src: img.getAttribute('src'),
    naturalWidth: img.naturalWidth,
    alt: img.getAttribute('alt') ?? '',
  })),
}))()`;

await rm(SHOTS, { recursive: true, force: true });
await mkdir(SHOTS, { recursive: true });
await mkdir(path.resolve('.tmp-check-profile'), { recursive: true });

const server = await startStaticServer();
const browser = launchBrowser({ port: CDP_PORT, profileDir: path.resolve('.tmp-check-profile') });
const report = { generatedAt: new Date().toISOString(), widths: {}, checks: {} };

try {
  await waitForBrowser(CDP_PORT);
  const { client, targetId } = await openPage(CDP_PORT);

  const widths = [
    { width: 360, height: 780, mobile: true, label: 'mobile' },
    { width: 768, height: 900, mobile: true, label: 'tablet' },
    { width: 1440, height: 900, mobile: false, label: 'desktop' },
  ];

  await goto(client, `http://127.0.0.1:${PORT}/`, { settle: 2600 });

  // Прокручиваем страницу и принудительно грузим отложенные изображения.
  await evaluate(
    client,
    `(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 110));
      }
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 1400));
      return true;
    })()`,
  );

  report.checks.page = await evaluate(client, sectionsProbe);
  report.checks.links = await evaluate(client, linksProbe);

  // Уведомление об использовании cookie: показывается один раз, выбор запоминается.
  await evaluate(client, `window.localStorage.clear()`);
  await goto(client, `http://127.0.0.1:${PORT}/`, { settle: 1800 });
  report.checks.cookieBanner = await evaluate(
    client,
    `(async () => {
      const banner = document.querySelector('[aria-label="Использование cookie"]');
      const visible = Boolean(banner);
      await new Promise((r) => setTimeout(r, 400));
      const accept = [...(banner?.querySelectorAll('button') ?? [])].find((b) =>
        b.textContent.trim().toLowerCase().startsWith('принять'),
      );
      accept?.click();
      await new Promise((r) => setTimeout(r, 500));
      return {
        shown: visible,
        acceptFound: Boolean(accept),
        hiddenAfter: !document.querySelector('[aria-label="Использование cookie"]'),
        stored: window.localStorage.getItem('portfolio-cookie-consent'),
        hasPolicyLink: Boolean(
          banner?.querySelector('a[href="privacy.html"]'),
        ),
      };
    })()`,
  );
  await screenshot(client, path.join(SHOTS, 'cookie-banner.png'));
  await evaluate(client, `window.localStorage.clear()`);
  await goto(client, `http://127.0.0.1:${PORT}/`, { settle: 1600 });
  await screenshot(client, path.join(SHOTS, 'cookie-banner-visible.png'));
  await evaluate(client, `window.localStorage.clear()`);
  await goto(client, `http://127.0.0.1:${PORT}/`, { settle: 1600 });

  for (const size of widths) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1,
      mobile: size.mobile,
    });
    await sleep(900);

    const overflow = await evaluate(client, overflowProbe);
    const taps = size.mobile ? await evaluate(client, tapProbe) : [];
    report.widths[size.label] = { ...size, overflow, smallTapTargets: taps };

    await evaluate(client, 'window.scrollTo(0, 0)');
    await sleep(500);
    await screenshot(client, path.join(SHOTS, `${size.width}-hero.png`));

    const worksTop = await evaluate(
      client,
      `Math.max(0, Math.round(document.querySelector('#works').getBoundingClientRect().top + window.scrollY) - 40)`,
    );
    await evaluate(client, `window.scrollTo(0, ${worksTop})`);
    await sleep(900);
    await screenshot(client, path.join(SHOTS, `${size.width}-works.png`));

    const contactTop = await evaluate(
      client,
      `Math.max(0, Math.round(document.querySelector('#contact').getBoundingClientRect().top + window.scrollY) - 40)`,
    );
    await evaluate(client, `window.scrollTo(0, ${contactTop})`);
    await sleep(900);
    await screenshot(client, path.join(SHOTS, `${size.width}-contact.png`));

    const extra = size.width === 768 ? ['services'] : ['services', 'process', 'approach'];
    for (const sectionId of extra) {
      const top = await evaluate(
        client,
        `Math.max(0, Math.round(document.querySelector('#${sectionId}').getBoundingClientRect().top + window.scrollY) - 40)`,
      );
      await evaluate(client, `window.scrollTo(0, ${top})`);
      await sleep(800);
      await screenshot(client, path.join(SHOTS, `${size.width}-${sectionId}.png`));
    }
  }

  // Мобильное меню: открытие, видимость, закрытие
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await goto(client, `http://127.0.0.1:${PORT}/`, { settle: 1600 });
  report.checks.mobileMenu = await evaluate(
    client,
    `(async () => {
      const button = document.querySelector('[aria-controls="mobile-menu"]');
      const menu = document.getElementById('mobile-menu');
      const before = { hidden: menu.hidden, expanded: button.getAttribute('aria-expanded') };
      button.click();
      await new Promise((r) => setTimeout(r, 350));
      const open = {
        hidden: menu.hidden,
        expanded: button.getAttribute('aria-expanded'),
        visibleHeight: Math.round(menu.getBoundingClientRect().height),
        linkCount: menu.querySelectorAll('a').length,
      };
      button.click();
      await new Promise((r) => setTimeout(r, 300));
      const closed = { hidden: menu.hidden, expanded: button.getAttribute('aria-expanded') };
      return { before, open, closed };
    })()`,
  );
  await evaluate(client, `document.querySelector('[aria-controls="mobile-menu"]').click()`);
  await sleep(400);
  await screenshot(client, path.join(SHOTS, '360-menu.png'));
  await evaluate(client, `document.querySelector('[aria-controls="mobile-menu"]').click()`);

  // Квиз заявки: три шага и финальный экран
  report.checks.quiz = await evaluate(
    client,
    `(async () => {
      const card = document.querySelector('#contact');
      const steps = [];
      const clickFirstOption = () => {
        const option = card.querySelector('button.group');
        if (option) option.click();
      };
      for (let i = 0; i < 3; i += 1) {
        steps.push(card.querySelector('h3')?.textContent?.trim() ?? '');
        clickFirstOption();
        await new Promise((r) => setTimeout(r, 250));
      }
      const summary = card.querySelectorAll('dl > div').length;
      const buttons = [...card.querySelectorAll('button, a')].map((el) => el.textContent.trim()).filter(Boolean);
      const hasTextarea = Boolean(card.querySelector('textarea'));
      return { steps, summaryRows: summary, hasTextarea, buttons: buttons.slice(-6) };
    })()`,
  );
  await screenshot(client, path.join(SHOTS, '360-quiz-result.png'));

  // Кейсы: ссылки из списка работ ведут на страницы кейсов
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await goto(client, `http://127.0.0.1:${PORT}/#works`, { settle: 1800 });
  report.checks.caseLinks = await evaluate(
    client,
    `(() => {
      const rows = [...document.querySelectorAll('#works li a[href*="case.html"]')].map((a) => a.getAttribute('href'));
      const featured = document.querySelector('#works article a[href*="case.html"]')?.getAttribute('href') ?? '';
      const ids = rows.map((href) => new URLSearchParams(href.split('?')[1]).get('work'));
      return {
        rows: rows.length,
        featured,
        ids,
        unique: new Set(ids).size === ids.length,
        allAbsolute: [...rows, featured].every((href) => href.startsWith('./case.html?work=')),
      };
    })()`,
  );
  await screenshot(client, path.join(SHOTS, '1440-works.png'));

  // Страница кейса: открывается, заполнена и не пустая
  await goto(client, `http://127.0.0.1:${PORT}/case.html?work=forma`, { settle: 2000 });
  report.checks.casePage = await evaluate(
    client,
    `(() => {
      const text = document.body.innerText.toLowerCase();
      return {
        title: document.querySelector('h1')?.textContent?.trim() ?? '',
        blocks: document.querySelectorAll('.case-block').length,
        screens: document.querySelectorAll('figure img').length,
        frames: document.querySelectorAll('.frame__shot').length,
        offers: document.querySelectorAll('.case-offers li').length,
        facts: document.querySelectorAll('.case-facts li').length,
        hasForm: Boolean(document.querySelector('#case-contact')),
        sections: ['разбор', 'что из этого можно заказать', 'экраны', 'задача'].filter((needle) => text.includes(needle)),
        emptyState: text.includes('такой работы в портфолио нет'),
        brokenImages: [...document.querySelectorAll('img')]
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.getAttribute('src')),
        lazyPending: [...document.querySelectorAll('img[loading="lazy"]')].filter((img) => !img.complete).length,
      };
    })()`,
  );
  await screenshot(client, path.join(SHOTS, '1440-case.png'));

  // Превью кейса: должно стоять рядом с курсором, ниже шапки и не уезжать за край
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await goto(client, `http://127.0.0.1:${PORT}/`, { settle: 1800 });
  await evaluate(client, `document.querySelector('#works').scrollIntoView({ block: 'start' })`);
  await sleep(700);

  // Плавная прокрутка: сначала прокручиваем, ждём, и только потом считаем координаты строки
  await evaluate(
    client,
    `document.querySelectorAll('#works li a[href*="case.html"]')[1].scrollIntoView({ block: 'center' })`,
  );
  await sleep(1100);

  const cursor = await evaluate(
    client,
    `(() => {
      const row = document.querySelectorAll('#works li a[href*="case.html"]')[1];
      const rect = row.getBoundingClientRect();
      return { x: Math.round(rect.left + 60), y: Math.round(rect.top + rect.height / 2) };
    })()`,
  );
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 12,
    y: 12,
    buttons: 0,
  });
  await sleep(200);
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: cursor.x,
    y: cursor.y,
    buttons: 0,
  });
  await sleep(300);
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: cursor.x + 4,
    y: cursor.y + 2,
    buttons: 0,
  });
  await sleep(900);

  report.checks.preview = await evaluate(
    client,
    `(() => {
      const el = [...document.querySelectorAll('#works [aria-hidden="true"]')].find(
        (node) => node.style.width === '360px',
      );
      if (!el) return { found: false };
      const rect = el.getBoundingClientRect();
      const header = document.querySelector('header').getBoundingClientRect();
      return {
        found: true,
        opacity: Number(getComputedStyle(el).opacity),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        belowHeader: rect.top >= header.bottom - 1,
        insideViewport:
          rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
        nearCursor: Math.abs(rect.top + rect.height / 2 - ${cursor.y}) < 220 && Math.abs(rect.left - ${cursor.x}) < 420,
      };
    })()`,
  );
  await screenshot(client, path.join(SHOTS, 'works-hover-preview.png'));

  // Страница политики конфиденциальности
  const privacy = [];
  for (const size of [1440, 360]) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: size,
      height: size === 1440 ? 900 : 780,
      deviceScaleFactor: 1,
      mobile: size !== 1440,
    });
    await goto(client, `http://127.0.0.1:${PORT}/privacy.html`, { settle: 1600 });
    const overflow = await evaluate(client, overflowProbe);
    const info = await evaluate(
      client,
      `(() => {
        const vw = document.documentElement.clientWidth;
        return {
          title: document.title,
          h1: document.querySelector('h1')?.textContent?.trim() ?? '',
          sections: document.querySelectorAll('main section').length,
          hasHorizontalScroll: document.documentElement.scrollWidth > vw + 1,
          policyLinks: document.querySelectorAll('a[href="index.html"]').length,
          errors: window.__errors ?? [],
        };
      })()`,
    );
    privacy.push({ width: size, ...info, overflow });
    await screenshot(client, path.join(SHOTS, `privacy-${size}.png`));
  }
  report.checks.privacy = privacy;

  client.close();
  await closePage(CDP_PORT, targetId);
} finally {
  browser.kill();
  server.close();
  await sleep(400);
  await writeFile(path.join(SHOTS, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  await rm(path.resolve('.tmp-check-profile'), { recursive: true, force: true });
}

console.log(JSON.stringify(report, null, 2));
