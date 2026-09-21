import { Check, Info } from 'lucide-react';
import { formats, terms } from '../data/formats';
import { Reveal } from '../lib/reveal';
import { SectionHead } from './Services';
import { homeUrl } from '../lib/links';

/**
 * Рамки работы: что входит, что нужно для старта и как решается вопрос цены.
 * Блок отвечает на вопросы «сколько», «за какой срок» и «что входит», которые
 * до этого приходилось выяснять в переписке.
 */
export function Formats() {
  return (
    <section id="formats" className="section bg-paper">
      <div className="container-x">
        <Reveal>
          <SectionHead
            index="03 / 06"
            label="Форматы и условия"
            title="Три формата работы и понятные условия"
            text="Ниже — состав работ по каждому формату, что понадобится от вас и как решается вопрос цены. Конкретную сумму называю после разбора задачи: она зависит от объёма, а не от прайса на глаз."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {formats.map((format, index) => (
            <Reveal key={format.id} delay={(index % 3) * 60}>
              <article className="sheet flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <h3 className="font-display text-2xl font-bold text-ink">{format.title}</h3>
                  <span className="index-num">{format.index}</span>
                </div>

                <p className="mt-5 text-[14.5px] leading-relaxed text-ink-soft">{format.bestFor}</p>

                <p className="label-mono mt-6">Что входит</p>
                <ul className="mt-3 space-y-2.5">
                  {format.includes.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="label-mono mt-6">Что нужно от вас</p>
                <ul className="mt-3 space-y-2">
                  {format.need.map((item) => (
                    <li key={item} className="text-[14px] leading-relaxed text-ink-soft">
                      — {item}
                    </li>
                  ))}
                </ul>

                <p className="label-mono mt-6 border-t border-line pt-4 leading-relaxed">{format.term}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <div className="mt-12 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <p className="label-mono">Условия</p>
              <h3 className="font-display mt-4 text-2xl font-bold text-ink sm:text-3xl">
                Что обсуждаем до старта
              </h3>
              <p className="measure mt-4 text-[15px] leading-relaxed text-ink-soft">
                Цены, сроки и порядок оплаты согласуем до начала работы. Ниже — общие правила, которые
                не меняются от проекта к проекту.
              </p>
              <a href={homeUrl('contact')} className="btn btn-primary mt-6">
                Обсудить задачу
              </a>
            </div>

            <dl className="grid gap-6 sm:grid-cols-2">
              {terms.map((item) => (
                <div key={item.title}>
                  <dt className="font-display text-lg font-bold text-ink">{item.title}</dt>
                  <dd className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="note-strip mt-10">
            <Info className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
              Ориентир по бюджету назову после разбора задачи: он зависит от числа страниц, механик и
              готовности материалов. Обещать рост продаж или сроки окупаемости не буду — это не то,
              что можно гарантировать заранее.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
