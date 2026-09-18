/** Контакты: заявка, адрес ателье и схема проезда. */
import { layout, u } from '../render/layout.mjs';
import { contact, site } from '../data/content.mjs';

const path = '/contacts/';
const title = 'Контакты и заявка';
const description =
  'Шоурум-ателье «СЕКСТАНТ»: Санкт-Петербург, улица Чапаева, 14. Приём по записи, заявка через форму, ответ в течение рабочего дня.';

/* Схема двора: рисуется кодом, без внешних карт и трекеров. */
const map = `<svg viewBox="0 0 720 420" role="img" aria-label="Схема: улица Чапаева, дом 14, арка во двор">
  <rect width="720" height="420" fill="#0a0b0e"/>
  <g stroke="rgba(244,239,228,0.08)" stroke-width="1">
    ${Array.from({ length: 11 }, (_, index) => `<line x1="${index * 72}" y1="0" x2="${index * 72}" y2="420"/>`).join('')}
    ${Array.from({ length: 7 }, (_, index) => `<line x1="0" y1="${index * 70}" x2="720" y2="${index * 70}"/>`).join('')}
  </g>

  <path d="M0 250h720" stroke="rgba(244,239,228,0.28)" stroke-width="26"/>
  <path d="M0 250h720" stroke="rgba(201,163,92,0.2)" stroke-width="1.5" stroke-dasharray="14 12"/>
  <text x="26" y="240" fill="#8d8371" font-family="monospace" font-size="13" letter-spacing="3">УЛИЦА ЧАПАЕВА</text>

  <g fill="#16130e" stroke="rgba(244,239,228,0.22)" stroke-width="1.5">
    <rect x="120" y="70" width="200" height="150"/>
    <rect x="400" y="70" width="200" height="150"/>
    <rect x="120" y="290" width="200" height="110"/>
    <rect x="400" y="290" width="200" height="110"/>
  </g>

  <path d="M330 96v130" stroke="rgba(244,239,228,0.3)" stroke-width="18"/>
  <text x="342" y="150" fill="#8d8371" font-family="monospace" font-size="12" letter-spacing="2">АРКА ВО ДВОР</text>

  <circle cx="339" cy="200" r="26" fill="rgba(201,163,92,0.12)"/>
  <circle cx="339" cy="200" r="7" fill="#c9a35c"/>
  <text x="339" y="266" fill="#e8cd92" font-family="monospace" font-size="13" letter-spacing="2" text-anchor="middle">ДОМ 14 · ШОУРУМ</text>

  <circle cx="60" cy="330" r="9" fill="none" stroke="#6f9bd1" stroke-width="2"/>
  <text x="80" y="335" fill="#6f9bd1" font-family="monospace" font-size="12" letter-spacing="2">М «ПЕТРОГРАДСКАЯ» · 12 МИНУТ</text>
</svg>`;

const content = `<section class="page-hero">
  <div class="container">
    <nav class="crumbs" aria-label="Хлебные крошки">
      <a href="${u('/')}">Главная</a><span>/</span><span>Контакты</span>
    </nav>
    <span class="eyebrow">${contact.eyebrow}</span>
    <h1 class="page-hero__title">${contact.title}</h1>
    <p class="lead page-hero__lead">${contact.lead}</p>
  </div>
</section>

<section class="section">
  <div class="container contacts">
    <form class="stack" data-request-form method="post" action="${u('/send.php')}" novalidate>
      <div class="grid grid--2">
        <label class="field">
          <span class="field__label">Имя</span>
          <input type="text" name="name" required autocomplete="name" placeholder="Как к вам обращаться">
        </label>
        <label class="field">
          <span class="field__label">Телефон</span>
          <input type="tel" name="phone" required autocomplete="tel" placeholder="+7 812 000-00-00">
        </label>
      </div>

      <label class="field">
        <span class="field__label">Почта</span>
        <input type="email" name="email" required autocomplete="email" placeholder="you@example.com">
      </label>

      <label class="field">
        <span class="field__label">Что интересует</span>
        <select name="topic">
          <option>Модель из коллекции</option>
          <option>Своя конфигурация</option>
          <option>Сервис или ремонт</option>
          <option>Восстановление исторического механизма</option>
        </select>
      </label>

      <label class="field">
        <span class="field__label">Сообщение</span>
        <textarea name="message" placeholder="Модель, размер корпуса, удобное время визита"></textarea>
      </label>

      <label class="checkbox">
        <input type="checkbox" name="consent" required>
        <span>Согласен на обработку персональных данных по условиям из раздела
          <a class="accent" href="${u('/privacy/')}">«Обработка данных»</a>.</span>
      </label>

      <label class="honeypot" aria-hidden="true">
        <span>Сайт</span>
        <input type="text" name="website" tabindex="-1" autocomplete="off">
      </label>

      <div class="form__status" data-form-status hidden role="status"></div>

      <div class="hero__actions">
        <button class="btn btn--primary" type="submit">
          <span>Отправить заявку</span><span class="btn__arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <p class="form__note">${contact.formNote}</p>
    </form>

    <div>
      <dl class="contact-list">
        <div class="contact-list__row">
          <dt>Адрес</dt>
          <dd>${site.address}<br><span class="muted">${site.addressNote}</span></dd>
        </div>
        <div class="contact-list__row">
          <dt>Часы работы</dt>
          <dd>${site.hours}<br><span class="muted">${site.hoursNote}</span></dd>
        </div>
        <div class="contact-list__row">
          <dt>Связь</dt>
          <dd><a class="accent" href="tel:${site.phoneHref}">${site.phone}</a><br>
            <a class="accent" href="mailto:${site.email}">${site.email}</a><br>
            <a class="accent" href="${site.telegram}">Telegram: ${site.telegramHandle}</a></dd>
        </div>
      </dl>

      <div class="map" style="margin-top:28px">${map}</div>
      <p class="form__note" style="margin-top:14px">${contact.mapNote}</p>
    </div>
  </div>
</section>

<section class="section section--panel section--tight">
  <div class="container">
    <p class="lead" data-reveal>${contact.visitNote}</p>
  </div>
</section>`;

export default {
  out: 'contacts/index.html',
  path,
  render: () => layout({ title, description, path, content }),
};
