/**
 * Заявки. Сначала пробуем отправить на сервер (send.php рядом с сайтом).
 * Если сервер недоступен — не теряем заявку: копируем текст в буфер
 * и открываем чат Telegram, показывая, что вставить.
 */
import { site } from './site-data.js';
import { readState, resolve } from './shared/toolview.js';
import { EXTRAS } from './shared/pricing.js';
import { money, days, meters } from './shared/format.js';

const ENDPOINT = `${site.base}/send.php`;

const extraName = (id) => EXTRAS.find((item) => item.id === id)?.name ?? id;

/**
 * Конфигурация человеческим языком: менеджеру нужен состав заказа,
 * а не строка параметров в адресе.
 */
function configLines() {
  if (!document.querySelector('[data-tool]')) return '';

  const state = readState(window.location.search);
  const { facade, color, worktop, topColor, fitting, layout, estimate } = resolve(state);

  return [
    `Планировка: ${layout.name.toLowerCase()}`,
    `Длина стены: ${state.wall} см, всего ${meters(estimate.run)} гарнитура`,
    `Фасад: ${facade.name}, «${color.name}»`,
    `Столешница: ${worktop.name}, «${topColor.name}»`,
    `Фурнитура: ${fitting.name.toLowerCase()}`,
    `Опции: ${state.extras.length ? state.extras.map(extraName).join(', ').toLowerCase() : 'нет'}`,
    `Расчёт: ${money(estimate.total)}, вилка ${money(estimate.min)} — ${money(estimate.max)}, срок ${days(estimate.lead)}`,
  ].join('\n');
}

/** Что видно в окне заявки: без длинной ссылки, чтобы ничего не распирало. */
function describeShort() {
  const lines = configLines();
  return lines || 'Заявка без конфигурации: посетитель оставил контакт на странице.';
}

/** Что уходит на сервер: то же плюс ссылка на расчёт. */
function describeFull() {
  const lines = configLines();
  return [lines, `Ссылка на расчёт: ${window.location.href}`].filter(Boolean).join('\n');
}

function compose(payload) {
  return [
    'Заявка с сайта мастерской «Форма»',
    '',
    `Имя: ${payload.name}`,
    `Контакт: ${payload.contact}`,
    payload.comment ? `Комментарий: ${payload.comment}` : '',
    '',
    payload.config,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const first = modal.querySelector('input[name="name"]');
  window.setTimeout(() => first?.focus(), 40);
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

export function initForms() {
  const modal = document.querySelector('[data-lead]');
  if (!modal) return;

  const form = modal.querySelector('[data-lead-form]');
  const status = modal.querySelector('[data-lead-status]');
  const summary = modal.querySelector('[data-lead-summary]');

  document.querySelectorAll('[data-lead-open]').forEach((button) => {
    button.addEventListener('click', () => {
      if (summary) summary.textContent = describeShort();
      status.textContent = '';
      openModal(modal);
    });
  });

  modal.querySelectorAll('[data-lead-close]').forEach((button) => {
    button.addEventListener('click', () => closeModal(modal));
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal(modal);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      contact: String(data.get('contact') ?? '').trim(),
      comment: String(data.get('comment') ?? '').trim(),
      honey: String(data.get('honey') ?? ''),
      config: describeFull(),
      page: window.location.pathname,
    };

    if (!payload.name || !payload.contact) {
      status.textContent = 'Заполните имя и контакт — иначе мы не сможем ответить.';
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = 'Отправляем…';

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.innerHTML = `<p class="modal__done">Заявка отправлена. Ответим в течение рабочего дня — обычно быстрее.</p>`;
      return;
    } catch {
      // Сервер недоступен: отдаём заявку через Telegram, ничего не теряя.
      const text = compose(payload);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* буфер обмена может быть закрыт — покажем текст ниже */
      }
      status.innerHTML = `Сервер заявок недоступен. Текст заявки скопирован — вставьте его в чат Telegram или отправьте письмом на <a class="link" href="mailto:${site.email}?subject=${encodeURIComponent('Заявка с сайта')}&body=${encodeURIComponent(text)}">${site.email}</a>.`;
      window.open(site.telegram, '_blank', 'noopener,noreferrer');
    } finally {
      submit.disabled = false;
    }
  });
}
