import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CasePage } from './components/CasePage';
import './index.css';

const container = document.getElementById('case-root');
if (!container) throw new Error('Не найден контейнер #case-root');

createRoot(container).render(
  <StrictMode>
    <CasePage />
  </StrictMode>,
);
