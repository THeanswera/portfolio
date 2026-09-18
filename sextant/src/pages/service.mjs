/** Сервис: условия, порядок работ и вопросы с ответами. */
import { layout, u } from '../render/layout.mjs';
import { service } from '../data/content.mjs';

const path = '/service/';
const title = 'Сервис и регламент';
const description =
  'Гарантия 5 лет, регламентное обслуживание каждые 5–7 лет, диагностика за 3 рабочих дня и восстановление исторических механизмов.';

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Сервис</span>
    </nav>
    <span class="eyebrow">${service.eyebrow}</span>
    <h1 class="page-hero__title">${service.title}</h1>
    <p class="lead page-hero__lead">${service.lead}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid grid--4">
      ${service.terms
        .map(
          (term, index) => `<article class="card" data-reveal>
        <span class="card__index">${String(index + 1).padStart(2, '0')}</span>
        <h2 class="card__title">${term.value}</h2>
        <p class="card__text"><strong>${term.label}.</strong> ${term.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--panel section--tight">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">Порядок работ</span>
      <h2 class="h2" data-reveal>Как проходит обслуживание</h2>
    </div>

    <div class="timeline">
      ${service.steps
        .map(
          (step, index) => `<div class="timeline__step" data-reveal>
        <span class="timeline__num">${String(index + 1).padStart(2, '0')}</span>
        <span class="timeline__title">${step.title}</span>
        <span class="timeline__text">${step.text}</span>
        <span class="timeline__time">этап ${index + 1} из ${service.steps.length}</span>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="container split split--aside">
    <div>
      <span class="eyebrow">Вопросы</span>
      <h2 class="h2" style="margin-top:14px">Что чаще всего спрашивают</h2>
      <p class="lead" style="margin-top:16px">
        Восемь вопросов, которые задают почти на каждой примерке: точность, обслуживание,
        водозащита, размер корпуса, сроки, осмотр до заказа, ремонт и магнитные поля.
      </p>
      <div class="hero__actions">
        <a class="btn btn--ghost" href="${u('/contacts/')}">Задать свой вопрос</a>
      </div>
    </div>

    <div class="accordion" data-accordion>
      ${service.faq
        .map(
          (item, index) => `<div class="accordion__item" data-open="false">
        <h3 style="margin:0">
          <button class="accordion__button" type="button" aria-expanded="false" aria-controls="faq-${index}">
            <span>${item.q}</span>
            <span class="accordion__sign" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="accordion__panel" id="faq-${index}">
          <div>${item.a}</div>
        </div>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

export default {
  out: 'service/index.html',
  path,
  render: () => layout({ title, description, path, content }),
};
