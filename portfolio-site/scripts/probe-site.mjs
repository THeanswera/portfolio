// Быстрый зонд страницы: заголовок, мета, заголовки, видимый текст, картинки.
// Запуск: node scripts/probe-site.mjs <url> [maxChars]
const url = process.argv[2];
const maxChars = Number(process.argv[3] ?? 1200);
if (!url) {
  console.error('Укажите URL: node scripts/probe-site.mjs https://example.com');
  process.exit(1);
}

const res = await fetch(url, {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) probe' },
  redirect: 'follow',
});
const html = await res.text();

const pick = (re) => html.match(re)?.[1]?.trim() ?? '';
const strip = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
const headings = [...html.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)]
  .map((m) => `${m[1].toUpperCase()}: ${strip(m[2]).slice(0, 120)}`)
  .filter((t) => t.length > 5)
  .slice(0, 30);
const images = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
  .map((m) => m[1])
  .filter((s) => !s.startsWith('data:'))
  .slice(0, 12);

console.log(`URL: ${res.url}`);
console.log(`STATUS: ${res.status}`);
console.log(`TITLE: ${pick(/<title[^>]*>([\s\S]*?)<\/title>/i)}`);
console.log(`DESCRIPTION: ${pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)}`);
console.log(`GENERATOR: ${pick(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']*)["']/i)}`);
console.log(`THEME: ${[...html.matchAll(/wp-content\/themes\/([a-z0-9-]+)/gi)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`);
console.log(`PLUGINS: ${[...html.matchAll(/wp-content\/plugins\/([a-z0-9-]+)/gi)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 12).join(', ')}`);
console.log('\nHEADINGS:\n' + (headings.join('\n') || '(нет)'));
console.log('\nIMAGES:\n' + (images.join('\n') || '(нет)'));
console.log('\nTEXT:\n' + strip(body).slice(0, maxChars));
