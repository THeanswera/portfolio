/**
 * Сборка сайта: копирует ассеты, склеивает CSS, генерирует страницы,
 * карту сайта и браузерный модуль с данными. Без зависимостей и сборщиков —
 * на выходе обычная статика, которую можно залить на любой хостинг.
 *
 * Запуск: npm run build
 */
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pages } from './src/pages/registry.mjs';
import { site } from './src/data/site.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ASSETS = ['fonts', 'js', 'img'];
const CSS_ORDER = ['fonts.css', 'base.css', 'layout.css', 'components.css', 'pages.css'];

const exists = async (target) => {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
};

/* --- чистая папка --- */
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

/* --- ассеты --- */
for (const folder of ASSETS) {
  const from = path.join(ROOT, 'src/assets', folder);
  if (await exists(from)) await cp(from, path.join(DIST, 'assets', folder), { recursive: true });
}

if (await exists(path.join(ROOT, 'public'))) {
  await cp(path.join(ROOT, 'public'), DIST, { recursive: true });
}

/* --- CSS: пять файлов в один запрос --- */
await mkdir(path.join(DIST, 'assets/css'), { recursive: true });
const css = (
  await Promise.all(CSS_ORDER.map((file) => readFile(path.join(ROOT, 'src/assets/css', file), 'utf8')))
).join('\n');
await writeFile(path.join(DIST, 'assets/css/app.css'), css);

/* --- данные для браузера: только то, что нужно на клиенте --- */
const clientSite = {
  base: site.base,
  name: site.name,
  legalName: site.legalName,
  phone: site.phone,
  phoneHref: site.phoneHref,
  email: site.email,
  telegram: site.telegram,
  telegramHandle: site.telegramHandle,
};
await writeFile(
  path.join(DIST, 'assets/js/site-data.js'),
  `/* Сгенерировано build.mjs из src/data/site.mjs */\nexport const site = ${JSON.stringify(clientSite, null, 2)};\n`,
);

/* --- страницы --- */
const written = [];
for (const page of pages) {
  const target = path.join(DIST, page.out);
  await mkdir(path.dirname(target), { recursive: true });
  const html = page.render();
  await writeFile(target, html);
  written.push({ out: page.out, path: page.path, size: Buffer.byteLength(html) });
}

/* --- карта сайта --- */
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .filter((page) => !page.noindex)
  .map((page) => `  <url><loc>${site.url}${page.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

/* --- .htaccess: страница 404, кодировка, сжатие и кеш --- */
const htaccess = `# Сгенерировано build.mjs
AddDefaultCharset UTF-8
ErrorDocument 404 ${site.base}/404.html
DirectoryIndex index.html

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain application/javascript image/svg+xml application/json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 6 months"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Служебные файлы не отдаём наружу
<FilesMatch "\\.(jsonl|json|log)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
</FilesMatch>
`;
await writeFile(path.join(DIST, '.htaccess'), htaccess);

/* --- отчёт --- */
const total = written.reduce((sum, page) => sum + page.size, 0);
console.log(`Страниц: ${written.length}, разметки ${(total / 1024).toFixed(1)} КБ, CSS ${(Buffer.byteLength(css) / 1024).toFixed(1)} КБ`);
for (const page of written) {
  console.log(`  ${page.out.padEnd(34)} ${page.path.padEnd(30)} ${(page.size / 1024).toFixed(1)} КБ`);
}
