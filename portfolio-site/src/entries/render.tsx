import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CaseCatalog } from '../components/CaseCatalog';
import { CasePage } from '../components/CasePage';
import { HomePage } from '../App';
import { PrivacyPage } from '../pages/Privacy';
import { NotFoundPage } from '../pages/NotFound';
import { works } from '../data/site';
import { initReveal } from '../lib/reveal';
import '../index.css';

/**
 * Единая точка входа собранных страниц.
 *
 * Сборка снимает готовую разметку в отдельные файлы (главная, каталог, шесть
 * кейсов, политика, страница ошибки), и все они грузят один и тот же скрипт.
 * Поэтому страница определяется по адресу: адрес знает и робот, и браузер.
 * Раньше у каждой страницы был свой скрипт, и это давало ошибку: страница
 * кейса грузила точку входа главной и подменяла разметку содержимым главной.
 *
 * Параметр ?page= используется только сборкой и разработкой: он позволяет
 * отрисовать нужную страницу, не подстраивая адрес.
 */
export type PrerenderPage =
  | { kind: 'home' }
  | { kind: 'catalog' }
  | { kind: 'privacy' }
  | { kind: 'not-found' }
  | { kind: 'case'; workId: string };

export function PrerenderRoot({ page }: { page: PrerenderPage }) {
  switch (page.kind) {
    case 'catalog':
      return <CaseCatalog />;
    case 'privacy':
      return <PrivacyPage />;
    case 'not-found':
      return <NotFoundPage />;
    case 'case':
      return <CasePage workId={page.workId} />;
    default:
      return <HomePage />;
  }
}

/** Какая страница открыта — по адресу или по явному параметру сборки. */
function resolvePage(): PrerenderPage {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('page');
  const path = window.location.pathname;

  if (requested === 'home') return { kind: 'home' };
  if (requested === 'catalog') return { kind: 'catalog' };
  if (requested === 'privacy') return { kind: 'privacy' };
  if (requested === 'not-found') return { kind: 'not-found' };
  if (requested === 'case') return { kind: 'case', workId: params.get('id') ?? '' };

  if (/\/cases\/[^/]+\/?$/.test(path)) {
    const slug = path.replace(/\/$/, '').split('/').pop() ?? '';
    const work = works.find((item) => item.slug === slug || item.id === slug);
    // Неизвестный slug на хостинге отдаёт 404 от Apache — сюда он не попадает.
    if (work) return { kind: 'case', workId: work.id };
    return { kind: 'not-found' };
  }

  if (/\/cases\/?$/.test(path)) return { kind: 'catalog' };
  if (path.endsWith('/privacy.html')) return { kind: 'privacy' };
  if (path.endsWith('/404.html')) return { kind: 'not-found' };

  return { kind: 'home' };
}

initReveal();

const container = document.getElementById('prerender-root');
if (!container) throw new Error('Не найден контейнер #prerender-root');

createRoot(container).render(
  <StrictMode>
    <PrerenderRoot page={resolvePage()} />
  </StrictMode>,
);
