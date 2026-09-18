/**
 * Калибр: интерактивная разборка механизма на узлы.
 * Сцена — та же, что на главной, но с разнесением деталей и выбором узла.
 */
import { layout, u } from '../render/layout.mjs';
import { calibre, gallery } from '../data/content.mjs';

const path = '/calibre/';
const title = 'Калибр SXT-01';
const description =
  'Калибр SXT-01: автоматический подзавод, 28 800 полуколебаний в час, 62 камня, 218 деталей, запас хода 72 часа. Интерактивная разборка механизма по узлам.';

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Калибр</span>
    </nav>
    <span class="eyebrow">${calibre.eyebrow}</span>
    <h1 class="page-hero__title">${calibre.title}</h1>
    <p class="lead page-hero__lead">${calibre.lead}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="container explode">
    <div class="stage" data-explode-stage>
      <canvas data-explode aria-label="Модель калибра SXT-01 с разборкой на узлы" role="img" tabindex="0"></canvas>
      <span class="stage__hint">Потяните, чтобы повернуть</span>
    </div>

    <div>
      <div class="stage-tools" role="group" aria-label="Управление разборкой">
        <button class="tool" type="button" data-explode-toggle aria-pressed="false">Разобрать механизм</button>
        <button class="tool" type="button" data-explode-reset>Сбросить вид</button>
      </div>

      <div class="parts" style="margin-top:24px">
        ${calibre.parts
          .map(
            (part, index) => `<button class="parts__item" type="button" data-part="${part.id}" aria-pressed="false">
          <span class="parts__index">${String(index + 1).padStart(2, '0')}</span>
          <span>
            <span class="parts__name">${part.name}</span>
            <span class="parts__role">${part.role}</span>
          </span>
        </button>`,
          )
          .join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container split">
    <div>
      <span class="eyebrow">Характеристики</span>
      <h2 class="h2" style="margin-top:14px">Что внутри</h2>
      <p class="lead" style="margin-top:16px">
        Калибр делается целиком в ателье: платина, мосты, барабан и ротор фрезеруются
        и отделываются здесь же, поэтому любую деталь можно заменить при обслуживании.
      </p>
      <div class="hero__actions">
        <a class="btn btn--ghost" href="${u('/service/')}">Сервис и регламент</a>
      </div>
    </div>

    <dl class="specs" data-reveal>
      ${calibre.specs
        .map((spec) => `<div class="specs__row"><dt>${spec.label}</dt><dd>${spec.value}</dd></div>`)
        .join('\n      ')}
    </dl>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">Отделка</span>
      <h2 class="h2" data-reveal>Четыре операции отделки</h2>
    </div>

    <div class="finishes">
      ${calibre.finishes
        .map(
          (finish) => `<article class="finish" data-reveal>
        <h3>${finish.name}</h3>
        <p>${finish.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="section__head section__head--row">
      <div>
        <span class="eyebrow">${gallery.eyebrow}</span>
        <h2 class="h2" style="margin-top:14px">Механизм крупным планом</h2>
      </div>
      <div>
        <p class="lead">${gallery.lead}</p>
        <div class="hero__actions">
          <a class="btn btn--ghost btn--small" href="${u('/gallery/')}">Вся галерея</a>
        </div>
      </div>
    </div>

    <div class="gallery">
      ${gallery.items
        .slice(2, 6)
        .map(
          (item) => `<figure class="gallery__item" data-reveal="image">
        <img src="${u(item.src)}" alt="${item.caption}" loading="lazy" width="1600" height="1000">
        <figcaption class="gallery__caption">${item.caption}</figcaption>
      </figure>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

export default {
  out: 'calibre/index.html',
  path,
  render: () => layout({ title, description, path, page: 'calibre', content }),
};
