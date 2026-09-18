/**
 * Приёмка сайта Sertexity в настоящем браузере: переполнение на трёх ширинах,
 * ошибки в консоли, битые запросы, ссылки, работа глобуса, калькулятора,
 * мобильного меню и формы.
 *
 * Запуск: node scripts/check.mjs [--url http://127.0.0.1:4174/]
 */
import { withBrowser, sleep, OVERFLOW_PROBE } from './cdp.mjs';
import { startServer } from './lib/server.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

let local = null;
let base = arg('url', '');
if (!base) {
  local = await startServer({ root: 'dist', port: Number(arg('port', 4174)) });
  base = local.url;
}

const probe = await fetch(`${base}/`).catch(() => null);
if (!probe || !probe.ok) {
  console.error(`Сайт не отвечает по адресу ${base}/ — сначала выполните сборку: node build.mjs`);
  if (local) await local.close();
  process.exit(1);
}

const WIDTHS = [360, 768, 1440];

const PAGES = [
  '/',
  '/how-it-works/',
  '/markets/',
  '/calculator/',
  '/faq/',
  '/contacts/',
  '/privacy/',
  '/thanks/',
  '/404.html',
];

const results = [];
const fail = (message) => results.push({ ok: false, message });
const pass = (message) => results.push({ ok: true, message });

const browser = await withBrowser({ port: 9338 });

