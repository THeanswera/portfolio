// Сборка файлов для роботов: sitemap.xml и robots.txt.
//
// Карта сайта собирается из того же списка страниц, что и сами страницы, —
// поэтому в неё не может попасть адрес, которого нет, и наоборот: раньше
// sitemap знал только главную и общий case.html, а шесть кейсов оставались
// вне карты.
//
// lastmod берётся из даты существенного обновления страницы (manifest.json),
// а не из даты сборки: иначе каждая выкладка объявляла бы весь сайт обновлённым.
//
// Запуск (из npm run build): node scripts/generate-meta.mjs
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteInfo, sitemapPages } from './lib/pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const urls = sitemapPages;

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((page) =>
    [
      '  <url>',
      `    <loc>${page.canonical}</loc>`,
      `    <lastmod>${page.updated}</lastmod>`,
      `    <changefreq>${page.changefreq ?? 'monthly'}</changefreq>`,
      `    <priority>${page.priority ?? '0.5'}</priority>`,
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  '# Служебные адреса: закрыты от индексации, но открыты для обхода.',
  'Disallow: /case.html',
  'Disallow: /render.html',
  '',
  `Sitemap: ${siteInfo.origin}/sitemap.xml`,
  '',
].join('\n');

await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(dist, 'robots.txt'), robots, 'utf8');

console.log(`  sitemap.xml — ${urls.length} адресов`);
console.log('  robots.txt');
for (const page of urls) console.log(`    ${page.canonical}`);
