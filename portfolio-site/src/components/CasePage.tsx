import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Info, Mail, Send, TriangleAlert } from 'lucide-react';
import { site, works } from '../data/site';
import type { Work } from '../data/site';
import { asset } from '../lib/asset';
import { applyPageMeta } from '../lib/meta';
import { caseUrl, catalogUrl, homeUrl } from '../lib/links';
import { Reveal } from '../lib/reveal';
import { FloatingActions, ScrollProgress } from './Chrome';
import { Footer } from './Footer';
import { MessageBuilder } from './MessageBuilder';
import { ScrollFrame } from './ScrollFrame';

const backHref = homeUrl('works');

/**
 * Пометка о демонстрационном проекте. Без неё посетитель принимает вымышленную
 * компанию за реального заказчика и может звонить по демонстрационному номеру.
 */
function DemoNotice({ work }: { work: Work }) {
  if (!work.demo) return null;

  return (
    <p className="note-strip mt-8">
      <TriangleAlert className="size-4 shrink-0 text-accent" aria-hidden="true" />
      <span>
        Демонстрационный проект: компания, адрес, телефон и цены вымышлены. Услуги не оказываются,
        формы не принимают реальные заказы. Сайт показывает, как может быть устроен проект такого
        типа.
      </span>
    </p>
  );
}

/** Предупреждение, если живая ссылка кейса не открывается. */
function DownNotice({ work }: { work: Work }) {
  if (!work.urlDown) return null;

  return (
    <p className="note-strip mt-4">
      <Info className="size-4 shrink-0 text-accent" aria-hidden="true" />
      <span>
        Живая ссылка сейчас не открывается: домен демонстрационного сайта не отвечает. Разбор, экраны
        и описание механик остаются на этой странице.
      </span>
    </p>
  );
}

