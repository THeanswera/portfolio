/**
 * Общий сценарий сайта: заставка, шапка, мобильное меню, появление блоков,
 * аккордеон, курсор и статус формы. 3D живёт в отдельных сценариях страниц.
 */
import { initReveal } from './reveal.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* --- Заставка ----------------------------------------------------------- */

const preloader = document.querySelector('[data-preloader]');
const preloaderCount = document.querySelector('[data-preloader-count]');
const preloaderLine = document.querySelector('.preloader__line i');

if (preloader) {
  let progress = 0;
  const started = performance.now();
  const MIN_TIME = prefersReduced ? 200 : 900;
  const MAX_TIME = 3200;

  const finish = () => {
    preloader.dataset.done = 'true';
    document.body.dataset.locked = 'false';
    window.setTimeout(() => preloader.remove(), 700);
  };

  const tick = () => {
    const elapsed = performance.now() - started;
    /* Полоса честно ждёт загрузку, но не висит дольше MAX_TIME. */
    const ready = document.readyState === 'complete' ? 100 : 88;
    progress += (ready - progress) * 0.08;

    if (preloaderCount) preloaderCount.textContent = String(Math.round(progress)).padStart(3, '0');
    if (preloaderLine) preloaderLine.style.setProperty('--load', `${progress}%`);

    if ((progress > 99 && elapsed > MIN_TIME) || elapsed > MAX_TIME) {
      finish();
      return;
    }

    requestAnimationFrame(tick);
  };

  document.body.dataset.locked = 'true';
  requestAnimationFrame(tick);
}

/* --- Шапка и полоса прокрутки ------------------------------------------- */

const header = document.querySelector('[data-header]');
const progressBar = document.querySelector('[data-scroll-progress]');

const onScroll = () => {
  if (header) header.dataset.scrolled = window.scrollY > 12 ? 'true' : 'false';

  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progressBar.style.setProperty('--progress', String(value));
  }
};

onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

/* --- Мобильное меню ----------------------------------------------------- */

const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobile-menu');

if (burger && mobileMenu) {
  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.dataset.open = String(open);
    document.body.dataset.locked = String(open);
  };

  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

/* --- Появление блоков --------------------------------------------------- */

initReveal();

/* --- Аккордеон ---------------------------------------------------------- */

document.querySelectorAll('[data-accordion]').forEach((accordion) => {
  accordion.querySelectorAll('.accordion__item').forEach((item) => {
    const button = item.querySelector('.accordion__button');
    const panel = item.querySelector('.accordion__panel');
    if (!button || !panel) return;

    button.addEventListener('click', () => {
      const open = item.dataset.open !== 'true';
      item.dataset.open = String(open);
      button.setAttribute('aria-expanded', String(open));
      panel.style.height = open ? `${panel.firstElementChild.offsetHeight}px` : '0px';
    });
  });
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.accordion__item[data-open="true"] .accordion__panel').forEach((panel) => {
    panel.style.height = `${panel.firstElementChild.offsetHeight}px`;
  });
});

/* --- Курсор ------------------------------------------------------------- */

if (finePointer && !prefersReduced) {
  const cursor = document.querySelector('[data-cursor]');

  if (cursor) {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let currentX = x;
    let currentY = y;

    window.addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.dataset.visible = 'true';

      const hot = event.target.closest('a, button, .parts__item, .chip, canvas');
      cursor.dataset.hot = hot ? 'true' : 'false';
    });

    window.addEventListener('pointerleave', () => {
      cursor.dataset.visible = 'false';
    });

    const follow = () => {
      currentX += (x - currentX) * 0.18;
      currentY += (y - currentY) * 0.18;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(follow);
    };

    requestAnimationFrame(follow);
  }
}

/* --- Магнитные кнопки --------------------------------------------------- */

if (finePointer && !prefersReduced) {
  document.querySelectorAll('.btn--primary').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
      button.style.transform = `translate(${dx * 6}px, ${dy * 4}px)`;
    });

    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}

/* --- Статус формы: обработчик возвращает ?status= ----------------------- */

const formStatus = document.querySelector('[data-form-status]');

if (formStatus) {
  const status = new URLSearchParams(window.location.search).get('status');

  if (status && status !== 'sent') {
    formStatus.hidden = false;
    formStatus.textContent =
      status === 'spam'
        ? 'Заявка отфильтрована как спам. Если это ошибка — позвоните в ателье.'
        : 'Заявка не отправлена: проверьте имя, телефон, почту и согласие на обработку данных.';
  }
}
