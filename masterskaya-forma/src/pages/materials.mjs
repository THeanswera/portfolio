/** Материалы, фурнитура и открытая формула цены. */
import { FACADES, WORKTOPS, FITTINGS, EXTRAS, PRICING_STEPS, calculate } from '../assets/js/shared/pricing.js';
import { money, meters, days } from '../assets/js/shared/format.js';
import { page, u, sectionHead } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { pageHead, steps, ctaBlock } from '../render/blocks.mjs';

/** Пример расчёта: та же конфигурация, что открывается в конфигураторе по умолчанию. */
const example = calculate({
  wall: 320,
  layout: 'corner',
  facade: FACADES[0],
  worktop: WORKTOPS[1],
  fitting: FITTINGS[1],
  extras: ['light'],
});

const facadeCards = `<div class="cards">
  ${FACADES.map(
    (facade) => `<article class="card" id="facade-${facade.id}">
    <div class="card__body">
      <div class="swatches">
        ${facade.colors
          .map((color) => `<span class="swatch" style="background:${color.hex}" title="${color.name}"></span>`)
          .join('')}
      </div>
      <h3 style="margin-top:16px">${facade.name}</h3>
      <p class="text-soft" style="font-size:14.5px">${facade.note}</p>
      <dl class="spec" style="margin-top:16px">
        <div><dt>Наценка за метр</dt><dd class="mono">${facade.price.toLocaleString('ru-RU')} ₽</dd></div>
        <div><dt>Цена с корпусом</dt><dd class="mono">${money(facade.price + 18000)}/м</dd></div>
        <div><dt>Срок</dt><dd>${days(facade.lead)}</dd></div>
        <div><dt>Цвета</dt><dd>${facade.colors.map((color) => color.name.toLowerCase()).join(', ')}</dd></div>
      </dl>
    </div>
  </article>`,
  ).join('\n  ')}
</div>`;

const worktopCards = `<div class="cards cards--three">
  ${WORKTOPS.map(
    (worktop) => `<article class="card" id="worktop-${worktop.id}">
    <div class="card__body">
      <div class="swatches">
        ${worktop.colors.map((color) => `<span class="swatch" style="background:${color.hex}" title="${color.name}"></span>`).join('')}
      </div>
      <h3 style="margin-top:16px">${worktop.name}</h3>
      <p class="text-soft" style="font-size:14.5px">${worktop.note}</p>
      <div class="card__meta"><span class="mono">${worktop.price.toLocaleString('ru-RU')} ₽/м</span></div>
    </div>
  </article>`,
  ).join('\n  ')}
</div>`;

