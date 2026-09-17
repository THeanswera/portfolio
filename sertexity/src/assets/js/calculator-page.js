/**
 * Калькулятор доходности: пересчёт, график и разбивка по шагам.
 */
import { data } from './data.js';

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const SMALL = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const PROFILES = {
  calm: { rate: 0.004, reserve: 0.4, label: 'Calm' },
  balanced: { rate: 0.005, reserve: 0.2, label: 'Balanced' },
  active: { rate: 0.006, reserve: 0.1, label: 'Active' },
};

const SHARE = (deposit) => (deposit >= 25000 ? 0.1 : deposit >= 1000 ? 0.15 : 0.2);

export function initCalculator(root) {
  if (!root) return;

  const read = () => ({
    deposit: Number(root.querySelector('[data-input="deposit"]')?.value ?? 1000),
    days: Number(root.querySelector('[data-input="days"]')?.value ?? 30),
    compound: Boolean(root.querySelector('[data-input="compound"]')?.checked),
    profile: root.querySelector('[data-profile][aria-pressed="true"]')?.dataset.profile ?? 'balanced',
  });

  const out = (key) => root.querySelector(`[data-out="${key}"]`);
  const canvas = root.querySelector('[data-chart]');
  const ctx = canvas?.getContext('2d');

  /** Ряд значений депозита по дням: с реинвестом — сложный процент. */
  const series = (state) => {
    const profile = PROFILES[state.profile];
    const share = SHARE(state.deposit);
    const points = [];
    let balance = state.deposit;

    for (let day = 0; day <= state.days; day += 1) {
      points.push(balance);
      const profit = balance * profile.rate;
      balance += state.compound ? profit * (1 - share) : 0;
      if (!state.compound) balance = state.deposit;
    }

    return points;
  };

  const drawChart = (points, deposit) => {
    if (!ctx || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...points);
    const min = Math.min(deposit, ...points);
    const scaleY = (value) => height - 8 - ((value - min) / Math.max(1, max - min)) * (height - 20);
    const scaleX = (index) => (index / (points.length - 1 || 1)) * width;

    /* Базовая линия депозита */
    ctx.beginPath();
    ctx.moveTo(0, scaleY(deposit));
    ctx.lineTo(width, scaleY(deposit));
    ctx.strokeStyle = 'rgba(123, 134, 166, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    /* Кривая роста */
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(46, 230, 168, 0.35)');
    gradient.addColorStop(1, 'rgba(46, 230, 168, 0)');

    ctx.beginPath();
    ctx.moveTo(0, scaleY(points[0]));
    points.forEach((value, index) => ctx.lineTo(scaleX(index), scaleY(value)));
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, scaleY(points[0]));
    points.forEach((value, index) => ctx.lineTo(scaleX(index), scaleY(value)));
    ctx.strokeStyle = '#2ee6a8';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const render = () => {
    const state = read();
    const profile = PROFILES[state.profile];
    const share = SHARE(state.deposit);
    const points = series(state);
    const final = points[points.length - 1];

    const grossPerDay = state.deposit * profile.rate;
    const grossProfit = state.compound
      ? final - state.deposit
      : grossPerDay * state.days;
    const platformShare = grossProfit * share;
    const net = grossProfit - platformShare;
    const effectiveRate = state.deposit > 0 ? (net / state.deposit / state.days) * 100 : 0;

    const set = (key, value) => {
      const node = out(key);
      if (node) node.textContent = value;
    };

    set('deposit', MONEY.format(state.deposit));
    set('days', `${state.days} day${state.days === 1 ? '' : 's'}`);
    set('profile', profile.label);
    set('total', MONEY.format(state.deposit + net));
    set('total-note', `in ${state.days} days at ${(profile.rate * 100).toFixed(2)} % per day · reserve ${Math.round(profile.reserve * 100)} %`);
    set('daily', SMALL.format(grossPerDay));
    set('profit', SMALL.format(grossProfit));
    set('share', `− ${SMALL.format(platformShare)} (${Math.round(share * 100)} %)`);
    set('net', SMALL.format(net));
    set('rate', `${effectiveRate.toFixed(3)} % per day`);

    drawChart(points, state.deposit);
  };

  root.querySelectorAll('[data-input]').forEach((input) => {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  });

  root.querySelectorAll('[data-profile]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-profile]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      render();
    });
  });

  window.addEventListener('resize', render);
  render();
}

/* Ссылка на данные оставлена для будущих профилей: пары из общего модуля. */
export const calculatorMeta = {
  pairs: data.pairs.length,
};
