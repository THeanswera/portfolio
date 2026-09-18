/**
 * Сценарии главной: калибр в первом экране и его же уменьшенная копия
 * в блоке «Калибр SXT-01».
 */
import { mountCalibre } from '../gl/mount.js';

const heroCanvas = document.querySelector('[data-calibre]');

if (heroCanvas) {
  const stage = heroCanvas.closest('.stage');
  const mounted = mountCalibre(heroCanvas, { distance: 5.6, autoRotate: 0.00022 });

  /* После первого перетаскивания подсказка исчезает. */
  heroCanvas.addEventListener('pointerdown', () => {
    if (stage) stage.dataset.dragged = 'true';
  });

  window.sextantHero = mounted;
}

const previewCanvas = document.querySelector('[data-calibre-preview-canvas]');

if (previewCanvas) {
  const mounted = mountCalibre(previewCanvas, {
    distance: 3.4,
    autoRotate: 0.00016,
    tilt: 1.28,
    zoom: false,
  });

  mounted.stage.setView(1.1, 1.34, 3.4);
  window.sextantPreview = mounted;
}
