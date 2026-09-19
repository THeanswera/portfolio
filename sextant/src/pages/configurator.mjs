/**
 * Конфигуратор: живая модель часов и выбор корпуса, циферблата, ремешка,
 * размера и гравировки с пересчётом стоимости.
 */
import { layout, u } from '../render/layout.mjs';
import { configurator } from '../data/content.mjs';

const path = '/configurator/';
const title = 'Конфигуратор';
const description =
  'Соберите свои часы «СЕКСТАНТ»: корпус, циферблат, ремешок, размер и гравировка. Стоимость пересчитывается сразу, модель обновляется вживую.';

const optionGroup = (key, label, items) => `<div class="config__option">
  <span class="config__label"><span>${label}</span><span data-extra="${key}"></span></span>
  <div class="chips" role="group" aria-label="${label}">
    ${items
      .map(
        (item) => `<button class="chip" type="button" data-group="${key}" data-value="${item.id}" data-extra="${item.extra ?? 0}" aria-pressed="false">
      ${item.name}<small>${item.note}</small>
    </button>`,
      )
      .join('\n      ')}
  </div>
</div>`;

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Конфигуратор</span>
    </nav>
    <span class="eyebrow">${configurator.eyebrow}</span>
    <h1 class="page-hero__title">${configurator.title}</h1>
    <p class="lead page-hero__lead">${configurator.lead}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="container config" data-configurator>
    <div class="config__stage">
      <div class="stage" data-watch-stage>
        <canvas data-watch aria-label="Модель часов в выбранной конфигурации" role="img" aria-describedby="watch-help" tabindex="0"></canvas>
        <span class="stage__hint">Потяните, чтобы повернуть · Колесо — масштаб</span>
      </div>
      <div class="watch-tools" role="group" aria-label="Управление 3D-моделью">
        <button class="chip" type="button" data-view="front">Циферблат</button>
        <button class="chip" type="button" data-view="side">Профиль</button>
        <button class="chip" type="button" data-view="back">Задняя крышка</button>
        <button class="chip" type="button" data-view="reset">Сбросить вид</button>
        <button class="chip" type="button" data-zoom="in" aria-label="Приблизить">＋</button>
        <button class="chip" type="button" data-zoom="out" aria-label="Отдалить">−</button>
        <button class="chip" type="button" data-spin aria-pressed="true">Автовращение</button>
      </div>
      <p class="form__note" id="watch-help">Вращайте мышью или пальцем. Масштаб — колёсиком или двумя пальцами. С клавиатуры: стрелки, + / −, Home.</p>
      <p class="form__note">Трёхмерный макет показывает сочетание отделки и пропорции корпуса. Как выглядят те же поверхности вблизи — на фотографиях в <a class="accent" href="${u('/collection/')}">коллекции</a> и <a class="accent" href="${u('/gallery/')}">галерее</a>.</p>
      <p class="form__note" data-watch-status role="status"></p>
    </div>

    <div class="config__panel">
      ${optionGroup('case', 'Корпус', configurator.cases)}
      ${optionGroup('dial', 'Циферблат', configurator.dials)}
      ${optionGroup('strap', 'Ремешок', configurator.straps)}
      ${optionGroup('size', 'Размер', configurator.sizes)}

      <div class="config__option">
        <span class="config__label"><span>${configurator.engraving.label}</span><span data-extra="engraving"></span></span>
        <div class="field">
          <input type="text" maxlength="${configurator.engraving.limit}" placeholder="Например: А. К. 2026" data-engraving aria-label="${configurator.engraving.label}">
          <span class="form__note">${configurator.engraving.note}</span>
        </div>
      </div>

      <div class="summary" data-summary>
        <div class="summary__row"><span>Базовая модель</span><span data-price="base"></span></div>
        <div class="summary__row"><span>Корпус</span><span data-price="case"></span></div>
        <div class="summary__row"><span>Циферблат</span><span data-price="dial"></span></div>
        <div class="summary__row"><span>Ремешок</span><span data-price="strap"></span></div>
        <div class="summary__row" data-price-row="engraving" hidden><span>Гравировка</span><span data-price="engraving"></span></div>
        <div class="summary__total">
          <span class="mono muted">Предварительно</span>
          <strong data-price="total"></strong>
        </div>
      </div>

      <p class="form__note" style="margin-top:18px">${configurator.note}</p>

      <div class="hero__actions">
        <a class="btn btn--primary" href="${u('/contacts/')}">
          <span>Отправить конфигурацию</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/collection/')}">Готовые модели</a>
      </div>
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="section__head">
      <span class="eyebrow">Как это работает</span>
      <h2 class="h2" data-reveal>Расчёт предварительный, решение — за мастером</h2>
      <p class="lead" data-reveal>
        Конфигуратор показывает порядок стоимости и то, как сочетание выглядит.
        Собирается ли такая пара «корпус-циферблат», сколько займёт работа и когда
        часы будут готовы — подтверждает ателье при заявке.
      </p>
    </div>

    <div class="grid grid--3">
      <article class="card" data-reveal>
        <span class="card__index">01</span>
        <h3 class="card__title">Выберите сочетание</h3>
        <p class="card__text">Корпус, циферблат, ремешок и размер. Модель обновляется сразу, стоимость — тоже.</p>
      </article>
      <article class="card" data-reveal>
        <span class="card__index">02</span>
        <h3 class="card__title">Отправьте заявку</h3>
        <p class="card__text">Опишите конфигурацию в форме. Мастер уточнит детали и назовёт срок изготовления.</p>
      </article>
      <article class="card" data-reveal>
        <span class="card__index">03</span>
        <h3 class="card__title">Приезжайте в ателье</h3>
        <p class="card__text">Перед сборкой стоит примерить корпус: 38, 40 и 42 мм на руке выглядят по-разному.</p>
      </article>
    </div>
  </div>
</section>`;

export default {
  out: 'configurator/index.html',
  path,
  render: () => layout({ title, description, path, page: 'configurator', content }),
};