const body = [
  pageHead({
    crumb: [{ href: '/', label: 'Главная' }, { label: 'Материалы' }],
    label: 'Материалы',
    title: 'За что вы платите в каждом метре',
    text: 'Мы показываем наценку за материал прямо в цифрах: видно, что даёт разницу в цене и где можно сэкономить без потери качества.',
    actions: `<a class="btn btn--primary" href="${u('/configurator/')}">Посчитать в конфигураторе${icon('arrow', { size: 18 })}</a>`,
  }),

  `<section class="section section--tight" id="facades">
  <div class="container">
    ${sectionHead({
      label: 'Фасады',
      title: 'Четыре материала — четыре характера',
      text: 'Разница между ЛДСП и массивом почти восьмикратная. Мы не предлагаем массив там, где достаточно ламината, и говорим прямо, где экономия обернётся проблемой.',
    })}
    ${facadeCards}
  </div>
</section>`,

  `<section class="section" id="worktops" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Столешницы',
      title: 'Самая рабочая поверхность в доме',
      text: 'Столешницу меняют реже, чем фасады, а изнашивается она быстрее всего. Здесь экономия заметна сильнее всего — и здесь же она больнее всего.',
    })}
    ${worktopCards}
  </div>
</section>`,

  `<section class="section" id="fittings">
  <div class="container">
    ${sectionHead({
      label: 'Фурнитура',
      title: 'Три класса: от «работает» до «работает красиво»',
      text: 'Фурнитура — это то, что вы трогаете каждый день. Разница между классами чувствуется на второй год: двери начинают хлопать, ящики — заедать.',
    })}
    <div class="cards cards--three">
      ${FITTINGS.map(
        (fitting) => `<article class="card"><div class="card__body">
        <h3>${fitting.name}</h3>
        <p class="text-soft" style="font-size:14.5px">${fitting.note}</p>
        <div class="card__meta"><span class="mono">${fitting.price === 0 ? 'включено в корпус' : `+${fitting.price.toLocaleString('ru-RU')} ₽/м`}</span></div>
      </div></article>`,
      ).join('\n      ')}
    </div>
  </div>
</section>`,

  `<section class="section" id="extras" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Опции',
      title: 'Дополнения, которые считаются отдельно',
      text: 'Каждую опцию видно в расчёте отдельной строкой. Можно добавить сейчас, а можно потом — конструкция позволяет доукомплектовать кухню.',
    })}
    <div class="cards cards--three">
      ${EXTRAS.map(
        (item) => `<article class="card"><div class="card__body">
        <h3>${item.name}</h3>
        <p class="text-soft" style="font-size:14.5px">${item.note}</p>
        <div class="card__meta"><span class="mono">${money(item.price)}</span></div>
      </div></article>`,
      ).join('\n      ')}
    </div>
  </div>
</section>`,

  `<section class="section" id="price">
  <div class="container">
    ${sectionHead({
      label: 'Как считается цена',
      title: 'Четыре шага и никаких скрытых строк',
      text: 'Формула одна для конфигуратора, каталога и договора. Ниже — пример: кухня 3,2 метра углом, ЛДСП дуб, компакт-ламинат, фурнитура «Комфорт» и подсветка.',
    })}
    ${steps(PRICING_STEPS)}

    <div class="money" style="margin-top:36px;max-width:720px">
      <div class="money__row"><span>Погонные метры</span><span class="mono">${meters(example.run)}</span></div>
      <div class="money__row"><span>Цена метра: корпус, фасад, столешница, фурнитура</span><span class="mono">${money(example.perMeter)}</span></div>
      <div class="money__row"><span>Изделие</span><span class="mono">${money(example.furniture)}</span></div>
      <div class="money__row"><span>Опции</span><span class="mono">${money(example.options)}</span></div>
      <div class="money__row"><span>Доставка и сборка — 8 %</span><span class="mono">${money(example.delivery)}</span></div>
      <div class="money__row money__row--total"><span>Итого</span><span class="mono">${money(example.total)}</span></div>
      <p class="note-line">Вилка ±7 %: ${money(example.min)} — ${money(example.max)}. Срок — ${days(example.lead)}. Эта же конфигурация открывается в конфигураторе по умолчанию.</p>
    </div>

    <p style="margin-top:28px">
      <a class="btn btn--primary" href="${u('/configurator/')}">Проверить на своей кухне${icon('arrow', { size: 18 })}</a>
    </p>
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'За что мы не берём денег',
      title: 'Бесплатно — и это не маркетинг',
      text: 'Эти работы входят в стоимость изделия, потому что без них нельзя сделать нормально. Отдельных счетов за них не будет.',
    })}
    <div class="promises">
      ${[
        { icon: 'ruler', title: 'Замер и шаблон', text: 'Выезд замерщика с образцами, обмер, проверка углов и составление шаблона для кривых стен.' },
        { icon: 'layers', title: 'Проект и чертежи', text: 'Планировка, развёртки, схема подключения техники. Остаются у вас, даже если вы не закажете.' },
        { icon: 'truck', title: 'Доставка и подъём', text: 'Включая подъём на этаж без лифта и защитную упаковку каждой детали.' },
        { icon: 'spark', title: 'Подключение техники', text: 'Врезка мойки, подключение духового шкафа, варочной панели и вытяжки.' },
      ]
        .map(
          (item) => `<article class="promise">
        <span class="promise__icon">${icon(item.icon, { size: 22 })}</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`,

  `<section class="section"><div class="container">${ctaBlock({
    title: 'Не уверены, какой материал вам нужен?',
    text: 'Соберите кухню в конфигураторе в двух вариантах и сравните цены. Если сомневаетесь — напишите, объясним разницу на вашем случае, без «берите подороже».',
    primary: { href: '/configurator/', label: 'Открыть конфигуратор' },
  })}</div></section>`,
].join('\n\n');

export default {
  out: 'materials/index.html',
  path: '/materials/',
  title: 'Материалы и фурнитура с ценами за метр',
  description:
    'Фасады ЛДСП, МДФ в эмали, шпон и массив дуба; столешницы от ЛДСП до кварца; три класса фурнитуры. Наценка за метр указана прямо, формула расчёта открыта.',
  render: () =>
    page({
      title: 'Материалы и фурнитура с ценами за метр',
      description:
        'Фасады ЛДСП, МДФ в эмали, шпон и массив дуба; столешницы от ЛДСП до кварца; три класса фурнитуры. Наценка за метр указана прямо, формула расчёта открыта.',
      path: '/materials/',
      body,
    }),
};
