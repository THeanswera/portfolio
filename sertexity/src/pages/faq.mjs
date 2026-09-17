/**
 * FAQ: риски, выплаты, лимиты и то, о чём обычно не пишут.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { faq, site } from '../data/site.mjs';

const path = '/faq/';
const title = 'FAQ';
const description =
  'Where the return comes from, what happens when a leg does not fill, how withdrawals work and what risks arbitrage carries.';

const extra = [
  {
    q: 'How fast is a withdrawal processed?',
    a: 'Withdrawal requests are queued immediately and released in batches every hour. Once the balance is back on the venue account, the transfer to your wallet follows the network confirmation time — usually a few minutes for USDT on a fast chain.',
  },
  {
    q: 'Can I stop the strategy at any time?',
    a: 'Yes. Pausing stops new routes within the same minute; the routes that are already open are closed by the engine, and the capital returns to your venue balance.',
  },
  {
    q: 'What does the platform see?',
    a: 'Trading permission on your venue account and the balances needed to size a route. The platform cannot withdraw to an address that is not confirmed by you.',
  },
  {
    q: 'Why is the daily range different every day?',
    a: 'Because spreads are not constant. Some days the engine closes many small routes, some days it skips almost everything. The band is what has been observed over closed routes, not a fixed payout.',
  },
];

const items = [...faq, ...extra];

const content = `<div class="page-head">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${u('/')}">Home</a><span>/</span><span>FAQ</span>
    </nav>
    <span class="eyebrow">Questions</span>
    <h1>Straight answers before you fund anything</h1>
    <p class="lead">
      Arbitrage is a mechanical strategy with a real chance of a losing day. Below are the questions
      worth asking any platform, including this one.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="container">
    <div class="faq">
      ${items
        .map(
          (item, index) => `<details class="faq__item" ${index === 0 ? 'open' : ''} data-reveal>
        <summary><span>${item.q}</span><span class="faq__mark" aria-hidden="true">+</span></summary>
        <p>${item.a}</p>
      </details>`,
        )
        .join('\n      ')}
    </div>

    <p class="note" style="margin-top:24px">
      <span aria-hidden="true">!</span>
      <span><strong>Demo build.</strong> Sertexity is a portfolio piece: the platform, its numbers and the
      SEC CIK reference come from the original design mockup. Do not treat anything on this site as
      investment advice or as an offer of return.</span>
    </p>
  </div>
</section>

<section class="section section--panel">
  <div class="container">
    <div class="cta-panel" data-reveal>
      <span class="eyebrow eyebrow--up">Still deciding</span>
      <h2>Ask the desk a direct question</h2>
      <p class="lead">
        Write what you want to check — fees, unwinds, withdrawals or the risk profile.
        We answer with numbers, not with a sales deck.
      </p>
      <div class="cta-panel__actions">
        <a class="btn btn--primary" href="${u('/contacts/')}">
          <span>Contact the desk</span><span class="btn__arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn--ghost" href="${u('/calculator/')}">Run the numbers</a>
      </div>
      <p class="form__note mono">Minimum deposit $${site.minDeposit} · withdrawal from $${site.minWithdraw}</p>
    </div>
  </div>
</section>`;

export default {
  out: 'faq/index.html',
  path,
  render: () =>
    layout({
      title,
      description,
      path,
      content,
      jsonLd: {
        ...pageSchema({ title, description, path }),
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    }),
};
