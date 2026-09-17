/** Каталог проектов с фильтром по стилю. */
import { site } from '../data/site.mjs';
import { projects, STYLES } from '../data/catalog.mjs';
import { page, u, sectionHead } from '../render/layout.mjs';
import { pageHead, projectGrid, ctaBlock } from '../render/blocks.mjs';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Проекты мастерской «Форма»',
  url: `${site.url}/projects/`,
  description: 'Кухни на заказ: планировки, материалы и расчёты по каждому проекту.',
  hasPart: projects.map((project) => ({
    '@type': 'CreativeWork',
    name: project.title,
    url: `${site.url}${project.url}`,
  })),
};

const usedStyles = STYLES.filter((style) => projects.some((project) => project.style === style));

const filters = `<div class="filters" role="group" aria-label="Фильтр по стилю">
  <button class="chip" type="button" data-filter="all" aria-pressed="true">Все проекты<span class="chip__count">${projects.length}</span></button>
  ${usedStyles
    .map((style) => {
      const count = projects.filter((project) => project.style === style).length;
      return `<button class="chip" type="button" data-filter="${style}" aria-pressed="false">${style}<span class="chip__count">${count}</span></button>`;
    })
    .join('\n  ')}
</div>`;

const body = [
  pageHead({
    crumb: [{ href: '/', label: 'Главная' }, { label: 'Проекты' }],
    label: 'Каталог',
    title: 'Проекты и их расчёты',
    text: 'Каждая кухня здесь — конкретная конфигурация из конфигуратора: длина, планировка, материалы и опции. Откройте проект и нажмите «Хочу такую же» — конфигуратор подставит те же параметры, и вы увидите, как меняется цена.',
  }),

  `<section class="section section--tight">
  <div class="container">
    ${filters}
    <div style="margin-top:28px">${projectGrid(projects, 'cards cards--three js-grid')}</div>
    <p class="note-line" data-empty hidden>В этом стиле пока нет проектов — посмотрите другие или соберите свою конфигурацию.</p>
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Что общего',
      title: 'Почему проекты выглядят по-разному',
      text: 'Мы не продаём «коллекцию»: каждый гарнитур считается под конкретную стену, привычки и бюджет. Поэтому одна кухня выходит на 113 тысяч, другая — на 688: разница в материалах, а не в наценке.',
    })}
    <div class="split">
      <div>
        <ul class="plain-list">
          <li>Длину задаёт стена, а не каталог: мы не подгоняем помещение под типовой размер.</li>
          <li>Материал выбирается под нагрузку: где готовят каждый день, ЛДСП честнее массива.</li>
          <li>Опции добавляются по одной — видно, сколько стоит каждая.</li>
          <li>Цена каждого проекта посчитана той же формулой, что и в конфигураторе.</li>
        </ul>
      </div>
      <div class="split__aside">
        <h3>Не нашли похожего?</h3>
        <p class="text-soft" style="margin-top:12px;font-size:14.5px">
          Соберите свою конфигурацию: четыре параметра — и вы увидите вилку цены и срок.
          Ничего заполнять и регистрироваться не нужно.
        </p>
        <p style="margin-top:20px"><a class="btn btn--primary btn--small" href="${u('/configurator/')}">Открыть конфигуратор</a></p>
      </div>
    </div>
  </div>
</section>`,

  `<section class="section"><div class="container">${ctaBlock({
    title: 'Хотите такую же — но под свою стену?',
    text: 'Возьмите любой проект за основу: в конфигураторе он открывается одним нажатием, а дальше меняйте длину, фасад и опции.',
    primary: { href: '/configurator/', label: 'Собрать свою кухню' },
  })}</div></section>`,
].join('\n\n');

export default {
  out: 'projects/index.html',
  path: '/projects/',
  title: 'Проекты кухонь на заказ с расчётом цены',
  description:
    'Шесть проектов кухонь: планировки, материалы, опции и стоимость каждого. Любой проект открывается в конфигураторе — можно поменять параметры и увидеть новую цену.',
  jsonLd,
  render: () =>
    page({
      title: 'Проекты кухонь на заказ с расчётом цены',
      description:
        'Шесть проектов кухонь: планировки, материалы, опции и стоимость каждого. Любой проект открывается в конфигураторе — можно поменять параметры и увидеть новую цену.',
      path: '/projects/',
      jsonLd,
      body,
    }),
};
