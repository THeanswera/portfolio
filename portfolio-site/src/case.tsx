import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CasePage } from './components/CasePage';
import { works } from './data/site';
import { initReveal } from './lib/reveal';
import './index.css';

const container = document.getElementById('case-root');
if (!container) throw new Error('Не найден контейнер #case-root');

// Блоки с data-reveal появляются при прокрутке: без этого вызова страница кейса
// показывала пустые полосы вместо текста.
initReveal();

/**
 * Кейс определяется в трёх случаях:
 * 1) data-work на контейнере — так размечена статическая страница /cases/<slug>/;
 * 2) data-work-page — каталог /cases/;
 * 3) ?work=<id> — старый адрес case.html, он перенаправляется на новый сервером,
 *    но остаётся рабочим при открытии файла напрямую и в локальной разработке.
 */
const slug = container.dataset.work ?? new URLSearchParams(window.location.search).get('work') ?? '';
const work = works.find((item) => item.id === slug || item.slug === slug);

if (container.dataset.workPage === 'catalog') {
  const { CaseCatalog } = await import('./components/CaseCatalog');
  createRoot(container).render(
    <StrictMode>
      <CaseCatalog />
    </StrictMode>,
  );
} else if (work) {
  createRoot(container).render(
    <StrictMode>
      <CasePage workId={work.id} />
    </StrictMode>,
  );
} else {
  // Неизвестный slug: на хостинге такие адреса отдаёт 404 от Apache.
  // Здесь остаётся локальный случай — открыть каталог кейсов в корне сайта.
  window.location.replace(new URL('cases/', new URL('.', window.location.href)).toString());
}
