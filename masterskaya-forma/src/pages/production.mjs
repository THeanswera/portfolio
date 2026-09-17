/** Производство, сроки, гарантия. */
import { site, alsoMake } from '../data/site.mjs';
import { FACADES } from '../assets/js/shared/pricing.js';
import { days } from '../assets/js/shared/format.js';
import { page, u, sectionHead } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { pageHead, steps, ctaBlock } from '../render/blocks.mjs';

const body = [
  pageHead({
    crumb: [{ href: '/', label: 'Главная' }, { label: 'Производство' }],
    label: 'Производство',
    title: 'Свой цех: от раскроя до сборки',
    text: 'Мы не перепродаём чужую мебель. Раскрой, кромка, присадка, покраска и сборка — в одном помещении, поэтому за срок отвечаем сами, а не пересказываем обещания подрядчика.',
    actions: `<a class="btn btn--primary" href="${u('/contacts/')}">Приехать в цех${icon('arrow', { size: 18 })}</a>`,
  }),

  `<section class="section section--tight">
  <div class="container">
    ${sectionHead({
      label: 'Этапы',
      title: 'Пять шагов от звонка до готовой кухни',
      text: 'На каждом шаге понятно, что происходит и сколько это занимает. Сроки считаются от согласования чертежей, а не от «начала работ».',
    })}
    ${steps([
      { title: 'Замер и шаблон', text: 'Замерщик приезжает с образцами фасадов и столешниц, проверяет геометрию, делает шаблон по месту, если стены неровные. Занимает 1–1,5 часа.' },
      { title: 'Проект и смета', text: 'Через два дня — планировка, развёртки, схема подключения техники и точная смета по артикулам. Правки в проект на этом этапе бесплатны.' },
      { title: 'Раскрой и кромка', text: 'Раскрой на станке с ЧПУ, кромка по всем видимым торцам, присадка под фурнитуру. Плита и кромка — одного производителя, чтобы не было разнотона.' },
      { title: 'Фасады и сборка', text: 'Фасады красят в камере или фрезеруют из массива, затем корпуса собирают и проверяют геометрию на стенде. Кухня уезжает к вам уже собранной по секциям.' },
      { title: 'Монтаж и техника', text: 'Доставка, подъём, сборка на месте, врезка мойки, подключение техники и вывоз упаковки — в один день. После монтажа регулируем двери и ящики.' },
    ])}
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Сроки',
      title: 'Сколько ждать именно вашу кухню',
      text: 'Срок зависит от материала фасадов: ЛДСП делается быстро, массив требует времени на покраску и сушку. Мы не обещаем «за неделю» — это всегда означает компромисс по качеству.',
    })}
    <div class="spec spec--wide">
      ${FACADES.map(
        (facade) => `<div><dt>${facade.name}</dt><dd><span class="mono">${days(facade.lead)}</span> от согласования чертежей</dd></div>`,
      ).join('\n      ')}
      <div><dt>Столешница из кварцевого камня</dt><dd><span class="mono">+7 дней</span> к сроку фасадов: замер после монтажа корпусов</dd></div>
    </div>
    <p class="note-line" style="margin-top:24px">
      За каждый день просрочки по нашей вине — компенсация 1 % от суммы заказа. Это условие прописано в договоре,
      а не сказано на словах.
    </p>
  </div>
</section>`,

  `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'Договор',
      title: 'Что зафиксировано на бумаге',
      text: 'Договор — не формальность, а способ не спорить потом. Вот что в нём есть, кроме цены и срока.',
    })}
    <div class="split">
      <div>
        <ul class="plain-list">
          <li>${icon('check', { size: 17 })}<span>Спецификация по артикулам: плита, кромка, фурнитура, столешница — с производителями и цветами</span></li>
          <li>${icon('check', { size: 17 })}<span>Точная сумма и порядок оплаты: аванс на материалы, остаток после монтажа</span></li>
          <li>${icon('check', { size: 17 })}<span>Срок изготовления и монтажа с датой, а не «в течение месяца»</span></li>
          <li>${icon('check', { size: 17 })}<span>Гарантия ${site.warranty} на корпус и фурнитуру, 2 года на покрытие фасадов</span></li>
          <li>${icon('check', { size: 17 })}<span>Ответственность за просрочку: 1 % от суммы заказа за каждый день</span></li>
          <li>${icon('check', { size: 17 })}<span>Условие о неизменности цены: доплаты только по вашему письменному согласию</span></li>
        </ul>
      </div>
      <div class="split__aside">
        <h3>Гарантия {site.warranty}</h3>
        <p class="text-soft" style="margin-top:12px;font-size:14.5px">
          Если сломается фурнитура — меняем по гарантии. Если двери «поехали» в первый год — приезжаем
          и регулируем бесплатно. Расходники и механизмы мы получаем напрямую, поэтому замена
          не растягивается на месяцы.
        </p>
        <p style="margin-top:20px"><a class="btn btn--ghost btn--small" href="${u('/materials/#fittings')}">Про фурнитуру и классы</a></p>
      </div>
    </div>
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Кроме кухонь',
      title: 'Что ещё делает мастерская',
      text: 'Тот же цех, те же материалы и та же фурнитура. Стоимость считается индивидуально — по размерам и наполнению.',
    })}
    <div class="promises">
      ${alsoMake
        .map(
          (item) => `<article class="promise">
        <span class="promise__icon">${icon('sofa', { size: 22 })}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`,

  `<section class="section"><div class="container">${ctaBlock({
    title: 'Приезжайте посмотреть цех',
    text: 'Лучший способ проверить мастерскую — увидеть, как она работает. Покажем образцы, дадим потрогать кромку и фурнитуру, ответим на вопросы без менеджера-посредника.',
    primary: { href: '/contacts/', label: 'Контакты и адрес' },
  })}</div></section>`,
].join('\n\n');

export default {
  out: 'production/index.html',
  path: '/production/',
  title: 'Производство, сроки и гарантия',
  description:
    'Свой цех: раскрой, кромка, покраска фасадов и сборка. Сроки по материалам от 21 до 45 дней, гарантия 5 лет, ответственность за просрочку в договоре.',
  render: () =>
    page({
      title: 'Производство, сроки и гарантия',
      description:
        'Свой цех: раскрой, кромка, покраска фасадов и сборка. Сроки по материалам от 21 до 45 дней, гарантия 5 лет, ответственность за просрочку в договоре.',
      path: '/production/',
      body,
    }),
};
