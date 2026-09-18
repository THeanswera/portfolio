/** Коллекция: три модели с полными характеристиками. */
import { layout, u } from '../render/layout.mjs';
import { models } from '../data/content.mjs';

const path = '/collection/';
const title = 'Коллекция';
const description =
  'Три модели «СЕКСТАНТ»: ГРИНВИЧ 38 из стали, ПУЛКОВО 40 с открытым балансом и АЗИМУТ 42 из титана с покрытием DLC. Характеристики, размеры, цены.';

const price = (value) => `${value.toLocaleString('ru-RU')} ₽`;

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Коллекция</span>
    </nav>
    <span class="eyebrow">Три модели</span>
    <h1 class="page-hero__title">Коллекция</h1>
    <p class="lead page-hero__lead">
      Один калибр SXT-01 и три характера: тонкий повседневный корпус, открытый баланс
      и защищённый титан. Любую модель можно собрать в своём сочетании отделки.
    </p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="models">
      ${models
        .map(
          (model) => `<article class="model" id="${model.slug}">
        <div class="model__media" data-reveal="image">
          <img src="${u(model.image)}" alt="${model.name} — ${model.tagline}" loading="lazy" width="1600" height="1600">
        </div>

        <div class="model__body">
          <span class="eyebrow">${model.latin}</span>
          <h2 class="model__name" data-reveal>${model.name}</h2>
          <p class="model__tagline">${model.tagline}</p>
          <p class="model__text">${model.description}</p>

          <dl class="specs model__specs" data-reveal>
            ${model.specs
              .map((spec) => `<div class="specs__row"><dt>${spec.label}</dt><dd>${spec.value}</dd></div>`)
              .join('\n            ')}
          </dl>

          <div class="model__price">
            <span>${model.priceNote}</span>
            <strong>${price(model.price)}</strong>
          </div>

          <div class="model__actions">
            <a class="btn btn--primary btn--small" href="${u('/configurator/')}">
              <span>Собрать конфигурацию</span><span class="btn__arrow" aria-hidden="true">→</span>
            </a>
            <a class="btn btn--ghost btn--small" href="${u('/contacts/')}">Записаться на примерку</a>
          </div>
        </div>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow">Дальше</span>
      <h2 class="h2">Посмотреть, что внутри</h2>
      <p class="lead">
        Все три модели идут на калибре SXT-01. На странице калибра механизм разбирается
        на узлы: видно, где стоит барабан, как работает анкерный ход и зачем нужны 62 камня.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/calibre/')}">
          <span>Разобрать калибр</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/gallery/')}">Галерея макросъёмки</a>
      </div>
    </div>
  </div>
</section>`;

export default {
  out: 'collection/index.html',
  path,
  render: () => layout({ title, description, path, content }),
};
