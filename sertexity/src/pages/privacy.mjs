/**
 * Политика конфиденциальности.
 */
import { layout, pageSchema, u } from '../render/layout.mjs';
import { site } from '../data/site.mjs';

const path = '/privacy/';
const title = 'Privacy policy';
const description =
  'What data the Sertexity website collects, why it is processed, how long it is stored and how to have it deleted.';

const sections = [
  {
    title: '1. Who processes the data',
    body: [
      `The website ${site.url} is a demonstration build of the ${site.legalName} platform. The operator of this website is the person who published it for portfolio purposes.`,
      'Contact for any question about personal data: ' + site.email + '.',
    ],
  },
  {
    title: '2. What data is collected',
    body: [
      'Only the data you enter yourself in the request form: name, email address, planned deposit range, risk profile and the text of your question.',
      'Technical data (IP address, browser and device type, pages visited) is processed by the hosting provider in server logs for security and fault diagnosis.',
    ],
  },
  {
    title: '3. Why it is processed',
    body: [
      'To answer your request, to prepare an answer with numbers about the platform, and to protect the website from spam and automated submissions.',
      'The legal basis is your consent, given when you tick the checkbox before sending the form.',
    ],
  },
  {
    title: '4. Cookies and local storage',
    body: [
      'The website itself does not set advertising or analytics cookies and does not use third-party trackers.',
      'Local storage in your browser may be used to remember interface preferences. It stays on your device and is not transmitted anywhere.',
    ],
  },
  {
    title: '5. How long the data is stored',
    body: [
      'Form submissions are stored for 12 months from the moment of the request, then deleted.',
      'Server logs are stored for 30 days.',
    ],
  },
  {
    title: '6. Who the data is shared with',
    body: [
      'Nobody. Data is not sold, not transferred to third parties for marketing and not used to build advertising profiles.',
      'Access to submissions is limited to the person who answers your request.',
    ],
  },
  {
    title: '7. Your rights',
    body: [
      'You can request a copy of your data, ask to correct it, withdraw consent or ask for deletion. Write to ' + site.email + ' and the request is processed within 30 days.',
      'You also have the right to complain to a data protection authority in your jurisdiction.',
    ],
  },
  {
    title: '8. Changes to this policy',
    body: [
      'If the policy changes, the new version is published on this page with an updated date.',
      'This document is part of a portfolio demonstration and is not legal advice for a real investment service.',
    ],
  },
];

const content = `<div class="page-head">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${u('/')}">Home</a><span>/</span><span>Privacy policy</span>
    </nav>
    <span class="eyebrow">Legal</span>
    <h1>Privacy policy</h1>
    <p class="lead">
      A plain-language description of what happens to the data you send through this website.
      No legal padding, no hidden processing.
    </p>
  </div>
</div>

<section class="section section--tight">
  <div class="container" style="max-width:860px">
    ${sections
      .map(
        (section) => `<section class="content-block" style="margin-bottom:28px">
      <h2 style="font-size:1.25rem">${section.title}</h2>
      ${section.body.map((paragraph) => `<p style="margin-top:10px">${paragraph}</p>`).join('\n      ')}
    </section>`,
      )
      .join('\n    ')}

    <p class="note">
      <span aria-hidden="true">!</span>
      <span><strong>Demo document.</strong> Sertexity is a portfolio build: the platform and the
      registration reference come from the original design mockup. Before launching a real investment
      service, this policy must be reviewed by a lawyer.</span>
    </p>
  </div>
</section>`;

export default {
  out: 'privacy/index.html',
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
