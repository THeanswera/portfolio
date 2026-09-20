/**
 * Проверка шапки сайта «КИТ-Строй.Москва» в браузере: пункты меню и кнопка
 * обязаны держаться в одну строку, шапка — не разъезжаться на две, а страница —
 * не получать горизонтальную прокрутку.
 *
 * Зачем отдельная проверка: тема WordPress собирается без браузера, и перенос
 * пункта меню в две строки виден только на живом сайте. Владелец заметил именно
 * такой дефект: «Как работаем» и «О компании» ломались пополам.
 *
 * Запуск: node scripts/check-header.mjs [адрес] [--widths 1600,1440,1280,1200,1024,768]
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser, waitForBrowser, openPage, closePage, goto, evaluate } from './lib/cdp.mjs';

const args = process.argv.slice(2);
const url = args.find((value) => value.startsWith('http')) ?? 'https://rootlost.online/';
const widthsIndex = args.indexOf('--widths');
const widths = (widthsIndex === -1 ? '1600,1440,1366,1280,1200,1152,1100,1024,992,860,768,390' : args[widthsIndex + 1])
  .split(',')
  .map(Number);

const PORT = 9355;
const profileDir = path.resolve('.tmp-header-check/profile');
await mkdir(profileDir, { recursive: true });

/** Высота строки текста у ссылки: больше одной — значит пункт переносится. */
const PROBE = `(() => {
  const inner = document.querySelector('.site-header__inner');
  if (!inner) return { error: 'не нашёл шапку .site-header__inner' };
  // Видимость считаем по прямоугольникам: у меню, спрятанного вместе с родителем,
  // собственный display остаётся flex.
  const visible = (el) => !!el && el.getClientRects().length > 0;
  const menu = document.querySelector('.site-menu');
  const links = [...document.querySelectorAll('.site-menu > li > a')];
  const lines = (el) => {
    const style = getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 22;
    const own = el.getBoundingClientRect().height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    return Math.round(own / line);
  };
  const cta = document.querySelector('.site-header__cta');
  const burger = document.querySelector('.site-header__burger');

  // Строк в шапке: блоки одной строки перекрываются по вертикали, блоки разных — нет.
  const boxes = [...inner.children].filter(visible).map((el) => el.getBoundingClientRect()).sort((a, b) => a.top - b.top);
  let rows = 0;
  let bottom = -Infinity;
  for (const box of boxes) {
    if (box.top >= bottom - 1) {
      rows += 1;
      bottom = box.bottom;
    } else {
      bottom = Math.max(bottom, box.bottom);
    }
  }

  return {
    viewport: window.innerWidth,
    available: Math.round(inner.clientWidth),
    used: Math.round(inner.scrollWidth),
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    headerHeight: Math.round(document.querySelector('.site-header').getBoundingClientRect().height),
    rows,
    menuVisible: visible(menu),
    burgerVisible: visible(burger),
    wrapped: links.filter((a) => lines(a) > 1).map((a) => a.textContent.trim()),
    ctaLines: visible(cta) ? lines(cta) : 0,
    ctaWidth: visible(cta) ? Math.round(cta.getBoundingClientRect().width) : 0,
  };
})()`;

const browser = launchBrowser({ port: PORT, profileDir });
await waitForBrowser(PORT);

const results = [];
try {
  for (const width of widths) {
    const { client, targetId } = await openPage(PORT);
    try {
      await client.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
      await goto(client, url, { settle: 1600 });
      const data = await evaluate(client, PROBE);
      if (data.error) {
        results.push({ ok: false, message: `${width}px: ${data.error}` });
        continue;
      }
      const problems = [];
      if (data.wrapped.length) problems.push(`в две строки: ${data.wrapped.join(', ')}`);
      if (data.ctaLines > 1) problems.push(`кнопка в ${data.ctaLines} строки`);
      if (data.rows > 1) problems.push(`шапка разъехалась на две строки (${data.headerHeight}px)`);
      if (data.docOverflow > 0) problems.push(`горизонтальная прокрутка ${data.docOverflow}px`);
      if (data.used > data.available + 1) problems.push(`содержимое шире контейнера: ${data.used} > ${data.available}`);
      results.push({
        ok: problems.length === 0,
        message:
          `${String(width).padStart(4)}px: ${data.menuVisible ? 'меню' : data.burgerVisible ? 'бургер' : 'без меню'}` +
          `${data.ctaWidth ? `, кнопка ${data.ctaWidth}px` : ''}, шапка ${data.headerHeight}px` +
          (problems.length ? ` — ${problems.join('; ')}` : ' — в порядке'),
      });
    } finally {
      await closePage(PORT, targetId);
      client.close();
    }
  }
} finally {
  browser.kill();
}

const failed = results.filter((item) => !item.ok);
for (const item of results) console.log(`${item.ok ? '✓' : '✗'} ${item.message}`);
console.log(`\nИтого: ${results.length - failed.length} из ${results.length} ширин без замечаний, провалов ${failed.length}`);
process.exit(failed.length ? 1 : 0);
