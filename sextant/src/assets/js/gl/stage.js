/**
 * Сцена: рендерер, камера, окружение и орбитальное управление.
 * Один и тот же модуль работает и на странице, и в офлайн-рендере
 * скриншотов — поэтому кадры в галерее совпадают с тем, что видно вживую.
 */
import * as THREE from 'three';
import { createEnvironment, createLights } from './environment.js';

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Сцена собирается только при живом WebGL. Если контекст не выдаётся
 * (старый браузер, отключено аппаратное ускорение, сборочная машина),
 * возвращаем null — страница остаётся рабочей, без модели.
 */
export function createStage(canvas, options = {}) {
  const probe = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

  if (!probe) {
    canvas.dataset.unavailable = 'true';
    return null;
  }
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
    floor = null,
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

  /* Мягкие тени: без них предмет висит в пустоте и выглядит нарисованным. */
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  if (background) scene.background = background;
  scene.environment = createEnvironment(renderer);
  const lights = createLights(scene);

  lights.key.castShadow = true;
  lights.key.shadow.mapSize.set(2048, 2048);
  lights.key.shadow.radius = 5;
  lights.key.shadow.bias = -0.0008;
  lights.key.shadow.normalBias = 0.025;

  const shadowCamera = lights.key.shadow.camera;
  shadowCamera.left = -3.4;
  shadowCamera.right = 3.4;
  shadowCamera.top = 3.4;
  shadowCamera.bottom = -3.4;
  shadowCamera.near = 0.5;
  shadowCamera.far = 20;
  shadowCamera.updateProjectionMatrix();

  /* Невидимая плоскость под предметом: она ничего не рисует, только ловит тень. */
  if (floor !== null) {
    const catcher = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.42 }),
    );
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.y = floor;
    catcher.receiveShadow = true;
    scene.add(catcher);
  }

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

  const pointers = new Map();
  const controller = new AbortController();
  const listen = (node, type, fn, options = {}) =>
    node.addEventListener(type, fn, { ...options, signal: controller.signal });
  const clampDistance = value => Math.min(maxDistance, Math.max(minDistance, value));
  const clampPhi = value => Math.min(Math.PI - 0.02, Math.max(0.02, value));
  let gesture = null;
  const baseline = () => {
    const points = [...pointers.values()];
    gesture = points.length > 1
      ? { gap: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), distance: state.targetDistance }
      : points.length ? { ...points[0], theta: state.targetTheta, phi: state.targetPhi } : null;
  };
  listen(canvas, 'pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    state.dragging = true;
    state.velocity = 0;
    canvas.setPointerCapture?.(event.pointerId);
    canvas.dataset.dragging = 'true';
    state.idleAt = performance.now();
    baseline();
  });
  listen(canvas, 'pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.values()];
    if (points.length > 1) {
      const gap = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      if (zoom && gap > 0 && gesture.gap > 0)
        state.targetDistance = clampDistance(gesture.distance * gesture.gap / gap);
    } else {
      const scale = 6.2 / Math.max(240, canvas.getBoundingClientRect().width);
      state.targetTheta = gesture.theta + (event.clientX - gesture.x) * scale;
      state.targetPhi = clampPhi(gesture.phi - (event.clientY - gesture.y) * scale);
    }
    state.idleAt = performance.now();
  });
  const endDrag = event => {
    pointers.delete(event.pointerId);
    state.dragging = pointers.size > 0;
    canvas.dataset.dragging = String(state.dragging);
    baseline();
    state.idleAt = performance.now();
  };
  listen(canvas, 'pointerup', endDrag);
  listen(canvas, 'pointercancel', endDrag);
  listen(canvas, 'lostpointercapture', endDrag);

  if (zoom) {
    listen(canvas,
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
  listen(canvas, 'keydown', (event) => {
    const step = 0.16;
    const map = {
      Home: () => { state.targetTheta = 0.62; state.targetPhi = tilt; state.targetDistance = distance; state.velocity = 0; },
      '+': () => { if (zoom) state.targetDistance = clampDistance(state.targetDistance / 1.15); },
      '-': () => { if (zoom) state.targetDistance = clampDistance(state.targetDistance * 1.15); },
      ArrowLeft: () => (state.targetTheta -= step),
      ArrowRight: () => (state.targetTheta += step),
      ArrowUp: () => (state.targetPhi = clampPhi(state.targetPhi - step * 0.6)),
      ArrowDown: () => (state.targetPhi = clampPhi(state.targetPhi + step * 0.6)),
    };

    if (map[event.key]) {
      event.preventDefault();
      map[event.key]();
      state.idleAt = performance.now();
    }
  });

  /* --- Цикл ------------------------------------------------------------- */

  let last = performance.now();
  let animationId;
  let observer;

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

    animationId = requestAnimationFrame(frame);
  };

  updateCamera();
  resize();
  animationId = requestAnimationFrame(frame);

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => (state.visible = entry.isIntersecting)),
      { rootMargin: '120px' },
    );
    observer.observe(canvas);
  }

  listen(document, 'visibilitychange', () => {
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
      state.targetDistance = clampDistance(value);
      state.idleAt = performance.now();
    },
    /* Ракурс для офлайн-рендера: выставляем без инерции. */
    setView: (theta, phi, dist = state.distance) => {
      state.theta = theta;
      state.targetTheta = theta;
      state.phi = phi;
      state.targetPhi = phi;
      state.distance = dist;
      state.targetDistance = dist;
      state.velocity = 0;
      state.idleAt = performance.now();
      updateCamera();
    },
    renderOnce: () => {
      updateCamera();
      frameHooks.forEach((hook) => hook(performance.now(), 16));
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    },
    dispose: () => {
      cancelAnimationFrame(animationId);
      controller.abort();
      observer?.disconnect();
      scene.environment?.dispose();
      const geometries = new Set(), materials = new Set(), textures = new Set();
      scene.traverse(node => {
        if (node.geometry) geometries.add(node.geometry);
        for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
          if (!material) continue;
          materials.add(material);
          Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
        }
      });
      textures.forEach(item => item.dispose());
      materials.forEach(item => item.dispose());
      geometries.forEach(item => item.dispose());
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
