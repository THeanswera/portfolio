/**
 * Калькулятор доходности: считает на клиенте, чтобы числа менялись без перезагрузки.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { site } from '../data/site.mjs';

const path = '/calculator/';
const title = 'Return calculator';
const description =
  'Estimate the daily and monthly return of the Sertexity arbitrage engine for your deposit, risk profile and holding period.';

const content = `<div class="page-head">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${u('/')}">Home</a><span>/</span><span>Calculator</span>
    </nav>
    <span class="eyebrow">Return calculator</span>
    <h1>What your deposit can do in a month</h1>
    <p class="lead">
      The engine trades a spread band of ${site.dailyLow}–${site.dailyHigh}% per day on executed routes.
      Move the sliders to see how the deposit, the risk profile and the payout split change the result.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="container">
    <div class="calc" data-calc>
      <div class="calc__controls">
        <div class="calc__group">
          <div class="calc__row">
            <label class="calc__label" for="calc-deposit">Deposit</label>
            <output class="calc__value" for="calc-deposit" data-out="deposit">$1 000</output>
          </div>
          <input class="range" id="calc-deposit" type="range" min="50" max="50000" step="50" value="1000" data-input="deposit">
          <div class="calc__scale"><span>$50</span><span>$25 000</span><span>$50 000</span></div>
        </div>

        <div class="calc__group">
          <div class="calc__row">
            <span class="calc__label">Risk profile</span>
            <output class="calc__value" data-out="profile">Balanced</output>
          </div>
          <div class="segmented" role="group" aria-label="Risk profile">
            <button type="button" data-profile="calm" aria-pressed="false">Calm</button>
            <button type="button" data-profile="balanced" aria-pressed="true">Balanced</button>
            <button type="button" data-profile="active" aria-pressed="false">Active</button>
          </div>
          <p class="form__note">
            Calm trades only wide spreads and keeps more reserve. Active trades more routes
            and takes a larger share of the deposit into work.
          </p>
        </div>

        <div class="calc__group">
          <div class="calc__row">
            <label class="calc__label" for="calc-days">Holding period</label>
            <output class="calc__value" for="calc-days" data-out="days">30 days</output>
          </div>
          <input class="range" id="calc-days" type="range" min="7" max="365" step="1" value="30" data-input="days">
          <div class="calc__scale"><span>7 days</span><span>6 months</span><span>1 year</span></div>
        </div>

        <div class="calc__group">
          <label class="calc__row" style="cursor:pointer">
            <span class="calc__label">Reinvest profit</span>
            <input type="checkbox" data-input="compound" checked style="width:18px;height:18px;accent-color:var(--accent)">
          </label>
          <p class="form__note">
            With reinvestment the daily profit joins the working capital, so the deposit grows
            through the period. Without it, profit is settled aside.
          </p>
        </div>

        <p class="note">
          <span aria-hidden="true">!</span>
          <span><strong>This is a model, not a promise.</strong> Spreads narrow, venues go down and a leg
          can be unwound at a loss. The calculator shows the arithmetic of the declared band, not a forecast.</span>
        </p>
      </div>

      <aside class="calc__result">
        <span class="eyebrow eyebrow--up">Projected result</span>
        <p class="calc__total" data-out="total">$0</p>
        <p class="mono text-soft" data-out="total-note">in 30 days at 0.50 % per day</p>

        <dl class="calc__lines">
          <div class="calc__line"><span>Daily profit</span><span data-out="daily">$0</span></div>
          <div class="calc__line"><span>Profit for the period</span><span data-out="profit">$0</span></div>
          <div class="calc__line"><span>Platform share</span><span data-out="share">$0</span></div>
          <div class="calc__line"><span>Net to you</span><span data-out="net">$0</span></div>
          <div class="calc__line"><span>Effective daily rate</span><span data-out="rate">0 %</span></div>
        </dl>

        <canvas class="calc__chart" data-chart aria-label="Deposit growth chart" role="img"></canvas>

        <a class="btn btn--primary btn--block" href="${u('/contacts/')}">
          <span>Open an account</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <p class="form__note">Withdrawals are available at any time once the balance reaches $${site.minWithdraw}.</p>
      </aside>
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">How the number is built</span>
      <h2>The arithmetic behind the estimate</h2>
    </div>

    <div class="card-grid">
      <article class="card">
        <span class="card__index">01</span>
        <h3 class="card__title">Daily band</h3>
        <p class="card__text">
          The engine works with a spread band of ${site.dailyLow}–${site.dailyHigh}% per day on routes that
          actually close. The calculator uses the middle of the band and shows both edges in the chart.
        </p>
      </article>

      <article class="card">
        <span class="card__index">02</span>
        <h3 class="card__title">Risk profile</h3>
        <p class="card__text">
          The profile changes the share of the deposit that may be in routes at once and the minimum
          spread the engine accepts: calm keeps 40% in reserve, active keeps 10%.
        </p>
      </article>

      <article class="card">
        <span class="card__index">03</span>
        <h3 class="card__title">Platform share</h3>
        <p class="card__text">
          The platform takes 20% of generated profit on Start, 15% on Pro and 10% on Desk.
          The share is charged on profit only, never on the deposit.
        </p>
      </article>

      <article class="card">
        <span class="card__index">04</span>
        <h3 class="card__title">Compounding</h3>
        <p class="card__text">
          With reinvestment the profit is added to the working capital daily, so the base grows.
          Without it, the estimate is linear.
        </p>
      </article>
    </div>
  </div>
</section>`;

export default {
  out: 'calculator/index.html',
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
