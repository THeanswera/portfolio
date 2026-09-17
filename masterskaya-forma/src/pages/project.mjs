/** Страницы проектов: по одной на каждую конфигурацию из каталога. */
import { site } from '../data/site.mjs';
import { projects } from '../data/catalog.mjs';
import { elevation, plan } from '../assets/js/shared/drawing.js';
import { money, meters, days } from '../assets/js/shared/format.js';
import { page, u, sectionHead } from '../render/layout.mjs';
import { icon } from '../render/icons.mjs';
import { pageHead, steps, ctaBlock } from '../render/blocks.mjs';
import { EXTRAS, PRICING_STEPS } from '../assets/js/shared/pricing.js';

function renderProject(project) {
  const { estimate } = project;
  const uid = `p-${project.slug}`;

  const spec = [
    ['Тип', 'Кухня на заказ'],
    ['Планировка', `${project.layout.name} — ${project.layout.hint.toLowerCase()}`],
    ['Длина стены', `${project.wall} см`],
    ['Общая длина гарнитура', meters(estimate.run)],
    ['Фасад', `${project.facade.name}, «${project.facadeColor.name}»`],
    ['Столешница', `${project.worktop.name}, «${project.worktopColor.name}»`],
    ['Фурнитура', `${project.fitting.name} — ${project.fitting.note.toLowerCase()}`],
    ['Опции', estimate.chosen.length ? estimate.chosen.map((item) => item.name.toLowerCase()).join(', ') : 'без дополнительных опций'],
    ['Срок изготовления', days(estimate.lead)],
    ['Место', project.place],
    ['Год', project.year],
  ];

  const money_rows = [
    ['Корпус, фасады, столешница, фурнитура', estimate.furniture],
    ['Опции', estimate.options],
    ['Доставка, подъём, сборка — 8 %', estimate.delivery],
  ];

  const body = [
    pageHead({
      crumb: [
        { href: '/', label: 'Главная' },
        { href: '/projects/', label: 'Проекты' },
        { label: project.title },
      ],
      label: `${project.style} · ${project.place} · ${project.year}`,
      title: project.title,
      text: project.summary,
      actions: `<a class="btn btn--primary" href="${u(`/configurator/?${project.query}`)}">Хочу такую же${icon('arrow', { size: 18 })}</a>
      <a class="btn btn--ghost" href="${u('/projects/')}">Все проекты</a>`,
    }),

    `<section class="section section--tight">
  <div class="container">
    <div class="project-stage">
      <div class="project-stage__draw">
        ${elevation({
          wall: project.wall,
          facadeHex: project.facadeColor.hex,
          worktopHex: project.worktopColor.hex,
          uid,
        })}
      </div>
      <div class="project-stage__side">
        <figure class="project-plan">
          ${plan({ layout: project.layout.id, wall: project.wall, accent: project.facadeColor.hex })}
          <figcaption>План расстановки</figcaption>
        </figure>
        <dl class="spec">
          ${spec.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('\n          ')}
        </dl>
      </div>
    </div>
  </div>
</section>`,

    `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Как это получилось',
      title: 'Что учитывали и почему так',
      text: 'Проект — это не картинка, а набор решений. Ниже — что именно пришлось решать и к чему пришли.',
    })}
    <div class="prose">
      ${project.story.map((paragraph) => `<p>${paragraph}</p>`).join('\n      ')}
    </div>
    <ul class="plain-list" style="margin-top:32px;max-width:70ch">
      ${project.highlights.map((item) => `<li>${icon('check', { size: 17 })}<span>${item}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>`,

    `<section class="section">
  <div class="container">
    ${sectionHead({
      label: 'Расчёт',
      title: 'Сколько это стоит и из чего сложилось',
      text: 'Сумма посчитана той же формулой, что и в конфигураторе: погонные метры, материалы и опции. Никаких «цен по запросу».',
    })}
    <div class="split">
      <div class="money">
        ${money_rows
          .map(
            ([label, value]) => `<div class="money__row"><span>${label}</span><span class="mono">${money(value)}</span></div>`,
          )
          .join('\n        ')}
        <div class="money__row money__row--total"><span>Итого</span><span class="mono">${money(estimate.total)}</span></div>
        <p class="note-line">Вилка с учётом изменения цен на материалы: ${money(estimate.min)} — ${money(estimate.max)}. Точная сумма фиксируется в договоре после замера.</p>
      </div>
      <div class="split__aside">
        <h3>Что входит</h3>
        <ul class="plain-list" style="margin-top:8px">
          <li>${icon('check', { size: 17 })}<span>Замер, проект и шаблон по месту</span></li>
          <li>${icon('check', { size: 17 })}<span>Корпус, фасады, кромка, фурнитура</span></li>
          <li>${icon('check', { size: 17 })}<span>Доставка, подъём и сборка</span></li>
          <li>${icon('check', { size: 17 })}<span>Подключение техники и вывоз упаковки</span></li>
          <li>${icon('check', { size: 17 })}<span>Гарантия ${site.warranty} на корпус и фурнитуру</span></li>
        </ul>
        <p style="margin-top:22px"><a class="btn btn--primary btn--small" href="${u(`/configurator/?${project.query}`)}">Открыть в конфигураторе</a></p>
      </div>
    </div>
  </div>
</section>`,

    `<section class="section" style="background:var(--bg-2);border-block:1px solid var(--line)">
  <div class="container">
    ${sectionHead({
      label: 'Опции',
      title: 'Что можно добавить к такому проекту',
      text: 'Каждая опция считается отдельной строкой — видно, сколько она добавляет к цене.',
    })}
    <div class="cards">
      ${EXTRAS.map(
        (item) => `<article class="card"><div class="card__body">
        <h3>${item.name}</h3>
        <p class="text-soft" style="font-size:14.5px">${item.note}</p>
        <div class="card__meta"><span class="mono">${money(item.price)}</span><span>${estimate.chosen.some((chosen) => chosen.id === item.id) ? 'в этом проекте есть' : 'можно добавить'}</span></div>
      </div></article>`,
      ).join('\n      ')}
    </div>
  </div>
</section>`,

    `<section class="section">
  <div class="container">
    ${sectionHead({ label: 'Как мы считаем', title: 'Формула, по которой получилась сумма' })}
    ${steps(PRICING_STEPS)}
  </div>
</section>`,

    `<section class="section"><div class="container">${ctaBlock({
      title: 'Обсудим похожую кухню?',
      text: 'Откройте конфигурацию в конфигураторе, поменяйте под себя длину и материалы и пришлите расчёт — ответим по делу.',
      primary: { href: `/configurator/?${project.query}`, label: 'Открыть в конфигураторе' },
    })}</div></section>`,
  ].join('\n\n');

  const title = `${project.title} — кухня на заказ, ${meters(estimate.run)}`;
  const description = `${project.summary} Расчёт: ${money(estimate.total)}, срок ${days(estimate.lead)}.`;

  return {
    out: `projects/${project.slug}/index.html`,
    path: project.url,
    title,
    description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: project.title,
      description: project.summary,
      url: `${site.url}${project.url}`,
      brand: { '@type': 'Brand', name: site.legalName },
      offers: {
        '@type': 'Offer',
        price: estimate.total,
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock',
        url: `${site.url}${project.url}`,
      },
    },
    render: () =>
      page({
        title,
        description,
        path: project.url,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: project.title,
          description: project.summary,
          url: `${site.url}${project.url}`,
          brand: { '@type': 'Brand', name: site.legalName },
          offers: {
            '@type': 'Offer',
            price: estimate.total,
            priceCurrency: 'RUB',
            availability: 'https://schema.org/InStock',
            url: `${site.url}${project.url}`,
          },
        },
        body,
      }),
  };
}

export const projectPages = projects.map(renderProject);
