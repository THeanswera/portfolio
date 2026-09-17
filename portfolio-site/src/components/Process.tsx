import { useEffect, useRef, useState } from 'react';
import { processSteps } from '../data/site';
import { Reveal } from '../lib/reveal';
import { SectionHead } from './Services';

export function Process() {
  const [active, setActive] = useState(0);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = itemsRef.current.filter((node): node is HTMLLIElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = nodes.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setActive(index);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" className="section">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionHead
                index="03 / 05"
                label="Процесс"
                title="Как проходит работа"
                text="Пять шагов без технического тумана: вы всегда знаете, что происходит сейчас и что будет дальше."
              />
            </Reveal>

            <Reveal delay={80}>
              <div
                className="sheet mt-9 p-5"
                style={{ boxShadow: '8px 8px 0 0 var(--color-ink)' }}
              >
                <p className="label-mono text-accent">Активный шаг</p>
                <p className="font-display mt-3 text-2xl leading-tight font-bold text-ink">
                  {processSteps[active]?.index} · {processSteps[active]?.title}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  {processSteps[active]?.detail}
                </p>
              </div>
            </Reveal>
          </div>

          <ol className="border-t-2 border-ink">
            {processSteps.map((step, index) => {
              const isActive = index === active;
              return (
                <li
                  key={step.index}
                  ref={(node) => {
                    itemsRef.current[index] = node;
                  }}
                  className={`grid gap-x-6 gap-y-3 border-b border-line px-1 py-7 transition-colors duration-300 md:grid-cols-[70px_1fr] ${
                    isActive ? 'bg-paper-2' : ''
                  }`}
                >
                  <span
                    className={`font-mono text-[12px] tracking-[0.12em] transition-colors duration-300 ${
                      isActive ? 'text-accent' : 'text-ink-soft'
                    }`}
                  >
                    {step.index}
                  </span>

                  <div>
                    <h3
                      className={`font-display text-2xl leading-tight font-bold transition-colors duration-300 md:text-[28px] ${
                        isActive ? 'text-ink' : 'text-ink/65'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                      {step.text}
                    </p>

                    <div
                      className={`grid transition-all duration-500 ease-out ${
                        isActive ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <p className="overflow-hidden text-[14px] leading-relaxed text-ink-soft/85">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
