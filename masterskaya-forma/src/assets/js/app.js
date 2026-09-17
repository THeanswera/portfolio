/** Общий сценарий страниц: меню, появление блоков, cookie, заявки, конфигуратор. */
import { initTools } from './tool.js';
import { initForms } from './forms.js';

const COOKIE_KEY = 'forma-cookie';

/* --- мобильное меню --- */

function initMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

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

  window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/* --- появление блоков при скролле --- */

const REVEAL = '.head, .card, .promise, .step, .cta, .facts__item, .faq details, .split__aside, .note-line';

function initReveal() {
  const targets = [...document.querySelectorAll(REVEAL)];
  if (targets.length === 0) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((node) => node.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );

  targets.forEach((node) => {
    const siblings = [...(node.parentElement?.children ?? [])].filter((child) => child.matches(REVEAL));
    node.style.transitionDelay = `${Math.min(siblings.indexOf(node), 4) * 70}ms`;
    observer.observe(node);
  });
}

/* --- cookie --- */

function initCookie() {
  const banner = document.querySelector('[data-cookie]');
  if (!banner) return;

  const read = () => {
    try {
      return window.localStorage.getItem(COOKIE_KEY);
    } catch {
      return 'blocked';
    }
  };

  if (!read()) banner.hidden = false;

  banner.querySelectorAll('[data-cookie-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        window.localStorage.setItem(COOKIE_KEY, button.dataset.cookieChoice);
      } catch {
        /* приватный режим — просто закрываем уведомление */
      }
      banner.hidden = true;
    });
  });

  document.querySelectorAll('[data-cookie-open]').forEach((button) => {
    button.addEventListener('click', () => {
      banner.hidden = false;
    });
  });
}

/* --- фильтр каталога --- */

function initFilters() {
  const group = document.querySelector('.filters');
  if (!group) return;

  const buttons = [...group.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-style]')];
  const empty = document.querySelector('[data-empty]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));

      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.style === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (empty) empty.hidden = visible > 0;
    });
  });
}

document.documentElement.classList.add('js');
initMenu();
initReveal();
initCookie();
initFilters();
initTools();
initForms();
