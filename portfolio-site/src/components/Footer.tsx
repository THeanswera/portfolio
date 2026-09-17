import { Mail, Send } from 'lucide-react';
import { legal, site } from '../data/site';
import { Logo } from './Logo';

const nav = [
  { href: '#services', label: 'Услуги' },
  { href: '#works', label: 'Работы' },
  { href: '#process', label: 'Процесс' },
  { href: '#approach', label: 'Подход' },
  { href: '#contact', label: 'Контакты' },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper">
      <div className="container-x py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
              Верстка и разработка сайтов: лендинги, корпоративные сайты, темы WordPress. От макета
              до выкладки на хостинг — с проверкой на реальных экранах.
            </p>
          </div>

          <nav aria-label="Навигация в подвале">
            <p className="label-mono">Разделы</p>
            <ul className="mt-4 space-y-2">
              {nav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="link-draw inline-flex min-h-7 items-center text-[15px] text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label-mono">Связаться</p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="link-draw inline-flex min-h-7 items-center gap-2 text-[15px] text-ink-soft transition-colors hover:text-ink"
                >
                  <Send className="size-4" aria-hidden="true" />
                  {site.telegramHandle}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="link-draw inline-flex min-h-7 items-center gap-2 text-[15px] text-ink-soft transition-colors hover:text-ink"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
            </ul>
            <p className="label-mono mt-5 leading-relaxed">{site.location}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="label-mono">
            © {new Date().getFullYear()} {site.name} · {legal.status} · ИНН {legal.inn}
          </p>
          <a
            href="privacy.html"
            className="link-draw label-mono inline-flex min-h-7 items-center"
          >
            Политика конфиденциальности
          </a>
          <p className="label-mono">Сверстано вручную: HTML, CSS и внимание к деталям</p>
        </div>
      </div>
    </footer>
  );
}
