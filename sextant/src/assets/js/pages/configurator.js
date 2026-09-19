/**
 * Конфигуратор: живая модель часов, выбор отделки и пересчёт стоимости.
 * Модель меняется на месте: геометрия пересобирается только при смене размера.
 */
import { mountWatch } from '../gl/mount.js';
import { data } from '../data.js';

const configurator = data.configurator;
const canvas = document.querySelector('[data-watch]');

/* Смета считается всегда, даже если WebGL недоступен и модели нет. */
const mounted = canvas
  ? mountWatch(canvas, {
      distance: 11.8,
      maxDistance: 20,
      floor: null,
      tilt: 1.02,
      autoRotate: 0.00014,
      watch: { size: 38, caseKind: 'steel', dialKind: 'midnight', strapTone: 0x4a3a2c },
    })
  : null;

if (canvas) {
  const stage = canvas.closest('.stage');
  const scene = mounted?.stage ?? null;
  const watch = mounted?.watch ?? null;
  const rub = (value) => `${value.toLocaleString('ru-RU')} ₽`;

  canvas.addEventListener('pointerdown', () => {
    if (stage) stage.dataset.dragged = 'true';
  });

  /* Соответствие идентификаторов данных материалам сцены. */
  const CASE_KINDS = { steel: 'steel', rhodium: 'steelBrushed', 'titanium-dlc': 'dlc' };
  const DIAL_KINDS = { midnight: 'midnight', graphite: 'graphite', 'white-opal': 'opal', meteorite: 'meteorite' };
  const STRAP_TONES = { leather: 0x4a3a2c, bracelet: 0x9aa0a8, rubber: 0x24282f };

  const state = { case: 'steel', dial: 'midnight', strap: 'leather', size: '38', engraving: '' };

  const extras = {
    case: () => configurator.cases.find((item) => item.id === state.case)?.extra ?? 0,
    dial: () => configurator.dials.find((item) => item.id === state.dial)?.extra ?? 0,
    strap: () => configurator.straps.find((item) => item.id === state.strap)?.extra ?? 0,
    engraving: () => (state.engraving.trim() ? configurator.engraving.price : 0),
  };

  const render = () => {
    const total =
      configurator.basePrice + extras.case() + extras.dial() + extras.strap() + extras.engraving();

    const set = (key, value) => {
      const node = document.querySelector(`[data-price="${key}"]`);
      if (node) node.textContent = value;
    };

    set('base', rub(configurator.basePrice));
    set('case', extras.case() ? `+ ${rub(extras.case())}` : 'включено');
    set('dial', extras.dial() ? `+ ${rub(extras.dial())}` : 'включено');
    set('strap', extras.strap() ? `+ ${rub(extras.strap())}` : 'включено');
    set('engraving', rub(extras.engraving()));
    set('total', rub(total));

    const engravingRow = document.querySelector('[data-price-row="engraving"]');
    if (engravingRow) engravingRow.hidden = extras.engraving() === 0;

    document.querySelectorAll('[data-extra]').forEach((node) => {
      const key = node.dataset.extra;
      if (!['case', 'dial', 'strap'].includes(key)) return;
      const value = extras[key]();
      node.textContent = value ? `+ ${rub(value)}` : 'включено';
    });
  };

  const applyMaterials = () => {
    if (!watch) return;
    watch.apply({
      caseKind: CASE_KINDS[state.case],
      dialKind: DIAL_KINDS[state.dial],
      strapTone: STRAP_TONES[state.strap],
      strapKind: state.strap,
    });
  };

  document.querySelectorAll('[data-group]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.group;
      state[group] = chip.dataset.value;

      document
        .querySelectorAll(`[data-group="${group}"]`)
        .forEach((item) => item.setAttribute('aria-pressed', String(item === chip)));

      if (group === 'size') {
        /* Размер — это пропорция корпуса: масштабируем узел целиком. */
        watch?.group.scale.setScalar(Number(state.size) / 38);
      } else {
        applyMaterials();
      }

      render();
    });
  });

  const engravingInput = document.querySelector('[data-engraving]');

  if (engravingInput) {
    engravingInput.addEventListener('input', () => {
      state.engraving = engravingInput.value;
      render();
    });
  }

  /* Начальное состояние: первые варианты в каждой группе. */
  document.querySelectorAll('[data-group]').forEach((chip) => {
    const group = chip.dataset.group;
    const isFirst = document.querySelector(`[data-group="${group}"]`) === chip;
    chip.setAttribute('aria-pressed', String(isFirst));
  });

  render();
  applyMaterials();

  /* Состояние наружу: по нему проверка в браузере читает выбранные варианты. */
  if (mounted) window.sextantWatch = { stage: scene, watch, state };
}

// Ракурсы соответствуют модели, лежащей циферблатом вверх (+Y).
const controls = document.querySelectorAll('[data-view], [data-zoom], [data-spin]');
if (!mounted) {
  controls.forEach(button => button.disabled = true);
  const status = document.querySelector('[data-watch-status]');
  if (status) status.textContent = '3D недоступно в этом браузере. Выбор отделки и расчёт стоимости работают.';
} else {
  const scene = mounted.stage;
  const spin = document.querySelector('[data-spin]');
  const setSpin = enabled => {
    scene.state.spin = enabled ? 0.00014 : 0;
    scene.state.velocity = 0;
    scene.state.idleAt = performance.now();
    spin.setAttribute('aria-pressed', String(enabled));
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSpin(false);
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    const views = { front: [0, 0.02, 11.8], side: [Math.PI / 2, Math.PI / 2, 11.8], back: [0, Math.PI - 0.02, 11.8], reset: [0.62, 1.02, 11.8] };
    scene.setView(...views[button.dataset.view]);
    setSpin(false);
  }));
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    scene.setDistance(scene.state.targetDistance * (button.dataset.zoom === 'in' ? 1 / 1.2 : 1.2));
  }));
  spin.addEventListener('click', () => setSpin(scene.state.spin === 0));
}
