/** Конфигуратор — главный инструмент сайта. */
import { site } from '../data/site.mjs';
import { faq } from '../data/faq.mjs';
import { PRICING_STEPS } from '../assets/js/shared/pricing.js';
import { toolHtml, DEFAULT_STATE } from '../assets/js/shared/toolview.js';
import { page, u, sectionHead } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { pageHead, steps, faqBlock, ctaBlock } from '../render/blocks.mjs';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Конфигуратор кухни',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Любая',
  url: `${site.url}/configurator/`,
  description:
    'Онлайн-конфигуратор кухни: планировка, размеры, фасады, столешница и фурнитура с расчётом цены и срока.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB' },
  isAccessibleForFree: true,
};

const body = [
  pageHead({
    crumb: [
      { href: '/', label: 'Главная' },
      { label: 'Конфигуратор' },
    ],
    label: 'Живой расчёт',
    title: 'Соберите кухню и посмотрите цену',
    text: 'Пять параметров — и вы видите чертёж, вилку цены и срок изготовления. Ссылку на расчёт можно скопировать и отправить кому угодно: конфигурация сохраняется в адресе страницы.',
  }),

  `<section class="section section--tight">
  <div class="container container--wide">
    ${toolHtml(DEFAULT_STATE, { full: true, action: u('/configurator/') })}
    <div class="tool-bar">
      <button class="btn btn--ghost btn--small" type="button" data-copy-config>Скопировать ссылку на расчёт</button>
      <button class="btn btn--ghost btn--small" type="button" data-reset-config>Сбросить к исходной</button>
      <span class="label">Конфигурация сохраняется в адресе страницы</span>
    </div>
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Что дальше',
      title: 'От расчёта до собранной кухни',
      text: 'Расчёт в конфигураторе — это начало разговора, а не счёт на оплату. Дальше мы приезжаем, меряем и считаем точно.',
    })}
    ${steps([
      { title: 'Вы отправляете расчёт', text: 'Мы получаем конфигурацию целиком: длину, планировку, материалы, опции и вилку цены. Уточняем детали по телефону или в переписке — обычно за один разговор.' },
      { title: 'Замер и точная смета', text: 'Замерщик приезжает с образцами, проверяет стены и углы, делает шаблон. Через два дня у вас чертёж, спецификация и точная смета.' },
      { title: 'Договор и производство', text: 'Смета фиксируется в договоре вместе со сроком. Дальше — раскрой, кромка, покраска фасадов, сборка и монтаж с подключением техники.' },
    ])}
  </div>
</section>`,

  `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'Как считается цена',
      title: 'Никакой магии в цифрах',
      text: 'Формула открыта, её можно проверить на калькуляторе. Мы не прячем наценку в «работу менеджера» и не поднимаем цену после замера.',
    })}
    ${steps(PRICING_STEPS)}
    <p style="margin-top:28px">
      <a class="btn btn--ghost" href="${u('/materials/#price')}">Пример расчёта по шагам${icon('arrow', { size: 18 })}</a>
    </p>
  </div>
</section>`,

  `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Вопросы о расчёте',
      title: 'Что уточняют чаще всего',
    })}
    ${faqBlock(faq.slice(0, 3))}
  </div>
</section>`,

  `<section class="section"><div class="container">${ctaBlock({
    title: 'Соберите кухню — мы ответим по делу',
    text: 'В заявке придёт готовая конфигурация: менеджер сразу увидит, что вы хотите, и не будет спрашивать «а какая у вас кухня».',
    primary: { href: '/projects/', label: 'Посмотреть проекты' },
  })}</div></section>`,
].join('\n\n');

export default {
  out: 'configurator/index.html',
  path: '/configurator/',
  title: 'Конфигуратор кухни — расчёт цены и срока онлайн',
  description:
    'Соберите кухню онлайн: планировка, длина стены, фасады, столешница, фурнитура и опции. Цена и срок пересчитываются сразу, конфигурацию можно отправить ссылкой.',
  jsonLd,
  render: () =>
    page({
      title: 'Конфигуратор кухни — расчёт цены и срока онлайн',
      description:
        'Соберите кухню онлайн: планировка, длина стены, фасады, столешница, фурнитура и опции. Цена и срок пересчитываются сразу, конфигурацию можно отправить ссылкой.',
      path: '/configurator/',
      jsonLd,
      body,
    }),
};
