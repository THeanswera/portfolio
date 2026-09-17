/**
 * Разметка конфигуратора. Один и тот же модуль собирает панель при сборке
 * страницы и обновляет её части в браузере, когда посетитель меняет параметры.
 * Поэтому расчёт в первом экране и в полном конфигураторе не может разойтись.
 */
import { FACADES, WORKTOPS, FITTINGS, LAYOUTS, EXTRAS, calculate, runMeters } from './pricing.js';
import { elevation, plan } from './drawing.js';
import { money, cm, meters, days } from './format.js';

export const DEFAULT_STATE = {
  wall: 320,
  layout: 'corner',
  facade: 'ldsp',
  color: 'oak',
  top: 'compact',
  topColor: 'graphite',
  fitting: 'comfort',
  extras: ['light'],
};

const find = (list, id) => list.find((item) => item.id === id) ?? list[0];

export function resolve(state) {
  const facade = find(FACADES, state.facade);
  const color = find(facade.colors, state.color);
  const worktop = find(WORKTOPS, state.top);
  const topColor = find(worktop.colors, state.topColor);
  const fitting = find(FITTINGS, state.fitting);
  const layout = find(LAYOUTS, state.layout);

  const estimate = calculate({
    wall: state.wall,
    layout: layout.id,
    facade,
    worktop,
    fitting,
    extras: state.extras,
  });

  return { facade, color, worktop, topColor, fitting, layout, estimate };
}

/** Читает состояние из адреса: ссылку на конфигурацию можно переслать. */
export function readState(search = '') {
  const params = new URLSearchParams(search);
  const state = { ...DEFAULT_STATE };

  const wall = Number(params.get('wall'));
  if (Number.isFinite(wall) && wall >= 180 && wall <= 480) state.wall = Math.round(wall / 10) * 10;

  const layout = params.get('layout');
  if (LAYOUTS.some((item) => item.id === layout)) state.layout = layout;

  const facade = params.get('facade');
  if (FACADES.some((item) => item.id === facade)) state.facade = facade;

  const facadeData = find(FACADES, state.facade);
  const color = params.get('color');
  if (color === null) {
    if (!facadeData.colors.some((item) => item.id === state.color)) state.color = facadeData.colors[0].id;
  } else {
    state.color = facadeData.colors.some((item) => item.id === color) ? color : facadeData.colors[0].id;
  }

  const top = params.get('top');
  if (WORKTOPS.some((item) => item.id === top)) state.top = top;

  const topData = find(WORKTOPS, state.top);
  const topColor = params.get('topColor');
  if (topColor === null) {
    if (!topData.colors.some((item) => item.id === state.topColor)) state.topColor = topData.colors[0].id;
  } else {
    state.topColor = topData.colors.some((item) => item.id === topColor) ? topColor : topData.colors[0].id;
  }

  const fitting = params.get('fitting');
  if (FITTINGS.some((item) => item.id === fitting)) state.fitting = fitting;

  const extras = params.get('extras');
  if (extras !== null) {
    state.extras = extras
      .split(',')
      .map((item) => item.trim())
      .filter((item) => EXTRAS.some((extra) => extra.id === item));
  }

  return state;
}

export function toSearch(state) {
  return new URLSearchParams({
    wall: String(state.wall),
    layout: state.layout,
    facade: state.facade,
    color: state.color,
    top: state.top,
    topColor: state.topColor,
    fitting: state.fitting,
    extras: state.extras.join(','),
  }).toString();
}

/* --- части панели: их обновляет браузер --- */

export function drawHtml(state) {
  const { color, topColor } = resolve(state);
  return elevation({ wall: state.wall, facadeHex: color.hex, worktopHex: topColor.hex });
}

export function planHtml(state) {
  const { layout } = resolve(state);
  return `<figure class="tool__plan">
      <div data-plan>${plan({ layout: layout.id, wall: state.wall })}</div>
      <figcaption>${layout.name} · план</figcaption>
    </figure>`;
}

export function swatchesHtml(items, current, name = 'color') {
  return items
    .map(
      (item) =>
        `<button class="swatch" type="button" data-set="${name}" data-value="${item.id}" aria-pressed="${item.id === current}" style="background:${item.hex}" title="${item.name}"><span class="visually-hidden">${item.name}</span></button>`,
    )
    .join('');
}

export function colorsHtml(state) {
  const { facade } = resolve(state);
  return swatchesHtml(facade.colors, state.color, 'color');
}

export function totalsHtml(state) {
  const { estimate, facade, worktop } = resolve(state);
  return {
    total: money(estimate.total),
    meta: `Вилка ${money(estimate.min)} — ${money(estimate.max)} · срок ${days(estimate.lead)}`,
    run: `${layoutLabel(state)} · ${meters(estimate.run)} гарнитура`,
    note: `Предварительный расчёт по ${facade.name.toLowerCase()} и столешнице «${worktop.name.toLowerCase()}». Точную смету фиксируем в договоре после замера — дальше она не меняется.`,
  };
}

export function layoutLabel(state) {
  return resolve(state).layout.name;
}

/* --- полная разметка --- */

