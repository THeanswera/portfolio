/**
 * Точка входа 3D: собирает сцену и механизм. Один и тот же модуль
 * используется и на страницах сайта, и в скрипте офлайн-рендера, поэтому
 * кадры в галерее выглядят так же, как живая модель в браузере.
 */
import * as THREE from 'three';
import { createStage } from './stage.js';
import { createCalibre } from './calibre.js';
import { createWatch } from './watch.js';

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
    ...stageOptions,
  });

  if (!stage) return null;

  const calibre = createCalibre();

  /* Механизм собран в плоскости XY (толщина по Z), а камера облетает сцену
     вокруг вертикали. Разворачиваем узел, чтобы смотреть на механизм сверху,
     как на разложенные на столе детали. */
  calibre.group.rotation.x = -Math.PI / 2;
  stage.root.add(calibre.group);

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
    target: new THREE.Vector3(0, 0, 0),
    ...stageOptions,
  });

  if (!stage) return null;

  const watch = createWatch(watchOptions);
  watch.group.rotation.x = -Math.PI / 2;
  stage.root.add(watch.group);

  if (frozenTime === null) {
    stage.onFrame((time, delta) => watch.animate(time, delta));
  } else {
    watch.animate(frozenTime, 16);
  }

  return { stage, watch };
}
