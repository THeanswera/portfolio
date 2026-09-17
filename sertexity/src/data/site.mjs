/**
 * Данные проекта Sertexity.
 *
 * Сайт собран по макету Figma: тексты, цифры доходности и упоминание CIK —
 * из макета заказчика. Формулы, калькулятор и таблицы маршрутов добавлены
 * при сборке и считаются кодом, а не вписаны руками.
 */

export const site = {
  /** Префикс адреса: пусто для домена, '/sertexity' если сайт в подпапке. */
  base: '',
  name: 'Sertexity',
  mark: 'S',
  tagline: 'AI crypto arbitrage',
  legalName: 'Sertexity',
  url: 'https://masterskaya-forma.online',
  email: 'hello@sertexity.io',
  telegram: 'https://t.me/sertexity',
  telegramHandle: '@sertexity',
  cik: '0002134368',
  /** Диапазон доходности из макета: показываем как обещание алгоритма. */
  dailyLow: 0.4,
  dailyHigh: 0.6,
  minDeposit: 50,
  minWithdraw: 10,
  ogImage: '/assets/img/og.png',
};

/**
 * Биржи и их координаты: используются и в списке, и на глобусе.
 * Координаты настоящие — по городам, где стоят площадки.
 */
export const exchanges = [
  { name: 'Binance', city: 'Singapore', code: 'SG', lat: 1.35, lon: 103.82, fee: 0.1, latency: 38 },
  { name: 'Coinbase', city: 'New York', code: 'US', lat: 40.71, lon: -74.0, fee: 0.6, latency: 24 },
  { name: 'Kraken', city: 'San Francisco', code: 'US', lat: 37.77, lon: -122.42, fee: 0.26, latency: 31 },
  { name: 'OKX', city: 'Hong Kong', code: 'HK', lat: 22.32, lon: 114.17, fee: 0.1, latency: 42 },
  { name: 'Bybit', city: 'Dubai', code: 'AE', lat: 25.2, lon: 55.27, fee: 0.1, latency: 47 },
  { name: 'Bitstamp', city: 'London', code: 'GB', lat: 51.51, lon: -0.13, fee: 0.5, latency: 21 },
  { name: 'Bitfinex', city: 'Zug', code: 'CH', lat: 47.17, lon: 8.52, fee: 0.2, latency: 19 },
  { name: 'Upbit', city: 'Seoul', code: 'KR', lat: 37.57, lon: 126.98, fee: 0.25, latency: 44 },
  { name: 'Bitget', city: 'Seychelles', code: 'SC', lat: -4.62, lon: 55.45, fee: 0.1, latency: 52 },
  { name: 'Gate', city: 'Panama', code: 'PA', lat: 8.98, lon: -79.52, fee: 0.2, latency: 36 },
  { name: 'KuCoin', city: 'Mahe', code: 'SC', lat: -4.68, lon: 55.5, fee: 0.1, latency: 51 },
  { name: 'Bitso', city: 'Mexico City', code: 'MX', lat: 19.43, lon: -99.13, fee: 0.3, latency: 33 },
];

/** Валютные пары, по которым работает арбитраж. */
export const pairs = [
  { pair: 'BTC/USDT', spread: 0.42, volume: 1840 },
  { pair: 'ETH/USDT', spread: 0.36, volume: 1210 },
  { pair: 'SOL/USDT', spread: 0.58, volume: 640 },
  { pair: 'TON/USDT', spread: 0.71, volume: 310 },
  { pair: 'XRP/USDT', spread: 0.29, volume: 480 },
  { pair: 'AVAX/USDT', spread: 0.47, volume: 220 },
];

