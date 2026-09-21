import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { site } from '../data/site';
import { homeUrl } from '../lib/links';
import { Logo } from './Logo';

const sections = [
  { hash: 'services', label: 'Услуги', index: '01' },
  { hash: 'works', label: 'Работы', index: '02' },
  { hash: 'formats', label: 'Форматы', index: '03' },
  { hash: 'process', label: 'Процесс', index: '04' },
  { hash: 'approach', label: 'Подход', index: '05' },
  { hash: 'contact', label: 'Контакты', index: '06' },
];

/**
 * Меню ведёт к разделам главной. На главной это якоря текущего документа, на
 * остальных страницах — адреса главной целиком: иначе пункт менял бы хеш и
 * ничего не находил, потому что таких секций на странице кейса нет.
 */
function menuLinks(onHome: boolean) {
  return sections.map((section) => ({
    ...section,
    href: onHome ? `#${section.hash}` : homeUrl(section.hash),
  }));
}

export function Header({ onHome = true }: { onHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const links = menuLinks(onHome);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-ink/15 bg-paper/90 backdrop-blur-md' : 'border-transparent'
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between md:h-[80px]">
        <Logo />

        <nav aria-label="Основная навигация" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
              <li key={link.hash}>
                <a
                  href={link.href}
                  className="link-draw font-mono text-[11.5px] tracking-[0.12em] text-ink uppercase"
                >
                  <span className="text-accent">{link.index}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.telegram}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary hidden md:inline-flex"
          >
            Обсудить проект
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            className="grid size-11 place-items-center border border-ink text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-ink/15 bg-paper lg:hidden"
      >
        <nav aria-label="Мобильная навигация" className="container-x py-6">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.hash} className="border-b border-line last:border-0">
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-4"
                >
                  <span className="index-num">{link.index}</span>
                  <span className="font-display text-3xl font-bold text-ink">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={site.telegram}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary mt-6 w-full"
            onClick={() => setOpen(false)}
          >
            Написать в Telegram
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="label-mono mt-4">{site.telegramHandle}</p>
        </nav>
      </div>
    </header>
  );
}
