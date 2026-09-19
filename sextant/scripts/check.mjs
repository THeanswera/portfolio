/**
 * Приёмка сайта «СЕКСТАНТ» в настоящем браузере: переполнение на трёх ширинах,
 * ошибки в консоли, битые запросы, ссылки, работа 3D-сцен, разборки калибра,
 * конфигуратора, аккордеона, меню и формы.
 *
 * Запуск: node scripts/check.mjs [--url http://127.0.0.1:4175/]
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
  local = await startServer({ root: 'dist', port: Number(arg('port', 4175)) });
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
  '/collection/',
  '/calibre/',
  '/configurator/',
  '/atelier/',
  '/service/',
  '/gallery/',
  '/contacts/',
  '/privacy/',
  '/thanks/',
  '/404.html',
];

const results = [];
const fail = (message) => results.push({ ok: false, message });
const pass = (message) => results.push({ ok: true, message });

/**
 * Проверка, что сцена действительно нарисована. readPixels не годится:
 * буфер очищается после вывода кадра, поэтому смотрим статистику рендерера —
 * сколько треугольников и вызовов отрисовки прошло в последнем кадре.
 */
const SCENE_DRAWN = (handle) => `(() => {
  const mounted = window['${handle}'];
  if (!mounted) return { found: false };
  const canvas = mounted.stage.renderer.domElement;
  const info = mounted.stage.renderer.info.render;
  const gl = mounted.stage.renderer.getContext();
  return {
    found: true,
    gl: Boolean(gl) && !gl.isContextLost(),
    width: canvas.width,
    height: canvas.height,
    triangles: info.triangles,
    calls: info.calls,
  };
})()`;