try {
  /* --- 1. Каждая страница на трёх ширинах --- */
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      const page = await browser.open(`${base}${path}`, { width });
      const overflow = await page.evaluate(OVERFLOW_PROBE);
      const title = await page.evaluate('document.title');
      const h1 = await page.evaluate('document.querySelector("h1")?.textContent?.trim() ?? ""');
      const height = await page.evaluate('document.body.scrollHeight');

      if (overflow.scrollWidth > overflow.clientWidth) {
        fail(`${path} @${width}: переполнение ${overflow.scrollWidth} > ${overflow.clientWidth} (${overflow.wide.join(', ')})`);
      } else if (!title || !h1) {
        fail(`${path} @${width}: нет заголовка или h1`);
      } else if (page.problems.length) {
        fail(`${path} @${width}: ошибки в консоли — ${page.problems[0].slice(0, 120)}`);
      } else if (page.failed.length) {
        fail(`${path} @${width}: битые запросы — ${page.failed[0]}`);
      } else {
        pass(`${path} @${width}: ${height}px, переполнения нет`);
      }

      await page.close();
    }
  }

  /* --- 2. Ссылки и якоря --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const links = await page.evaluate(`(() => {
      const internal = [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel'));
      const anchors = internal.filter((href) => href.startsWith('#') && href !== '#');
      const missing = anchors.filter((href) => !document.querySelector(href));
      return { total: internal.length, anchors: anchors.length, missing };
    })()`);

    if (links.missing.length) fail(`Главная: битые якоря — ${links.missing.join(', ')}`);
    else pass(`Главная: ${links.total} внутренних ссылок, ${links.anchors} якорей, все ведут на существующие блоки`);

    /* Проверяем, что все внутренние адреса отвечают 200. */
    const pagesToCheck = ['/how-it-works/', '/markets/', '/calculator/', '/faq/', '/contacts/', '/privacy/'];
    const broken = [];

    for (const path of pagesToCheck) {
      const response = await fetch(`${base}${path}`).catch(() => null);
      if (!response || !response.ok) broken.push(`${path} → ${response?.status ?? 'нет ответа'}`);
    }

    if (broken.length) fail(`Внутренние адреса: ${broken.join(', ')}`);
    else pass(`Внутренние адреса: ${pagesToCheck.length} страниц отвечают 200`);

    await page.close();
  }

  /* --- 3. Глобус: canvas с ненулевым размером и нарисованными пикселями --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const globe = await page.evaluate(`(() => {
      const canvas = document.querySelector('[data-globe]');
      if (!canvas) return { found: false };
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4 * 97) if (data[i] > 8) painted += 1;
      return { found: true, width: canvas.width, height: canvas.height, painted };
    })()`);

    if (!globe.found || globe.width === 0 || globe.painted < 20) {
      fail(`Глобус: canvas ${globe.width}×${globe.height}, закрашенных точек ${globe.painted}`);
    } else {
      pass(`Глобус: canvas ${globe.width}×${globe.height}, закрашенных точек ${globe.painted}`);
    }

    /* Вращение мышью: тянем canvas вбок и смотрим на угол поворота. */
    const box = await page.evaluate(`(() => {
      const rect = document.querySelector('[data-globe]').getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);
    const cx = Math.round(box.x + box.width / 2);
    const cy = Math.round(box.y + box.height / 2);
    const yawBefore = await page.evaluate('document.querySelector("[data-globe]").globeState.yaw');

    await page.client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy, buttons: 0 });
    await page.client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: cx, y: cy, button: 'left', buttons: 1, clickCount: 1,
    });
    for (let step = 1; step <= 12; step += 1) {
      await page.client.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved', x: cx + step * 14, y: cy - step * 3, button: 'left', buttons: 1,
      });
    }
    await page.client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: cx + 168, y: cy - 36, button: 'left', buttons: 0,
    });
    await sleep(200);

    const dragState = await page.evaluate(`(() => {
      const state = document.querySelector('[data-globe]').globeState;
      return { yaw: state.yaw, pitch: state.pitch, dragging: state.dragging };
    })()`);

    if (Math.abs(dragState.yaw - yawBefore) < 0.2) {
      fail(`Глобус: перетаскивание не повернуло сферу (${yawBefore.toFixed(3)} → ${dragState.yaw.toFixed(3)})`);
    } else if (dragState.dragging) {
      fail('Глобус: перетаскивание не завершилось после отпускания кнопки');
    } else {
      pass(`Глобус: тянется мышью, поворот ${yawBefore.toFixed(2)} → ${dragState.yaw.toFixed(2)} рад`);
    }

    /* Наведение на площадку: ищем точку, где появляется подсказка. */
    let hovered = null;
    for (let ring = 1; ring <= 4 && !hovered; ring += 1) {
      for (let angle = 0; angle < 12 && !hovered; angle += 1) {
        const radius = ring * (box.width / 9);
        const x = Math.round(cx + Math.cos((angle / 12) * Math.PI * 2) * radius);
        const y = Math.round(cy + Math.sin((angle / 12) * Math.PI * 2) * radius);
        await page.client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 });
        await sleep(60);
        const state = await page.evaluate(`(() => {
          const canvas = document.querySelector('[data-globe]');
          const tip = document.querySelector('.globe__tip');
          return { hovered: canvas.globeState.hovered, tip: tip ? !tip.hidden : false };
        })()`);
        if (state.hovered !== -1 && state.tip) hovered = state;
      }
    }

    if (!hovered) fail('Глобус: подсказка о площадке не появляется при наведении');
    else pass('Глобус: наведение на площадку показывает комиссию и задержку');

    await page.close();
  }

  /* --- 4. Бегущая строка: элементы построены скриптом --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const ticker = await page.evaluate('document.querySelectorAll("[data-ticker] .ticker__item").length');
    const terminal = await page.evaluate('document.querySelectorAll("[data-terminal] .terminal__line").length');

    if (ticker < 12) fail(`Тикер: элементов ${ticker}, ожидалось не меньше 12`);
    else pass(`Тикер: ${ticker} строк с котировками`);

    if (terminal < 5) fail(`Терминал: строк лога ${terminal}`);
    else pass(`Терминал: ${terminal} строк лога сделок`);

    await page.close();
  }

  /* --- 5. Калькулятор: пересчёт при движении ползунка --- */
  {
    const page = await browser.open(`${base}/calculator/`, { width: 1440 });
    const before = await page.evaluate('document.querySelector("[data-out=\\"total\\"]").textContent');
    const after = await page.evaluate(`(() => {
      const input = document.querySelector('[data-input="deposit"]');
      input.value = '20000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return document.querySelector('[data-out="total"]').textContent;
    })()`);
    const active = await page.evaluate(`(() => {
      document.querySelector('[data-profile="active"]').click();
      return document.querySelector('[data-out="profile"]').textContent;
    })()`);
    const chart = await page.evaluate(`(() => {
      const canvas = document.querySelector('[data-chart]');
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;
      for (let i = 3; i < data.length; i += 4 * 53) if (data[i] > 8) painted += 1;
      return painted;
    })()`);

    if (before === after) fail(`Калькулятор: итог не изменился при депозите 20 000 (${before})`);
    else pass(`Калькулятор: $1 000 → ${before}, $20 000 → ${after}`);

    if (active.trim() !== 'Active') fail(`Калькулятор: профиль риска не переключился (${active})`);
    else pass('Калькулятор: профиль риска переключается');

    if (chart < 10) fail(`Калькулятор: график не построен (точек ${chart})`);
    else pass(`Калькулятор: график построен (точек ${chart})`);

    await page.close();
  }

  /* --- 6. Мобильное меню --- */
  {
    const page = await browser.open(`${base}/`, { width: 360 });
    const menu = await page.evaluate(`(() => {
      const burger = document.querySelector('.burger');
      const panel = document.getElementById('mobile-menu');
      const before = panel.dataset.open;
      burger.click();
      const opened = panel.dataset.open;
      const links = panel.querySelectorAll('a').length;
      burger.click();
      return { before, opened, closed: panel.dataset.open, links };
    })()`);

    if (menu.before !== 'false' || menu.opened !== 'true' || menu.closed !== 'false') {
      fail(`Мобильное меню: состояния ${menu.before} → ${menu.opened} → ${menu.closed}`);
    } else if (menu.links < 5) {
      fail(`Мобильное меню: ссылок ${menu.links}`);
    } else {
      pass(`Мобильное меню: открывается и закрывается, ${menu.links} ссылок`);
    }

    await page.close();
  }

  /* --- 7. Форма заявки: обязательные поля и согласие --- */
  {
    const page = await browser.open(`${base}/contacts/`, { width: 1440 });
    const form = await page.evaluate(`(() => {
      const form = document.querySelector('[data-request-form]');
      const required = [...form.querySelectorAll('[required]')].map((el) => el.name || el.id);
      const honey = Boolean(form.querySelector('input[name="website"]'));
      const action = form.getAttribute('action');
      const consent = Boolean(form.querySelector('input[name="consent"][required]'));
      return { required, honey, action, consent };
    })()`);

    if (!form.required.includes('name') || !form.required.includes('email')) fail('Форма: нет обязательных полей имени и почты');
    else if (!form.honey) fail('Форма: нет ловушки для спама');
    else if (!form.consent) fail('Форма: нет согласия на обработку данных');
    else pass(`Форма: обязательные поля ${form.required.join(', ')}, ловушка и согласие на месте`);

    await page.close();
  }

  /* --- 8. Шрифты и вес страницы --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const assets = await page.evaluate(`(() => {
      const entries = performance.getEntriesByType('resource')
        .filter((item) => item.name.includes('/assets/'))
        .map((item) => ({ name: item.name.split('/').pop(), size: Math.round((item.transferSize || item.encodedBodySize || 0) / 1024) }));
      const fonts = [...document.fonts].filter((font) => font.status === 'loaded').map((font) => font.family);
      return { entries, fonts: [...new Set(fonts)] };
    })()`);

    const total = assets.entries.reduce((sum, item) => sum + item.size, 0);
    if (!assets.fonts.length) fail('Шрифты: ни один не загрузился');
    else pass(`Шрифты: ${assets.fonts.join(', ')}`);
    pass(`Вес страницы: ${total} КБ (${assets.entries.map((item) => `${item.name}:${item.size}`).join(', ')})`);

    await page.close();
  }
} finally {
  await browser.close();
  if (local) await local.close();
  await sleep(200);
}

const failed = results.filter((item) => !item.ok);
for (const item of results) console.log(`${item.ok ? '✓' : '✗'} ${item.message}`);
console.log(`\nИтого: ${results.length - failed.length} из ${results.length} без замечаний, провалов ${failed.length}`);
process.exitCode = failed.length > 0 ? 1 : 0;
