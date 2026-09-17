import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/** Плавное появление элементов с атрибутом data-reveal при попадании в вид. */
export function useRevealOnScroll() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduced) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
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
