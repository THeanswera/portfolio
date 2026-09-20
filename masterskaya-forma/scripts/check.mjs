/**
 * Приёмка сайта в настоящем браузере: переполнение на трёх ширинах, ошибки в консоли,
 * битые запросы, ссылки и якоря, работа конфигуратора, фильтра, форм и cookie.
 *
 * Запуск: node scripts/check.mjs [--url http://127.0.0.1:4173/]
 */
import { withBrowser, sleep, OVERFLOW_PROBE } from './cdp.mjs';
import { startServer } from './lib/server.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

/**
 * Без --url поднимаем собственный сервер над dist. Так проверка не зависит
 * от того, запущен ли где-то рядом serve.mjs, — это важно и локально, и в CI.
 */
let local = null;
let base = arg('url', '');
if (!base) {
  local = await startServer({ root: 'dist', port: Number(arg('port', 4173)) });
  base = local.url;
}

// Если сайт не отдаётся, все проверки ниже бессмысленны — говорим об этом прямо.
const probe = await fetch(`${base}/`).catch(() => null);
if (!probe || !probe.ok) {
  console.error(`Сайт не отвечает по адресу ${base}/ — сначала выполните сборку: node build.mjs`);
  if (local) await local.close();
  process.exit(1);
}

const WIDTHS = [360, 768, 1440];

const PAGES = [
  '/',
  '/configurator/',
  '/projects/',
  '/projects/kuhnya-s-ostrovom-v-barvihe/',
  '/materials/',
  '/production/',
  '/contacts/',
  '/privacy/',
  '/thanks/',
  '/404.html',
];

const results = [];
const fail = (message) => results.push({ ok: false, message });
const pass = (message) => results.push({ ok: true, message });

const browser = await withBrowser();

