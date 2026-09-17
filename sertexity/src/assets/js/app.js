/**
 * Общий сценарий: шапка, мобильное меню, появление блоков, бегущая строка,
 * терминал с логом сделок и счётчики.
 */
import { data } from './data.js';
import { initGlobe } from './globe.js';
import { initCalculator } from './calculator-page.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rub = (value, digits = 2) => value.toFixed(digits);

/* --- Шапка: тень при скролле и полоса прогресса --- */
const header = document.querySelector('[data-header]');
const progress = document.querySelector('[data-scroll-progress]');

const onScroll = () => {
  if (header) header.dataset.scrolled = window.scrollY > 10 ? 'true' : 'false';

  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    progress.style.setProperty('--progress', String(Math.min(1, Math.max(0, value))));
  }
};

onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

/* --- Мобильное меню --- */
const burger = document.querySelector('.burger');
const menu = document.getElementById('mobile-menu');

if (burger && menu) {
  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

/* --- Появление блоков --- */
const revealNodes = [...document.querySelectorAll('[data-reveal]')];

if (revealNodes.length) {
  if (!('IntersectionObserver' in window) || prefersReduced) {
    revealNodes.forEach((node) => node.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      /* Порог 0 у высоких блоков: панель выше экрана и при 5 % не срабатывала. */
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    revealNodes.forEach((node) => {
      const siblings = [...(node.parentElement?.children ?? [])].filter((child) => child.hasAttribute('data-reveal'));
      node.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(node), 4) * 70}ms`);
      observer.observe(node);
    });
  }
}

/* --- Бегущая строка котировок --- */
const ticker = document.querySelector('[data-ticker]');

if (ticker) {
  const basePrice = {
    'BTC/USDT': 67420,
    'ETH/USDT': 3285,
    'SOL/USDT': 168.4,
    'TON/USDT': 7.42,
    'XRP/USDT': 0.612,
    'AVAX/USDT': 36.8,
  };

  const build = () => {
    const items = data.pairs.map((item) => {
      const base = basePrice[item.pair] ?? 100;
      const jitter = (Math.random() - 0.5) * 0.004;
      const price = base * (1 + jitter);
      const delta = item.spread;

      return `<span class="ticker__item">
        <span class="ticker__pair">${item.pair}</span>
        <span class="ticker__price">${price.toLocaleString('en-US', { maximumFractionDigits: price < 1 ? 4 : 1 })}</span>
        <span class="ticker__delta">+${rub(delta)} %</span>
      </span>`;
    });

    /* Дублируем ленту, чтобы анимация шла без разрыва. */
    ticker.innerHTML = items.join('') + items.join('');
  };

  build();
  if (!prefersReduced) window.setInterval(build, 5000);
}

/* --- Терминал с логом сделок --- */
const terminal = document.querySelector('[data-terminal]');

if (terminal) {
  const venues = data.exchanges.map((item) => item.name);
  const pairs = data.pairs.map((item) => item.pair);
  const lines = [];

  const stamp = () =>
    new Date().toISOString().slice(11, 19);

  const pushLine = () => {
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const from = venues[Math.floor(Math.random() * venues.length)];
    let to = venues[Math.floor(Math.random() * venues.length)];
    if (to === from) to = venues[(venues.indexOf(from) + 1) % venues.length];

    const roll = Math.random();
    let kind = 'up';
    let text = '';

    if (roll < 0.62) {
      const spread = (0.3 + Math.random() * 0.45).toFixed(2);
      text = `route closed  ${pair}  ${from} → ${to}  spread +${spread} %  filled 412 ms`;
    } else if (roll < 0.85) {
      const spread = (0.12 + Math.random() * 0.15).toFixed(2);
      kind = 'warn';
      text = `signal skipped ${pair}  ${from} → ${to}  spread ${spread} % below fee threshold`;
    } else {
      const late = 900 + Math.floor(Math.random() * 400);
      kind = 'warn';
      text = `leg unwound   ${pair}  ${from} → ${to}  timeout ${late} ms, position closed`;
    }

    lines.push({ time: stamp(), text, kind });
    if (lines.length > 8) lines.shift();

    terminal.innerHTML = lines
      .map(
        (line) =>
          `<span class="terminal__line terminal__line--${line.kind}"><span class="terminal__time">${line.time}</span><span>${line.text}</span></span>`,
      )
      .join('');
  };

  for (let index = 0; index < 7; index += 1) pushLine();
  if (!prefersReduced) window.setInterval(pushLine, 2200);
}

/* --- Счётчики --- */
const counters = [...document.querySelectorAll('[data-counter]')];

if (counters.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const node = entry.target;
        const target = Number(node.dataset.counter);
        const suffix = node.dataset.suffix ?? '';
        const digits = Number(node.dataset.digits ?? 0);
        observer.unobserve(node);

        if (prefersReduced || !Number.isFinite(target)) {
          node.textContent = target.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + suffix;
          return;
        }

        const start = performance.now();
        const duration = 1100;

        const tick = (now) => {
          const progressValue = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - progressValue) ** 3;
          const value = target * eased;
          node.textContent =
            value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) + suffix;
          if (progressValue < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 },
  );

  counters.forEach((node) => observer.observe(node));
}

/* --- Глобус --- */
initGlobe(document.querySelector('[data-globe]'));

/* --- Калькулятор доходности --- */
initCalculator(document.querySelector('[data-calc]'));

/* --- Статус формы: обработчик возвращает ?status= --- */
const formStatus = document.querySelector('[data-form-status]');

if (formStatus) {
  const status = new URLSearchParams(window.location.search).get('status');

  if (status && status !== 'sent') {
    formStatus.hidden = false;
    formStatus.textContent =
      status === 'spam'
        ? 'The request was filtered as spam. If this is a mistake, write to the email on the right.'
        : 'The request was not sent: check the name, email and consent checkbox.';
  }
}
