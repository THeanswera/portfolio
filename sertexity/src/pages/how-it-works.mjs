/**
 * Как это работает: механика движка, контроль риска и разбор отказа.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { pipeline, faq } from '../data/site.mjs';

const path = '/how-it-works/';
const title = 'How the engine works';
const description =
  'Order-book feed, signal filter, two-leg execution and settlement: how the Sertexity arbitrage engine decides what to trade and what to skip.';

const controls = [
  {
    title: 'Minimum spread threshold',
    text: 'A signal is tradable only if the difference covers both taker fees, the withdrawal cost and the expected slippage with margin left. Everything below the threshold is written to the log as skipped.',
    value: '0.28 %',
  },
  {
    title: 'Reserve per venue',
    text: 'Part of the capital always stays on each venue, so both legs can be filled instantly without waiting for a transfer between exchanges.',
    value: '20 %',
  },
  {
    title: 'Route time-box',
    text: 'Both legs must fill inside 900 ms. If the second leg does not fill, the first position is closed at market and the route is marked as unwound.',
    value: '900 ms',
  },
  {
    title: 'Exposure limit',
    text: 'The engine never holds a directional position: capital is either in a route that is being closed or back on the venue balance.',
    value: '0 open',
  },
];

const content = `<div class="page-head">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${u('/')}">Home</a><span>/</span><span>How it works</span>
    </nav>
    <span class="eyebrow">Engine</span>
    <h1>How the engine decides what to trade</h1>
    <p class="lead">
      Arbitrage looks simple until you count the fees. The engine earns on the difference between
      two venues and loses on every signal it should not have taken — so most of the work happens
      before the order is sent.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="container">
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
</section>

<section class="section section--panel">
  <div class="container">
    <div class="section-head section-head--row">
      <div>
        <span class="eyebrow">Risk controls</span>
        <h2 style="margin-top:14px">Four limits that keep the engine boring</h2>
      </div>
      <p class="lead" style="max-width:44ch">
        Boring is the goal: a route that fails safely costs less than a route that stays open.
      </p>
    </div>

    <div class="card-grid">
      ${controls
        .map(
          (item, index) => `<article class="card" data-reveal>
        <div class="card__head">
          <span class="card__index">${String(index + 1).padStart(2, '0')}</span>
          <span class="pill pill--up">${item.value}</span>
        </div>
        <h3 class="card__title">${item.title}</h3>
        <p class="card__text">${item.text}</p>
      </article>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Failure case</span>
      <h2>What happens when the second leg does not fill</h2>
      <p class="lead">
        This is the scenario most platforms do not describe. Here is the sequence the engine follows
        and what it costs.
      </p>
    </div>

    <div class="terminal" data-terminal-wrap data-reveal>
      <div class="terminal">
        <div class="terminal__bar">
          <span class="terminal__dot"></span>
          <span class="terminal__dot"></span>
          <span class="terminal__dot"></span>
          <span style="margin-left:8px">unwind.log — example</span>
        </div>
        <div class="terminal__body" style="max-height:none">
          <span class="terminal__line"><span class="terminal__time">12:04:07</span><span>signal        ETH/USDT  Kraken → OKX  spread +0.36 %</span></span>
          <span class="terminal__line terminal__line--up"><span class="terminal__time">12:04:07</span><span>buy leg       Kraken filled 2.0000 ETH @ 3 281.40</span></span>
          <span class="terminal__line terminal__line--warn"><span class="terminal__time">12:04:08</span><span>sell leg      OKX not filled inside 900 ms</span></span>
          <span class="terminal__line terminal__line--warn"><span class="terminal__time">12:04:08</span><span>unwind        position closed at market @ 3 279.10</span></span>
          <span class="terminal__line"><span class="terminal__time">12:04:08</span><span>result        route −4.60 USD after fees · logged and counted</span></span>
        </div>
      </div>
    </div>

    <p class="note" style="margin-top:20px">
      <span aria-hidden="true">!</span>
      <span>Unwound routes are part of the model: they are why the engine keeps a fee threshold and a
      reserve on every venue instead of pushing the whole deposit into the next signal.</span>
    </p>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Questions</span>
      <h2>What people ask before funding</h2>
    </div>

    <div class="faq">
      ${faq
        .slice(0, 3)
        .map(
          (item, index) => `<details class="faq__item" ${index === 0 ? 'open' : ''} data-reveal>
        <summary><span>${item.q}</span><span class="faq__mark" aria-hidden="true">+</span></summary>
        <p>${item.a}</p>
      </details>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

export default {
  out: 'how-it-works/index.html',
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