export function CasePage({ workId }: { workId?: string }) {
  const work = works.find((item) => item.id === workId) ?? null;

  useEffect(() => {
    if (!work) return;
    applyPageMeta({
      title: `${work.title} — ${work.titleSuffix}`,
      description: work.summary,
      canonical: `https://rootlost.ru/cases/${work.slug}/`,
    });
  }, [work]);

  if (!work) return null;

  const message = [
    `Здравствуйте! Меня заинтересовал кейс «${work.title}».`,
    '',
    'Хочу обсудить похожий проект.',
  ].join('\n');

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-[12px] focus:tracking-widest focus:text-paper focus:uppercase"
      >
        Перейти к содержанию
      </a>

      <div className="grain" aria-hidden="true" />
      <ScrollProgress />

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="container-x flex min-h-[68px] items-center gap-4">
          <a href={backHref} className="btn btn-ghost btn-small">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Все работы</span>
            <span className="sm:hidden">Назад</span>
          </a>
          <span className="label-mono ml-auto hidden sm:block">Кейс · {work.year}</span>
          <a
            href={site.telegram}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-small ml-auto sm:ml-0"
          >
            <Send className="size-4" aria-hidden="true" />
            Написать
          </a>
        </div>
      </header>

      <main id="main">
        <section className="section pb-0">
          <div className="container-x">
            <p className="label-mono">{work.tag}</p>
            <h1 className="font-display mt-5 text-[34px] leading-[1.02] font-bold text-ink sm:text-6xl">
              {work.title}
            </h1>
            <p className="label-mono mt-4">{work.titleSuffix}</p>

            <DemoNotice work={work} />
            <DownNotice work={work} />

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
              <p className="measure text-[17px] leading-relaxed text-ink-soft">{work.lead ?? work.summary}</p>
              <div>
                <dl className="case-meta">
                  {work.role && (
                    <div>
                      <dt>Моя роль</dt>
                      <dd>{work.role}</dd>
                    </div>
                  )}
                  {work.timeline && (
                    <div>
                      <dt>Срок</dt>
                      <dd>{work.timeline}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Год</dt>
                    <dd>{work.year}</dd>
                  </div>
                  <div>
                    <dt>Тип проекта</dt>
                    <dd>{work.demo ? 'Демонстрационный сайт' : 'Коммерческий проект'}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  {work.url && !work.urlDown && (
                    <a href={work.url} target="_blank" rel="noreferrer" className="btn btn-primary">
                      Открыть сайт
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                  <a href="#case-lead" className="btn btn-ghost">
                    Хочу похожий
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10 pb-14 sm:pt-14">
          <div className="container-x">
            <Reveal>
              <ScrollFrame work={work} size="tall" />
            </Reveal>

            {work.facts && (
              <ul className="case-facts mt-10">
                {work.facts.map((fact) => (
                  <li key={fact.label}>
                    <strong>{fact.value}</strong>
                    <span>{fact.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="section bg-paper-2">
          <div className="container-x">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
                <div>
                  <p className="label-mono">Задача</p>
                  <h2 className="font-display mt-4 text-2xl font-bold text-ink sm:text-4xl">
                    Что нужно было сделать
                  </h2>
                  <p className="measure mt-5 text-[16px] leading-relaxed text-ink-soft">{work.task}</p>
                </div>
                <div>
                  <p className="label-mono">Что сделано</p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {work.built.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {work.blocks && (
          <section className="section">
            <div className="container-x">
              <Reveal>
                <p className="label-mono">Разбор</p>
                <h2 className="font-display mt-4 text-2xl font-bold text-ink sm:text-4xl">
                  Что решали и почему так
                </h2>
              </Reveal>

              <div className="mt-10 grid gap-10">
                {work.blocks.map((block, index) => (
                  <Reveal key={block.title} delay={(index % 3) * 60}>
                    <article className="case-block">
                      <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">{block.title}</h3>
                        <p className="mt-4 max-w-[62ch] text-[15.5px] leading-relaxed text-ink-soft">
                          {block.text}
                        </p>
                        {block.shot && (
                          <figure className="mt-6">
                            <img
                              src={asset(block.shot)}
                              alt={block.caption ?? block.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full border border-ink"
                            />
                            {block.caption && <figcaption className="label-mono mt-3">{block.caption}</figcaption>}
                          </figure>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {work.screens && work.screens.length > 0 && (
          <section className="section section-tight bg-paper-2">
            <div className="container-x">
              <Reveal>
                <p className="label-mono">Экраны</p>
                <h2 className="font-display mt-4 text-2xl font-bold text-ink sm:text-4xl">
                  Как это выглядит вживую
                </h2>
              </Reveal>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {work.screens.map((screen, index) => (
                  <Reveal key={screen.src + screen.caption} delay={(index % 2) * 60}>
                    <figure className={screen.kind === 'phone' ? 'case-phone' : ''}>
                      <img
                        src={asset(screen.src)}
                        alt={screen.caption}
                        loading="lazy"
                        decoding="async"
                        className="w-full border border-ink"
                      />
                      <figcaption className="label-mono mt-3">{screen.caption}</figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {work.offers && (
          <section className="section section-tight section-join">
            <div className="container-x">
              <Reveal>
                <p className="label-mono">Что из этого можно заказать</p>
                <h2 className="font-display mt-4 text-2xl font-bold text-ink sm:text-4xl">
                  Это переносится на ваш бизнес
                </h2>
                <p className="measure mt-5 text-[16px] leading-relaxed text-ink-soft">
                  Ниже — не «услуги вообще», а конкретные вещи из этого кейса, которые можно повторить
                  у вас: от отдельной механики до сайта целиком.
                </p>
              </Reveal>

              <ul className="case-offers mt-10">
                {work.offers.map((offer) => (
                  <li key={offer}>
                    <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{offer}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <span className="label-mono">Стек:</span>
                {work.stack.map((item) => (
                  <span key={item} className="tag-mono">
                    {item}
                  </span>
                ))}
              </div>

              <p className="note-strip mt-10">
                <Info className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{work.value}</span>
              </p>
            </div>
          </section>
        )}

        <section className="section section-tight" id="case-lead">
          <div className="container-x grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <Reveal>
              <p className="label-mono">Заявка</p>
              <h2 className="font-display mt-4 text-2xl font-bold text-ink sm:text-4xl">
                Обсудим ваш проект
              </h2>
              <p className="measure mt-5 text-[16px] leading-relaxed text-ink-soft">
                Расскажите, что нужно: лендинг, корпоративный сайт, магазин или калькулятор вроде
                этого конфигуратора. Отвечу, что реально сделать, за какой срок и в каком порядке.
              </p>
              <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a href={site.telegram} target="_blank" rel="noreferrer" className="link-draw font-mono text-[13px]">
                  <Send className="mr-1.5 inline size-3.5" aria-hidden="true" />
                  {site.telegramHandle}
                </a>
                <a href={`mailto:${site.email}`} className="link-draw font-mono text-[13px]">
                  <Mail className="mr-1.5 inline size-3.5" aria-hidden="true" />
                  {site.email}
                </a>
              </p>
              <p className="label-mono mt-5 leading-relaxed">
                Telegram не обязателен: тот же текст можно отправить письмом — кнопка «Написать на
                почту» подставит его в письмо.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <MessageBuilder
                idPrefix="case"
                heading={`Сообщение по кейсу «${work.title}»`}
                note="Скопируйте текст и отправьте его сами — в чат Telegram или письмом. Ничего не уходит автоматически: форма на сайте ничего не отправляет на сервер."
                subject={`Сайт как «${work.title}»`}
                requireConsent
                message={message}
              />
            </Reveal>
          </div>
        </section>

        <section className="section section-tight section-join">
          <div className="container-x">
            <p className="label-mono">Другие работы</p>
            <ul className="mt-6">
              {works
                .filter((item) => item.id !== work.id && item.published)
                .map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={caseUrl(item.id)}
                      className="group grid grid-cols-[46px_1fr] items-baseline gap-x-4 gap-y-2 border-b border-line py-5 md:grid-cols-[64px_1.3fr_1fr_auto] md:items-center md:gap-6"
                    >
                      <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                      <span className="font-display text-[22px] leading-tight font-bold text-ink transition-colors duration-300 group-hover:text-accent md:text-[28px]">
                        {item.title}
                      </span>
                      <span className="label-mono col-start-2 md:col-start-auto">{item.tag}</span>
                      <ArrowUpRight
                        className="col-start-2 size-5 text-ink-soft transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent md:col-start-auto"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
            </ul>

            <p className="mt-8">
              <a href={catalogUrl()} className="btn btn-ghost">
                Все кейсы
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingActions lifted={false} />
    </>
  );
}
