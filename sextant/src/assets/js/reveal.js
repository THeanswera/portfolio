/**
 * Появление блоков при прокрутке. Наблюдатель один на страницу и живёт
 * вне React-подобных циклов, поэтому блоки, добавленные позже, тоже
 * получают класс is-in.
 */
let observer = null;
let fallback = false;

const show = (node) => node.classList.add('is-in');

export function initReveal(root = document) {
  if (fallback) {
    root.querySelectorAll('[data-reveal]').forEach(show);
    return;
  }

  if (!('IntersectionObserver' in window)) {
    fallback = true;
    root.querySelectorAll('[data-reveal]').forEach(show);
    return;
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      /* Порог 0: высокие блоки выше экрана и при большем пороге не срабатывают. */
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );
  }

  const nodes = root.querySelectorAll('[data-reveal]:not(.is-in)');
  nodes.forEach((node) => {
    const siblings = [...(node.parentElement?.children ?? [])].filter((child) => child.hasAttribute('data-reveal'));
    node.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(node), 5) * 70}ms`);
    observer.observe(node);
  });
}

/** Раскрыть всё сразу: нужно проверкам и съёмке скриншотов. */
export const REVEAL_ALL = `document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-in'))`;
