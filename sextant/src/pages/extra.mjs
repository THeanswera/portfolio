/** Спасибо за заявку и страница 404. */
import { layout, u } from '../render/layout.mjs';
import { thanks, notFound } from '../data/content.mjs';

const thanksContent = `<section class="section" style="padding-top:clamp(140px,18vw,240px)">
  <div class="container" style="display:grid;gap:22px;justify-items:start;max-width:760px">
    <span class="eyebrow">Заявка</span>
    <h1 class="page-hero__title">${thanks.title}</h1>
    <p class="lead">${thanks.text}</p>
    <div class="hero__actions">
      <a class="btn btn--primary" href="${u(thanks.cta.href)}">
        <span>${thanks.cta.label}</span><span class="btn__arrow" aria-hidden="true">→</span>
      </a>
      <a class="btn btn--ghost" href="${u('/collection/')}">Вернуться в коллекцию</a>
    </div>
  </div>
</section>`;

const notFoundContent = `<section class="section" style="padding-top:clamp(140px,18vw,240px)">
  <div class="container" style="display:grid;gap:22px;justify-items:start;max-width:760px">
    <span class="eyebrow">404</span>
    <h1 class="page-hero__title">${notFound.title}</h1>
    <p class="lead">${notFound.text}</p>
    <div class="hero__actions">
      <a class="btn btn--primary" href="${u(notFound.cta.href)}">
        <span>${notFound.cta.label}</span><span class="btn__arrow" aria-hidden="true">→</span>
      </a>
      <a class="btn btn--ghost" href="${u('/contacts/')}">Контакты ателье</a>
    </div>
  </div>
</section>`;

export default [
  {
    out: 'thanks/index.html',
    path: '/thanks/',
    indexable: false,
    render: () =>
      layout({
        title: thanks.title,
        description: 'Заявка отправлена: мастер ателье ответит в течение рабочего дня.',
        path: '/thanks/',
        content: thanksContent,
      }),
  },
  {
    out: '404.html',
    path: '/404.html',
    indexable: false,
    render: () =>
      layout({
        title: notFound.title,
        description: 'Страница не найдена.',
        path: '/404.html',
        content: notFoundContent,
      }),
  },
];
