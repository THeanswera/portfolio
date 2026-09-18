/** Ателье: этапы работы, факты и примечание о сроках. */
import { layout, u } from '../render/layout.mjs';
import { atelier } from '../data/content.mjs';

const path = '/atelier/';
const title = 'Ателье';
const description =
  'Ателье «СЕКСТАНТ» в Санкт-Петербурге: изготовление деталей, отделка, ручная сборка, регулировка в пяти положениях и шесть недель испытаний хода.';

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Ателье</span>
    </nav>
    <span class="eyebrow">${atelier.eyebrow}</span>
    <h1 class="page-hero__title">${atelier.title}</h1>
    <p class="lead page-hero__lead">${atelier.lead}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">Этапы</span>
      <h2 class="h2" data-reveal>Шесть шагов от заготовки до паспорта</h2>
    </div>

    <div class="timeline">
      ${atelier.steps
        .map(
          (step, index) => `<div class="timeline__step" data-reveal>
        <span class="timeline__num">${String(index + 1).padStart(2, '0')}</span>
        <span class="timeline__title">${step.title}</span>
        <span class="timeline__text">${step.text}</span>
        <span class="timeline__time">${step.time}</span>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="grid grid--4">
      ${atelier.facts
        .map(
          (fact) => `<div class="stat" data-reveal>
        <strong class="stat__value">${fact.value}</strong>
        <span class="stat__label">${fact.label}</span>
      </div>`,
        )
        .join('\n      ')}
    </div>

    <p class="lead" style="margin-top:44px;max-width:70ch" data-reveal>${atelier.note}</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow">Визит</span>
      <h2 class="h2">Ателье — это мастерская, а не витрина</h2>
      <p class="lead">
        Часть операций идёт на станках, часть делается руками и занимает часы.
        Поэтому приём по записи: так у мастера есть время показать работу, а не только готовые часы.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/contacts/')}">
          <span>Записаться на визит</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/calibre/')}">Посмотреть калибр</a>
      </div>
    </div>
  </div>
</section>`;

export default {
  out: 'atelier/index.html',
  path,
  render: () => layout({ title, description, path, content }),
};
