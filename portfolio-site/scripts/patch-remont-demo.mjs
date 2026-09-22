// Разовая правка демонстрационного сайта «ТехРемонт».
//
// Что делает:
// 1) добавляет видимую пометку о демонстрационном проекте в подвал каждой страницы;
// 2) убирает неподтверждённые обещания реальной компании: возраст, гарантию на
//    12 месяцев, «устраним бесплатно» и «повторный ремонт бесплатно»;
// 3) переводит условия в образец оформления: «пример условия», «в макете»;
// 4) приводит адрес сайта в canonical и og:url к тому, где он на самом деле лежит;
// 5) чинит список селекторов тап-целей в css/style.css (из-за него ссылки в
//    крошках, подвале и контактах получили position: absolute и наехали на текст);
// 6) убирает опечатку «Цены указаны и указаны без стоимости запчастей»;
// 7) разрешает перенос внутри длинного слова в заголовке (на 320px он вылезал
//    за колонку);
// 8) добавляет стиль .footer__demo в css/style.css.
//
// Скрипт идемпотентен: повторный запуск на исправленных файлах ничего не меняет.
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

  // Опечатка исходного макета: «Цены указаны и указаны без стоимости запчастей».
  // Перенос строки в замене сохраняет принятую в файле ширину абзаца.
  ['Цены указаны и указаны без стоимости запчастей', 'Цены указаны\n            без стоимости запчастей'],
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

/**
 * Тап-цели ссылок внутри текста.
 *
 * В опубликованном style.css список селекторов остался без закрывающей скобки:
 * ссылки и их псевдоэлементы попали в одно правило и вместе с `content: ""`
 * получили `position: absolute`. Из-за этого «Главная» и «Услуги» в крошках,
 * контакты в подвале и телефон с почтой в блоке заявки уехали к левому краю и
 * наложились на заголовки. Возвращаем ссылкам отдельное правило: псевдоэлемент
 * по-прежнему расширяет область нажатия, но отсчитывается от самой ссылки.
 */
const BROKEN_TAP_TARGETS = `.request__contacts a,
.footer__contact a,
.section__note a,
.breadcrumbs a,
.footer__bottom-links a,
.form__consent-text a,

.request__contacts a::before,
.footer__contact a::before,
.section__note a::before,
.breadcrumbs a::before,
.footer__bottom-links a::before,
.form__consent-text a::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -13px;
  bottom: -13px;
}`;

const FIXED_TAP_TARGETS = `.request__contacts a,
.footer__contact a,
.section__note a,
.breadcrumbs a,
.footer__bottom-links a,
.form__consent-text a {
  position: relative;
}

.request__contacts a::before,
.footer__contact a::before,
.section__note a::before,
.breadcrumbs a::before,
.footer__bottom-links a::before,
.form__consent-text a::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -13px;
  bottom: -13px;
}`;

/**
 * Перенос внутри длинного слова в заголовке.
 *
 * «Политика конфиденциальности» на экране 320px шире колонки на 11px: заголовок
 * вылезал за сетку и обрезался. Правило срабатывает только тогда, когда слово
 * само не помещается в строку, поэтому на обычных ширинах вид не меняется.
 */
const PLAIN_TITLE = `.page-hero__title {
  font-size: var(--fs-3xl);
  color: #fff;
  max-width: 24ch;
}`;

const WRAPPING_TITLE = `.page-hero__title {
  font-size: var(--fs-3xl);
  color: #fff;
  max-width: 24ch;
}

.page-hero__title,
.hero__title,
.section__title,
.request__title,
.cta__title {
  overflow-wrap: break-word;
}`;

const cssNotes = [];

if (css.includes(BROKEN_TAP_TARGETS)) {
  css = css.replace(BROKEN_TAP_TARGETS, FIXED_TAP_TARGETS);
  cssNotes.push('починено правило тап-целей: ссылки больше не position: absolute');
}

if (css.includes(PLAIN_TITLE)) {
  css = css.replace(PLAIN_TITLE, WRAPPING_TITLE);
  cssNotes.push('добавлен перенос внутри длинных слов в заголовках');
}

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
  cssNotes.push('добавлен стиль .footer__demo');
}

// Пишем файл, если менялось хоть что-то: починка правила и пометка независимы.
if (cssNotes.length > 0) await writeFile(cssPath, css, 'utf8');

for (const item of report) {
  console.log(`${item.file.padEnd(18)} ${item.changes.length ? item.changes.join('; ') : 'изменений нет'}`);
}
console.log(`\ncss/style.css — ${cssNotes.length ? cssNotes.join('; ') : 'изменений нет'}`);
