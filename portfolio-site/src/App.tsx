import { useEffect, useState } from 'react';
import { Approach } from './components/Approach';
import { Contact } from './components/Contact';
import { Formats } from './components/Formats';
import { Hero } from './components/Hero';
import { Process } from './components/Process';
import { Services } from './components/Services';
import { SiteShell } from './components/SiteShell';
import type { CookieChoice } from './components/CookieBanner';
import { COOKIE_KEY } from './components/CookieBanner';
import { Works } from './components/Works';
import { useCounters } from './lib/counters';

/**
 * Главная страница. Отдельным компонентом, потому что её рендерят двое:
 * браузер (src/main.tsx) и сборка статических страниц (scripts/prerender).
 */
export function HomePage() {
  // В статической сборке localStorage недоступен, поэтому уведомление
  // показывается после монтирования: иначе разметка сервера и браузера
  // разошлись бы и React перерисовал бы весь документ.
  const [cookieOpen, setCookieOpen] = useState(false);

  useCounters();

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(COOKIE_KEY);
      if (value !== 'all' && value !== 'necessary') setCookieOpen(true);
    } catch {
      setCookieOpen(true);
    }
  }, []);

  const decideCookie = (choice: CookieChoice) => {
    try {
      window.localStorage.setItem(COOKIE_KEY, choice);
    } catch {
      /* приватный режим — просто скрываем уведомление */
    }
    setCookieOpen(false);
  };

  return (
    <SiteShell cookieOpen={cookieOpen} onCookieDecide={decideCookie}>
      <Hero />
      <Services />
      <Works />
      <Formats />
      <Process />
      <Approach />
      <Contact />
    </SiteShell>
  );
}

export default HomePage;
