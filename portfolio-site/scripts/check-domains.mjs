/**
 * Проверка живых доменов: каждый адрес отдаёт тот сайт, который должен.
 *
 * Нужна после переездов между доменами и после выгрузки: страницы при этом
 * открываются, а `canonical`, ссылки в разметке и ассеты продолжают указывать
 * на старый адрес — глазами такое не видно.
 *
 * Запуск: node scripts/check-domains.mjs [--quiet]
 */
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');

/**
 * `title` — часть заголовка, `canonical` — ожидаемый адрес, `marks` — следы
 * движка в разметке, `foreign` — домен, которого на странице быть не должно.
 */
const SITES = [
  {
    url: 'https://rootlost.ru/',
    title: 'Александра Мельникова',
    canonical: 'https://rootlost.ru/',
    foreign: 'rootlost.online',
  },
  {
    url: 'https://rootlost.ru/case.html?work=sextant',
    canonical: 'https://rootlost.ru/case.html',
    foreign: 'rootlost.online',
  },
  {
    url: 'https://rootlost.ru/sextant/',
    title: 'СЕКСТАНТ',
    canonical: 'https://rootlost.ru/sextant/',
    foreign: 'rootlost.online',
  },
  { url: 'https://rootlost.ru/remont/', title: 'ТехРемонт' },
  {
    url: 'https://rootlost.online/',
    canonical: 'https://rootlost.online/',
    marks: ['wp-content'],
    foreign: 'rootlost.ru',
  },
  {
    url: 'https://rootlost.online/calculator/',
    canonical: 'https://rootlost.online/calculator/',
    marks: ['wp-content'],
    foreign: 'rootlost.ru',
  },
  {
    url: 'https://rootlost.online/portfolio/',
    canonical: 'https://rootlost.online/portfolio/',
    marks: ['wp-content'],
    foreign: 'rootlost.ru',
  },
  { url: 'https://masterskaya-forma.ru/', title: 'Форма', canonical: 'https://masterskaya-forma.ru/' },
  { url: 'https://masterskaya-forma.online/', title: 'Sertexity', canonical: 'https://masterskaya-forma.online/' },
];

const results = [];
const check = (ok, message) => results.push({ ok, message });

for (const site of SITES) {
  const label = site.url.replace('https://', '');
  const response = await fetch(site.url, { redirect: 'manual' }).catch((error) => ({ status: error.message }));
  if (response.status !== 200) {
    check(false, `${label}: HTTP ${response.status}`);
    continue;
  }
  const html = await response.text();
  const title = (html.match(/<title>([^<]*)</) ?? [])[1]?.trim() ?? '';
  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) ?? [])[1] ?? '';
  const problems = [];

  if (site.title && !title.toLowerCase().includes(site.title.toLowerCase())) {
    problems.push(`заголовок «${title.slice(0, 50)}» не похож на «${site.title}»`);
  }
  if (site.canonical && canonical !== site.canonical) {
    problems.push(`canonical ${canonical || 'нет'} вместо ${site.canonical}`);
  }
  for (const mark of site.marks ?? []) {
    if (!html.includes(mark)) problems.push(`в разметке нет «${mark}»`);
  }
  if (site.foreign && html.includes(site.foreign)) {
    const times = html.split(site.foreign).length - 1;
    problems.push(`в разметке ${times} раз упомянут чужой домен ${site.foreign}`);
  }

  // Ассеты со своего домена: переезд папок ломает их чаще всего.
  const origin = new URL(site.url).origin;
  const assets = [...new Set(
    [...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js|woff2|webp|png)(?:\?[^"]*)?)"/g)].map((match) => {
      try {
        return new URL(match[1], site.url).href;
      } catch {
        return '';
      }
    }),
  )].filter((url) => url.startsWith(origin)).slice(0, 4);
  let broken = 0;
  for (const asset of assets) {
    const probe = await fetch(asset).catch(() => ({ status: 0 }));
    if (probe.status !== 200) {
      broken += 1;
      problems.push(`ассет ${probe.status}: ${asset}`);
    }
  }

  if (problems.length) {
    check(false, `${label}: ${problems.join('; ')}`);
  } else {
    check(true, `${label}: 200, «${title.slice(0, 46)}», ассетов проверено ${assets.length}${canonical ? ', canonical свой' : ''}`);
  }
}

const failed = results.filter((item) => !item.ok);
for (const item of results) {
  if (item.ok && quiet) continue;
  console.log(`${item.ok ? '✓' : '✗'} ${item.message}`);
}
console.log(`\nИтого: ${results.length - failed.length} из ${results.length} без замечаний, провалов ${failed.length}`);
process.exit(failed.length ? 1 : 0);
