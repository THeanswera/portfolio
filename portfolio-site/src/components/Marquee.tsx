import type { ReactNode } from 'react';

/** Печатная лента: бесконечная строка, повторяющая содержимое дважды. */
export function Marquee({
  items,
  className = '',
  itemClassName = '',
  slow = false,
  separator = '·',
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  slow?: boolean;
  separator?: string;
}) {
  const row = [...items, ...items];

  return (
    <div className={`marquee-wrap overflow-hidden ${className}`}>
      <div className={`marquee ${slow ? 'marquee-slow' : ''}`}>
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className={`flex shrink-0 items-center ${itemClassName}`}>
            <span className="whitespace-nowrap">{item}</span>
            <span className="mx-4 opacity-40 sm:mx-6" aria-hidden="true">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Анимированный счётчик для числовых показателей. */
export function Counter({ value, suffix = '' }: { value: number; suffix?: string }): ReactNode {
  return (
    <span data-counter data-value={value} data-suffix={suffix}>
      0{suffix}
    </span>
  );
}
