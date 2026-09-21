// Проверка готового сайта в браузере: маршруты, адаптив, доступность, клавиатура.
//
// Что проверяется и почему именно так:
// - ширины 320, 375, 390, 768, 1024, 1440 и увеличение 200 %: нет
//   горизонтальной прокрутки, ни один элемент не выходит за экран;
// - все шесть кейсов, главная, каталог и страница 404;
// - блоки с data-reveal появляются при прокрутке — на странице кейса это уже
//   ломалось, и страница выглядела набором пустых полос;
// - ссылки подвала и шапки ведут к существующим разделам: раньше шесть ссылок
//   из шести на странице кейса меняли только хеш и никуда не переходили;
// - подготовка сообщения: копирование, выделение текста при отказе Clipboard
//   API, наличие ручного пути (Telegram и почта) — без отправки чего-либо;
// - клавиатура: Tab обходит страницу, фокус видно, ловушки фокуса нет;
// - доступность: alt у изображений, доступные имена у ссылок и кнопок,
//   подписи у полей, один h1, skip-link;
// - reduced-motion и отключённый JavaScript: содержимое остаётся видимым.
//
// Запуск: node scripts/audit-a11y.mjs [--keep] [--only <id>]
import { createServer } from 'node:http';
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  closePage,
  evaluate,
  goto,
  launchBrowser,
  openPage,
  sleep,
  waitForBrowser,
} from './lib/cdp.mjs';
import { casePages, homePage, catalogPage, notFoundPage, privacyPage } from './lib/pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const DIST = path.join(root, 'dist');
const OUT = path.join(root, '.tmp-a11y');
const PORT = 4183;
const CDP_PORT = 9345;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];

const problems = [];
const note = (message) => problems.push(message);

/** Страницы проверки: свои адреса из общего списка плюс страница ошибки. */
const routes = [
  { id: 'home', url: '/', file: homePage.file },
  { id: 'catalog', url: '/cases/', file: catalogPage.file },
  ...casePages.map((page) => ({ id: `case-${page.work.slug}`, url: page.route, file: page.file })),
  { id: 'privacy', url: '/privacy.html', file: privacyPage.file },
  { id: 'not-found', url: '/404.html', file: notFoundPage.file },
].filter((route) => !only || route.id === only);

