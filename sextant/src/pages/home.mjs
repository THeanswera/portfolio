/**
 * Главная: первый экран с калибром, манифест, коллекция, разбор механизма,
 * галерея, ателье и заявка.
 */
import { layout, u } from '../render/layout.mjs';
import {
  hero,
  manifest,
  models,
  calibre,
  gallery,
  atelier,
  service,
  site,
} from '../data/content.mjs';

const path = '/';
const title = 'Часы ручной сборки';
const description =
  'Часовая мануфактура «СЕКСТАНТ»: калибр SXT-01 на 218 деталей, запас хода 72 часа, регулировка в пяти положениях. Три модели, конфигуратор и ателье в Санкт-Петербурге.';

const price = (value) => `${value.toLocaleString('ru-RU')} ₽`;

const heroBlock = `<section class="hero">
  <div class="container hero__inner">
    <div class="hero__content">
      <span class="eyebrow">${hero.eyebrow}</span>
      <h1 class="hero__title">
        ${hero.titleLines
          .map((line, index) => `<span>${index === hero.accentLine ? `<em>${line}</em>` : line}</span>`)
          .join('\n        ')}
      </h1>
      <p class="lead hero__lead">${hero.lead}</p>

      <div class="hero__actions">
        <a class="btn btn--primary" href="${u(hero.primaryCta.href)}">
          <span>${hero.primaryCta.label}</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u(hero.secondaryCta.href)}">${hero.secondaryCta.label}</a>
      </div>

      <div class="hero__facts">
        ${hero.facts
          .map(
            (fact) => `<div class="stat">
          <strong class="stat__value">${fact.value}</strong>
          <span class="stat__label">${fact.label}</span>
        </div>`,
          )
          .join('\n        ')}
      </div>
    </div>

    <div class="stage" data-calibre-stage>
      <canvas data-calibre aria-label="Трёхмерная модель калибра SXT-01. Потяните, чтобы повернуть." role="img" tabindex="0"></canvas>
      <span class="stage__hint">${hero.hint}</span>
      <div class="stage__badge stage__badge--tl">
        <span>калибр</span>
        <strong>SXT-01 · автоматический</strong>
      </div>
      <div class="stage__badge stage__badge--br">
        <span>ход</span>
        <strong>28 800 полуколебаний/час</strong>
      </div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true">
  <div class="marquee__track">
    ${['Женевские полосы', 'Зернение', 'Англаж', 'Спираль Бреге', 'Пять положений', '72 часа', '62 камня']
      .map((word) => `<span class="marquee__item">${word}</span>`)
      .join('\n    ')}
  </div>
  <div class="marquee__track">
    ${['Женевские полосы', 'Зернение', 'Англаж', 'Спираль Бреге', 'Пять положений', '72 часа', '62 камня']
      .map((word) => `<span class="marquee__item">${word}</span>`)
      .join('\n    ')}
  </div>
</div>`;

