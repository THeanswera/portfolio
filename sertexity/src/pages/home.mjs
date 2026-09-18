/**
 * Главная: первый экран с глобусом, конвейер сделки и ключевые блоки.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { site, pipeline, dashboard, plans, steps, exchanges } from '../data/site.mjs';

const path = '/';
const title = 'Earn with AI-powered crypto arbitrage';
const description =
  'Sertexity captures price differences across twelve crypto exchanges with an automated arbitrage engine. Watch the routes, fund from $50, withdraw from $10.';

const hero = `<section class="hero">
  <div class="container hero__inner">
    <div class="hero__content">
      <span class="eyebrow">AI arbitrage engine · live since 2023</span>
      <h1 class="hero__title">Earn with <span class="gradient-text">AI-powered</span> crypto arbitrage</h1>
      <p class="lead hero__lead">
        Our algorithms analyse the market and execute trades 24/7 — fully automated.
        Generate ${site.dailyLow}% to ${site.dailyHigh}% daily by capturing price differences across crypto exchanges.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="${u('/calculator/')}">
          <span>Start earning</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/how-it-works/')}">See how it works</a>
      </div>
      <div class="hero__stats">
        <div class="hero__stat">
          <strong class="is-up" data-counter="12" data-suffix=" venues">0</strong>
          <span>exchanges in one order-book feed</span>
        </div>
        <div class="hero__stat">
          <strong data-counter="1400" data-suffix="+">0</strong>
          <span>pairs under continuous scan</span>
        </div>
        <div class="hero__stat">
          <strong data-counter="40" data-suffix=" ms">0</strong>
          <span>average feed latency</span>
        </div>
        <div class="hero__stat">
          <strong data-counter="900" data-suffix=" ms">0</strong>
          <span>time-box on every route</span>
        </div>
      </div>
    </div>

    <div class="globe">
      <canvas
        class="globe__canvas"
        data-globe
        tabindex="0"
        role="application"
        aria-label="Interactive map of twelve exchanges and the arbitrage routes between them. Drag to rotate, or use the arrow keys."
      ></canvas>
      <span class="globe__hint">Drag to rotate · hover a venue</span>
      <div class="globe__badge globe__badge--a">
        <span>route</span>
        <strong>Binance → Coinbase</strong>
        <span>BTC/USDT · +0.42 %</span>
      </div>
      <div class="globe__badge globe__badge--b">
        <span>execution</span>
        <strong>412 ms</strong>
        <span>both legs filled</span>
      </div>
      <div class="globe__badge globe__badge--c">
        <span>reserve</span>
        <strong>20 % per venue</strong>
        <span>keeps legs liquid</span>
      </div>
    </div>
  </div>
</section>

<div class="ticker" aria-hidden="true">
  <div class="ticker__track" data-ticker></div>
</div>`;

const pipelineSection = `<section class="section" id="pipeline">
  <div class="container">
    <div class="section-head section-head--row">
      <div>
        <span class="eyebrow">How the engine trades</span>
        <h2 style="margin-top:14px">Four steps from a quote to a closed route</h2>
      </div>
      <p class="lead" style="max-width:44ch">
        The engine does not predict the market. It watches the same asset on many venues
        and takes the difference — but only when the difference survives fees and slippage.
      </p>
    </div>

    <div class="pipeline">
      ${pipeline
        .map(
          (step, index) => `<article class="pipeline__step" data-reveal>
        <span class="pipeline__index">${String(index + 1).padStart(2, '0')}</span>
        <h3>${step.title}</h3>
        <p class="card__text">${step.text}</p>
        <ul class="meta-list">${step.meta.map((item) => `<li>${item}</li>`).join('')}</ul>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const routeSection = `<section class="section section--panel" id="route">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow eyebrow--up">One route, minute by minute</span>
      <h2>What a single arbitrage route looks like</h2>
      <p class="lead">
        Both legs are sent at the same moment. The spread is fixed when the second leg fills,
        and the route is written to the log — including the ones that were skipped.
      </p>
    </div>

    <div class="route" data-reveal>
      <div class="route__head">
        <span class="pill pill--up"><span class="pill__dot"></span>BTC/USDT · route #1841</span>
        <span class="mono text-soft">fees included · 412 ms total</span>
      </div>

      <div class="route__flow">
        <div class="route__leg route__leg--buy">
          <span>buy leg · Binance</span>
          <strong>1.0000 BTC @ 67 395.20</strong>
          <span class="mono text-soft">taker fee 0.10 % · depth 4.2 BTC</span>
        </div>

        <div class="route__leg route__leg--sell">
          <span>sell leg · Coinbase</span>
          <strong>1.0000 BTC @ 67 678.40</strong>
          <span class="mono text-soft">taker fee 0.60 % · depth 2.8 BTC</span>
        </div>

        <div class="route__result">
          <span class="mono text-soft">net spread</span>
          <strong>+0.42 %</strong>
          <span class="mono text-soft">after both taker fees</span>
        </div>
      </div>

      <p class="form__note mono">
        Numbers above are an example of a filled route. Spreads narrow and widen through the day;
        the engine trades only while the net difference stays above the fee threshold.
      </p>
    </div>
  </div>
</section>`;

const platformSection = `<section class="section" id="platform">
  <div class="container">
    <div class="section-head section-head--row">
      <div>
        <span class="eyebrow">Platform advantages</span>
        <h2 style="margin-top:14px">Built by traders, engineered for uptime</h2>
      </div>
      <p class="lead" style="max-width:44ch">
        The dashboard is not a black box: every route, every skipped signal and every unwind
        is written to a log you can read.
      </p>
    </div>

    <div class="dash" data-reveal>
      ${dashboard
        .map(
          (cell) => `<div class="dash__cell">
        <small>${cell.label}</small>
        <strong>${cell.value}</strong>
        <small>${cell.note}</small>
      </div>`,
        )
        .join('\n      ')}
    </div>

    <div class="terminal" data-terminal-wrap style="margin-top:24px" data-reveal>
      <div class="terminal">
        <div class="terminal__bar">
          <span class="terminal__dot terminal__dot--live"></span>
          <span class="terminal__dot"></span>
          <span class="terminal__dot"></span>
          <span style="margin-left:8px">execution.log — live tail</span>
        </div>
        <div class="terminal__body" data-terminal></div>
      </div>
    </div>
  </div>
</section>`;

const stepsSection = `<section class="section section--panel" id="start">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Get started</span>
      <h2>From deposit to first settlement</h2>
    </div>

    <div class="steps">
      ${steps
        .map(
          (step, index) => `<article class="step" data-reveal>
        <span class="step__num">${index + 1}</span>
        <h3>${step.title}</h3>
        <p class="card__text">${step.text}</p>
        <span class="step__time">${step.time}</span>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const coverageSection = `<section class="section" id="coverage">
  <div class="container">
    <div class="section-head section-head--row">
      <div>
        <span class="eyebrow">Coverage</span>
        <h2 style="margin-top:14px">Twelve venues, one normalised feed</h2>
      </div>
      <a class="btn btn--ghost btn--small" href="${u('/markets/')}">All markets and fees</a>
    </div>

    <div class="pill-row" data-reveal>
      ${exchanges.map((item) => `<span class="pill">${item.name} · ${item.city}</span>`).join('\n      ')}
    </div>
  </div>
</section>`;

const plansSection = `<section class="section section--panel" id="plans">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Plans</span>
      <h2>We earn when the routes close</h2>
      <p class="lead">
        No subscription: the platform takes a share of the profit it generates.
        The share goes down as the deposit grows.
      </p>
    </div>

    <div class="plans">
      ${plans
        .map(
          (plan) => `<article class="plan${plan.featured ? ' plan--featured' : ''}" data-reveal>
        ${plan.featured ? '<span class="pill pill--accent">Most chosen</span>' : ''}
        <h3>${plan.name}</h3>
        <p class="plan__price">from $${plan.from.toLocaleString('en-US')}</p>
        <p class="plan__share">${plan.share}% of generated profit</p>
        <ul>${plan.features.map((feature) => `<li>${feature}</li>`).join('')}</ul>
        <a class="btn ${plan.featured ? 'btn--primary' : 'btn--ghost'} btn--block" href="${u('/calculator/')}">Estimate return</a>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

const ctaSection = `<section class="section">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow eyebrow--up">Open an account</span>
      <h2>Ready to start earning?</h2>
      <p class="lead">
        Fund from $${site.minDeposit}, watch the first routes in the dashboard and withdraw
        from $${site.minWithdraw} whenever you decide.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/calculator/')}">
          <span>Calculate my return</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/contacts/')}">Talk to the desk</a>
      </div>
      <p class="form__note">
        Arbitrage is not a guaranteed return. The daily range is the observed band on executed routes,
        and capital is at risk.
      </p>
    </div>
  </div>
</section>`;

export default {
  out: 'index.html',
  path,
  render: () =>
    layout({
      title,
      description,
      path,
      content: [hero, pipelineSection, routeSection, platformSection, stepsSection, coverageSection, plansSection, ctaSection].join('\n'),
      jsonLd: pageSchema({ title, description, path }),
    }),
};
