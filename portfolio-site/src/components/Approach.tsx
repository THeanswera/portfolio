import { reasons, stack } from '../data/site';
import { Reveal } from '../lib/reveal';
import { Marquee } from './Marquee';
import { SectionHead } from './Services';

export function Approach() {
  return (
    <section id="approach" className="section bg-paper-2 pb-0">
      <div className="container-x">
        <Reveal>
          <SectionHead
            index="05 / 06"
            label="Подход"
            title="Почему со мной спокойно"
            text="Шесть причин, по которым заказчики возвращаются с новыми задачами вместо поиска нового исполнителя."
          />
        </Reveal>

        <div className="mt-14 grid gap-x-12 md:grid-cols-2">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 40}>
              <article className="border-t border-ink py-6">
                <div className="flex items-baseline gap-4">
                  <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-xl leading-tight font-bold text-ink md:text-[22px]">
                    {reason.title}
                  </h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft md:pl-10">
                  {reason.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <Reveal>
          <div className="container-x mb-5">
            <p className="label-mono flex items-center gap-3">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              Стек, с которым работаю
            </p>
          </div>
        </Reveal>
        <div className="border-y-2 border-ink bg-ink py-4 text-paper">
          <Marquee
            items={stack}
            slow
            className="py-1"
            itemClassName="font-mono text-[12px] tracking-[0.16em] uppercase"
          />
        </div>
      </div>
    </section>
  );
}
