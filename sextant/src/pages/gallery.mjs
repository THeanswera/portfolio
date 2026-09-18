/** Галерея: макросъёмка механизма и корпусов. */
import { layout, u } from '../render/layout.mjs';
import { gallery } from '../data/content.mjs';

const path = '/gallery/';
const title = 'Галерея';
const description =
  'Макросъёмка калибра SXT-01: баланс и спираль Бреге, женевские полосы, зернение, англаж, заводной барабан и ротор подзавода.';

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Галерея</span>
    </nav>
    <span class="eyebrow">${gallery.eyebrow}</span>
    <h1 class="page-hero__title">${gallery.title}</h1>
    <p class="lead page-hero__lead">${gallery.lead}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="container container--wide">
    <div class="gallery">
      ${gallery.items
        .map(
          (item, index) => `<figure class="gallery__item ${index % 5 === 0 ? 'gallery__item--wide' : ''}" data-reveal="image">
        <img src="${u(item.src)}" alt="${item.caption}" loading="${index < 2 ? 'eager' : 'lazy'}" width="1600" height="1000">
        <figcaption class="gallery__caption">${item.caption}</figcaption>
      </figure>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow">Живая модель</span>
      <h2 class="h2">Механизм можно повертеть</h2>
      <p class="lead">
        Снимки сделаны с той же модели, что крутится на странице калибра: её можно
        вращать, разбирать на узлы и рассматривать с любой стороны.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/calibre/')}">
          <span>Открыть калибр</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/configurator/')}">Собрать конфигурацию</a>
      </div>
    </div>
  </div>
</section>`;

export default {
  out: 'gallery/index.html',
  path,
  render: () => layout({ title, description, path, content }),
};
