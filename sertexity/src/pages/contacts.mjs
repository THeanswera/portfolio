/**
 * Контакты и форма заявки.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { site } from '../data/site.mjs';

const path = '/contacts/';
const title = 'Contacts';
const description =
  'Talk to the Sertexity desk: deposits, withdrawals, risk profiles and technical questions about the arbitrage engine.';

const content = `<div class="page-head">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${u('/')}">Home</a><span>/</span><span>Contacts</span>
    </nav>
    <span class="eyebrow">Contacts</span>
    <h1>Write to the desk</h1>
    <p class="lead">
      Questions about fees, unwinds or the risk profile are answered with numbers.
      Leave a contact and a short description — the reply comes within one business day.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="container">
    <div class="contacts-grid">
      <div class="card" style="padding:clamp(22px,3vw,32px)">
        <span class="eyebrow">Request</span>
        <h2 style="font-size:1.5rem;margin-top:12px">Open an account or ask a question</h2>

        <form class="form" action="${u('/send.php')}" method="post" data-request-form style="margin-top:18px">
          <input type="hidden" name="form" value="sertexity-request">
          <input type="hidden" name="startedAt" value="${Math.floor(Date.now() / 1000)}">
          <div class="form__honeypot" aria-hidden="true">
            <label for="request-website">Website</label>
            <input id="request-website" type="text" name="website" tabindex="-1" autocomplete="off">
          </div>

          <p class="form-status form-status--error" data-form-status hidden>
            The request was not sent: check the name, email and consent checkbox.
          </p>

          <div class="form__grid">
            <label class="form__field" for="request-name">
              <span>Name</span>
              <input id="request-name" type="text" name="name" maxlength="80" minlength="2" autocomplete="name" required placeholder="How should we address you">
            </label>

            <label class="form__field" for="request-email">
              <span>Email</span>
              <input id="request-email" type="email" name="email" maxlength="120" autocomplete="email" required placeholder="you@example.com">
            </label>

            <label class="form__field" for="request-deposit">
              <span>Planned deposit</span>
              <select id="request-deposit" name="deposit">
                <option value="50-1000">$${site.minDeposit} — $1 000</option>
                <option value="1000-25000" selected>$1 000 — $25 000</option>
                <option value="25000+">$25 000 and more</option>
              </select>
            </label>

            <label class="form__field" for="request-profile">
              <span>Risk profile</span>
              <select id="request-profile" name="profile">
                <option value="calm">Calm — wide spreads only</option>
                <option value="balanced" selected>Balanced</option>
                <option value="active">Active — more routes</option>
              </select>
            </label>

            <label class="form__field form__field--full" for="request-message">
              <span>Question</span>
              <textarea id="request-message" name="message" rows="4" maxlength="1200" placeholder="Which venues, which pairs, what happens on an unwind — anything specific"></textarea>
            </label>
          </div>

          <label class="form__consent">
            <input type="checkbox" name="consent" value="1" required>
            <span>I agree to the processing of my contact details according to the <a class="link" href="${u('/privacy/')}">privacy policy</a>.</span>
          </label>

          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
            <p class="form__note" style="max-width:44ch">Contacts are used only to answer this request.</p>
            <button class="btn btn--primary" type="submit">
              <span>Send request</span><span class="btn__arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>

      <div class="card" style="padding:clamp(22px,3vw,32px)">
        <span class="eyebrow">Direct</span>
        <h2 style="font-size:1.5rem;margin-top:12px">Without the form</h2>

        <ul class="footer__col" style="display:grid;gap:16px;margin-top:18px">
          <li>
            <h3 style="margin-bottom:6px">Email</h3>
            <a class="mono" href="mailto:${site.email}">${site.email}</a>
          </li>
          <li>
            <h3 style="margin-bottom:6px">Telegram</h3>
            <a class="mono" href="${site.telegram}" target="_blank" rel="noopener noreferrer">${site.telegramHandle}</a>
          </li>
          <li>
            <h3 style="margin-bottom:6px">Desk hours</h3>
            <span class="text-soft">Monday to Friday, 09:00–19:00 UTC</span>
          </li>
          <li>
            <h3 style="margin-bottom:6px">Registration</h3>
            <span class="mono text-soft">SEC CIK ${site.cik}</span>
          </li>
        </ul>

        <p class="note" style="margin-top:22px">
          <span aria-hidden="true">!</span>
          <span><strong>Demo build.</strong> The form is a working example of a request flow; the platform,
          numbers and registration reference come from the original design mockup.</span>
        </p>
      </div>
    </div>
  </div>
</section>`;

export default {
  out: 'contacts/index.html',
  path,
  render: () =>
    layout({
      title,
      description,
      path,
      content,
      jsonLd: pageSchema({ title, description, path }),
    }),
};
