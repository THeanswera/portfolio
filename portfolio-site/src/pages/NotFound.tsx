import { ArrowLeft, ArrowUpRight, Mail, Search, Send } from 'lucide-react';
import { site } from '../data/site';
import { caseUrl, homeUrl, privacyUrl } from '../lib/links';
import { works } from '../data/site';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

/**
 * Страница 404. Прежний ответ сервера весил 769 404 байта — это готовая
 * страница хостинга с чужими скриптами. Здесь только ссылки назад и контакты.
 */
export function NotFoundPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-[12px] focus:tracking-widest focus:text-paper focus:uppercase"
      >
        Перейти к содержанию
      </a>

      <div className="grain" aria-hidden="true" />
      <Header onHome={false} />

      <main id="main" className="pt-24 md:pt-32">
        <section className="section">
          <div className="container-x">
            <p className="label-mono flex items-center gap-3">
              <Search className="size-4 text-accent" aria-hidden="true" />
              Ошибка 404
            </p>
            <h1 className="font-display mt-5 text-[38px] leading-[1.02] font-bold text-ink sm:text-6xl">
              Такой страницы нет
            </h1>
            <p className="measure mt-6 text-[17px] leading-relaxed text-ink-soft">
              Адрес устарел или в ссылке опечатка. Ниже — рабочие разделы: список работ, форматы
              работы и способы связаться. Если вы пришли по ссылке из поиска, возможно, страница
              переехала: у каждого проекта теперь свой адрес вида /cases/&lt;проект&gt;/.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href={homeUrl()} className="btn btn-primary">
                <ArrowLeft className="size-4" aria-hidden="true" />
                На главную
              </a>
              <a href={homeUrl('works')} className="btn btn-ghost">
                К работам
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="section section-tight bg-paper-2">
          <div className="container-x">
            <p className="label-mono">Кейсы</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {works
                .filter((work) => work.published)
                .map((work) => (
                  <li key={work.id}>
                    <a
                      href={caseUrl(work.id)}
                      className="link-draw inline-flex min-h-9 items-center gap-2 text-[15px] text-ink-soft hover:text-ink"
                    >
                      {work.title}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
            </ul>

            <p className="label-mono mt-10">Связаться</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={site.telegram}
                target="_blank"
                rel="noreferrer"
                className="link-draw font-mono text-[13px]"
              >
                <Send className="mr-1.5 inline size-3.5" aria-hidden="true" />
                {site.telegramHandle}
              </a>
              <a href={`mailto:${site.email}`} className="link-draw font-mono text-[13px]">
                <Mail className="mr-1.5 inline size-3.5" aria-hidden="true" />
                {site.email}
              </a>
              <a href={privacyUrl()} className="link-draw font-mono text-[13px]">
                Политика конфиденциальности
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
