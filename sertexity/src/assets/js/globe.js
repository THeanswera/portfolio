/**
 * Глобус арбитража: Canvas 2D, ортографическая проекция сферы.
 * Показывает двенадцать площадок и маршруты между ними — те самые,
 * по которым алгоритм ищет расхождение цены. Без внешних библиотек.
 */
import { data } from './data.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initGlobe(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const nodes = data.exchanges.map((item) => ({
    ...item,
    phi: (90 - item.lat) * (Math.PI / 180),
    theta: (item.lon + 180) * (Math.PI / 180),
  }));

  /* Маршруты: пары площадок с заметным расхождением цены. */
  const routes = [
    [0, 1], [0, 7], [1, 5], [2, 4], [3, 8], [4, 6],
    [5, 0], [6, 3], [7, 10], [8, 11], [9, 1], [10, 2],
  ];

  const project = (phi, theta, rotation) => {
    const angle = theta + rotation;
    const x = Math.sin(phi) * Math.cos(angle);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(angle);

    return {
      x: width / 2 + x * (Math.min(width, height) * 0.36),
      y: height / 2 - y * (Math.min(width, height) * 0.36),
      z,
    };
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = host.clientWidth;
    height = host.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /** Дуга между двумя точками сферы: квадратичная кривая через середину. */
  const drawRoute = (from, to, rotation, progress) => {
    const a = project(from.phi, from.theta, rotation);
    const b = project(to.phi, to.theta, rotation);

    if (a.z < -0.15 && b.z < -0.15) return;

    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lift = Math.hypot(dx, dy) * 0.32;
    const cx = mx - dy * 0.22;
    const cy = my + dx * 0.22 - lift;

    const alpha = (0.1 + progress * 0.5) * Math.max(0.15, (a.z + b.z) / 2 + 0.5);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(cx, cy, b.x, b.y);
    ctx.strokeStyle = `rgba(139, 92, 255, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* Пакет данных, бегущий по маршруту. */
    if (progress > 0.05 && progress < 0.95) {
      const t = progress;
      const px = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x;
      const py = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y;

      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(46, 230, 168, ${Math.min(1, alpha * 2.4).toFixed(3)})`;
      ctx.fill();
    }
  };

  const drawNode = (node, rotation, time) => {
    const point = project(node.phi, node.theta, rotation);
    if (point.z < 0) return;

    const depth = (point.z + 1) / 2;
    const pulse = 1 + Math.sin(time / 900 + node.lon) * 0.12;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.4 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(46, 230, 168, ${(0.35 + depth * 0.6).toFixed(3)})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.x, point.y, 8 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(46, 230, 168, ${(0.06 + depth * 0.14).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (depth > 0.72) {
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(179, 188, 216, ${(depth * 0.85).toFixed(2)})`;
      ctx.fillText(node.code, point.x + 10, point.y + 4);
    }
  };

  const drawSphere = () => {
    const radius = Math.min(width, height) * 0.36;
    const cx = width / 2;
    const cy = height / 2;

    const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(139, 92, 255, 0.22)');
    gradient.addColorStop(0.6, 'rgba(20, 27, 48, 0.45)');
    gradient.addColorStop(1, 'rgba(5, 7, 13, 0.75)');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* Свечение по контуру: шар читается на тёмном фоне. */
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 92, 255, 0.12)';
    ctx.lineWidth = 6;
    ctx.stroke();
  };

  /** Меридианы и параллели: сетка вращается вместе с шаром. */
  const drawGrid = (rotation) => {
    const radius = Math.min(width, height) * 0.36;
    const cx = width / 2;
    const cy = height / 2;

    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(58, 72, 108, 0.75)';

    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const r = Math.sin(phi) * radius;
      const y = cy - Math.cos(phi) * radius;

      ctx.beginPath();
      ctx.ellipse(cx, y, Math.abs(r), Math.abs(r) * 0.22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let lon = 0; lon < 180; lon += 22.5) {
      const angle = (lon * Math.PI) / 180 + rotation;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(Math.cos(angle)) * radius, radius, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Дополнительные «меридианы» под углом: без них шар выглядит плоским. */
    ctx.strokeStyle = 'rgba(58, 72, 108, 0.45)';

    for (let tilt = -60; tilt <= 60; tilt += 30) {
      const angle = (tilt * Math.PI) / 180;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, Math.abs(Math.cos(angle)) * radius, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  let start = performance.now();

  const frame = (now) => {
    const time = now - start;
    const rotation = prefersReduced ? 0.6 : (time / 22000) % (Math.PI * 2);

    ctx.clearRect(0, 0, width, height);
    drawGrid(rotation);
    drawSphere();

    routes.forEach(([fromIndex, toIndex], index) => {
      const progress = prefersReduced ? 0.5 : ((time / 3200 + index * 0.37) % 1);
      drawRoute(nodes[fromIndex], nodes[toIndex], rotation, progress);
    });

    nodes.forEach((node) => drawNode(node, rotation, time));

    if (!prefersReduced) requestAnimationFrame(frame);
  };

  resize();
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => {
    resize();
    if (prefersReduced) requestAnimationFrame(frame);
  });
}