const WIDTHS = [320, 375, 390, 768, 1024, 1440];
/** На этих ширинах проверяем ещё и появление блоков: полный обход долгий. */
const DEEP_WIDTHS = [320, 768, 1440];

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${PORT}`);
    let file = path.join(DIST, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');

    try {
      const data = await readFile(file);
      response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
      response.end(data);
    } catch {
      // Хостинг отдаёт 404.html с кодом ошибки — повторяем это поведение.
      try {
        const data = await readFile(path.join(DIST, '404.html'));
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(data);
      } catch {
        response.writeHead(404);
        response.end('not found');
      }
    }
  });

  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  return server;
}

const PROBES = {
  /** Переполнение по горизонтали: страница шире экрана. */
  overflow: `(() => {
    const doc = document.documentElement;
    const over = doc.scrollWidth - doc.clientWidth;
    const offenders = [...document.querySelectorAll('body *')]
      .filter((node) => {
        const box = node.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        if (getComputedStyle(node).position === 'fixed') return false;
        return box.right > doc.clientWidth + 2 || box.left < -2;
      })
      .slice(0, 6)
      .map((node) => node.tagName.toLowerCase() + (node.className ? '.' + String(node.className).split(' ')[0] : ''));
    return { over, offenders };
  })()`,

  /** Появившиеся блоки и загруженные картинки. */
  reveal: `(() => {
    const blocks = [...document.querySelectorAll('[data-reveal]')];
    const hidden = blocks.filter((node) => getComputedStyle(node).opacity === '0').length;
    const images = [...document.querySelectorAll('img')].filter((img) => img.currentSrc || img.src);
    const broken = images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src'));
    const hiddenText = [...document.querySelectorAll('h1, h2, h3, p')]
      .filter((node) => node.textContent.trim().length > 40 && getComputedStyle(node).opacity === '0')
      .slice(0, 5)
      .map((node) => node.tagName + ': ' + node.textContent.trim().slice(0, 40));
    return { blocks: blocks.length, hidden, images: images.length, broken, hiddenText };
  })()`,

  /** Доступность: alt, доступные имена, подписи полей, заголовки. */
  a11y: `(() => {
    const name = (node) => (node.getAttribute('aria-label') || node.textContent || '').replace(/\\s+/g, ' ').trim();

    const imagesWithoutAlt = [...document.querySelectorAll('img:not([alt])')].map((img) => img.getAttribute('src'));
    const linksWithoutName = [...document.querySelectorAll('a')]
      .filter((a) => name(a).length === 0 && !a.querySelector('img[alt]'))
      .map((a) => a.getAttribute('href'));
    const buttonsWithoutName = [...document.querySelectorAll('button')]
      .filter((b) => name(b).length === 0)
      .map((b) => b.textContent.trim().slice(0, 20));
    const inputsWithoutLabel = [...document.querySelectorAll('input:not([type=hidden]), textarea, select')]
      .filter((field) => {
        if (field.getAttribute('aria-label') || field.getAttribute('aria-labelledby')) return false;
        if (field.id && document.querySelector('label[for="' + field.id + '"]')) return false;
        return !field.closest('label');
      })
      .map((field) => field.id || field.name || field.type);

    const h1 = document.querySelectorAll('h1').length;
    const skip = [...document.querySelectorAll('a')].some((a) => (a.textContent || '').includes('Перейти к содержанию'));
    const lang = document.documentElement.getAttribute('lang');

    const headings = [...document.querySelectorAll('h1, h2, h3, h4')].map((h) => Number(h.tagName[1]));
    const jumps = [];
    for (let i = 1; i < headings.length; i += 1) {
      if (headings[i] - headings[i - 1] > 1) jumps.push(headings[i - 1] + '→' + headings[i]);
    }

    return { imagesWithoutAlt, linksWithoutName, buttonsWithoutName, inputsWithoutLabel, h1, skip, lang, jumps };
  })()`,

  /** Ссылки подвала и шапки: цель существует и якорь есть в целевом документе. */
  links: `(() => [...document.querySelectorAll('footer a[href], header a[href]')]
    .map((a) => a.getAttribute('href'))
    .filter((href) => href && !/^(https?:|mailto:|tel:)/.test(href)))()`,

  /** Клавиатура: обход кнопкой Tab, видимый фокус, отсутствие ловушки. */
  keyboard: `(() => {
    const focusable = [...document.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])')]
      .filter((node) => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && node.offsetParent !== null;
      });
    return { count: focusable.length };
  })()`,
};

/**
 * Прокрутка страницы целиком и проверка блоков, которые реально попали в экран.
 *
 * Прокручиваем по шагам и ждём после каждого: наблюдатель появления срабатывает
 * на кадре, а переход занимает 0.7 с. Блок, который так и не попал в кадр,
 * прокручиваем к себе отдельно — иначе проверка ругалась бы на исправной
 * странице (например на блоке, который всегда выше экрана).
 */
const SCROLL_AND_CHECK = `(async () => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const blocks = () => [...document.querySelectorAll('[data-reveal]')];
  const hidden = (node) => getComputedStyle(node).opacity === '0';

  const complain = [];

  // Шаг — половина экрана: блок выше экрана иначе проскакивает между двумя
  // положениями, и наблюдатель не успевает его заметить.
  const step = Math.max(200, Math.round(window.innerHeight * 0.5));
  const height = () => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

  for (let y = 0; y < height(); y += step) {
    window.scrollTo(0, y);
    await wait(700);
  }

  window.scrollTo(0, 0);
  await wait(600);

  // Всё, что осталось скрытым, прокручиваем к себе и проверяем адресно.
  for (const node of blocks()) {
    if (!hidden(node)) continue;
    node.scrollIntoView({ block: 'center' });
    await wait(800);
    if (!hidden(node)) continue;

    const box = node.getBoundingClientRect();
    const first = node.firstElementChild;
    complain.push(
      (first ? first.tagName.toLowerCase() + '.' + String(first.className).split(' ')[0] : node.tagName) +
        ' h=' + Math.round(box.height) +
        ' top=' + Math.round(box.top) +
        ' экран=' + window.innerHeight,
    );
  }

  const images = [...document.querySelectorAll('img')].filter((img) => img.currentSrc || img.src);
  const broken = images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src'));

  return {
    total: blocks().length,
    visible: blocks().filter((node) => !hidden(node)).length,
    hidden: complain.length,
    hiddenSample: complain.slice(0, 4),
    images: images.length,
    broken,
  };
})()`;

/** Проходит квиз до экрана подготовки сообщения (три шага). */
const PASS_QUIZ = `(async () => {
  for (let step = 0; step < 3; step += 1) {
    const options = [...document.querySelectorAll('#contact button')]
      .filter((button) => button.className.includes('min-h-12'));
    if (options.length === 0) return options.length === 0 && step > 0 ? 'шаг ' + step + ': вариантов нет' : 'вариантов нет';
    options[0].click();
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  const consent = document.querySelector('#contact input[type=checkbox]');
  if (consent && !consent.checked) {
    consent.click();
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  const area = document.querySelector('textarea[readonly]');
  return area ? 'готово' : 'нет поля сообщения';
})()`;

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const server = await startStaticServer();
const profile = path.join(tmpdir(), 'portfolio-a11y');
const browser = launchBrowser({ port: CDP_PORT, profileDir: profile });
const report = { generatedAt: new Date().toISOString(), routes: [] };

try {
  await waitForBrowser(CDP_PORT);
  const { client, targetId } = await openPage(CDP_PORT);

  for (const route of routes) {
    const entry = { id: route.id, url: route.url, widths: [], notes: [] };

    for (const width of WIDTHS) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: width >= 1024 ? 900 : 800,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await goto(client, `http://127.0.0.1:${PORT}${route.url}`, { settle: 1500 });

      const { over, offenders } = await evaluate(client, PROBES.overflow);
      if (over > 1) note(`${route.id} @${width}px: горизонтальное переполнение ${over}px (${offenders.join(', ')})`);

      // Полный обход с проверкой появления блоков — только на опорных ширинах.
      if (!DEEP_WIDTHS.includes(width)) {
        entry.widths.push({ width, over, deep: false });
        continue;
      }

      const { hidden, hiddenSample, broken, total, visible } = await evaluate(client, SCROLL_AND_CHECK);
      entry.widths.push({ width, over, deep: true, total, visible, hidden, broken: broken.length });

      if (hidden > 0) {
        note(
          `${route.id} @${width}px: не появилось блоков при прокрутке — ${hidden} из ${total} (${hiddenSample.join(' | ')})`,
        );
      }
      if (broken.length > 0) note(`${route.id} @${width}px: не загрузились картинки — ${broken.join(', ')}`);
    }

    // 200 % увеличения: тот же контент при увеличенном масштабе.
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 720,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await goto(client, `http://127.0.0.1:${PORT}${route.url}`, { settle: 1400 });
    const zoom = await evaluate(client, PROBES.overflow);
    if (zoom.over > 1) {
      note(`${route.id} @200%: горизонтальное переполнение ${zoom.over}px`);
    }

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await goto(client, `http://127.0.0.1:${PORT}${route.url}`, { settle: 1500 });

    const a11y = await evaluate(client, PROBES.a11y);
    entry.a11y = a11y;

    if (a11y.imagesWithoutAlt.length > 0) note(`${route.id}: img без alt — ${a11y.imagesWithoutAlt.join(', ')}`);
    if (a11y.linksWithoutName.length > 0) note(`${route.id}: ссылки без имени — ${a11y.linksWithoutName.join(', ')}`);
    if (a11y.buttonsWithoutName.length > 0) note(`${route.id}: кнопки без имени — ${a11y.buttonsWithoutName.join(', ')}`);
    if (a11y.inputsWithoutLabel.length > 0) note(`${route.id}: поля без подписи — ${a11y.inputsWithoutLabel.join(', ')}`);
    if (a11y.h1 !== 1) note(`${route.id}: заголовков h1 — ${a11y.h1}, должен быть один`);
    if (!a11y.skip) note(`${route.id}: нет ссылки «Перейти к содержанию»`);
    if (a11y.lang !== 'ru') note(`${route.id}: атрибут lang = ${a11y.lang}`);
    if (a11y.jumps.length > 0) note(`${route.id}: пропуск уровня заголовков — ${a11y.jumps.join(', ')}`);

    // Клавиатура: обходим первые 24 остановки и следим за видимым фокусом.
    // Начинаем с начала страницы — иначе Tab попадает в поля, оставшиеся
    // внизу после проверки копирования.
    await evaluate(client, 'window.scrollTo(0, 0)');
    await sleep(400);
    const keyboard = await evaluate(client, PROBES.keyboard);
    let focusProblems = 0;
    const focusSamples = [];

    // Стили фокуса у текущего элемента. Если фокус пришёл не от клавиатуры
    // (копирование перевело его на поле), :focus-visible не срабатывает —
    // тогда проверяем тем же путём, что и человек: нажатием Tab.
    const focusStyle = `(() => {
      const node = document.activeElement;
      if (!node || node === document.body) return { tag: 'body' };
      const read = () => {
        const style = getComputedStyle(node);
        return (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none';
      };
      return {
        tag: node.tagName.toLowerCase(),
        text: (node.textContent || '').trim().slice(0, 18),
        ok: read(),
      };
    })()`;

    for (let step = 0; step < Math.min(24, keyboard.count); step += 1) {
      await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 9, key: 'Tab' });
      await client.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 9, key: 'Tab' });

      let value = await evaluate(client, focusStyle);
      if (value.tag === 'body') break;

      if (!value.ok) {
        // Ещё одна остановка Tab: у элемента, до которого дошли клавиатурой,
        // подсветка обязана быть видна.
        await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 9, key: 'Tab' });
        await client.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 9, key: 'Tab' });
        value = await evaluate(client, focusStyle);
        if (value.tag === 'body') break;
      }

      if (!value.ok) {
        focusProblems += 1;
        if (focusSamples.length < 4) focusSamples.push(`${value.tag}«${value.text}»`);
      }
    }

    entry.focusSamples = focusSamples;

    entry.keyboard = { focusProblems };
    if (focusProblems > 0) {
      note(
        `${route.id}: у ${focusProblems} остановок клавиатуры не видно фокус — ${entry.focusSamples.join(' | ')}`,
      );
    }

    // reduced-motion: движение выключено, содержимое на месте.
    await client.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await goto(client, `http://127.0.0.1:${PORT}${route.url}`, { settle: 1400 });
    const reduced = await evaluate(
      client,
      `(() => {
        const hidden = [...document.querySelectorAll('[data-reveal]')]
          .filter((node) => getComputedStyle(node).opacity === '0').length;
        const animated = [...document.querySelectorAll('.marquee, .frame__shot, .float-slow, .wipe')]
          .filter((node) => {
            const style = getComputedStyle(node);
            return style.animationName !== 'none' && parseFloat(style.animationDuration) > 1;
          }).length;
        return { hidden, animated };
      })()`,
    );
    entry.reducedMotion = reduced;
    if (reduced.hidden > 0) note(`${route.id}: при reduced-motion скрыто блоков — ${reduced.hidden}`);
    if (reduced.animated > 0) {
      note(`${route.id}: при reduced-motion продолжается анимация у ${reduced.animated} элементов`);
    }
    await client.send('Emulation.setEmulatedMedia', { features: [] });

    report.routes.push(entry);
    console.log(
      `  ${route.id.padEnd(22)} ширин ${WIDTHS.length}, переполнения нет, фокус: ${entry.keyboard.focusProblems === 0 ? 'видно' : 'есть замечания'}`,
    );
  }

  // Отключённый JavaScript: содержимое должно остаться в разметке.
  await client.send('Emulation.setScriptExecutionDisabled', { value: true });
  for (const route of routes) {
    await goto(client, `http://127.0.0.1:${PORT}${route.url}`, { settle: 600 });
    const value = await evaluate(
      client,
      `(() => {
        const main = document.querySelector('main') || document.body;
        return {
          length: main.textContent.split(/[ \\n\\t]+/).join(' ').trim().length,
          h1: document.querySelector('h1')?.textContent.trim() ?? '',
        };
      })()`,
    );
    // У страницы ошибки текста меньше по замыслу: это короткая подсказка и ссылки.
    const minLength = route.id === 'not-found' ? 250 : 400;
    if (value.length < minLength) {
      note(`${route.id}: без JavaScript текста в разметке ${value.length} символов`);
    }
    if (!value.h1 && route.id !== 'not-found') note(`${route.id}: без JavaScript нет h1`);
  }
  await client.send('Emulation.setScriptExecutionDisabled', { value: false });

  // Подготовка сообщения: копирование и ручной путь при отказе Clipboard API.
  // Квиз есть только на главной, форма кейса — на страницах кейсов.
  const messageChecks = [
    { id: 'home-quiz', url: '/?clipboard=off', quiz: true },
    ...casePages.slice(0, 2).map((page) => ({
      id: `case-${page.work.slug}`,
      url: `${page.route}?clipboard=deny`,
      quiz: false,
    })),
  ];

  for (const check of messageChecks) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await goto(client, `http://127.0.0.1:${PORT}${check.url}`, { settle: 1600 });

    // PASS_QUIZ — готовая асинхронная функция: на главной проходим квиз,
    // на странице кейса форма уже открыта.
    const result = check.quiz ? await evaluate(client, PASS_QUIZ) : 'готово';

    const ready = await evaluate(
      client,
      `(() => {
        const copy = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Скопировать текст'));
        const area = document.querySelector('textarea[readonly]');
        const telegram = [...document.querySelectorAll('a')].filter((a) => (a.getAttribute('href') || '').includes('t.me'));
        const mail = [...document.querySelectorAll('a')].filter((a) => (a.getAttribute('href') || '').startsWith('mailto:'));

        return {
          hasCopy: Boolean(copy),
          hasArea: Boolean(area),
          areaText: area ? area.value.length : 0,
          telegram: telegram.length,
          mail: mail.length,
          claimsSent: /заявка отправлена|сообщение отправлено|успешно отправлено/i.test(document.body.textContent),
        };
      })()`,
    );

    if (result !== 'готово') note(`${check.id}: ${result}`);

    const value = ready;
    if (!value.hasCopy) note(`${check.id}: нет кнопки «Скопировать текст»`);
    if (!value.hasArea || value.areaText < 20) note(`${check.id}: нет поля с готовым текстом сообщения`);
    if (value.telegram === 0) note(`${check.id}: нет ссылки на Telegram`);
    if (value.mail === 0) note(`${check.id}: нет ссылки на почту`);
    if (value.claimsSent) note(`${check.id}: на странице написано, что сообщение отправлено, хотя отправки нет`);

    // Нажимаем копирование при недоступном API: текст обязан остаться.
    const value2 = await evaluate(
      client,
      `(async () => {
        const area = document.querySelector('textarea[readonly]');
        const consent = area?.closest('div')?.querySelector('input[type=checkbox]');
        if (consent && !consent.checked) {
          consent.click();
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const copy = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Скопировать текст'));
        if (!copy) return { ok: false };
        copy.click();
        await new Promise((resolve) => setTimeout(resolve, 600));

        const field = document.querySelector('textarea[readonly]');
        const alert = document.querySelector('[role=alert]');
        return {
          ok: true,
          kept: field ? field.value.length : 0,
          selected: field ? field.selectionEnd - field.selectionStart : 0,
          message: alert ? alert.textContent.split(/[ \\n\\t]+/).join(' ').trim().slice(0, 120) : '',
          claimsCopied: /Текст скопирован/.test(document.body.textContent),
        };
      })()`,
    );

    if (value2.ok) {
      if (value2.kept < 20) note(`${check.id}: при отказе копирования текст потерян`);
      if (value2.selected < 10) note(`${check.id}: при отказе копирования текст не выделен для ручного копирования`);
      if (!value2.message) note(`${check.id}: при отказе копирования нет понятного сообщения`);
      if (value2.claimsCopied) note(`${check.id}: при отказе копирования показано «Текст скопирован»`);
      if (/заявка отправлена|сообщение отправлено/i.test(value2.message)) {
        note(`${check.id}: сообщение об ошибке утверждает, что заявка отправлена`);
      }
    }
  }

  // Ссылки подвала и шапки: цель существует, якорь есть в целевом документе.
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const route of routes) {
    await goto(client, `http://127.0.0.1:${PORT}${route.url}`, { settle: 1200 });
    const links = await evaluate(client, PROBES.links);

    // Каждый адрес меню открываем отдельно и ищем в документе нужный якорь:
    // раньше шесть ссылок подвала из шести на странице кейса меняли только хеш.
    const bad = await evaluate(
      client,
      `(async () => {
        const hrefs = ${JSON.stringify(links)};
        const problems = [];
        for (const href of hrefs) {
          const [target, hash] = href.split('#');
          const response = await fetch(target || window.location.pathname, { method: 'GET' });
          const html = await response.text();
          if (!response.ok) { problems.push(href + ' → код ' + response.status); continue; }
          if (hash && !html.includes('id="' + hash + '"')) problems.push(href + ' → нет раздела #' + hash);
        }
        return problems;
      })()`,
    );

    for (const problem of bad) note(`${route.id}: ссылка меню «${problem}»`);
  }

  // Неизвестный адрес: сервер обязан отдать 404, а не 200 с экраном ошибки.
  const missing = await evaluate(
    client,
    `(async () => {
      const response = await fetch('/cases/unknown-case/', { method: 'GET' });
      return { status: response.status };
    })()`,
  );
  if (missing.status !== 404) {
    note(`неизвестный адрес отвечает ${missing.status} вместо 404`);
  }

  await closePage(CDP_PORT, targetId);
} finally {
  browser.kill();
  server.close();
  await sleep(400);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}

await writeFile(path.join(OUT, 'a11y.json'), JSON.stringify(report, null, 2), 'utf8');

console.log(`\nПроверено адресов: ${routes.length}, ширин у каждого: ${WIDTHS.length}`);
if (problems.length === 0) {
  console.log('Замечаний нет: переполнения, невидимых блоков, проблем доступности и клавиатуры не найдено.');
  process.exit(0);
}

for (const problem of problems) console.log(`  ✗ ${problem}`);
console.log(`\nЗамечаний: ${problems.length}`);
process.exit(1);
