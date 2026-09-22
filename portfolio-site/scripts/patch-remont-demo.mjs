// Разовая правка демонстрационного сайта «ТехРемонт».
//
// Что делает:
// 1) добавляет видимую пометку о демонстрационном проекте в подвал каждой страницы;
// 2) убирает неподтверждённые обещания реальной компании: возраст, гарантию на
//    12 месяцев, «устраним бесплатно» и «повторный ремонт бесплатно»;
// 3) переводит условия в образец оформления: «пример условия», «в макете»;
// 4) приводит адрес сайта в canonical и og:url к тому, где он на самом деле лежит;
// 5) добавляет стиль .footer__demo в css/style.css.
//
// Запуск: node scripts/patch-remont-demo.mjs
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', 'demos', 'remont');

/** Пометка: что это за сайт и почему по нему нельзя заказать услугу. */
const NOTICE = `<p class="footer__demo">
            Демонстрационный проект: компания, адрес, телефон и цены вымышлены. Услуги не
            оказываются, формы показывают пример интерфейса и никуда не отправляют данные.
            Гарантия, сроки и цифры на страницах — образец оформления, а не обязательство.
          </p>
`;

/**
 * Замены: было → стало.
 *
 * Формулировки в разметке перенесены по строкам и разделены тегами, поэтому
 * подстановка идёт по «сжатому» виду (переносы и лишние пробелы — один пробел).
 *
 * Порядок важен: одни правила рассчитаны на исходный текст, другие — на уже
 * изменённый, поэтому вторые стоят ниже.
 */
const REPLACEMENTS = [
  // Возраст компании: неподтверждённая заявка о реальном бизнесе.
  [
    'Сервисный центр «ТехРемонт» работает с 2014 года. За это время мы собрали мастерскую, в которой есть',
    'В макете сервисный центр «ТехРемонт» — мастерская, в которой есть',
  ],
  ['с 2014 года', 'в макете'],
  ['&copy; 2014–2026 «ТехРемонт».', '&copy; 2026 «ТехРемонт». Демонстрационный макет.'],
  ['© 2014–2026 «ТехРемонт».', '© 2026 «ТехРемонт». Демонстрационный макет.'],

  // Гарантия и сроки: из обещаний в пример оформления.
  ['Гарантия 12 месяцев', 'Гарантия — пример условия'],
  ['гарантия 12 месяцев', 'гарантия — пример условия'],
  ['На работу и установленные детали действует гарантия 12 месяцев.', 'На работу и установленные детали в макете действует гарантия.'],
  [
    'На выполненные работы и установленные запчасти выдаём гарантийный талон. Если неисправность вернётся — устраним бесплатно.',
    'В макете показан гарантийный талон: пример документа, который обычно выдаётся после ремонта.',
  ],
  [
    'Выдаём квитанцию об оплате и гарантийный талон на 12 месяцев. Отвечаем на вопросы по работе техники.',
    'В макете есть квитанция об оплате и гарантийный талон — образцы документов.',
  ],
  ['Запускаем технику вместе с вами, выдаём квитанцию и гарантийный талон на 12 месяцев.', 'Запускаем технику вместе с вами, в макете выдаётся квитанция и гарантийный талон.'],
  ['гарантийный талон на 12 месяцев. По этим документам принимаются гарантийные обращения', 'гарантийный талон — образец документа. По этим документам заявки не принимаются'],
  ['гарантийный талон на 12 месяцев', 'гарантийный талон — образец документа'],
  ['12 месяцев', 'срок по условию макета'],
  ['В течение гарантийных 12 месяцев', 'В течение гарантийного срока'],
  ['гарантийных 12 месяцев', 'гарантийного срока'],
  ['Повторный ремонт по той же причине выполняем бесплатно', 'Повторный ремонт по той же причине в макете описан как бесплатный'],
  ['выполняем бесплатно', 'в макете описан как бесплатный'],

  // Правила ниже срабатывают по уже изменённому тексту.
  ['<p class="fact__value">срок по условию макета</p>', '<p class="fact__value">пример условия</p>'],
  ['<strong>срок по условию макета</strong>', '<strong>Диагностика</strong>'],
  ['В течение гарантийных срок по условию макета повторный ремонт по той же причине в макете описан как бесплатный', 'В течение гарантийного срока повторный ремонт по той же причине в макете описан как бесплатный'],
  ['Гарантия — пример условия', 'Гарантия по условиям макета'],
  ['гарантия — пример условия', 'гарантия по условиям макета'],
  ['<strong>в макете</strong>Работаем по Москве и области', '<strong>Москва и область</strong>Выезд мастера на дом'],

  // Метаданные и адрес: описание должно читаться, а canonical — указывать на
  // тот адрес, где сайт действительно лежит (в макете стоял techremont.example).
  [
    'Бесплатная диагностика, выезд мастера в день обращения, гарантия по условиям макета.',
    'Диагностика, выезд мастера и согласование стоимости до начала работ.',
  ],
  [
    'Бесплатная диагностика, выезд мастера в день обращения, гарантия — пример условия.',
    'Диагностика, выезд мастера и согласование стоимости до начала работ.',
  ],
  [
    'три направления ремонта, бесплатная диагностика, согласование стоимости до начала работ и гарантия — пример условия на работы и запчасти.',
    'три направления ремонта, диагностика и согласование стоимости до начала работ.',
  ],
  ['https://techremont.example/index.html', 'https://rootlost.ru/remont/'],
  ['https://techremont.example/catalog.html', 'https://rootlost.ru/remont/catalog.html'],
  ['https://techremont.example/prices.html', 'https://rootlost.ru/remont/prices.html'],
  ['https://techremont.example/about.html', 'https://rootlost.ru/remont/about.html'],
  ['https://techremont.example/contacts.html', 'https://rootlost.ru/remont/contacts.html'],
  ['https://techremont.example/privacy.html', 'https://rootlost.ru/remont/privacy.html'],
  ['https://techremont.example/service-1.html', 'https://rootlost.ru/remont/service-1.html'],
  ['https://techremont.example/service-2.html', 'https://rootlost.ru/remont/service-2.html'],
  ['https://techremont.example/service-3.html', 'https://rootlost.ru/remont/service-3.html'],
  ['https://techremont.example', 'https://rootlost.ru/remont'],
  ['info@techremont.ru', 'info@example.com'],
];

