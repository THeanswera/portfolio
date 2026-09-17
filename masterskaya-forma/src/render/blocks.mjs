/** Повторяемые блоки страниц. */
import { u, sectionHead, crumbs } from './layout.mjs';
import { icon } from './icons.mjs';
import { site } from '../data/site.mjs';
import { elevation } from '../assets/js/shared/drawing.js';
import { money, meters, days } from '../assets/js/shared/format.js';

/** Карточка проекта: чертёж этой самой конфигурации плюс характеристики. */
export function projectCard(project, index = 0) {
  return `<a class="card" href="${u(project.url)}" data-style="${project.style}">
  <div class="card__draw">${elevation({
    wall: project.wall,
    facadeHex: project.facadeColor.hex,
    worktopHex: project.worktopColor.hex,
    uid: `card-${project.slug}`,
    compact: true,
  })}</div>
  <div class="card__body">
    <p class="label">${project.style} · ${project.place}</p>
    <h3>${project.title}</h3>
    <p class="text-soft" style="font-size:14.5px">${project.facade.name}, столешница «${project.worktop.name.toLowerCase()}», ${project.layout.name.toLowerCase()} планировка.</p>
    <div class="card__meta">
      <span>${meters(project.estimate.run)} гарнитура · ${days(project.estimate.lead)}</span>
      <span class="card__price">${money(project.estimate.total)}</span>
    </div>
  </div>
</a>`;
}

export function projectGrid(list, className = 'cards') {
  return `<div class="${className}">
  ${list.map((item, index) => projectCard(item, index)).join('\n  ')}
</div>`;
}

/** Сетка обещаний с иконками. */
export function promiseGrid(items) {
  return `<div class="promises">
  ${items
    .map(
      (item) => `<article class="promise">
    <span class="promise__icon">${icon(item.icon, { size: 22 })}</span>
    <h3>${item.title}</h3>
    <p>${item.text}</p>
  </article>`,
    )
    .join('\n  ')}
</div>`;
}

export function steps(items) {
  return `<ol class="steps">
  ${items
    .map(
      (item, index) => `<li class="step">
    <span class="step__index">${String(index + 1).padStart(2, '0')}</span>
    <h3>${item.title}</h3>
    <p>${item.text}</p>
  </li>`,
    )
    .join('\n  ')}
</ol>`;
}

export function faqBlock(items) {
  return `<div class="faq">
  ${items
    .map(
      (item) => `<details>
    <summary>${item.q}</summary>
    <p>${item.a}</p>
  </details>`,
    )
    .join('\n  ')}
</div>`;
}

export function ctaBlock({
  title = 'Соберите кухню и пришлите расчёт',
  text = 'Конфигуратор покажет чертёж, вилку цены и срок. Расчёт можно отправить нам — в заявке придёт готовая конфигурация, и разговор начнётся с дела, а не с «расскажите о задаче».',
  primary = { href: '/configurator/', label: 'Открыть конфигуратор' },
  telegram = true,
} = {}) {
  return `<div class="cta">
  <div class="cta__grid">
    <div>
      <h2>${title}</h2>
      <p class="lead" style="margin-top:16px;max-width:52ch">${text}</p>
    </div>
    <div class="cta__actions">
      <a class="btn btn--primary" href="${u(primary.href)}">${primary.label}${icon('arrow', { size: 18 })}</a>
      ${telegram ? `<a class="btn btn--ghost" href="${site.telegram}" target="_blank" rel="noreferrer">${icon('send', { size: 17 })}Написать в Telegram</a>` : ''}
    </div>
  </div>
</div>`;
}

export { sectionHead };

/** Шапка внутренней страницы: крошки, надзаголовок, заголовок, лид. */
export function pageHead({ crumb, label, title, text, actions = '' }) {
  return `<section class="page-head">
  <div class="container">
    ${crumbs(crumb)}
    ${label ? `<p class="label" style="margin-top:24px">${label}</p>` : ''}
    <h1 class="display">${title}</h1>
    ${text ? `<p class="lead">${text}</p>` : ''}
    ${actions ? `<div class="page-head__actions">${actions}</div>` : ''}
  </div>
</section>`;
}
