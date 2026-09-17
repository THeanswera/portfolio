/** Контакты. */
import { site } from '../data/site.mjs';
import { page, u, sectionHead } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { pageHead, ctaBlock } from '../render/blocks.mjs';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Контакты — ${site.legalName}`,
  url: `${site.url}/contacts/`,
  disambiguatingDescription: 'Демонстрационный проект: контакты вымышлены.',
};

const rows = [
  { icon: 'phone', label: 'Телефон', value: site.phone, href: `tel:${site.phoneHref}`, note: 'Звонки принимаем без автоответчика' },
  { icon: 'send', label: 'Telegram', value: site.telegramHandle, href: site.telegram, note: 'Самый быстрый способ: отвечаем в течение часа в рабочее время' },
  { icon: 'mail', label: 'Почта', value: site.email, href: `mailto:${site.email}`, note: 'Для чертежей, планировок и спецификаций' },
  { icon: 'clock', label: 'Часы работы', value: site.hours, note: site.hoursNote },
];

const body = [
  pageHead({
    crumb: [{ href: '/', label: 'Главная' }, { label: 'Контакты' }],
    label: 'Контакты',
    title: 'Приезжайте, звоните или напишите',
    text: 'Шоурум и производство находятся по одному адресу: можно посмотреть образцы материалов и увидеть, как собирают корпуса. Лучше предупредить о визите — вас встретит тот, кто будет вести заказ.',
    actions: `<button class="btn btn--primary" type="button" data-lead-open>Оставить заявку${icon('arrow', { size: 18 })}</button>
    <a class="btn btn--ghost" href="${site.telegram}" target="_blank" rel="noreferrer">${icon('send', { size: 17 })}Telegram</a>`,
  }),

  `<section class="section section--tight">
  <div class="container">
    <div class="contact-grid">
      ${rows
        .map(
          (row) => `<article class="contact">
        <span class="contact__icon">${icon(row.icon, { size: 20 })}</span>
        <p class="label">${row.label}</p>
        ${
          row.href
            ? `<a class="contact__value mono" href="${row.href}"${row.href.startsWith('http') ? ' target="_blank" rel="noreferrer"' : ''}>${row.value}</a>`
            : `<p class="contact__value mono">${row.value}</p>`
        }
        <p class="contact__note">${row.note}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    <div class="split">
      <div>
        ${sectionHead({
          label: 'Адрес',
          title: 'Шоурум и цех в одном месте',
          text: site.addressNote,
        })}
        <p class="contact__value mono" style="font-size:19px">${site.address}</p>
        <ul class="plain-list" style="margin-top:24px;max-width:62ch">
          <li>${icon('check', { size: 17 })}<span>На машине: въезд со стороны производственной улицы, парковка перед воротами</span></li>
          <li>${icon('check', { size: 17 })}<span>На общественном транспорте: 10 минут пешком от остановки</span></li>
          <li>${icon('check', { size: 17 })}<span>Приезжайте с планом квартиры или фотографиями — посчитаем на месте</span></li>
        </ul>
      </div>
      <div class="split__aside">
        <h3>Как проходит визит</h3>
        <ol class="plain-list" style="margin-top:8px">
          <li><span class="mono" style="color:var(--wood)">01</span><span>Показываем образцы фасадов и столешниц при разном свете</span></li>
          <li><span class="mono" style="color:var(--wood)">02</span><span>Разбираем вашу планировку и говорим, что встанет, а что нет</span></li>
          <li><span class="mono" style="color:var(--wood)">03</span><span>Считаем предварительную смету прямо при вас</span></li>
        </ol>
        <p class="note-line" style="margin-top:20px">
          Визит ни к чему не обязывает: можно уехать подумать или не возвращаться.
        </p>
      </div>
    </div>
  </div>
</section>`,

  `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'О проекте',
      title: 'Это демонстрационный сайт',
      text: 'Сайт сделан как образец: он показывает, как может работать сайт мастерской мебели. Компания, адрес, телефон и цены вымышлены, заявки никуда не уходят.',
    })}
    <div class="split">
      <div class="prose">
        <p>
          Всё, что здесь есть, работает по-настоящему: конфигуратор считает цену по открытой формуле,
          чертежи строятся параметрически, формы отправляют данные. Меняются только реквизиты —
          на месте вымышленной мастерской может быть ваша.
        </p>
        <p>
          Если сайт нужен вам — <a class="link" href="${u('/privacy/')}">посмотрите, как устроена работа с данными</a>,
          и напишите тому, кто делал этот сайт: контакты разработчика указаны на странице портфолио.
        </p>
      </div>
      <div class="split__aside">
        <h3>Что здесь настоящее</h3>
        <ul class="plain-list" style="margin-top:8px">
          <li>${icon('check', { size: 17 })}<span>Конфигуратор с пересчётом цены и срока</span></li>
          <li>${icon('check', { size: 17 })}<span>Параметрические чертежи и планы</span></li>
          <li>${icon('check', { size: 17 })}<span>Формы заявок с проверкой на стороне сервера</span></li>
          <li>${icon('check', { size: 17 })}<span>Политика конфиденциальности и cookie-уведомление</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>`,

  `<section class="section"><div class="container">${ctaBlock({
    title: 'Соберите кухню перед визитом',
    text: 'Если придёте с готовым расчётом, разговор будет предметным: останется обсудить материалы и сроки, а не выяснять размеры.',
    primary: { href: '/configurator/', label: 'Открыть конфигуратор' },
  })}</div></section>`,
].join('\n\n');

export default {
  out: 'contacts/index.html',
  path: '/contacts/',
  title: 'Контакты мастерской: адрес, телефон, Telegram',
  description:
    'Как с нами связаться: телефон, Telegram, почта, часы работы, адрес шоурума и цеха. Замер бесплатный, визит ни к чему не обязывает.',
  jsonLd,
  render: () =>
    page({
      title: 'Контакты мастерской: адрес, телефон, Telegram',
      description:
        'Как с нами связаться: телефон, Telegram, почта, часы работы, адрес шоурума и цеха. Замер бесплатный, визит ни к чему не обязывает.',
      path: '/contacts/',
      jsonLd,
      body,
    }),
};
