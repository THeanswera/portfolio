/**
 * Рынки и покрытие: биржи, комиссии, задержки и пары.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { exchanges, pairs } from '../data/site.mjs';

const path = '/markets/';
const title = 'Markets and exchange coverage';
const description =
  'Twelve crypto exchanges, taker fees, feed latency and the pairs the Sertexity engine scans for arbitrage spreads.';

const totalVolume = pairs.reduce((sum, item) => sum + item.volume, 0);
const averageSpread = pairs.reduce((sum, item) => sum + item.spread, 0) / pairs.length;
const averageLatency = Math.round(exchanges.reduce((sum, item) => sum + item.latency, 0) / exchanges.length);

const content = `<div class="page-head">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${u('/')}">Home</a><span>/</span><span>Markets</span>
    </nav>
    <span class="eyebrow">Coverage</span>
    <h1>Where the engine looks for spreads</h1>
    <p class="lead">
      Twelve venues with different fee schedules and different liquidity. The engine normalises the
      order books into one feed and only trades a pair when the difference survives both fee tables.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="container">
    <div class="metrics" data-reveal>
      <div class="metric"><strong data-counter="12">0</strong><span>exchanges connected</span></div>
      <div class="metric"><strong data-counter="${Math.round(averageLatency)}" data-suffix=" ms">0</strong><span>average feed latency</span></div>
      <div class="metric"><strong class="is-up" data-counter="${totalVolume}">0</strong><span>millions USD daily volume watched</span></div>
      <div class="metric"><strong class="is-up" data-counter="${Number(averageSpread.toFixed(2))}" data-digits="2" data-suffix=" %">0</strong><span>average observed spread</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head section-head--row">
      <div>
        <span class="eyebrow">Exchanges</span>
        <h2 style="margin-top:14px">Venues, fees and latency</h2>
      </div>
      <p class="lead" style="max-width:40ch">
        Latency is the round-trip time from the engine to the venue API measured over a day.
        Fees are public taker rates.
      </p>
    </div>

    <div class="table-wrap" data-reveal>
      <table class="data-table">
        <caption class="screen-reader-text">Exchange coverage, taker fees and measured latency</caption>
        <thead>
          <tr>
            <th scope="col">Exchange</th>
            <th scope="col">Location</th>
            <th scope="col">Taker fee</th>
            <th scope="col">Latency</th>
            <th scope="col">Feed</th>
          </tr>
        </thead>
        <tbody>
          ${exchanges
            .map(
              (item) => `<tr>
            <td class="is-mono">${item.name}</td>
            <td>${item.city} · ${item.code}</td>
            <td class="is-mono">${item.fee.toFixed(2)} %</td>
            <td class="is-mono">${item.latency} ms</td>
            <td><span class="pill pill--up"><span class="pill__dot"></span>live</span></td>
          </tr>`,
            )
            .join('\n          ')}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="section-head section-head--row">
      <div>
        <span class="eyebrow">Pairs</span>
        <h2 style="margin-top:14px">What the engine scans most often</h2>
      </div>
      <p class="lead" style="max-width:40ch">
        Spread is the observed difference between the cheapest and the most expensive venue
        over the last rolling day.
      </p>
    </div>

    <div class="table-wrap" data-reveal>
      <table class="data-table">
        <caption class="screen-reader-text">Traded pairs, observed spread and daily volume</caption>
        <thead>
          <tr>
            <th scope="col">Pair</th>
            <th scope="col">Observed spread</th>
            <th scope="col">Daily volume</th>
            <th scope="col">Above threshold</th>
          </tr>
        </thead>
        <tbody>
          ${pairs
            .map(
              (item) => `<tr>
            <td class="is-mono">${item.pair}</td>
            <td class="is-up">+${item.spread.toFixed(2)} %</td>
            <td class="is-mono">${item.volume}M USD</td>
            <td>${item.spread >= 0.4 ? 'yes · traded' : 'no · ' + (0.4 - item.spread).toFixed(2) + ' % short'}</td>
          </tr>`,
            )
            .join('\n          ')}
        </tbody>
      </table>
    </div>

    <p class="note" style="margin-top:22px">
      <span aria-hidden="true">!</span>
      <span>Spreads move through the day and the table is a snapshot of one rolling day, not a constant.
      When the difference falls below the fee threshold the engine stops trading the pair and waits.</span>
    </p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow eyebrow--up">Next step</span>
      <h2>See what the band means for your deposit</h2>
      <p class="lead">The calculator turns the spread band into daily, monthly and yearly numbers.</p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/calculator/')}">
          <span>Open the calculator</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </div>
</section>`;

export default {
  out: 'markets/index.html',
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
