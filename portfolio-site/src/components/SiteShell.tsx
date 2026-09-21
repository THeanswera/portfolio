import type { ReactNode } from 'react';
import { FloatingActions, ScrollProgress } from './Chrome';
import { CookieBanner, COOKIE_KEY } from './CookieBanner';
import type { CookieChoice } from './CookieBanner';
import { Footer } from './Footer';
import { Header } from './Header';

function readCookieChoice(): CookieChoice | null {
  try {
    const value = window.localStorage.getItem(COOKIE_KEY);
    return value === 'all' || value === 'necessary' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Общая оболочка главной страницы: пропуск к содержанию, зерно, шапка, главный
 * блок, подвал. Вынесена отдельно, потому что главную рендерят два места —
 * браузер и сборка статических страниц.
 */
export function SiteShell({
  children,
  cookieOpen,
  onCookieDecide,
}: {
  children: ReactNode;
  cookieOpen: boolean;
  onCookieDecide: (choice: CookieChoice) => void;
}) {
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
      <Header />

      <main id="main">{children}</main>

      <Footer />
      <FloatingActions lifted={cookieOpen} />
      {cookieOpen && <CookieBanner onDecide={onCookieDecide} />}
    </>
  );
}

/** Начальное состояние уведомления о cookie: в сборке читаем то же хранилище. */
export function initialCookieOpen(): boolean {
  if (typeof window === 'undefined') return false;
  return readCookieChoice() === null;
}

export { COOKIE_KEY };
export type { CookieChoice };
