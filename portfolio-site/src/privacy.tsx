import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivacyPage } from './pages/Privacy';
import './index.css';

const container = document.getElementById('privacy-root');
if (!container) throw new Error('Не найден контейнер #privacy-root');

createRoot(container).render(
  <StrictMode>
    <PrivacyPage />
  </StrictMode>,
);
