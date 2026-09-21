import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Точка входа сборки статических страниц. Файла нет в репозитории: его создаёт
 * prerender перед сборкой и удаляет после, чтобы он не попал в выгрузку.
 * В разработке этот плагин отдаёт его содержимое виртуально.
 */
const PRERENDER_HTML = [
  '<!doctype html>',
  '<html lang="ru">',
  '<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />',
  '<title>Сборка страниц</title><link rel="icon" href="./favicon.svg" type="image/svg+xml" /></head>',
  '<body><div id="prerender-root"></div>',
  '<script type="module" src="/src/entries/render.tsx"></script></body>',
  '</html>',
].join('\n');

/**
 * В разработке адреса кейсов отдаёт та же точка входа, что и в собранном сайте:
 * /cases/<slug>/ — страница кейса. Адрес /cases/ разрешается сам: в папке
 * cases/ лежит index.html.
 */
const caseRoutes: Plugin = {
  name: 'case-routes',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/cases\/[a-z0-9-]+\/(\?.*)?$/i.test(req.url)) {
        const slug = req.url.match(/^\/cases\/([a-z0-9-]+)\//i)?.[1] ?? '';
        req.url = `/case.html?work=${slug}`;
      }
      next();
    });
  },
  // В разработке render.html может отсутствовать — отдаём его из памяти.
  transformIndexHtml: {
    order: 'pre',
    handler(html, context) {
      if (context.server && context.filename.endsWith('render.html')) return PRERENDER_HTML;
      return html;
    },
  },
};

export default defineConfig({
  // Абсолютные пути от корня домена: страницы кейсов лежат в подпапках, и
  // относительные ссылки внутри них указывали бы внутрь папки кейса.
  base: '/',
  plugins: [react(), tailwindcss(), caseRoutes],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: {
        // Главная и политика используют тот же вход, что и страницы кейсов:
        // один скрипт определяет страницу по адресу (src/entries/render.tsx).
        main: path.resolve(root, 'index.html'),
        privacy: path.resolve(root, 'privacy.html'),
        // Старый адрес кейсов: сервер перенаправляет его на /cases/<slug>/,
        // но страница остаётся рабочей — для локальной разработки и прямого файла.
        case: path.resolve(root, 'case.html'),
        // Точка входа сборки статических страниц (создаётся prerender).
        render: path.resolve(root, 'render.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
