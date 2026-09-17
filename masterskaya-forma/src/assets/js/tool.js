/**
 * Логика конфигуратора: следит за состоянием, перерисовывает чертёж и цену,
 * обновляет адрес страницы, чтобы ссылку на конфигурацию можно было переслать.
 */
import {
  readState,
  toSearch,
  drawHtml,
  planHtml,
  swatchesHtml,
  totalsHtml,
  resolve,
} from './shared/toolview.js';
import { FACADES, WORKTOPS, FITTINGS, LAYOUTS } from './shared/pricing.js';

const find = (list, id) => list.find((item) => item.id === id) ?? list[0];

export function initTools() {
  document.querySelectorAll('[data-tool]').forEach((root) => {
    if (root.dataset.ready === 'true') return;
    root.dataset.ready = 'true';
    start(root);
  });
}

function start(root) {
  const full = root.dataset.full === 'true';
  const action = root.dataset.action ?? '/configurator/';
  const state = readState(window.location.search);
  const part = (name) => root.querySelector(`[data-part="${name}"]`);

  const setPressed = (name, value) => {
    root.querySelectorAll(`[data-set="${name}"]`).forEach((node) => {
      if (node.tagName === 'BUTTON') node.setAttribute('aria-pressed', String(node.dataset.value === value));
    });
  };

  const paint = () => {
    const draw = part('draw');
    if (draw) draw.innerHTML = drawHtml(state);

    const plan = part('plan');
    if (plan) plan.innerHTML = planHtml(state);

    const totals = totalsHtml(state);
    const total = part('total');
    const meta = part('meta');
    const run = part('run');
    const note = part('note');
    if (total) total.textContent = totals.total;
    if (meta) meta.textContent = totals.meta;
    if (run) run.textContent = totals.run;
    if (note) note.textContent = totals.note;

    const { facade, worktop, fitting, layout, color, topColor } = resolve(state);

    const wallValue = part('wall-value');
    if (wallValue) wallValue.textContent = `${state.wall} см`;

    const layoutValue = part('layout-value');
    if (layoutValue) layoutValue.textContent = layout.hint;

    const facadeValue = part('facade-value');
    if (facadeValue) facadeValue.textContent = `${facade.price.toLocaleString('ru-RU')} ₽/м`;

    const topValue = part('top-value');
    if (topValue) topValue.textContent = `${worktop.price.toLocaleString('ru-RU')} ₽/м`;

    const fittingValue = part('fitting-value');
    if (fittingValue) fittingValue.textContent = fitting.note.split(',')[0];

    const colorRow = part('color');
    if (colorRow) colorRow.innerHTML = swatchesHtml(facade.colors, state.color, 'color');
    const colorValue = part('color-value');
    if (colorValue) colorValue.textContent = color.name;

    const topColorRow = part('topColor');
    if (topColorRow) topColorRow.innerHTML = swatchesHtml(worktop.colors, state.topColor, 'topColor');
    const topColorValue = part('topColor-value');
    if (topColorValue) topColorValue.textContent = topColor.name;

    setPressed('layout', state.layout);
    setPressed('facade', state.facade);
    setPressed('top', state.top);
    setPressed('fitting', state.fitting);

    const cta = part('cta');
    if (cta) cta.href = `${action}?${toSearch(state)}`;

    if (full) {
      window.clearTimeout(start.urlTimer);
      start.urlTimer = window.setTimeout(() => {
        window.history.replaceState(null, '', `${window.location.pathname}?${toSearch(state)}`);
      }, 220);
    }
  };

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      paint();
    });
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-set]');
    if (!button) return;
    const { set, value } = button.dataset;

    if (set === 'layout') state.layout = value;
    if (set === 'color') state.color = value;
    if (set === 'topColor') state.topColor = value;
    if (set === 'fitting') state.fitting = value;
    if (set === 'facade') {
      state.facade = value;
      state.color = find(FACADES, value).colors[0].id;
    }
    if (set === 'top') {
      state.top = value;
      state.topColor = find(WORKTOPS, value).colors[0].id;
    }

    schedule();
  });

  root.addEventListener('input', (event) => {
    const field = event.target.closest('[data-set]');
    if (!field) return;

    if (field.type === 'range' && field.dataset.set === 'wall') {
      state.wall = Number(field.value);
      const wallValue = part('wall-value');
      if (wallValue) wallValue.textContent = `${state.wall} см`;
      schedule();
      return;
    }

    if (field.type === 'checkbox' && field.dataset.set === 'extras') {
      const value = field.value;
      state.extras = field.checked
        ? [...new Set([...state.extras, value])]
        : state.extras.filter((item) => item !== value);
      schedule();
    }
  });

  // Кнопка «Скопировать ссылку» — на странице конфигуратора.
  const copy = document.querySelector('[data-copy-config]');
  if (copy) {
    copy.addEventListener('click', async () => {
      const url = `${window.location.origin}${window.location.pathname}?${toSearch(state)}`;
      window.history.replaceState(null, '', url.slice(window.location.origin.length));
      try {
        await navigator.clipboard.writeText(url);
        copy.textContent = 'Ссылка скопирована';
      } catch {
        copy.textContent = 'Скопируйте адрес из строки браузера';
      }
      window.setTimeout(() => {
        copy.textContent = 'Скопировать ссылку на расчёт';
      }, 2600);
    });
  }

  // Сброс к исходной конфигурации.
  const reset = document.querySelector('[data-reset-config]');
  if (reset) {
    reset.addEventListener('click', () => {
      const fresh = readState('');
      Object.assign(state, fresh, { extras: [...fresh.extras] });
      root.querySelectorAll('[data-set]').forEach((node) => {
        if (node.type === 'range') node.value = String(state.wall);
        if (node.type === 'checkbox') node.checked = state.extras.includes(node.value);
      });
      paint();
    });
  }

  paint();
}
