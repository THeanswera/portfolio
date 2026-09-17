/** Главная страница. */
import { site, promises } from '../data/site.mjs';
import { projects } from '../data/catalog.mjs';
import { faq } from '../data/faq.mjs';
import { FACADES, PRICING_STEPS } from '../assets/js/shared/pricing.js';
import { toolHtml, DEFAULT_STATE } from '../assets/js/shared/toolview.js';
import { page, u, sectionHead } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { projectGrid, promiseGrid, steps, faqBlock, ctaBlock } from '../render/blocks.mjs';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.legalName,
  disambiguatingDescription: 'Демонстрационный проект: компания, адрес и телефон вымышлены.',
  description:
    'Изготовление кухонь, шкафов и столов по индивидуальным размерам. Замер, производство, доставка и сборка.',
  url: site.url,
  telephone: site.phone,
  email: site.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Москва',
    streetAddress: 'ул. Мастеровая, 12, строение 3',
    addressCountry: 'RU',
  },
  areaServed: site.area,
  openingHours: 'Mo-Sa 10:00-20:00',
  priceRange: 'от 60 000 ₽',
};

const hero = `<section class="hero">
  <div class="container hero__grid">
    <div>
      <p class="label hero__label">Мастерская мебели · ${site.area}</p>
      <h1 class="display">Кухня по вашим размерам — <em>с ценой до звонка</em></h1>
      <p class="lead hero__lead">
        Соберите гарнитур в конфигураторе: чертёж, цена и срок пересчитываются сразу.
        Расчёт можно отправить нам — в заявке придёт готовая конфигурация, а не «здравствуйте».
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="${u('/configurator/')}">Собрать кухню${icon('arrow', { size: 18 })}</a>
        <a class="btn btn--ghost" href="${u('/projects/')}">Смотреть проекты</a>
      </div>
      <ul class="facts">
        <li class="facts__item"><strong>21 день</strong><span>минимальный срок изготовления</span></li>
        <li class="facts__item"><strong>${site.warranty}</strong><span>гарантия на корпус и фурнитуру</span></li>
        <li class="facts__item"><strong>0 ₽</strong><span>замер и расчёт сметы</span></li>
      </ul>
    </div>
    <div>
      ${toolHtml(DEFAULT_STATE, { full: false, action: u('/configurator/') })}
    </div>
  </div>
</section>`;

const promisesSection = `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'Почему нам можно верить',
      title: 'Четыре обещания, за которые мы отвечаем деньгами',
      text: 'Мы не пишем «индивидуальный подход» и «лучшие материалы». Вместо этого фиксируем в договоре цену, срок и гарантию — и объясняем, что будет, если мы их нарушим.',
    })}
    ${promiseGrid(promises)}
  </div>
</section>`;

const projectsSection = `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Проекты',
      title: 'Кухни, которые уже стоят у людей',
      text: 'Каждый проект — это конкретная конфигурация: длина, планировка, фасад, столешница и опции. Её можно открыть в конфигураторе, поменять под себя и посмотреть, как изменится цена.',
    })}
    ${projectGrid(projects.slice(0, 3), 'cards cards--three')}
    <p style="margin-top:28px">
      <a class="btn btn--ghost" href="${u('/projects/')}">Все проекты и расчёты${icon('arrow', { size: 18 })}</a>
    </p>
  </div>
</section>`;

const priceSection = `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'Честная цена',
      title: 'Из чего складывается сумма',
      text: 'Формула открыта: её видно в конфигураторе, и по ней же считаются все проекты в каталоге. Никаких «цена по запросу» — считать можно самому.',
    })}
    ${steps(PRICING_STEPS)}
  </div>
</section>`;

const materialsSection = `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Материалы',
      title: 'Четыре фасада — от практичного до вечного',
      text: 'Разница в цене между ЛДСП и массивом — почти восьмикратная. Мы показываем, за что именно вы платите, и не предлагаем массив там, где хватит ламината.',
    })}
    <div class="cards">
      ${FACADES.map(
        (facade) => `<article class="card">
        <div class="card__body">
          <div class="swatches">${facade.colors
            .map((color) => `<span class="swatch" style="background:${color.hex}" title="${color.name}"></span>`)
            .join('')}</div>
          <h3 style="margin-top:12px">${facade.name}</h3>
          <p class="text-soft" style="font-size:14.5px">${facade.note}</p>
          <div class="card__meta">
            <span>от ${(facade.price + 18000).toLocaleString('ru-RU')} ₽/м с корпусом</span>
            <span>${facade.lead} дней</span>
          </div>
        </div>
      </article>`,
      ).join('\n      ')}
    </div>
    <p style="margin-top:28px">
      <a class="btn btn--ghost" href="${u('/materials/')}">Все материалы и фурнитура${icon('arrow', { size: 18 })}</a>
    </p>
  </div>
</section>`;

const productionSection = `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'Производство',
      title: 'Свой цех, а не перепродажа',
      text: 'Раскрой, кромка, присадка, сборка и упаковка — всё в одном помещении. Поэтому мы отвечаем за срок, а не пересказываем обещания подрядчика.',
    })}
    <div class="split">
      <div>
        ${steps([
          { title: 'Замер и проект', text: 'Замерщик приезжает с образцами, делает обмеры и шаблон, если стены неровные. Через два дня у вас чертёж и смета.' },
          { title: 'Производство', text: 'Раскрой на станке с ЧПУ, кромка по всем видимым торцам, присадка под фурнитуру. Фасады красят и шлифуют отдельно.' },
          { title: 'Доставка и монтаж', text: 'Привозим в защитной упаковке, поднимаем, собираем, подключаем технику и вывозим мусор в тот же день.' },
        ])}
      </div>
      <div class="split__aside">
        <h3>Кроме кухонь</h3>
        <ul class="plain-list">
          ${[
            'Шкафы и гардеробные по размеру стены',
            'Обеденные столы и стеллажи из массива',
            'Мебель для ванной: влагостойкие корпуса',
            'Фасады отдельно, если корпус менять не нужно',
          ]
            .map((item) => `<li>${icon('check', { size: 17 })}<span>${item}</span></li>`)
            .join('\n          ')}
        </ul>
        <p style="margin-top:22px"><a class="btn btn--ghost btn--small" href="${u('/production/')}">Подробнее о производстве</a></p>
      </div>
    </div>
  </div>
</section>`;

const faqSection = `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Вопросы',
      title: 'Что спрашивают до заказа',
      text: 'Если вашего вопроса здесь нет — напишите, ответим честно и без «приезжайте, обсудим на месте».',
    })}
    ${faqBlock(faq)}
  </div>
</section>`;

const ctaSection = `<section class="section">
  <div class="container">
    ${ctaBlock()}
  </div>
</section>`;

export default {
  out: 'index.html',
  path: '/',
  title: 'Кухни на заказ по индивидуальным размерам',
  description:
    'Мастерская «Форма»: кухни, шкафы и столы по вашим размерам. Посчитайте кухню в конфигураторе — чертёж, цена и срок сразу. Замер бесплатно, гарантия 5 лет.',
  jsonLd,
  render: () =>
    page({
      title: 'Кухни на заказ по индивидуальным размерам',
      description:
        'Мастерская «Форма»: кухни, шкафы и столы по вашим размерам. Посчитайте кухню в конфигураторе — чертёж, цена и срок сразу. Замер бесплатно, гарантия 5 лет.',
      path: '/',
      jsonLd,
      body: [hero, promisesSection, projectsSection, priceSection, materialsSection, productionSection, faqSection, ctaSection].join('\n\n'),
    }),
};
