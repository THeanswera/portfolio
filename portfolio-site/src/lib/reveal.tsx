import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Плавное появление элементов с атрибутом data-reveal при попадании в вид.
 *
 * Наблюдатель один на страницу и живёт вне React: так блоки, отрисованные позже
 * (страница кейса, ленивые секции), всё равно получают класс is-visible. Раньше
 * хук вызывался только в App.tsx, и на странице кейса все секции с data-reveal
 * оставались с opacity: 0 — выглядело как пустые провалы вместо текста.
 */
let started = false;
let observer: IntersectionObserver | null = null;

function revealNow(node: HTMLElement) {
  node.classList.add('is-visible');
  observer?.unobserve(node);
}

function watch(node: Element) {
  if (!(node instanceof HTMLElement) || !node.hasAttribute('data-reveal')) return;
  if (observer) observer.observe(node);
  else revealNow(node);
}

export function initReveal() {
  if (started || typeof window === 'undefined') return;
  started = true;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduced) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => node.classList.add('is-visible'));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) revealNow(entry.target as HTMLElement);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
  );

  const scan = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach(watch);
  scan();

  // React дорисовывает разметку после первого кадра — подхватываем новые блоки.
  const mutations = new MutationObserver(scan);
  mutations.observe(document.documentElement, { childList: true, subtree: true });
}

export function useRevealOnScroll() {
  useEffect(() => {
    initReveal();
  }, []);
}

/** Текущая позиция скролла страницы в пикселях (для прогресса чтения и шапки). */
export function useScrollPosition() {
  const [state, setState] = useStateSafe({ y: 0, progress: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setState({
        y: window.scrollY,
        progress: max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0,
      });
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}

// Небольшая обёртка, чтобы не тянуть useState в каждый вызов хука выше.
import { useState } from 'react';
function useStateSafe<T>(initial: T) {
  return useState<T>(initial);
}

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
};

export function Reveal({ children, delay = 0, className, id }: RevealProps) {
  return (
    <div
      id={id}
      data-reveal
      className={className}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
