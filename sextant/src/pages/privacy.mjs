/** Обработка персональных данных. */
import { layout, u } from '../render/layout.mjs';
import { privacy } from '../data/content.mjs';

const path = '/privacy/';
const title = privacy.title;
const description =
  'Какие данные собирает сайт «СЕКСТАНТ», зачем они нужны, кому передаются, сколько хранятся и как отозвать согласие.';

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Обработка данных</span>
    </nav>
    <span class="eyebrow">Документы</span>
    <h1 class="page-hero__title">${privacy.title}</h1>
    <p class="lead page-hero__lead">${privacy.lead}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="container split split--aside">
    <div class="stack">
      ${privacy.sections
        .map(
          (section, index) => `<article class="card" data-reveal>
        <span class="card__index">${String(index + 1).padStart(2, '0')}</span>
        <h2 class="card__title">${section.title}</h2>
        <p class="card__text">${section.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>

    <div class="cta-panel" data-reveal>
      <span class="eyebrow">Вопросы по данным</span>
      <h2 class="h2">Написать в ателье</h2>
      <p class="lead">
        Запрос на копию, исправление или удаление данных обрабатывается по письму
        с того же адреса, с которого пришла заявка.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/contacts/')}">Перейти к контактам</a>
      </div>
    </div>
  </div>
</section>`;

export default {
  out: 'privacy/index.html',
  path,
  render: () => layout({ title, description, path, content }),
};
