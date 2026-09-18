/**
 * Глобус арбитража: Canvas 2D, ортографическая проекция сферы с полным
 * поворотом по двум осям. Показывает двенадцать площадок и маршруты между
 * ними — те самые, по которым алгоритм ищет расхождение цены.
 *
 * Глобус живой: вращается сам, поворачивается мышью и пальцем с инерцией,
 * наклоняется вслед за курсором, а по наведению на площадку показывает
 * её комиссию и задержку. Без внешних библиотек.
 */
import { data } from './data.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function initGlobe(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let radius = 0;

  /* --- Модель: точки на сфере ------------------------------------------- */

  /** Широта и долгота в радианах — вектор единичной длины. */
  const nodes = data.exchanges.map((item) => {
    const phi = (item.lat * Math.PI) / 180;
    const lambda = (item.lon * Math.PI) / 180;
    return {
      ...item,
      phi,
      lambda,
      vector: [Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)],
    };
  });

  /* Маршруты: пары площадок с заметным расхождением цены. */
  const routePairs = [
    [0, 1], [0, 7], [1, 5], [2, 4], [3, 8], [4, 6],
    [5, 0], [6, 3], [7, 10], [8, 11], [9, 1], [10, 2],
  ];

  /**
   * Дуга большого круга между двумя площадками, приподнятая над сферой.
   * Точки считаются в трёхмерных координатах, поэтому дуга не «плывёт»
   * при наклоне глобуса, как это было с квадратичной кривой на плоскости.
   */
  const buildRoute = (a, b) => {
    const dot = clamp(a.vector[0] * b.vector[0] + a.vector[1] * b.vector[1] + a.vector[2] * b.vector[2], -1, 1);
    const omega = Math.acos(dot);
    const sin = Math.sin(omega);
    const points = [];

    for (let step = 0; step <= 24; step += 1) {
      const t = step / 24;
      let x;
      let y;
      let z;

      if (sin < 1e-5) {
        x = a.vector[0];
        y = a.vector[1];
        z = a.vector[2];
      } else {
        const ka = Math.sin((1 - t) * omega) / sin;
        const kb = Math.sin(t * omega) / sin;
        x = a.vector[0] * ka + b.vector[0] * kb;
        y = a.vector[1] * ka + b.vector[1] * kb;
        z = a.vector[2] * ka + b.vector[2] * kb;
      }

      const lift = 1 + 0.055 + Math.sin(t * Math.PI) * 0.075;
      points.push([x * lift, y * lift, z * lift]);
    }

    return { from: a, to: b, points };
  };

  const routes = routePairs.map(([from, to]) => buildRoute(nodes[from], nodes[to]));

  /* --- Состояние поворота ------------------------------------------------ */

  const state = {
    yaw: 0.4,
    pitch: -0.32, // наклон оси: северный полюс слегка к зрителю
    spin: 0, // собственная скорость вращения
    velocity: 0, // инерция после броска
    dragging: false,
    pointerX: 0,
    pointerY: 0,
    parallaxYaw: 0,
    parallaxPitch: 0,
    targetParallaxYaw: 0,
    targetParallaxPitch: 0,
    hovered: -1,
    hoverAmount: 0,
    hintShown: true,
  };

  const PITCH_LIMIT = 1.1;

  /* --- Точка на экране --------------------------------------------------- */

  const projected = { x: 0, y: 0, z: 0 };

  /** Поворот вектора: сначала вокруг вертикальной оси, затем наклон. */
  const project = (vector, yaw, pitch) => {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const x = vector[0] * cy + vector[2] * sy;
    const z0 = -vector[0] * sy + vector[2] * cy;
    const y = vector[1] * cp - z0 * sp;
    const z = vector[1] * sp + z0 * cp;

    projected.x = width / 2 + x * radius;
    projected.y = height / 2 - y * radius;
    projected.z = z;
    return projected;
  };

  /* --- Размеры ----------------------------------------------------------- */

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = host.clientWidth;
    height = host.clientHeight;
    radius = Math.min(width, height) * 0.36;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /* --- Отрисовка --------------------------------------------------------- */

  /** Сетка: параллели и меридианы ломаными, чтобы наклон читался честно. */
  const gridLines = (() => {
    const lines = [];

    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (lat * Math.PI) / 180;
      const line = [];
      for (let lon = 0; lon <= 360; lon += 6) {
        const lambda = (lon * Math.PI) / 180;
        line.push([Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)]);
      }
      lines.push(line);
    }

    for (let lon = 0; lon < 180; lon += 30) {
      const lambda = (lon * Math.PI) / 180;
      const line = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (lat * Math.PI) / 180;
        line.push([Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)]);
      }
      lines.push(line);
    }

    return lines;
  })();

  /* Готовые цвета вместо сборки строки на каждый отрезок: сетка рисуется
     каждый кадр, а строки — это лишние аллокации. */
  const frontPalette = Array.from({ length: 21 }, (_, index) => `rgba(58, 72, 108, ${(0.16 + (index / 20) * 0.62).toFixed(3)})`);
  const backColor = 'rgba(58, 72, 108, 0.14)';

  const drawGrid = (yaw, pitch, front) => {
    ctx.lineWidth = front ? 0.9 : 0.7;
    ctx.strokeStyle = backColor;

    for (const line of gridLines) {
      let previous = null;

      for (const vector of line) {
        const point = project(vector, yaw, pitch);
        const current = { x: point.x, y: point.y, z: point.z };

        if (previous) {
          const visible = front ? previous.z > 0 && current.z > 0 : previous.z <= 0 && current.z <= 0;

          if (visible) {
            if (front) {
              const depth = (Math.max(previous.z, current.z) + 1) / 2;
              ctx.strokeStyle = frontPalette[Math.round(clamp(depth, 0, 1) * 20)];
            }
            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
          }
        }

        previous = current;
      }
    }
  };

  const drawSphere = () => {
    const cx = width / 2;
    const cy = height / 2;

    const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(139, 92, 255, 0.20)');
    gradient.addColorStop(0.6, 'rgba(20, 27, 48, 0.42)');
    gradient.addColorStop(1, 'rgba(5, 7, 13, 0.72)');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* Свечение по контуру: шар читается на тёмном фоне. */
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, TAU);
    ctx.strokeStyle = 'rgba(139, 92, 255, 0.12)';
    ctx.lineWidth = 6;
    ctx.stroke();
  };

  /** Дуга маршрута: рисуется по сегментам, видимые ярче. */
  const drawRoute = (route, yaw, pitch, progress, highlighted) => {
    const { points } = route;
    const alphaBoost = highlighted ? 0.55 : 0;
    let previous = null;

    for (let index = 0; index < points.length; index += 1) {
      const point = project(points[index], yaw, pitch);
      const current = { x: point.x, y: point.y, z: point.z };

      if (previous && (previous.z > 0 || current.z > 0)) {
        const depth = (Math.max(previous.z, current.z) + 1) / 2;
        const alpha = (0.08 + progress * 0.42 + alphaBoost) * Math.max(0.12, depth);

        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.strokeStyle = `rgba(139, 92, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = highlighted ? 1.8 : 1.2;
        ctx.stroke();
      }

      previous = current;
    }

    /* Пакет данных, бегущий по маршруту. */
    if (progress > 0.04 && progress < 0.96) {
      const index = Math.round(progress * (points.length - 1));
      const point = project(points[index], yaw, pitch);

      if (point.z > 0) {
        const depth = (point.z + 1) / 2;

        ctx.beginPath();
        ctx.arc(point.x, point.y, highlighted ? 3 : 2.4, 0, TAU);
        ctx.fillStyle = `rgba(46, 230, 168, ${Math.min(1, (0.35 + depth * 0.6 + alphaBoost) * 2).toFixed(3)})`;
        ctx.fill();
      }
    }
  };

  const drawNode = (node, index, yaw, pitch, time) => {
    const point = project(node.vector, yaw, pitch);
    if (point.z < 0) return;

    const depth = (point.z + 1) / 2;
    const hovered = state.hovered === index;
    const pulse = 1 + Math.sin(time / 900 + node.lon) * 0.12;
    const scale = hovered ? 1 + state.hoverAmount * 0.9 : 1;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.2 * pulse * scale, 0, TAU);
    ctx.fillStyle = hovered
      ? 'rgba(46, 230, 168, 1)'
      : `rgba(46, 230, 168, ${(0.35 + depth * 0.6).toFixed(3)})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.x, point.y, (7 + state.hoverAmount * 9) * pulse * scale, 0, TAU);
    ctx.strokeStyle = hovered
      ? `rgba(46, 230, 168, ${(0.3 + state.hoverAmount * 0.5).toFixed(3)})`
      : `rgba(46, 230, 168, ${(0.06 + depth * 0.14).toFixed(3)})`;
    ctx.lineWidth = hovered ? 1.4 : 1;
    ctx.stroke();

    if (hovered) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 15 + state.hoverAmount * 6, 0, TAU);
      ctx.strokeStyle = `rgba(46, 230, 168, ${(0.12 * state.hoverAmount).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (depth > 0.72 && !hovered) {
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(179, 188, 216, ${(depth * 0.85).toFixed(2)})`;
      ctx.fillText(node.code, point.x + 10, point.y + 4);
    }

    return { x: point.x, y: point.y, z: point.z };
  };

  /* --- Подсказка о площадке ---------------------------------------------- */

  const tip = document.createElement('div');
  tip.className = 'globe__tip';
  tip.hidden = true;
  tip.innerHTML =
    '<span class="globe__tip-city"></span><strong class="globe__tip-name"></strong><span class="globe__tip-meta"></span>';
  host.append(tip);

  const tipCity = tip.querySelector('.globe__tip-city');
  const tipName = tip.querySelector('.globe__tip-name');
  const tipMeta = tip.querySelector('.globe__tip-meta');

  const showTip = (node, x, y) => {
    tipCity.textContent = `${node.city} · ${node.code}`;
    tipName.textContent = node.name;
    tipMeta.textContent = `taker ${node.fee}% · ${node.latency} ms`;
    tip.hidden = false;

    const box = tip.getBoundingClientRect();
    const left = clamp(x + 14, 8, Math.max(8, width - box.width - 8));
    const top = clamp(y - box.height - 12, 8, Math.max(8, height - box.height - 8));
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };

  const hideTip = () => {
    tip.hidden = true;
  };

  /* --- Управление -------------------------------------------------------- */

  const screenPositions = new Array(nodes.length).fill(null);

  const pickNode = (x, y) => {
    let best = -1;
    let bestDistance = 20;

    screenPositions.forEach((point, index) => {
      if (!point) return;
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });

    return best;
  };

  const localPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  let dragStart = null;
  let lastMove = 0;
  let idleSince = performance.now();

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    dragStart = { x: event.clientX, y: event.clientY, yaw: state.yaw, pitch: state.pitch, moved: 0 };
    state.dragging = true;
    state.velocity = 0;
    state.spin = 0;
    idleSince = performance.now();
    canvas.setPointerCapture?.(event.pointerId);
    canvas.dataset.dragging = 'true';
  });

  canvas.addEventListener('pointermove', (event) => {
    const point = localPoint(event);

    if (state.dragging && dragStart) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      dragStart.moved = Math.max(dragStart.moved, Math.hypot(dx, dy));

      const scale = 0.0075 * (560 / Math.max(280, Math.min(width, height)));
      state.yaw = dragStart.yaw + dx * scale;
      state.pitch = clamp(dragStart.pitch - dy * scale * 0.7, -PITCH_LIMIT, PITCH_LIMIT);
      state.velocity = dx * scale * 0.45;
      idleSince = performance.now();
      hideTip();
      state.hovered = -1;
      return;
    }

    const hovered = pickNode(point.x, point.y);

    if (hovered !== state.hovered) {
      state.hovered = hovered;
      if (hovered === -1) hideTip();
    }

    if (hovered !== -1 && screenPositions[hovered]) {
      showTip(nodes[hovered], screenPositions[hovered].x, screenPositions[hovered].y);
    }

    /* Наклон вслед за курсором: глобус отзывается на мышь. */
    if (finePointer && !prefersReduced) {
      const nx = point.x / Math.max(1, width) - 0.5;
      const ny = point.y / Math.max(1, height) - 0.5;
      state.targetParallaxYaw = nx * 0.34;
      state.targetParallaxPitch = -ny * 0.22;
    }

    lastMove = performance.now();
  });

  const endDrag = (event) => {
    if (!state.dragging) return;
    state.dragging = false;
    canvas.dataset.dragging = 'false';
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);

    /* Если это был клик, а не вращение — оставляем площадку подсвеченной. */
    if (dragStart && dragStart.moved < 4) {
      const point = localPoint(event);
      const picked = pickNode(point.x, point.y);
      if (picked !== -1) {
        state.hovered = picked;
        showTip(nodes[picked], screenPositions[picked].x, screenPositions[picked].y);
      }
    }

    dragStart = null;
    idleSince = performance.now();

    if (state.hintShown) {
      state.hintShown = false;
      host.dataset.dragged = 'true';
    }
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('pointerleave', () => {
    if (state.dragging) return;
    state.hovered = -1;
    hideTip();
    state.targetParallaxYaw = 0;
    state.targetParallaxPitch = 0;
  });

  /* Клавиатура: стрелки поворачивают глобус, если он в фокусе. */
  canvas.addEventListener('keydown', (event) => {
    const step = 0.12;
    let handled = true;

    switch (event.key) {
      case 'ArrowLeft':
        state.yaw -= step;
        break;
      case 'ArrowRight':
        state.yaw += step;
        break;
      case 'ArrowUp':
        state.pitch = clamp(state.pitch + step * 0.6, -PITCH_LIMIT, PITCH_LIMIT);
        break;
      case 'ArrowDown':
        state.pitch = clamp(state.pitch - step * 0.6, -PITCH_LIMIT, PITCH_LIMIT);
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
      idleSince = performance.now();
      state.velocity = 0;
      state.spin = 0;
    }
  });

  canvas.addEventListener('focus', () => {
    canvas.dataset.focused = 'true';
  });
  canvas.addEventListener('blur', () => {
    canvas.dataset.focused = 'false';
  });

  /* --- Кадр -------------------------------------------------------------- */

  let previousTime = performance.now();

  const frame = (now) => {
    const delta = Math.min(48, now - previousTime);
    previousTime = now;

    /* Автоповорот включается, когда с глобусом давно ничего не делали. */
    const idle = now - idleSince > 2200 && !state.dragging;
    const targetSpin = prefersReduced ? 0 : idle ? 0.00022 : 0;

    if (state.dragging) {
      state.spin = 0;
    } else {
      state.spin += (targetSpin - state.spin) * 0.02;
      state.yaw += state.spin * delta;
      state.yaw += state.velocity * delta * 0.06;
      state.velocity *= 0.94;

      if (Math.abs(state.velocity) < 0.00002) state.velocity = 0;

      /* Плавное возвращение наклона к исходному, если курсор ушёл. */
      if (!prefersReduced && now - lastMove > 400) {
        state.targetParallaxYaw *= 0.96;
        state.targetParallaxPitch *= 0.96;
      }
    }

    state.parallaxYaw += (state.targetParallaxYaw - state.parallaxYaw) * 0.06;
    state.parallaxPitch += (state.targetParallaxPitch - state.parallaxPitch) * 0.06;

    const yaw = state.yaw + state.parallaxYaw;
    const pitch = clamp(state.pitch + state.parallaxPitch, -PITCH_LIMIT - 0.2, PITCH_LIMIT + 0.2);

    state.hoverAmount += ((state.hovered === -1 ? 0 : 1) - state.hoverAmount) * 0.12;

    ctx.clearRect(0, 0, width, height);
    drawGrid(yaw, pitch, false);
    drawSphere();
    drawGrid(yaw, pitch, true);

    routes.forEach((route, index) => {
      const progress = prefersReduced ? 0.5 : (now / 3200 + index * 0.37) % 1;
      const highlighted = state.hovered !== -1 && (route.from === nodes[state.hovered] || route.to === nodes[state.hovered]);
      drawRoute(route, yaw, pitch, progress, highlighted);
    });

    nodes.forEach((node, index) => {
      screenPositions[index] = drawNode(node, index, yaw, pitch, now);
    });

    /* Подсказка едет за площадкой, пока глобус вращается. */
    if (state.hovered !== -1 && screenPositions[state.hovered] && !tip.hidden) {
      showTip(nodes[state.hovered], screenPositions[state.hovered].x, screenPositions[state.hovered].y);
    }

    requestAnimationFrame(frame);
  };

  resize();
  requestAnimationFrame(frame);

  /* Состояние наружу: по нему проверка в браузере убеждается, что глобус
     действительно вращается и реагирует на наведение. */
  canvas.globeState = state;

  window.addEventListener('resize', () => {
    resize();
  });
}