const manifestBlock = `<section class="section" id="method">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">${manifest.eyebrow}</span>
      <h2 class="h2" data-reveal>${manifest.title}</h2>
      <p class="lead" data-reveal>${manifest.text}</p>
    </div>

    <div class="principles">
      ${manifest.principles
        .map(
          (item, index) => `<article class="principle" data-reveal>
        <span class="principle__index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const collectionBlock = `<section class="section section--panel" id="collection">
  <div class="container">
    <div class="section__head section__head--row">
      <div>
        <span class="eyebrow">Коллекция</span>
        <h2 class="h2" style="margin-top:14px">Три корпуса, один калибр</h2>
      </div>
      <p class="lead">
        Модели отличаются корпусом, циферблатом и функциями — механизм внутри один и тот же.
        Поэтому обслуживание и запасные части одинаковы для всей коллекции.
      </p>
    </div>

    <div class="models">
      ${models
        .map(
          (model) => `<article class="model" id="${model.slug}">
        <div class="model__media" data-reveal="image">
          <img src="${u(model.image)}" alt="${model.name} — ${model.tagline}" loading="lazy" width="1600" height="1600">
        </div>

        <div class="model__body">
          <span class="eyebrow">${model.latin}</span>
          <h3 class="model__name" data-reveal>${model.name}</h3>
          <p class="model__tagline">${model.tagline}</p>
          <p class="model__text">${model.summary}</p>

          <dl class="specs model__specs" data-reveal>
            ${model.specs
              .slice(0, 4)
              .map((spec) => `<div class="specs__row"><dt>${spec.label}</dt><dd>${spec.value}</dd></div>`)
              .join('\n            ')}
          </dl>

          <div class="model__price">
            <span>${model.priceNote}</span>
            <strong>${price(model.price)}</strong>
          </div>

          <div class="model__actions">
            <a class="btn btn--ghost btn--small" href="${u('/collection/')}#${model.slug}">Все характеристики</a>
            <a class="btn btn--ghost btn--small" href="${u('/configurator/')}">Собрать в конфигураторе</a>
          </div>
        </div>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const calibreBlock = `<section class="section" id="calibre">
  <div class="container explode">
    <div>
      <span class="eyebrow">${calibre.eyebrow}</span>
      <h2 class="h2" style="margin-top:16px" data-reveal>${calibre.title}</h2>
      <p class="lead" style="margin-top:18px" data-reveal>${calibre.lead}</p>

      <dl class="specs" style="margin-top:30px" data-reveal>
        ${calibre.specs
          .slice(0, 5)
          .map((spec) => `<div class="specs__row"><dt>${spec.label}</dt><dd>${spec.value}</dd></div>`)
          .join('\n        ')}
      </dl>

      <div class="hero__actions">
        <a class="btn btn--ghost" href="${u('/calibre/')}">
          <span>Разобрать механизм</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>

    <div class="stage stage--tall" data-calibre-preview>
      <canvas data-calibre-preview-canvas aria-label="Калибр SXT-01 крупным планом" role="img"></canvas>
    </div>
  </div>
</section>`;

const finishesBlock = `<section class="section section--tight">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">Отделка</span>
      <h2 class="h2" data-reveal>Четыре операции, которые видно глазом</h2>
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
</section>`;

const galleryBlock = `<section class="section section--panel">
  <div class="container">
    <div class="section__head section__head--row">
      <div>
        <span class="eyebrow">${gallery.eyebrow}</span>
        <h2 class="h2" style="margin-top:14px">${gallery.title}</h2>
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
        .slice(0, 5)
        .map(
          (item, index) => `<figure class="gallery__item ${index === 0 ? 'gallery__item--wide' : ''}" data-reveal="image">
        <img src="${u(item.src)}" alt="${item.caption}" loading="lazy" width="1600" height="1000">
        <figcaption class="gallery__caption">${item.caption}</figcaption>
      </figure>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const atelierBlock = `<section class="section">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">${atelier.eyebrow}</span>
      <h2 class="h2" data-reveal>${atelier.title}</h2>
      <p class="lead" data-reveal>${atelier.lead}</p>
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

    <div class="grid grid--3" style="margin-top:44px">
      ${atelier.facts
        .map(
          (fact) => `<div class="stat" data-reveal>
        <strong class="stat__value">${fact.value}</strong>
        <span class="stat__label">${fact.label}</span>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const serviceBlock = `<section class="section section--panel">
  <div class="container">
    <div class="section__head section__head--row">
      <div>
        <span class="eyebrow">${service.eyebrow}</span>
        <h2 class="h2" style="margin-top:14px">${service.title}</h2>
      </div>
      <p class="lead">${service.lead}</p>
    </div>

    <div class="grid grid--4">
      ${service.terms
        .map(
          (term, index) => `<article class="card" data-reveal>
        <span class="card__index">${String(index + 1).padStart(2, '0')}</span>
        <h3 class="card__title">${term.value}</h3>
        <p class="card__text"><strong>${term.label}.</strong> ${term.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const ctaBlock = `<section class="section">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow">Заявка</span>
      <h2 class="h2">Приехать в ателье или задать вопрос</h2>
      <p class="lead">
        Покажем калибр в разборе, дадим примерить все три корпуса и объясним,
        чем отличается отделка. Приём по записи: ${site.hours}.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/contacts/')}">
          <span>Оставить заявку</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/configurator/')}">Собрать конфигурацию</a>
      </div>
      <p class="form__note">
        Онлайн-оплаты и доставки у ателье нет: часы передаются в шоуруме после примерки.
      </p>
    </div>
  </div>
</section>`;

export default {
  out: 'index.html',
  path,
  render: () =>
    layout({
      title,
      description,
      path,
      page: 'home',
      content: [
        heroBlock,
        manifestBlock,
        collectionBlock,
        calibreBlock,
        finishesBlock,
        galleryBlock,
        atelierBlock,
        serviceBlock,
        ctaBlock,
      ].join('\n'),
    }),
};
