import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ribbon, site, spec } from '../data/site';
import { Counter, Marquee } from './Marquee';
import { Reveal } from '../lib/reveal';

export function Hero() {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sheetRef.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 10;
      node.style.setProperty('--sheet-x', `${x}px`);
      node.style.setProperty('--sheet-y', `${y}px`);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-0 md:pt-36">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-16">
          <div>
            <Reveal>
              <p className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="h-px w-10 bg-accent" aria-hidden="true" />
                Frontend developer
                <span className="text-line">/</span>
                HTML · CSS · JS · WordPress
              </p>
            </Reveal>

            <h1
              className="wipe mt-6 text-[42px] leading-[0.98] font-extrabold sm:text-6xl lg:text-[76px]"
              style={{ animationDelay: '140ms' }}
            >
              Сайты, которые{' '}
              <em className="font-display text-accent italic">не ломаются</em> на телефоне
            </h1>

            <Reveal delay={140}>
              <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink-soft">
                Делаю сайты под ключ — по готовому макету, по техническому заданию или по вашей идее.
                Собираю структуру, верстаю, проверяю на телефоне, планшете и большом экране,
                выкладываю на хостинг и остаюсь на связи после запуска.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Обсудить проект
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <a href="#works" className="btn btn-ghost w-full sm:w-auto">
                  Смотреть работы
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <p className="label-mono mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
                Отвечу лично в течение дня
                <span className="text-line" aria-hidden="true">
                  ·
                </span>
                Работаю и по макету, и по ТЗ
              </p>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="float-slow">
              <div
                ref={sheetRef}
                className="sheet sheet-hover relative p-6 sm:p-7"
                style={{
                  transform: 'translate3d(var(--sheet-x, 0px), var(--sheet-y, 0px), 0) rotate(-1deg)',
                  boxShadow: '10px 10px 0 0 var(--color-ink)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="label-mono">Спецификация · 2026</p>
                  <p className="label-mono text-accent">лист 01</p>
                </div>

                <div className="mt-6 divide-y divide-line border-y border-ink">
                  {spec.map((item) => (
                    <div key={item.label} className="flex items-end justify-between gap-4 py-4">
                      <div>
                        <p className="font-display text-lg leading-tight font-bold text-ink">
                          {item.label}
                        </p>
                        <p className="label-mono mt-1 text-[10px]">{item.note}</p>
                      </div>
                      {item.value === null ? (
                        <p className="font-display shrink-0 text-2xl leading-none font-bold text-accent">
                          {item.text}
                        </p>
                      ) : (
                        <p className="font-display text-4xl leading-none font-extrabold text-ink tabular-nums">
                          <Counter value={item.value} suffix={item.suffix} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-end justify-between gap-6">
                  <p className="max-w-[190px] font-mono text-[10.5px] leading-relaxed text-ink-soft">
                    Структура, верстка, адаптив, проверка в браузере и выкладка на хостинг.
                  </p>
                  <span className="stamp shrink-0">проверено в браузере</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-16 border-y-2 border-ink bg-paper-2 md:mt-24">
        <Marquee
          items={[...ribbon]}
          className="py-4"
          itemClassName="font-mono text-[12px] tracking-[0.18em] text-ink uppercase"
          separator="/"
        />
      </div>
    </section>
  );
}
