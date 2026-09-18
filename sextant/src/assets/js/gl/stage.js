/**
 * Сцена: рендерер, камера, окружение и орбитальное управление.
 * Один и тот же модуль работает и на странице, и в офлайн-рендере
 * скриншотов — поэтому кадры в галерее совпадают с тем, что видно вживую.
 */
import * as THREE from 'three';
import { createEnvironment, createLights } from './environment.js';

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createStage(canvas, options = {}) {
  const {
    distance = 6,
    fov = 26,
    minDistance = 0.6,
    maxDistance = 14,
    autoRotate = 0.00016,
    zoom = true,
    tilt = 1.02,
    target = new THREE.Vector3(0, 0, 0),
    exposure = 0.98,
    background = null,
  } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();
  if (background) scene.background = background;
  scene.environment = createEnvironment(renderer);
  const lights = createLights(scene);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 200);
  const root = new THREE.Group();
  scene.add(root);

  const state = {
    theta: 0.62,
    phi: tilt,
    distance,
    targetTheta: 0.62,
    targetPhi: tilt,
    targetDistance: distance,
    spin: autoRotate,
    velocity: 0,
    dragging: false,
    visible: true,
    paused: false,
    idleAt: performance.now(),
  };

  const frameHooks = [];
  const resizeHooks = [];

  const resize = () => {
    const host = canvas.parentElement ?? canvas;
    const width = host.clientWidth || canvas.clientWidth || 1;
    const height = host.clientHeight || canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    resizeHooks.forEach((hook) => hook(width, height));

    /* Смена размера очищает буфер рисования. Если сцена сейчас вне экрана,
       кадр не обновляется — и на снимке остаётся пустой прямоугольник. */
    if (!state.visible || state.paused) {
      updateCamera();
      renderer.render(scene, camera);
    }
  };

  const updateCamera = () => {
    const sinPhi = Math.sin(state.phi);
    camera.position.set(
      target.x + state.distance * sinPhi * Math.sin(state.theta),
      target.y + state.distance * Math.cos(state.phi),
      target.z + state.distance * sinPhi * Math.cos(state.theta),
    );
    camera.lookAt(target);
  };

  /* --- Управление: перетаскивание, колесо, инерция ---------------------- */

  const localPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, width: rect.width, height: rect.height };
  };

  let dragStart = null;

  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStart = { x: event.clientX, y: event.clientY, theta: state.targetTheta, phi: state.targetPhi };
    state.dragging = true;
    state.velocity = 0;
    canvas.setPointerCapture?.(event.pointerId);
    canvas.dataset.dragging = 'true';
    state.idleAt = performance.now();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!state.dragging || !dragStart) return;
    const point = localPoint(event);
    const scale = 6.2 / Math.max(240, point.width);
    state.targetTheta = dragStart.theta + (event.clientX - dragStart.x) * scale;
    state.targetPhi = Math.min(2.65, Math.max(0.3, dragStart.phi - (event.clientY - dragStart.y) * scale));
    state.velocity = (event.clientX - dragStart.x) * 0.00012;
    state.idleAt = performance.now();
  });

  const endDrag = (event) => {
    if (!state.dragging) return;
    state.dragging = false;
    canvas.dataset.dragging = 'false';
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    dragStart = null;
    state.idleAt = performance.now();
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  if (zoom) {
    canvas.addEventListener(
      'wheel',
      (event) => {
        /* Колесо над сценой приближает, но страницу не блокирует:
           при достижении предела отдаём событие дальше. */
        const next = state.targetDistance * (1 + Math.sign(event.deltaY) * 0.12);
        const clamped = Math.min(maxDistance, Math.max(minDistance, next));
        if (clamped === state.targetDistance) return;
        state.targetDistance = clamped;
        event.preventDefault();
        state.idleAt = performance.now();
      },
      { passive: false },
    );
  }

  /* Клавиатура: стрелки поворачивают модель. */
  canvas.addEventListener('keydown', (event) => {
    const step = 0.16;
    const map = {
      ArrowLeft: () => (state.targetTheta -= step),
      ArrowRight: () => (state.targetTheta += step),
      ArrowUp: () => (state.targetPhi = Math.max(0.3, state.targetPhi - step * 0.6)),
      ArrowDown: () => (state.targetPhi = Math.min(2.65, state.targetPhi + step * 0.6)),
    };

    if (map[event.key]) {
      event.preventDefault();
      map[event.key]();
      state.idleAt = performance.now();
    }
  });

  /* --- Цикл ------------------------------------------------------------- */

  let last = performance.now();

  const frame = (now) => {
    const delta = Math.min(48, now - last);
    last = now;

    if (state.visible && !state.paused) {
      const idle = now - state.idleAt > 2600 && !state.dragging;
      const spin = idle && !prefersReduced() ? state.spin : 0;

      if (!state.dragging) {
        state.targetTheta += spin * delta + state.velocity * delta;
        state.velocity *= 0.93;
        if (Math.abs(state.velocity) < 1e-6) state.velocity = 0;
      }

      state.theta += (state.targetTheta - state.theta) * 0.09;
      state.phi += (state.targetPhi - state.phi) * 0.09;
      state.distance += (state.targetDistance - state.distance) * 0.08;

      updateCamera();
      frameHooks.forEach((hook) => hook(now, delta));
      renderer.render(scene, camera);
    }

    requestAnimationFrame(frame);
  };

  updateCamera();
  resize();
  requestAnimationFrame(frame);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => (state.visible = entry.isIntersecting)),
      { rootMargin: '120px' },
    );
    observer.observe(canvas);
  }

  document.addEventListener('visibilitychange', () => {
    state.paused = document.hidden;
  });

  window.addEventListener('resize', resize);

  return {
    renderer,
    scene,
    camera,
    root,
    lights,
    state,
    resize,
    onFrame: (hook) => frameHooks.push(hook),
    onResize: (hook) => resizeHooks.push(hook),
    setDistance: (value) => {
      state.targetDistance = value;
    },
    /* Ракурс для офлайн-рендера: выставляем без инерции. */
    setView: (theta, phi, dist = state.distance) => {
      state.theta = theta;
      state.targetTheta = theta;
      state.phi = phi;
      state.targetPhi = phi;
      state.distance = dist;
      state.targetDistance = dist;
      updateCamera();
    },
    renderOnce: () => {
      updateCamera();
      frameHooks.forEach((hook) => hook(performance.now(), 16));
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    },
    dispose: () => {
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
