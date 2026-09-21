import { ArrowUpRight } from 'lucide-react';
import { site, works } from '../data/site';
import { caseUrl, homeUrl } from '../lib/links';
import { plural } from '../lib/plural';
import { FloatingActions, ScrollProgress } from './Chrome';
import { Footer } from './Footer';
import { Header } from './Header';
import { ScrollFrame } from './ScrollFrame';

/**
 * Каталог кейсов: раньше на /cases/ отвечал общий case.html с экраном
 * «Кейс не найден» и кодом 200 — это soft 404. Теперь адрес ведёт на реальную
 * страницу со списком работ.
 */
export function CaseCatalog() {
  const published = works.filter((work) => work.published);

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
      {/* Меню ведёт к разделам главной: на этой странице их нет. */}
      <Header onHome={false} />

      <main id="main" className="pt-24 md:pt-32">
        <section className="section pb-0">
          <div className="container-x">
            <p className="label-mono">Каталог</p>
            <h1 className="font-display mt-5 text-[38px] leading-[1.02] font-bold text-ink sm:text-6xl">
              Кейсы
            </h1>
            <p className="measure mt-6 text-[17px] leading-relaxed text-ink-soft">
              {published.length} {plural(published.length, 'проект', 'проекта', 'проектов')} с разбором:
              задача, решения, экраны и стек. Демонстрационные проекты помечены на странице кейса —
              вымышленные компании не выдают себя за реальных заказчиков.
            </p>
            <p className="mt-6">
              <a href={homeUrl('works')} className="btn btn-ghost">
                Вернуться на главную
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-x grid gap-12">
            {published.map((work, index) => (
              <article
                key={work.id}
                className="grid gap-8 border-t-2 border-ink pt-8 lg:grid-cols-[1fr_1fr] lg:gap-14"
              >
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                    <p className="label-mono">{work.tag}</p>
                  </div>
                  <h2 className="font-display mt-4 text-[30px] leading-[1.05] font-bold text-ink sm:text-4xl">
                    {work.title}
                  </h2>
                  <p className="label-mono mt-3">{work.titleSuffix}</p>
                  <p className="measure mt-5 text-[15.5px] leading-relaxed text-ink-soft">{work.summary}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a href={caseUrl(work.id)} className="btn btn-primary">
                      Разобрать кейс
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                    {work.urlDown ? (
                      <span className="label-mono inline-flex items-center border border-line px-2 py-1 text-ink-soft">
                        демо недоступно — смотрите разбор
                      </span>
                    ) : (
                      work.url && (
                        <a href={work.url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                          Открыть сайт
                        </a>
                      )
                    )}
                  </div>
                </div>

                <a href={caseUrl(work.id)} aria-label={`Кейс «${work.title}»`} className="block">
                  <ScrollFrame work={work} caption={false} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section bg-ink text-paper">
          <div className="container-x">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Похожая задача?</h2>
            <p className="measure mt-5 text-[16px] leading-relaxed text-paper/70">
              Напишите, что нужно сделать, — предложу структуру, срок и порядок работы. Telegram не
              обязателен, письмо тоже подойдёт.
            </p>
            <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={homeUrl('contact')} className="btn bg-accent text-paper hover:bg-accent-soft">
                Обсудить проект
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a href={`mailto:${site.email}`} className="link-draw font-mono text-[13px]">
                {site.email}
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