try {
  /* --- 1. Каждая страница на трёх ширинах --- */
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      const page = await browser.open(`${base}${path}`, { width });
      const overflow = await page.evaluate(OVERFLOW_PROBE);
      const title = await page.evaluate('document.title');
      const h1 = await page.evaluate('document.querySelector("h1")?.textContent?.trim() ?? ""');
      const scrollY = await page.evaluate('document.body.scrollHeight');

      if (overflow.scrollWidth > overflow.clientWidth) {
        fail(`${path} @${width}: переполнение ${overflow.scrollWidth} > ${overflow.clientWidth} (${overflow.wide.join(', ')})`);
      } else if (!title || !h1) {
        fail(`${path} @${width}: нет заголовка или h1`);
      } else {
        pass(`${path} @${width}: ${overflow.clientWidth}px, высота ${scrollY}px, h1 «${h1.slice(0, 42)}»`);
      }

      if (page.problems.length) fail(`${path} @${width}: ошибки в консоли — ${page.problems.slice(0, 2).join(' | ')}`);
      if (page.failed.length) fail(`${path} @${width}: битые запросы — ${page.failed.slice(0, 3).join(' | ')}`);

      await page.close();
    }
  }

  /* --- 2. Ссылки и якоря --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const links = await page.evaluate(`
      [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
    `);
    const internal = [...new Set(links.filter((href) => href.startsWith('/') && !href.startsWith('//')))];
    const broken = [];
    for (const href of internal) {
      const clean = href.split('#')[0] || '/';
      const probe = await page.evaluate(`fetch(${JSON.stringify(clean)}, { method: 'GET' }).then((r) => r.status).catch(() => 0)`);
      if (probe !== 200) broken.push(`${href} → ${probe}`);
    }

    const anchors = await page.evaluate(`
      [...document.querySelectorAll('a[href*="#"]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href.startsWith('/') && href.includes('#'))
    `);
    const badAnchors = [];
    for (const href of [...new Set(anchors)]) {
      const [pathname, hash] = href.split('#');
      const probe = await page.evaluate(
        `fetch(${JSON.stringify(pathname || '/')}).then((r) => r.text()).then((html) => html.includes(${JSON.stringify(`id="${hash}"`)}))`,
      );
      if (!probe) badAnchors.push(href);
    }

    if (broken.length) fail(`Битые внутренние ссылки: ${broken.join(', ')}`);
    else pass(`Внутренние ссылки: ${internal.length} проверено, все отвечают 200`);

    if (badAnchors.length) fail(`Якоря без цели: ${badAnchors.join(', ')}`);
    else pass(`Якоря: ${new Set(anchors).size} проверено, все ведут к существующим блокам`);

    await page.close();
  }

  /* --- 3. Конфигуратор: реакция на действия --- */
  {
    const page = await browser.open(`${base}/configurator/`, { width: 1440 });
    const read = (part) => page.evaluate(`document.querySelector('[data-part="${part}"]')?.textContent?.trim() ?? ''`);

    const before = await read('total');
    await page.evaluate(`document.querySelector('[data-set="layout"][data-value="u"]').click()`);
    await sleep(300);
    const afterLayout = await read('total');
    const runLabel = await read('run');

    await page.evaluate(`(() => { const el = document.querySelector('[data-set="wall"]'); el.value = '460'; el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(300);
    const afterWall = await read('total');
    const wallLabel = await page.evaluate(`document.querySelector('[data-part="wall-value"]').textContent.trim()`);

    await page.evaluate(`document.querySelector('[data-set="facade"][data-value="solid"]').click()`);
    await sleep(300);
    const afterFacade = await read('total');
    const swatches = await page.evaluate(`document.querySelectorAll('[data-part="color"] .swatch').length`);
    const pressed = await page.evaluate(`document.querySelectorAll('[data-part="color"] .swatch[aria-pressed="true"]').length`);

    const url = await page.evaluate('location.search');
    const drawing = await page.evaluate(`document.querySelectorAll('[data-part="draw"] svg *').length`);

    if (before && afterLayout && before !== afterLayout) pass(`Конфигуратор: смена планировки меняет цену (${before} → ${afterLayout}, ${runLabel})`);
    else fail(`Конфигуратор: планировка не влияет на цену (${before} → ${afterLayout})`);

    if (afterWall !== afterLayout) pass(`Конфигуратор: ползунок длины меняет цену (${afterLayout} → ${afterWall}, ${wallLabel})`);
    else fail('Конфигуратор: ползунок длины не влияет на цену');

    if (afterFacade !== afterWall) pass(`Конфигуратор: смена фасада меняет цену (${afterWall} → ${afterFacade})`);
    else fail('Конфигуратор: фасад не влияет на цену');

    if (swatches >= 2 && pressed === 1) pass(`Конфигуратор: палитра перерисовалась — ${swatches} цвета, выбран ровно один`);
    else fail(`Конфигуратор: палитра не обновилась (${swatches} цветов, выбрано ${pressed})`);

    if (url.includes('layout=u') && url.includes('wall=460')) pass(`Конфигуратор: состояние в адресе — ${url}`);
    else fail(`Конфигуратор: адрес не обновился (${url})`);

    if (drawing > 30) pass(`Конфигуратор: чертёж перерисован (${drawing} элементов в SVG)`);
    else fail(`Конфигуратор: чертёж пустой (${drawing} элементов)`);

    /* --- План: гарнитур занимает верхние углы комнаты --- */
    // Раньше комната рисовалась на 80 см шире стены, и в правом верхнем углу
    // П-образной планировки оставалась пустая полоса. Проверяем углы у всех
    // планировок: основная стена идёт во всю ширину комнаты.
    const planCorners = async (layoutId) => {
      await page.evaluate(`document.querySelector('[data-set="layout"][data-value="${layoutId}"]').click()`);
      await sleep(250);
      return page.evaluate(`(() => {
        const rects = [...document.querySelectorAll('[data-plan] svg rect')].map((el) => ({
          x: Number(el.getAttribute('x')),
          y: Number(el.getAttribute('y')),
          w: Number(el.getAttribute('width')),
          h: Number(el.getAttribute('height')),
          room: el.getAttribute('fill') === 'none',
        }));
        const room = rects.find((item) => item.room);
        const cabinets = rects.filter((item) => !item.room);
        if (!room || !cabinets.length) return { error: 'план не нарисован' };
        const inside = (px, py) => cabinets.some((c) => px >= c.x - 0.5 && px <= c.x + c.w + 0.5 && py >= c.y - 0.5 && py <= c.y + c.h + 0.5);
        const probes = [];
        for (let dx = 5; dx <= 55; dx += 5) {
          for (let dy = 5; dy <= 55; dy += 5) {
            probes.push([room.x + dx, room.y + dy], [room.x + room.w - dx, room.y + dy]);
          }
        }
        return {
          total: probes.length,
          covered: probes.filter(([px, py]) => inside(px, py)).length,
          roomW: Math.round(room.w),
          runRight: Math.round(Math.max(...cabinets.map((c) => c.x + c.w))),
          roomRight: Math.round(room.x + room.w),
        };
      })()`);
    };

    for (const layoutId of ['line', 'corner', 'u', 'island']) {
      const probe = await planCorners(layoutId);
      if (probe.error) {
        fail(`План «${layoutId}»: ${probe.error}`);
      } else if (probe.covered === probe.total && probe.runRight === probe.roomRight) {
        pass(`План «${layoutId}»: стена ${probe.roomW} см, углы заняты гарнитуром (${probe.covered}/${probe.total} точек)`);
      } else {
        fail(`План «${layoutId}»: пустой угол — занято ${probe.covered} из ${probe.total} точек, стена кончается на ${probe.runRight} при комнате ${probe.roomRight}`);
      }
    }

    await page.evaluate(`document.querySelector('[data-lead-open]').click()`);
    await sleep(300);
    const modalOpen = await page.evaluate(`!document.querySelector('[data-lead]').hidden`);
    const summary = await page.evaluate(`document.querySelector('[data-lead-summary]').textContent.trim().slice(0, 60)`);

    // Окно заявки не должно распирать себя полосами прокрутки
    const box = await page.evaluate(`(() => {
      const panel = document.querySelector('.modal__panel');
      const rect = panel.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        scrollWidth: panel.scrollWidth,
        clientWidth: panel.clientWidth,
        scrollHeight: panel.scrollHeight,
        clientHeight: panel.clientHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        docScrollWidth: document.documentElement.scrollWidth,
        summaryHasLink: document.querySelector('[data-lead-summary]').textContent.includes('http'),
      };
    })()`);

    if (box.scrollWidth <= box.clientWidth + 1 && box.docScrollWidth <= box.viewportWidth) {
      pass(`Заявка: окно ${box.width}×${box.height} без горизонтальной прокрутки (контент ${box.scrollWidth} ≤ ${box.clientWidth})`);
    } else {
      fail(`Заявка: горизонтальная прокрутка — контент ${box.scrollWidth} при ширине ${box.clientWidth}, документ ${box.docScrollWidth}`);
    }

    if (box.width <= box.viewportWidth && box.height <= box.viewportHeight) {
      pass(`Заявка: окно помещается в экран (${box.width}×${box.height} при ${box.viewportWidth}×${box.viewportHeight})`);
    } else {
      fail(`Заявка: окно больше экрана — ${box.width}×${box.height} при ${box.viewportWidth}×${box.viewportHeight}`);
    }

    if (box.scrollHeight <= box.clientHeight + 1) {
      pass(`Заявка: содержимое помещается целиком (${box.scrollHeight} ≤ ${box.clientHeight})`);
    } else {
      fail(`Заявка: содержимое не влезает — ${box.scrollHeight} при высоте окна ${box.clientHeight}`);
    }

    if (!box.summaryHasLink) {
      pass('Заявка: в описании нет длинной ссылки — она уходит на сервер отдельным полем');
    } else {
      fail('Заявка: в описании осталась длинная ссылка, она распирает окно');
    }
    await page.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
    await sleep(300);
    const modalClosed = await page.evaluate(`document.querySelector('[data-lead]').hidden`);

    if (modalOpen && summary.includes('Планировка')) pass(`Заявка: окно открывается и подставляет расчёт («${summary.replace(/\n/g, ' / ')}…»)`);
    else fail(`Заявка: окно не открылось или расчёт не подставлен (${summary})`);

    if (modalClosed) pass('Заявка: окно закрывается по Escape');
    else fail('Заявка: окно не закрылось по Escape');

    // Опции: адрес должен оставаться читаемым, без мусора в параметрах
    await page.evaluate(`(() => { const el = document.querySelector('input[data-set="extras"][value="dryer"]'); el.checked = true; el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await sleep(500);
    const extras = await page.evaluate(`(() => {
      const raw = new URLSearchParams(location.search).get('extras') ?? '';
      return { raw, ids: raw.split(',').filter(Boolean), href: location.href };
    })()`);
    const known = ['light', 'sink', 'dryer', 'organizers', 'tall'];
    const unknown = extras.ids.filter((id) => !known.includes(id));

    if (unknown.length === 0 && extras.ids.includes('dryer') && extras.ids.includes('light')) {
      pass(`Опции: адрес собирается верно — ${extras.ids.join(', ')}`);
    } else {
      fail(`Опции: в адресе мусор (${extras.raw})`);
    }

    await page.close();
  }

  /* --- 4. Каталог: фильтр по стилю --- */
  {
    const page = await browser.open(`${base}/projects/`, { width: 1440 });
    const all = await page.evaluate(`document.querySelectorAll('[data-style]').length`);
    await page.evaluate(`document.querySelector('[data-filter="Лофт"]').click()`);
    await sleep(250);
    const visible = await page.evaluate(`[...document.querySelectorAll('[data-style]')].filter((el) => !el.hidden).length`);
    const pressed = await page.evaluate(`document.querySelector('[data-filter="Лофт"]').getAttribute('aria-pressed')`);
    await page.evaluate(`document.querySelector('[data-filter="all"]').click()`);
    await sleep(250);
    const restored = await page.evaluate(`[...document.querySelectorAll('[data-style]')].filter((el) => !el.hidden).length`);

    if (visible === 1 && pressed === 'true' && restored === all) pass(`Каталог: фильтр работает (${all} → ${visible} → ${restored})`);
    else fail(`Каталог: фильтр сломан (${all} → ${visible} → ${restored}, aria-pressed=${pressed})`);

    await page.close();
  }

  /* --- 5. Cookie --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    await page.evaluate(`localStorage.removeItem('forma-cookie'); location.reload()`);
    await sleep(1800);
    const shown = await page.evaluate(`!document.querySelector('[data-cookie]').hidden`);
    await page.evaluate(`document.querySelector('[data-cookie-choice="necessary"]').click()`);
    await sleep(200);
    const stored = await page.evaluate(`localStorage.getItem('forma-cookie')`);
    const hidden = await page.evaluate(`document.querySelector('[data-cookie]').hidden`);

    if (shown && stored === 'necessary' && hidden) pass('Cookie: уведомление показывается, выбор сохраняется');
    else fail(`Cookie: показано=${shown}, сохранено=${stored}, скрыто=${hidden}`);

    await page.close();
  }

  /* --- 6. Шрифты и вес страницы --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const fonts = await page.evaluate(`[...document.fonts].map((f) => f.family + ' ' + f.status).join(', ')`);
    const resources = await page.evaluate(`
      performance.getEntriesByType('resource').map((entry) => entry.name.split('/').pop() + ':' + Math.round(entry.transferSize / 1024))
    `);
    const totalKb = await page.evaluate(`
      Math.round(performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0) / 1024)
    `);

    pass(`Шрифты: ${fonts}`);
    pass(`Ресурсы страницы: ${totalKb} КБ (${resources.join(', ')})`);
    await page.close();
  }

  /* --- 7. Мобильное меню --- */
  {
    const page = await browser.open(`${base}/`, { width: 360 });
    await page.evaluate(`document.querySelector('.burger').click()`);
    await sleep(250);
    const open = await page.evaluate(`document.getElementById('mobile-menu').dataset.open`);
    const expanded = await page.evaluate(`document.querySelector('.burger').getAttribute('aria-expanded')`);
    const links = await page.evaluate(`document.querySelectorAll('#mobile-menu a').length`);
    await page.evaluate(`document.querySelector('#mobile-menu a').click()`);
    await sleep(200);
    const closed = await page.evaluate(`document.getElementById('mobile-menu').dataset.open`);

    if (open === 'true' && expanded === 'true' && links >= 5 && closed === 'false') pass(`Меню: открывается, ${links} ссылок, закрывается по клику`);
    else fail(`Меню: open=${open}, aria=${expanded}, ссылок=${links}, после клика=${closed}`);

    await page.close();
  }
} finally {
  await browser.close();
  if (local) await local.close();
}

const failed = results.filter((item) => !item.ok);
console.log('\n--- Проверки ---');
for (const item of results) console.log(`${item.ok ? '✓' : '✗'} ${item.message}`);
console.log(`\nИтого: ${results.length - failed.length} из ${results.length} без замечаний, провалов ${failed.length}`);
process.exit(failed.length ? 1 : 0);
