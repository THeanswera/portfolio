/**
 * Модель цены. Чистые функции без DOM: один и тот же код считает цену
 * при сборке страницы и в браузере, когда посетитель двигает ползунки.
 *
 * Логика открыта и объясняется на странице «Материалы»: цена = погонные метры
 * × (корпус + фасад + столешница + фурнитура) + выбранные опции + доставка и сборка.
 */

/** Корпус: каркас, полки, цоколь, кромка, работа цеха. */
export const CARCASS = 18000;

/** Доставка, подъём и сборка — 8 % от стоимости изделия. */
export const DELIVERY_RATE = 0.08;

/** Вилка: цены на материалы меняются, точная сумма — после замера. */
export const RANGE = 0.07;

export const LAYOUTS = [
  { id: 'line', name: 'Линейная', extra: 0, hint: 'Всё вдоль одной стены' },
  { id: 'corner', name: 'Угловая', extra: 1.2, hint: 'Две стены, рабочая зона в углу' },
  { id: 'u', name: 'П-образная', extra: 2.4, hint: 'Три стены — больше всего хранения' },
  { id: 'island', name: 'С островом', extra: 1.8, hint: 'Отдельная рабочая поверхность' },
];

export const FACADES = [
  {
    id: 'ldsp',
    name: 'ЛДСП',
    price: 6000,
    lead: 21,
    note: 'Ламинат на ДСП. Ровный цвет без стыков, не боится пара и мытья. Самый практичный вариант для семьи с детьми.',
    colors: [
      { id: 'milk', name: 'Молочный', hex: '#E7E1D6' },
      { id: 'grey', name: 'Серый графит', hex: '#71766F' },
      { id: 'oak', name: 'Дуб натуральный', hex: '#C39A6B' },
      { id: 'walnut', name: 'Орех', hex: '#8A5A38' },
    ],
  },
  {
    id: 'enamel',
    name: 'МДФ в эмали',
    price: 21000,
    lead: 30,
    note: 'Крашеный МДФ. Любой цвет по вееру, матовая или глянцевая поверхность, фрезеровка любой формы.',
    colors: [
      { id: 'milk', name: 'Молочный', hex: '#EFE9DF' },
      { id: 'graphite', name: 'Графит', hex: '#3B403D' },
      { id: 'olive', name: 'Олива', hex: '#6C7150' },
      { id: 'clay', name: 'Терракота', hex: '#A65A3E' },
    ],
  },
  {
    id: 'veneer',
    name: 'Шпон дуба',
    price: 34000,
    lead: 40,
    note: 'Натуральный шпон на МДФ. Живой рисунок дерева, толщина рейки 19 мм, покрытие маслом или лаком.',
    colors: [
      { id: 'oak-light', name: 'Дуб светлый', hex: '#D2A876' },
      { id: 'oak-smoked', name: 'Дуб копчёный', hex: '#8B6A46' },
    ],
  },
  {
    id: 'solid',
    name: 'Массив дуба',
    price: 50000,
    lead: 45,
    note: 'Цельный массив, филёнка или рейка. Вес, фактура и срок службы — максимум из возможного.',
    colors: [
      { id: 'oak-natural', name: 'Дуб', hex: '#C79A66' },
      { id: 'ash', name: 'Ясень', hex: '#D8C4A0' },
    ],
  },
];