/** Заменяет формулировку, не обращая внимания на переносы строк внутри неё. */
function replacePhrase(text, from, to) {
  const pattern = from
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('\\s+');

  const regex = new RegExp(pattern, 'g');
  const matches = text.match(regex);
  if (!matches) return { text, count: 0 };
  return { text: text.replace(regex, to), count: matches.length };
}

const htmlFiles = (await readdir(root)).filter((file) => file.endsWith('.html'));
const report = [];

for (const file of htmlFiles) {
  const full = path.join(root, file);
  let text = await readFile(full, 'utf8');
  const changes = [];

  for (const [from, to] of REPLACEMENTS) {
    const result = replacePhrase(text, from, to);
    if (result.count === 0) continue;
    text = result.text;
    const short = from.length > 44 ? `${from.slice(0, 44)}…` : from;
    changes.push(`${result.count}× «${short}»`);
  }

  // Пометку добавляем один раз, перед нижней полосой подвала.
  if (!text.includes('footer__demo')) {
    const marker = '<div class="footer__bottom">';
    if (text.includes(marker)) {
      text = text.replace(marker, `${NOTICE}        ${marker}`);
      changes.push('добавлена пометка о демо');
    }
  }

  await writeFile(full, text, 'utf8');
  report.push({ file, changes });
}

// Стиль пометки: заметный, но в палитре сайта.
const cssPath = path.join(root, 'css', 'style.css');
let css = await readFile(cssPath, 'utf8');

if (!css.includes('.footer__demo')) {
  css += `
/* Пометка о демонстрационном проекте: заметная, но в палитре сайта.
   Текст светлый — подвал тёмный, обычный --color-text на нём нечитаем. */
.footer__demo {
  margin: 0 0 24px;
  padding: 14px 18px;
  border: 1px solid var(--color-accent);
  border-left-width: 4px;
  border-radius: 2px;
  background: rgba(237, 106, 44, 0.1);
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-on-dark);
  max-width: 760px;
}

@media (max-width: 640px) {
  .footer__demo {
    font-size: 13px;
    padding: 12px 14px;
  }
}
`;
  await writeFile(cssPath, css, 'utf8');
}

for (const item of report) {
  console.log(`${item.file.padEnd(18)} ${item.changes.length ? item.changes.join('; ') : 'изменений нет'}`);
}
console.log('\ncss/style.css — стиль .footer__demo добавлен');
