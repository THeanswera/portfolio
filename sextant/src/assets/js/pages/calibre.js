/**
 * Страница калибра: разборка механизма на узлы и подсветка выбранной детали.
 * Если WebGL недоступен, сцены нет и страница остаётся текстовой.
 */
import { mountCalibre } from '../gl/mount.js';

const canvas = document.querySelector('[data-explode]');
const mounted = canvas ? mountCalibre(canvas, { distance: 7.2, tilt: 1.0, autoRotate: 0.00012 }) : null;

if (mounted) {
  const { stage: scene, calibre } = mounted;
  const stage = canvas.closest('.stage');

  canvas.addEventListener('pointerdown', () => {
    if (stage) stage.dataset.dragged = 'true';
  });

  /* Насколько далеко уходит узел при разборке (в локальных единицах). */
  const OFFSETS = {
    mainplate: -0.25,
    train: 0.45,
    barrel: 0.85,
    escapement: 1.15,
    bridges: 1.6,
    jewels: 2.0,
    rotor: 2.45,
  };

  const base = new Map();
  Object.entries(calibre.nodes).forEach(([id, node]) => {
    base.set(id, node.position.z);
  });

  const state = { factor: 0, target: 0, selected: null };

  const toggle = document.querySelector('[data-explode-toggle]');
  const reset = document.querySelector('[data-explode-reset]');
  const partButtons = [...document.querySelectorAll('[data-part]')];

  const updateToggle = () => {
    if (!toggle) return;
    const open = state.target > 0.5;
    toggle.setAttribute('aria-pressed', String(open));
    toggle.textContent = open ? 'Собрать механизм' : 'Разобрать механизм';
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      state.target = state.target > 0.5 ? 0 : 1;
      if (state.target === 0) {
        state.selected = null;
        partButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
      }
      updateToggle();
    });
  }

  if (reset) {
    reset.addEventListener('click', () => {
      state.target = 0;
      state.selected = null;
      partButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
      scene.setView(0.62, 1.0, 7.2);
      updateToggle();
    });
  }

  partButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.part;
      const isSame = state.selected === id;

      state.selected = isSame ? null : id;
      state.target = isSame ? 0 : 1;

      partButtons.forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.part === state.selected)));
      updateToggle();

      if (!isSame) {
        /* Разворот к выбранному узлу: у каждого своё место на плате. */
        const angle = {
          barrel: -0.9,
          train: 0.4,
          balance: -1.1,
          escapement: -0.6,
          bridges: 0.2,
          jewels: 0.6,
          mainplate: 0,
          rotor: 0,
        };
        scene.setView(0.62 + (angle[id] ?? 0), id === 'mainplate' ? 1.4 : 0.95, id === 'mainplate' ? 7.8 : 6.4);
      }
    });
  });

  scene.onFrame((time, delta) => {
    state.factor += (state.target - state.factor) * 0.06 * (delta / 16);

    Object.entries(OFFSETS).forEach(([id, offset]) => {
      const node = calibre.nodes[id];
      if (!node) return;

      const extra = state.selected === id ? 0.5 * state.factor : 0;
      node.position.z = (base.get(id) ?? 0) + (offset + extra) * state.factor;

      const scale = state.selected === id ? 1 + 0.05 * state.factor : 1;
      node.scale.setScalar(scale);
    });
  });

  /* Состояние наружу: по нему проверка в браузере убеждается, что сцена жива. */
  window.sextantExplode = { stage: scene, calibre, state };
}
