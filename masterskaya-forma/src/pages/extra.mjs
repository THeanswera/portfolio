/** Страница «спасибо» и 404. */
import { site } from '../data/site.mjs';
import { page, u } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { pageHead } from '../render/blocks.mjs';

export const thanks = {
  out: 'thanks/index.html',
  path: '/thanks/',
  noindex: true,
  title: 'Заявка отправлена',
  description: 'Заявка отправлена. Ответим в течение рабочего дня.',
  render: () =>
    page({
      title: 'Заявка отправлена',
      description: 'Заявка отправлена. Ответим в течение рабочего дня.',
      path: '/thanks/',
      body: [
        pageHead({
          crumb: [{ href: '/', label: 'Главная' }, { label: 'Заявка отправлена' }],
          label: 'Готово',
          title: 'Заявка у нас',
          text: 'Мы получили расчёт целиком: длину, планировку, материалы и опции. Ответим в течение рабочего дня — обычно быстрее.',
          actions: `<a class="btn btn--primary" href="${u('/projects/')}">Посмотреть проекты${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--ghost" href="${site.telegram}" target="_blank" rel="noreferrer">${icon('send', { size: 17 })}Написать в Telegram</a>`,
        }),
        `<section class="section section--tight">
  <div class="container">
    <div class="split">
      <div>
        <h2>Что будет дальше</h2>
        <ul class="plain-list" style="margin-top:20px;max-width:62ch">
          <li>${icon('check', { size: 17 })}<span>Посмотрим конфигурацию и уточним детали, если чего-то не хватает</span></li>
          <li>${icon('check', { size: 17 })}<span>Предложим удобное время для замера — он бесплатный и ни к чему не обязывает</span></li>
          <li>${icon('check', { size: 17 })}<span>Через два дня после замера пришлём чертёж, спецификацию и точную смету</span></li>
        </ul>
      </div>
      <div class="split__aside">
        <h3>Если заявка не дошла</h3>
        <p class="text-soft" style="margin-top:12px;font-size:14.5px">
          Напишите напрямую — так быстрее всего:
        </p>
        <p style="margin-top:16px"><a class="contact__value mono" href="${site.telegram}" target="_blank" rel="noreferrer">${site.telegramHandle}</a></p>
        <p><a class="contact__value mono" href="mailto:${site.email}">${site.email}</a></p>
        <p><a class="contact__value mono" href="tel:${site.phoneHref}">${site.phone}</a></p>
      </div>
    </div>
  </div>
</section>`,
      ].join('\n\n'),
    }),
};

export const notFound = {
  out: '404.html',
  path: '/404.html',
  noindex: true,
  title: 'Страница не найдена',
  description: 'Такой страницы нет. Вернитесь на главную или откройте конфигуратор.',
  render: () =>
    page({
      title: 'Страница не найдена',
      description: 'Такой страницы нет. Вернитесь на главную или откройте конфигуратор.',
      path: '/404.html',
      body: [
        pageHead({
          crumb: [{ href: '/', label: 'Главная' }, { label: '404' }],
          label: 'Ошибка 404',
          title: 'Такой страницы нет',
          text: 'Возможно, адрес изменился или в ссылке опечатка. Ниже — то, что обычно ищут: проекты, конфигуратор и материалы.',
          actions: `<a class="btn btn--primary" href="${u('/')}">На главную${icon('arrow', { size: 18 })}</a>
          <a class="btn btn--ghost" href="${u('/configurator/')}">Собрать кухню</a>`,
        }),
        `<section class="section section--tight">
  <div class="container">
    <div class="cards cards--three">
      ${[
        { href: '/projects/', title: 'Проекты', text: 'Шесть кухонь с расчётами: планировки, материалы, цены.' },
        { href: '/materials/', title: 'Материалы', text: 'Фасады, столешницы, фурнитура — с наценкой за метр.' },
        { href: '/production/', title: 'Производство', text: 'Свой цех, сроки от 21 до 45 дней, гарантия 5 лет.' },
      ]
        .map(
          (item) => `<a class="card" href="${u(item.href)}"><div class="card__body">
        <h3>${item.title}</h3>
        <p class="text-soft" style="font-size:14.5px">${item.text}</p>
        <div class="card__meta"><span>Открыть</span><span>${icon('arrow', { size: 16 })}</span></div>
      </div></a>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`,
      ].join('\n\n'),
    }),
};