export const WORKTOPS = [
  {
    id: 'ldsp',
    name: 'ЛДСП 38 мм',
    price: 6000,
    note: 'Тот же ламинат, что и фасады. Недорого, можно подобрать в тон.',
    colors: [{ id: 'grey', name: 'Серый камень', hex: '#8C8C86' }, { id: 'oak', name: 'Дуб', hex: '#B98F60' }],
  },
  {
    id: 'compact',
    name: 'Компакт-ламинат 12 мм',
    price: 14000,
    note: 'Влагостойкий, без кромки по краю, выдерживает горячее.',
    colors: [{ id: 'graphite', name: 'Графит', hex: '#454A47' }, { id: 'white', name: 'Белый', hex: '#E4E2DC' }],
  },
  {
    id: 'solid',
    name: 'Массив дуба 40 мм',
    price: 18000,
    note: 'Склеенный щит, покрытие маслом. Можно обновлять шлифовкой.',
    colors: [{ id: 'oak', name: 'Дуб натуральный', hex: '#C09660' }],
  },
  {
    id: 'stone',
    name: 'Кварцевый камень 20 мм',
    price: 32000,
    note: 'Не боится ножа, пятен и горячей посуды. Самый долгий срок службы.',
    colors: [
      { id: 'white', name: 'Белый мрамор', hex: '#E9E6E0' },
      { id: 'dark', name: 'Тёмный сланец', hex: '#4A4C48' },
    ],
  },
];

export const FITTINGS = [
  { id: 'base', name: 'Базовая', price: 0, note: 'Петли с доводчиком, ящики на роликовых направляющих' },
  { id: 'comfort', name: 'Комфорт', price: 8000, note: 'Скрытые направляющие полного выдвижения, push-to-open, доводчики на всех дверях' },
  { id: 'premium', name: 'Премиум', price: 18000, note: 'Подъёмные механизмы, ящики под столешницей, электропривод, ограничители открывания' },
];

export const EXTRAS = [
  { id: 'light', name: 'Подсветка рабочей зоны', price: 14000, note: 'Светодиодная лента под верхними шкафами, выключатель на цоколе' },
  { id: 'sink', name: 'Мойка из нержавеющей стали', price: 9000, note: 'Врезная, две чаши, крыло для сушки' },
  { id: 'dryer', name: 'Сушка для посуды в шкаф', price: 6000, note: 'Металлическая, с поддоном для воды' },
  { id: 'organizers', name: 'Органайзеры в ящики', price: 12000, note: 'Разделители для приборов, ножей и специй' },
  { id: 'tall', name: 'Пенал под встроенную технику', price: 24000, note: 'Колонна под духовой шкаф, СВЧ и холодильник' },
];

/** Погонные метры гарнитура: длина стены плюс дополнительные стороны планировки. */
export function runMeters(wallCm, layoutId) {
  const layout = LAYOUTS.find((item) => item.id === layoutId) ?? LAYOUTS[0];
  return wallCm / 100 + layout.extra;
}

/** Полный расчёт: что и сколько стоит. */
export function calculate({ wall, layout, facade, worktop, fitting, extras = [] }) {
  const run = runMeters(wall, layout);
  const perMeter = CARCASS + facade.price + worktop.price + fitting.price;
  const furniture = Math.round((run * perMeter) / 100) * 100;

  const chosen = EXTRAS.filter((item) => extras.includes(item.id));
  const options = chosen.reduce((sum, item) => sum + item.price, 0);

  const delivery = Math.round(((furniture + options) * DELIVERY_RATE) / 100) * 100;
  const total = furniture + options + delivery;

  return {
    run,
    perMeter,
    furniture,
    options,
    delivery,
    total,
    min: Math.round((total * (1 - RANGE)) / 100) * 100,
    max: Math.round((total * (1 + RANGE)) / 100) * 100,
    lead: Math.max(facade.lead, worktop.id === 'stone' ? 35 : 0),
    chosen,
  };
}

export const PRICING_STEPS = [
  { title: 'Погонные метры', text: 'Длина стены плюс дополнительные стороны: угловая планировка добавляет 1,2 м, П-образная — 2,4 м, остров — 1,8 м.' },
  { title: 'Что входит в метр', text: `Корпус ${CARCASS.toLocaleString('ru-RU')} ₽ + выбранный фасад + столешница + класс фурнитуры. Это цена за метр готового изделия, а не за «шкаф без ничего».` },
  { title: 'Опции', text: 'Подсветка, мойка, сушка, органайзеры и пенал под технику считаются отдельными позициями — их можно добавить позже.' },
  { title: 'Доставка и сборка', text: `8 % от стоимости изделия: замер, доставка, подъём, сборка и подключение техники. Отдельно за это платить не нужно.` },
];
