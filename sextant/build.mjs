/**
 * Сборка сайта: копирует ассеты и шрифты, склеивает CSS в один файл,
 * рендерит страницы, пишет sitemap, robots и правила для хостинга.
 * Запуск: node build.mjs
 */
import { mkdir, rm, cp, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pages from './src/pages/registry.mjs';
import { site, configurator } from './src/data/content.mjs';
import { BASE } from './src/render/layout.mjs';

/* Папка проекта, а не текущая папка запуска: сборку зовут и из корня репозитория. */
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(ROOT, 'src/assets');

/** Порядок важен: переменные и база, затем каркас, элементы и блоки. */
const CSS_ORDER = ['base.css', 'layout.css', 'components.css', 'sections.css'];

const kb = (buffer) => `${(buffer.length / 1024).toFixed(1)} КБ`;

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

/* --- Ассеты ------------------------------------------------------------- */

await cp(ASSETS, path.join(DIST, 'assets'), { recursive: true });
await cp(path.join(ROOT, 'src/vendor'), path.join(DIST, 'assets/vendor'), { recursive: true });

/* Шрифты подключаются первым файлом, дальше — стили сайта.
   Пути внутри fonts.css указывают на соседнюю папку, а после склейки
   CSS лежит в assets/css/ — поэтому префикс переписывается. */
const fontsCss = (await readFile(path.join(ASSETS, 'fonts/fonts.css'), 'utf8')).replace(
  /url\('\.\//g,
  "url('../fonts/",
);

const cssParts = [];
for (const file of CSS_ORDER) cssParts.push(await readFile(path.join(ASSETS, 'css', file), 'utf8'));

const css = [fontsCss, ...cssParts]
  .join('\n\n')
  .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

await writeFile(path.join(DIST, 'assets/css/app.css'), `${css}\n`);
console.log(`✓ assets/css/app.css — ${kb(Buffer.from(css))}`);

/* Общие файлы сайта. */
if (existsSync(path.join(ROOT, 'public'))) {
  await cp(path.join(ROOT, 'public'), DIST, { recursive: true });
}

const fonts = await readdir(path.join(DIST, 'assets/fonts'));
const images = existsSync(path.join(DIST, 'assets/img')) ? await readdir(path.join(DIST, 'assets/img')) : [];
console.log(`✓ assets: ${fonts.length} файлов шрифтов, ${images.length} изображений`);

/* Данные, которые нужны в браузере: страницам сцены и конфигуратору. */
await writeFile(
  path.join(DIST, 'assets/js/data.js'),
  `/* Сгенерировано build.mjs из src/data/content.mjs. Не редактировать вручную. */\nexport const data = ${JSON.stringify(
    { site: { name: site.name, url: site.url }, configurator },
    null,
    2,
  )};\n`,
);
console.log('✓ assets/js/data.js');

/* --- Страницы ----------------------------------------------------------- */

for (const page of pages) {
  const html = page.render();
  const target = path.join(DIST, page.out);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`  ${page.out.padEnd(30)} ${page.path.padEnd(18)} ${kb(Buffer.from(html))}`);
}

/* --- Служебные файлы ---------------------------------------------------- */

const routes = pages.filter((page) => page.indexable !== false).map((page) => page.path);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) =>
      `  <url><loc>${site.url}${route === '/' ? '/' : route}</loc><changefreq>monthly</changefreq><priority>${route === '/' ? '1.0' : '0.7'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
console.log('✓ sitemap.xml');

await writeFile(
  path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`,
);
console.log('✓ robots.txt');

/* Чистые адреса и кэширование статики. Пути к 404 — с учётом подпапки.
   Скрипты и стили браузер перепроверяет при каждой загрузке: иначе после
   публикации посетитель видит прошлую версию страницы. */
await writeFile(
  path.join(DIST, '.htaccess'),
  `DirectoryIndex index.html
ErrorDocument 404 ${BASE}/404.html

<IfModule mod_headers.c>
  <FilesMatch "\\.(html|js|mjs|css)$">
    Header set Cache-Control "no-cache, must-revalidate"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType font/woff2 "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
</IfModule>
`,
);
console.log('✓ .htaccess');

console.log(`\nГотово. Префикс адресов: ${BASE || '/'}`);
