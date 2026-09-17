import { useEffect } from 'react';

/**
 * Анимирует числовые показатели с атрибутом data-counter при попадании в вид.
 * Итоговое значение берётся из data-value, суффикс — из data-suffix.
 */
export function useCounters() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-counter]'));
    if (nodes.length === 0) return;

    const finalize = (element: HTMLElement) => {
      element.textContent = `${element.dataset.value ?? ''}${element.dataset.suffix ?? ''}`;
    };

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodes.forEach(finalize);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);

          const target = Number(element.dataset.value ?? 0);
          const suffix = element.dataset.suffix ?? '';
          const duration = 900;
          const start = performance.now();

          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - (1 - progress) ** 3;
            element.textContent = `${Math.round(target * eased)}${suffix}`;
            if (progress < 1) window.requestAnimationFrame(tick);
          };

          window.requestAnimationFrame(tick);
        });
      },
      { threshold: 0.35 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}