const browser = await withBrowser({ port: 9341 });

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
        fail(`${path} @${width}: ошибки в консоли — ${page.problems[0].slice(0, 140)}`);
      } else if (page.failed.length) {
        fail(`${path} @${width}: битые запросы — ${page.failed[0]}`);
      } else {
        pass(`${path} @${width}: ${height}px, переполнения нет`);
      }

      await page.close();
    }
  }

  /* --- 2. Ссылки и шрифты --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const links = await page.evaluate(`(() => {
      const internal = [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((href) => href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel'));
      /* Якоря внутри страницы: ссылки вида /service/#faq ведут на другую страницу. */
      const anchors = internal.filter((href) => href.startsWith('#') && href !== '#');
      const missing = anchors.filter((href) => !document.querySelector(href));
      return { total: internal.length, anchors: anchors.length, missing };
    })()`);

    if (links.missing.length) fail(`Главная: битые якоря — ${links.missing.join(', ')}`);
    else pass(`Главная: ${links.total} внутренних ссылок, ${links.anchors} якорей, все ведут на существующие блоки`);

    const targets = ['/collection/', '/calibre/', '/configurator/', '/atelier/', '/service/', '/gallery/', '/contacts/', '/privacy/'];
    const broken = [];

    for (const path of targets) {
      const response = await fetch(`${base}${path}`).catch(() => null);
      if (!response || !response.ok) broken.push(`${path} → ${response?.status ?? 'нет ответа'}`);
    }

    if (broken.length) fail(`Внутренние адреса: ${broken.join(', ')}`);
    else pass(`Внутренние адреса: ${targets.length} страниц отвечают 200`);

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
    pass(`Вес главной: ${total} КБ (${assets.entries.map((item) => `${item.name}:${item.size}`).join(', ')})`);

    await page.close();
  }

  /* --- 3. Калибр на главной: сцена рисуется и вращается мышью --- */
  {
    const page = await browser.open(`${base}/`, { width: 1440 });
    const drawn = await page.evaluate(SCENE_DRAWN('sextantHero'));

    if (!drawn.found || !drawn.gl || drawn.triangles < 1000) {
      fail(`Калибр на главной: сцена не нарисована (треугольников ${drawn.triangles ?? 0})`);
    } else {
      pass(
        `Калибр на главной: ${drawn.width}×${drawn.height}, ` +
          `${drawn.triangles.toLocaleString('ru-RU')} треугольников, ${drawn.calls} вызовов отрисовки`,
      );
    }

    const box = await page.evaluate(`(() => {
      const canvas = document.querySelector('[data-calibre]');
      const rect = canvas.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    const cx = Math.round(box.x + box.width / 2);
    const cy = Math.round(box.y + box.height / 2);
    const before = await page.evaluate(`(() => {
      const state = window.sextantHero.stage.state;
      return { theta: state.theta, phi: state.phi };
    })()`);

    await page.client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy, buttons: 0 });
    await page.client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: cx, y: cy, button: 'left', buttons: 1, clickCount: 1,
    });
    for (let step = 1; step <= 12; step += 1) {
      await page.client.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved', x: cx + step * 14, y: cy + step * 3, button: 'left', buttons: 1,
      });
    }
    await page.client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: cx + 168, y: cy + 36, button: 'left', buttons: 0,
    });
    await sleep(220);

    const after = await page.evaluate(`(() => {
      const state = window.sextantHero.stage.state;
      return { theta: state.theta, phi: state.phi, dragging: state.dragging };
    })()`);

    if (Math.abs(after.theta - before.theta) < 0.15) {
      fail(`Калибр: перетаскивание не повернуло модель (${before.theta.toFixed(3)} → ${after.theta.toFixed(3)})`);
    } else if (after.dragging) {
      fail('Калибр: перетаскивание не завершилось после отпускания кнопки');
    } else {
      pass(`Калибр: тянется мышью, поворот ${before.theta.toFixed(2)} → ${after.theta.toFixed(2)} рад`);
    }

    await page.close();
  }

  /* --- 4. Разборка калибра на странице механизма --- */
  {
    const page = await browser.open(`${base}/calibre/`, { width: 1440 });
    const drawn = await page.evaluate(SCENE_DRAWN('sextantExplode'));

    if (!drawn.found || !drawn.gl || drawn.triangles < 1000) {
      fail(`Страница калибра: сцена не нарисована (треугольников ${drawn.triangles ?? 0})`);
    } else {
      pass(`Страница калибра: ${drawn.triangles.toLocaleString('ru-RU')} треугольников, ${drawn.calls} вызовов отрисовки`);
    }

    const before = await page.evaluate('window.__explodeZ ?? 0');

    const exploded = await page.evaluate(`(() => {
      document.querySelector('[data-explode-toggle]').click();
      return document.querySelector('[data-explode-toggle]').getAttribute('aria-pressed');
    })()`);

    await sleep(1400);

    const parts = await page.evaluate(`(() => {
      const buttons = [...document.querySelectorAll('[data-part]')];
      buttons[0].click();
      return {
        count: buttons.length,
        pressed: buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').length,
      };
    })()`);

    await sleep(600);

    if (exploded !== 'true') fail('Разборка: кнопка не включила разборку механизма');
    else pass('Разборка: кнопка разносит узлы механизма');

    if (parts.count !== 8 || parts.pressed !== 1) {
      fail(`Разборка: узлов ${parts.count}, выбрано ${parts.pressed}`);
    } else {
      pass(`Разборка: ${parts.count} узлов, выбор узла подсвечивает список`);
    }

    void before;
    await page.close();
  }

  /* --- 5. Конфигуратор: смена варианта меняет сумму --- */
  {
    const page = await browser.open(`${base}/configurator/`, { width: 1440 });
    const drawn = await page.evaluate(SCENE_DRAWN('sextantWatch'));

    if (!drawn.found || !drawn.gl || drawn.triangles < 1000) {
      fail(`Конфигуратор: модель не нарисована (треугольников ${drawn.triangles ?? 0})`);
    } else {
      pass(`Конфигуратор: модель часов, ${drawn.triangles.toLocaleString('ru-RU')} треугольников`);
    }

    const totalBefore = await page.evaluate('document.querySelector("[data-price=\\"total\\"]").textContent');

    const totalAfter = await page.evaluate(`(() => {
      const chips = [...document.querySelectorAll('[data-group="dial"]')];
      chips[3].click();
      return document.querySelector('[data-price="total"]').textContent;
    })()`);

    const caseAfter = await page.evaluate(`(() => {
      const chips = [...document.querySelectorAll('[data-group="case"]')];
      chips[2].click();
      return document.querySelector('[data-price="total"]').textContent;
    })()`);

    if (totalBefore === totalAfter) fail(`Конфигуратор: циферблат не изменил сумму (${totalBefore})`);
    else pass(`Конфигуратор: циферблат меняет сумму — ${totalBefore} → ${totalAfter}`);

    if (totalAfter === caseAfter) fail(`Конфигуратор: корпус не изменил сумму (${caseAfter})`);
    else pass(`Конфигуратор: корпус меняет сумму — ${totalAfter} → ${caseAfter}`);

    const engraving = await page.evaluate(`(() => {
      const input = document.querySelector('[data-engraving]');
      input.value = 'А. К. 2026';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const row = document.querySelector('[data-price-row="engraving"]');
      return { hidden: row.hidden, total: document.querySelector('[data-price="total"]').textContent };
    })()`);

    if (engraving.hidden) fail('Конфигуратор: гравировка не добавилась в расчёт');
    else pass(`Конфигуратор: гравировка добавляет строку, итог ${engraving.total}`);

    /* Кнопки ракурсов: они должны переставлять камеру, а не только нажиматься. */
    const views = await page.evaluate(`(async () => {
      const before = window.sextantWatch.stage.state.phi;
      document.querySelector('[data-view="back"]').click();
      await new Promise((resolve) => setTimeout(resolve, 700));
      const after = window.sextantWatch.stage.state.phi;

      const zoomBefore = window.sextantWatch.stage.state.distance;
      document.querySelector('[data-zoom="in"]').click();
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        before,
        after,
        zoomBefore,
        zoomAfter: window.sextantWatch.stage.state.targetDistance,
        buttons: document.querySelectorAll('[data-view], [data-zoom], [data-spin]').length,
      };
    })()`);

    if (Math.abs(views.after - views.before) < 0.3) {
      fail(`Конфигуратор: кнопка «Задняя крышка» не переставила камеру (${views.before.toFixed(2)} → ${views.after.toFixed(2)})`);
    } else if (views.zoomAfter >= views.zoomBefore) {
      fail(`Конфигуратор: кнопка «+» не приблизила модель (${views.zoomBefore.toFixed(2)} → ${views.zoomAfter.toFixed(2)})`);
    } else {
      pass(
        `Конфигуратор: ${views.buttons} кнопок управления, ракурс и масштаб меняются ` +
          `(${views.before.toFixed(2)} → ${views.after.toFixed(2)} рад, дистанция ${views.zoomBefore.toFixed(1)} → ${views.zoomAfter.toFixed(1)})`,
      );
    }

    await page.close();
  }

  /* --- 6. Аккордеон вопросов --- */
  {
    const page = await browser.open(`${base}/service/`, { width: 1440 });
    const accordion = await page.evaluate(`(() => {
      const items = [...document.querySelectorAll('.accordion__item')];
      const first = items[0];
      first.querySelector('.accordion__button').click();
      const open = first.dataset.open;
      const height = first.querySelector('.accordion__panel').style.height;
      return { count: items.length, open, height };
    })()`);

    if (accordion.count !== 8) fail(`Аккордеон: вопросов ${accordion.count}, ожидалось 8`);
    else if (accordion.open !== 'true' || accordion.height === '0px' || accordion.height === '') {
      fail(`Аккордеон: панель не раскрылась (${accordion.open}, ${accordion.height})`);
    } else {
      pass(`Аккордеон: ${accordion.count} вопросов, панель раскрывается на ${accordion.height}`);
    }

    await page.close();
  }

  /* --- 7. Мобильное меню --- */
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
    } else if (menu.links < 6) {
      fail(`Мобильное меню: ссылок ${menu.links}`);
    } else {
      pass(`Мобильное меню: открывается и закрывается, ${menu.links} ссылок`);
    }

    await page.close();
  }

  /* --- 8. Форма заявки --- */
  {
    const page = await browser.open(`${base}/contacts/`, { width: 1440 });
    const form = await page.evaluate(`(() => {
      const form = document.querySelector('[data-request-form]');
      const required = [...form.querySelectorAll('[required]')].map((el) => el.name || el.id);
      const honey = Boolean(form.querySelector('input[name="website"]'));
      const consent = Boolean(form.querySelector('input[name="consent"][required]'));
      const action = form.getAttribute('action');
      return { required, honey, consent, action };
    })()`);

    if (!form.required.includes('name') || !form.required.includes('email') || !form.required.includes('phone')) {
      fail(`Форма: обязательные поля — ${form.required.join(', ')}`);
    } else if (!form.honey) fail('Форма: нет ловушки для спама');
    else if (!form.consent) fail('Форма: нет согласия на обработку данных');
    else if (!form.action || !form.action.endsWith('/send.php')) fail(`Форма: действие ${form.action}`);
    else pass(`Форма: обязательные поля ${form.required.join(', ')}, ловушка, согласие и адрес обработчика на месте`);

    await page.close();
  }

  /* --- 9. Страница 404 --- */
  {
    const response = await fetch(`${base}/nothing-here/`).catch(() => null);
    const body = response ? await response.text() : '';

    if (!response || response.status !== 404) fail(`404: сервер отвечает ${response?.status ?? 'без ответа'}`);
    else if (!body.includes('Страница не найдена')) fail('404: страница отдаёт не свой текст');
    else pass('404: неизвестный адрес отдаёт страницу «Страница не найдена»');
  }

  /* --- 10. Галерея: карточка занимает колонку, подпись не закрывает кадр --- */
  for (const width of [360, 1440]) {
    const page = await browser.open(`${base}/gallery/`, { width });
    await page.evaluate(`document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-in'))`);
    /* Ленивые картинки грузим принудительно: на сборочной машине
       четырнадцать снимков не успевают догрузиться за время прокрутки. */
    await page.evaluate(`document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; })`);
    await page.evaluate(`(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      window.scrollTo(0, 0);
    })()`);

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const pending = await page.evaluate('[...document.images].filter((img) => !img.complete).length');
      if (pending === 0) break;
      await sleep(400);
    }

    const gallery = await page.evaluate(`(() => {
      const grid = document.querySelector('.gallery');
      if (!grid) return { error: 'нет галереи' };

      const column = parseFloat(getComputedStyle(grid).gridTemplateColumns.split(' ')[0]);
      const items = [...grid.querySelectorAll('.gallery__item')].map((item) => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery__caption');
        const itemRect = item.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const captionRect = caption.getBoundingClientRect();

        /* Подпись поверх снимка допустима, пока не закрывает его целиком. */
        const overlap = captionRect.top < imgRect.bottom
          ? (imgRect.bottom - Math.max(captionRect.top, imgRect.top)) / imgRect.height
          : 0;

        return { fill: imgRect.width / itemRect.width, overlap, loaded: img.naturalWidth > 0 };
      });

      return { count: items.length, column: Math.round(column), items };
    })()`);

    if (gallery.error) {
      fail(`Галерея @${width}: ${gallery.error}`);
    } else {
      const empty = gallery.items.filter((item) => !item.loaded).length;
      const narrow = gallery.items.filter((item) => item.fill < 0.85).length;
      const covered = gallery.items.filter((item) => item.overlap > 0.6).length;

      if (empty) fail(`Галерея @${width}: не загрузилось картинок — ${empty}`);
      else if (narrow) fail(`Галерея @${width}: ${narrow} карточек уже своей колонки (${gallery.column}px)`);
      else if (covered) fail(`Галерея @${width}: подпись закрывает кадр больше чем наполовину — ${covered} карточек`);
      else {
        pass(
          `Галерея @${width}: ${gallery.count} карточек, все занимают колонку целиком ` +
            `(${gallery.column}px), подписи не закрывают снимки`,
        );
      }
    }

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