/** Короткие подписи для переключателей: полные названия не влезают в кнопку. */
const LABELS = {
  ldsp: 'ЛДСП',
  enamel: 'Эмаль',
  veneer: 'Шпон',
  solid: 'Массив',
  compact: 'Компакт 12',
  stone: 'Кварц 20',
};

const shorten = (items) =>
  items.map((item) => {
    if (item.id === 'ldsp' && item.price === 6000) return { ...item, name: 'ЛДСП 38' };
    return { ...item, name: LABELS[item.id] ?? item.name };
  });

const segmented = (name, label, items, current, extra = '') =>
  `<div class="control">
    <div class="control__head"><span class="label">${label}</span>${extra}</div>
    <div class="segmented" role="group" aria-label="${label}">
      ${items
        .map(
          (item) =>
            `<button type="button" data-set="${name}" data-value="${item.id}" aria-pressed="${item.id === current}">${item.name}</button>`,
        )
        .join('')}
    </div>
  </div>`;

export function toolHtml(state, { full = false, action, note = '' } = {}) {
  const { facade, worktop, fitting, estimate, color, topColor } = resolve(state);

  const range = (name, label, min, max, step, value, suffix) =>
    `<div class="control">
      <div class="control__head">
        <span class="label">${label}</span>
        <span class="control__value" data-part="${name}-value">${value} ${suffix}</span>
      </div>
      <input class="range" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-set="${name}" aria-label="${label}">
      <div class="range-scale"><span>${min}</span><span>${max} ${suffix}</span></div>
    </div>`;

  const swatchRow = (name, label, items, current, valueId) =>
    `<div class="control">
      <div class="control__head">
        <span class="label">${label}</span>
        <span class="control__value" data-part="${valueId}">${find(items, current).name}</span>
      </div>
      <div class="swatches" data-part="${name}">${swatchesHtml(items, current, name)}</div>
    </div>`;

  const totals = totalsHtml(state);

  const controls = full
    ? [
        segmented('layout', 'Планировка', LAYOUTS, state.layout, `<span class="control__value" data-part="layout-value">${find(LAYOUTS, state.layout).hint}</span>`),
        range('wall', 'Длина стены', 180, 480, 10, state.wall, 'см'),
        segmented('facade', 'Фасад', shorten(FACADES), state.facade, `<span class="control__value" data-part="facade-value">${facade.price.toLocaleString('ru-RU')} ₽/м</span>`),
        swatchRow('color', 'Цвет фасада', facade.colors, state.color, 'color-value'),
        segmented('top', 'Столешница', shorten(WORKTOPS), state.top, `<span class="control__value" data-part="top-value">${worktop.price.toLocaleString('ru-RU')} ₽/м</span>`),
        swatchRow('topColor', 'Цвет столешницы', worktop.colors, state.topColor, 'topColor-value'),
        segmented('fitting', 'Фурнитура', FITTINGS, state.fitting, `<span class="control__value" data-part="fitting-value">${fitting.note.split(',')[0]}</span>`),
        `<div class="control">
          <div class="control__head"><span class="label">Опции</span></div>
          <div class="checks">
            ${EXTRAS.map(
              (item) => `<label class="check">
                <input type="checkbox" data-set="extras" value="${item.id}"${state.extras.includes(item.id) ? ' checked' : ''}>
                <span>${item.name}<br><span class="text-soft" style="font-size:12.5px">${item.note} · ${item.price.toLocaleString('ru-RU')} ₽</span></span>
              </label>`,
            ).join('')}
          </div>
        </div>`,
      ].join('\n')
    : [
        segmented('layout', 'Планировка', LAYOUTS, state.layout, `<span class="control__value" data-part="layout-value">${find(LAYOUTS, state.layout).hint}</span>`),
        range('wall', 'Длина стены', 180, 480, 10, state.wall, 'см'),
        segmented('facade', 'Фасад', shorten(FACADES), state.facade, `<span class="control__value" data-part="facade-value">${facade.price.toLocaleString('ru-RU')} ₽/м</span>`),
        swatchRow('color', 'Цвет', facade.colors, state.color, 'color-value'),
      ].join('\n');

  return `<div class="tool" data-tool data-full="${full}" data-action="${action}">
  <div class="tool__head">
    <span class="tool__badge"><i></i>${full ? 'Конфигуратор' : 'Живой расчёт'}</span>
    <span class="label" data-part="run">${totals.run}</span>
  </div>

  <div class="tool__stage">
    <div data-part="draw">${drawHtml(state)}</div>
    <div data-part="plan">${planHtml(state)}</div>
  </div>

  <div class="tool__controls">
${controls}
  </div>

  <div class="tool__total">
    <div>
      <p class="total__value" data-part="total">${totals.total}</p>
      <p class="total__meta" data-part="meta">${totals.meta}</p>
    </div>
    ${
      full
        ? '<button class="btn btn--primary" type="button" data-lead-open>Отправить расчёт</button>'
        : `<a class="btn btn--primary" data-part="cta" href="${action}?${toSearch(state)}">Открыть конфигуратор</a>`
    }
  </div>

  <p class="tool__note" data-part="note">${note || totals.note}</p>
</div>`;
}