/** Этапы работы алгоритма. */
export const pipeline = [
  {
    key: 'scan',
    title: 'Market scan',
    text: 'Twelve venues are polled through a single normalised order-book feed. Every update is timestamped, so a stale quote never reaches execution.',
    meta: ['12 venues', '40 ms feed', '1 400 pairs'],
  },
  {
    key: 'signal',
    title: 'Signal filter',
    text: 'A spread is only tradable after fees, withdrawal costs and expected slippage. Anything below the threshold is discarded instead of traded.',
    meta: ['Fee model', 'Slippage check', 'Depth check'],
  },
  {
    key: 'execute',
    title: 'Execution',
    text: 'Both legs are sent simultaneously with a time-box. If one leg does not fill, the position is unwound instead of left open.',
    meta: ['Two legs', 'Time-box 900 ms', 'Auto unwind'],
  },
  {
    key: 'settle',
    title: 'Settlement',
    text: 'Balances are rebalanced across venues on a schedule, so funds do not pile up on one exchange where they cannot be used.',
    meta: ['Rebalance', 'Reserve 20 %', 'Daily report'],
  },
];

/** Что показывает личный кабинет. */
export const dashboard = [
  { label: 'Spread captured', value: '0.42 %', note: 'median per closed route' },
  { label: 'Routes today', value: '184', note: 'executed and settled' },
  { label: 'Rejected signals', value: '1 206', note: 'below fee threshold' },
  { label: 'Reserve on venues', value: '20 %', note: 'keeps both legs liquid' },
];

/** Ответы на частые вопросы. */
export const faq = [
  {
    q: 'Where does the return come from?',
    a: 'From the price difference of the same asset on two venues. The platform buys on the cheaper venue and sells on the more expensive one within the same minute. The spread is fixed at the moment both legs fill.',
  },
  {
    q: 'What happens if a leg does not fill?',
    a: 'Every route has a time-box of 900 ms. If the second leg is not filled inside it, the first position is closed at market and the route is written to the log as unwound. The system does not hold an open directional position.',
  },
  {
    q: 'How is my capital protected?',
    a: 'Funds stay on regulated venues in your own account, split between them, with a 20 % reserve so that both legs are always liquid. Withdrawals are available at any time once the balance reaches $10.',
  },
  {
    q: 'Do I need to trade myself?',
    a: 'No. The algorithm opens and closes every route on its own. Your part is a deposit and a withdrawal decision — the rest is logged and visible in the dashboard.',
  },
  {
    q: 'What are the risks?',
    a: 'Arbitrage is not a guaranteed return: spreads narrow, venues go down, and a transfer can take longer than planned. The daily range of 0.4–0.6 % is the observed band on executed routes, not a promise. Never deposit more than you are ready to lose.',
  },
];

/** Шаги подключения. */
export const steps = [
  {
    key: 'account',
    title: 'Create an account',
    text: 'Email and a password. No documents are needed to open the dashboard and watch the routes in read-only mode.',
    time: '2 minutes',
  },
  {
    key: 'fund',
    title: 'Fund from $50',
    text: 'Deposit in USDT, BTC or ETH. The funds stay on the venue in your name — the platform only gets trading permission.',
    time: '10 minutes',
  },
  {
    key: 'activate',
    title: 'Activate the strategy',
    text: 'Pick a risk profile: the threshold for the minimum spread and the share of capital that may be in a route at once.',
    time: '1 minute',
  },
  {
    key: 'earn',
    title: 'Track and withdraw',
    text: 'Income is calculated daily. Withdraw from $10 to the same wallet or to another address at any time.',
    time: 'ongoing',
  },
];

/** Тарифы: доля платформы от заработанного. */
export const plans = [
  {
    key: 'start',
    name: 'Start',
    from: 50,
    share: 20,
    features: ['Shared liquidity pool', 'Daily settlement', 'Withdraw from $10', 'Email support'],
  },
  {
    key: 'pro',
    name: 'Pro',
    from: 1000,
    share: 15,
    features: ['Own risk profile', 'Higher route priority', 'Weekly analytics report', 'Support within 4 hours'],
    featured: true,
  },
  {
    key: 'desk',
    name: 'Desk',
    from: 25000,
    share: 10,
    features: ['Dedicated execution slot', 'Custom spread threshold', 'API access', 'Personal manager'],
  },
];

export const nav = [
  { href: '/how-it-works/', label: 'How it works' },
  { href: '/markets/', label: 'Markets' },
  { href: '/calculator/', label: 'Calculator' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/contacts/', label: 'Contacts' },
];
