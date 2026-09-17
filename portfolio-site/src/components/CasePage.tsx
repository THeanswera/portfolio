import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Info, Send } from 'lucide-react';
import { site, works } from '../data/site';
import type { Work } from '../data/site';
import { asset } from '../lib/asset';
import { Reveal } from '../lib/reveal';
import { FloatingActions, ScrollProgress } from './Chrome';
import { Footer } from './Footer';
import { ScrollFrame } from './ScrollFrame';

const backHref = './index.html#works';

function LeadForm({ work }: { work: Work }) {
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);

  const message = `Здравствуйте! Хочу сайт, как кейс «${work.title}». Мой контакт: ${contact.trim()}`;

  const send = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* буфер обмена может быть недоступен — текст всё равно уйдёт в почту */
    }
    setSent(true);
    window.open(site.telegram, '_blank', 'noopener,noreferrer');
  };

  return (
    <form
      className="sheet p-6 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (!contact.trim()) return;
        void send();
      }}
    >
      <p className="label-mono">Обсудить похожий проект</p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Опишу, что можно повторить в вашем случае, сколько это займёт и что понадобится от вас.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="case-contact">
          Контакт для связи
        </label>
        <input
          id="case-contact"
          name="contact"
          type="text"
          required
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="Telegram, телефон или e-mail"
          className="field flex-1"
        />
        <button type="submit" className="btn btn-primary shrink-0">
          Отправить
        </button>
      </div>

      <p className="label-mono mt-4 leading-relaxed">
        Отвечу лично в течение дня. Отправляя заявку, вы соглашаетесь с{' '}
        <a href="./privacy.html" target="_blank" rel="noreferrer" className="link-draw text-accent normal-case">
          политикой конфиденциальности
        </a>
        .
      </p>

      {sent && (
        <p className="mt-4 text-[13px] leading-relaxed text-accent">
          Заявка скопирована — вставьте её в открывшийся чат Telegram. Или напишите на{' '}
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(`Сайт как «${work.title}»`)}&body=${encodeURIComponent(message)}`}
            className="link-draw"
          >
            {site.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}

function NotFound() {
  return (
    <section className="section">
      <div className="container-x">
        <p className="label-mono">Кейс не найден</p>
        <h1 className="font-display mt-4 text-3xl font-bold text-ink sm:text-5xl">
          Такой работы в портфолио нет
        </h1>
        <p className="measure mt-4 text-ink-soft">
          Возможно, ссылка устарела. Вернитесь к списку работ — там все проекты с описанием.
        </p>
        <a href={backHref} className="btn btn-primary mt-8">
          <ArrowLeft className="size-4" aria-hidden="true" />
          К списку работ
        </a>
      </div>
    </section>
  );
}

export function CasePage() {
  const id = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('work');
  const work = works.find((item) => item.id === id) ?? null;

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
          <span className="label-mono ml-auto hidden sm:block">Кейс · {work?.year ?? ''}</span>
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
        {!work ? (
          <NotFound />
        ) : (
          <>
            <section className="section pb-0">
              <div className="container-x">
                <p className="label-mono">{work.tag}</p>
                <h1 className="font-display mt-5 text-[34px] leading-[1.02] font-bold text-ink sm:text-6xl">
                  {work.title}
                </h1>
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
                    </dl>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {work.url && (
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
              <section className="section bg-paper-2">
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
              <section className="section">
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

            <section className="section bg-paper-2" id="case-lead">
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
                      {site.telegramHandle}
                    </a>
                    <a href={`mailto:${site.email}`} className="link-draw font-mono text-[13px]">
                      {site.email}
                    </a>
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  <LeadForm work={work} />
                </Reveal>
              </div>
            </section>

            <section className="section">
              <div className="container-x">
                <p className="label-mono">Другие работы</p>
                <ul className="mt-6">
                  {works
                    .filter((item) => item.id !== work.id)
                    .map((item, index) => (
                      <li key={item.id}>
                        <a
                          href={`./case.html?work=${item.id}`}
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
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
      <FloatingActions lifted={false} />
    </>
  );
}
