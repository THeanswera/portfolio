import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CasePage } from './components/CasePage';
import { initReveal } from './lib/reveal';
import './index.css';

const container = document.getElementById('case-root');
if (!container) throw new Error('Не найден контейнер #case-root');

// Блоки с data-reveal появляются при прокрутке: без этого вызова страница кейса
// показывала пустые полосы вместо текста.
initReveal();

createRoot(container).render(
  <StrictMode>
    <CasePage />
  </StrictMode>,
);
