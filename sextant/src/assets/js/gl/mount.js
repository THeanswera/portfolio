/**
 * Точка входа 3D: собирает сцену и модель. Один и тот же модуль
 * используется и на страницах сайта, и в скрипте офлайн-рендера, поэтому
 * кадры в галерее выглядят так же, как живая модель в браузере.
 */
import * as THREE from 'three';
import { createStage } from './stage.js';
import { createCalibre } from './calibre.js';
import { createWatch } from './watch.js';

/**
 * Включает тени на всех непрозрачных деталях узла. Стекло и сапфир тень
 * не отбрасывают: чёрное пятно под прозрачной деталью выглядит ошибкой.
 */
function enableShadows(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    const transparent = child.material?.transparent === true;
    child.castShadow = !transparent;
    child.receiveShadow = true;
  });
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 *   frozenTime — если задано, движение останавливается на этом моменте
 *                (нужно для съёмки кадров), иначе механизм живёт.
 */
export function mountCalibre(canvas, options = {}) {
  const { frozenTime = null, ...stageOptions } = options;

  const stage = createStage(canvas, {
    distance: 4.6,
    fov: 26,
    minDistance: 2.4,
    maxDistance: 9,
    tilt: 1.06,
    /* Механизм лежит плашмя: плоскость ловит тень прямо под платиной. */
    floor: -0.24,
    ...stageOptions,
  });

  if (!stage) return null;

  const calibre = createCalibre();

  /* Механизм собран в плоскости XY (толщина по Z), а камера облетает сцену
     вокруг вертикали. Разворачиваем узел, чтобы смотреть на механизм сверху,
     как на разложенные на столе детали. */
  calibre.group.rotation.x = -Math.PI / 2;
  stage.root.add(calibre.group);
  enableShadows(calibre.group);

  if (frozenTime === null) {
    stage.onFrame((time, delta) => calibre.animate(time, delta));
  } else {
    calibre.animate(frozenTime, 16);
  }

  return { stage, calibre };
}

/** Часы целиком: корпус, циферблат, стрелки, ремешок и механизм внутри. */
export function mountWatch(canvas, options = {}) {
  const { frozenTime = null, watch: watchOptions = {}, ...stageOptions } = options;

  const stage = createStage(canvas, {
    distance: 8.2,
    fov: 26,
    minDistance: 4.4,
    maxDistance: 16,
    tilt: 1.12,
    /* Центр композиции ниже нуля: ремешок уходит вниз, и без этого
       кадр перекашивается вверх. */
    target: new THREE.Vector3(0, -0.5, 0),
    /* Плоскость прямо под корпусом: она даёт мягкую тень под часами. */
    floor: -0.72,
    ...stageOptions,
  });

  if (!stage) return null;

  const watch = createWatch(watchOptions);
  watch.group.rotation.x = -Math.PI / 2;
  stage.root.add(watch.group);
  enableShadows(watch.group);

  if (frozenTime === null) {
    stage.onFrame((time, delta) => watch.animate(time, delta));
  } else {
    watch.animate(frozenTime, 16);
  }

  return { stage, watch };
}
