/**
 * Спасибо за заявку и страница 404.
 */
import { layout } from '../render/layout.mjs';
import { site } from '../data/site.mjs';

export const thanks = {
  out: 'thanks/index.html',
  path: '/thanks/',
  noindex: true,
  render: () =>
    layout({
      title: 'Request received',
      description: 'Your request has been sent to the Sertexity desk.',
      path: '/thanks/',
      content: `<section class="section">
  <div class="container" style="max-width:720px">
    <span class="eyebrow eyebrow--up">Sent</span>
    <h1 style="margin:16px 0 18px;font-size:clamp(1.9rem,3.6vw,2.8rem)">Request received</h1>
    <p class="lead">
      The desk answers within one business day. In the reply you get the venue list, the fee model and
      the numbers for your deposit range.
    </p>

    <div class="dash" style="margin-top:28px">
      <div class="dash__cell">
        <small>What happens next</small>
        <strong style="font-size:1.05rem">We read the request</strong>
        <small>and check it against the risk profile you picked</small>
      </div>
      <div class="dash__cell">
        <small>Then</small>
        <strong style="font-size:1.05rem">A reply with numbers</strong>
        <small>fees, unwinds and the withdrawal rules</small>
      </div>
      <div class="dash__cell">
        <small>Meanwhile</small>
        <strong style="font-size:1.05rem">Run the calculator</strong>
        <small>to see the band applied to your deposit</small>
      </div>
    </div>

    <div class="cta-panel__actions" style="margin-top:28px">
      <a class="btn btn--primary" href="${site.base}/calculator/"><span>Return calculator</span><span class="btn__arrow" aria-hidden="true">→</span></a>
      <a class="btn btn--ghost" href="${site.base}/">Back to home</a>
    </div>
  </div>
</section>`,
    }),
};

export const notFound = {
  out: '404.html',
  path: '/404.html',
  noindex: true,
  render: () =>
    layout({
      title: 'Page not found',
      description: 'This address does not exist on the Sertexity website.',
      path: '/404.html',
      content: `<section class="section">
  <div class="container" style="max-width:720px">
    <span class="eyebrow">404</span>
    <h1 style="margin:16px 0 18px">This route was not filled</h1>
    <p class="lead">
      The page you asked for does not exist. The engine would have unwound this position —
      here are the links that do work.
    </p>

    <div class="card-grid" style="margin-top:28px">
      <a class="card" href="${site.base}/">
        <span class="card__index">01</span>
        <h3 class="card__title">Home</h3>
        <p class="card__text">The engine, the pipeline and the route breakdown.</p>
      </a>
      <a class="card" href="${site.base}/calculator/">
        <span class="card__index">02</span>
        <h3 class="card__title">Return calculator</h3>
        <p class="card__text">What the spread band means for your deposit.</p>
      </a>
      <a class="card" href="${site.base}/markets/">
        <span class="card__index">03</span>
        <h3 class="card__title">Markets</h3>
        <p class="card__text">Twelve venues, fees and measured latency.</p>
      </a>
    </div>
  </div>
</section>`,
    }),
};
