import { useState } from 'react';
import { Approach } from './components/Approach';
import { FloatingActions, ScrollProgress } from './components/Chrome';
import { Contact } from './components/Contact';
import { CookieBanner, COOKIE_KEY } from './components/CookieBanner';
import type { CookieChoice } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Process } from './components/Process';
import { Services } from './components/Services';
import { Works } from './components/Works';
import { useCounters } from './lib/counters';
import { useRevealOnScroll } from './lib/reveal';

function readCookieChoice(): CookieChoice | null {
  try {
    const value = window.localStorage.getItem(COOKIE_KEY);
    return value === 'all' || value === 'necessary' ? value : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [cookieOpen, setCookieOpen] = useState(() => readCookieChoice() === null);

  useRevealOnScroll();
  useCounters();

  const decideCookie = (choice: CookieChoice) => {
    try {
      window.localStorage.setItem(COOKIE_KEY, choice);
    } catch {
      /* приватный режим — просто скрываем уведомление */
    }
    setCookieOpen(false);
  };

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

      <main id="main">
        <Hero />
        <Services />
        <Works />
        <Process />
        <Approach />
        <Contact />
      </main>

      <Footer />
      <FloatingActions lifted={cookieOpen} />
      {cookieOpen && <CookieBanner onDecide={decideCookie} />}
    </>
  );
}
