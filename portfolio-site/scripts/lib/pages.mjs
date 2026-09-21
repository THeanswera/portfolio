// Мост между данными сайта и сборкой.
//
// Node 24 умеет импортировать TypeScript напрямую (стирание типов), поэтому
// список страниц не дублируется во втором месте: сборка статических страниц,
// карта сайта и проверки берут ровно те данные, что видит браузер.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');

/** Ссылка на модуль: на Windows путь обязан быть file://, иначе «D:» читается как протокол. */
const moduleUrl = (relative) => pathToFileURL(path.join(root, relative)).href;

const pageData = await import(moduleUrl('src/data/pages.ts'));
const siteData = await import(moduleUrl('src/data/site.ts'));
const manifestData = await import(moduleUrl('src/data/manifest.ts'));

export const manifest = manifestData.manifest;
export const homePage = pageData.homePage;
export const catalogPage = pageData.catalogPage;
export const privacyPage = pageData.privacyPage;
export const notFoundPage = pageData.notFoundPage;
export const casePages = pageData.casePages;
export const sitemapPages = pageData.sitemapPages;
export const allPages = pageData.allPages;
export const canonicalRoutes = pageData.canonicalRoutes;

export const works = siteData.works;
export const site = siteData.site;

/** Картинка превью для кейса: готовится скриптом build-og-images.mjs. */
export const ogImageUrl = (slug) => `${manifest.origin}/og/${slug}.jpg`;

/** Данные для подписей и проверок: домен, название и контакты в одном месте. */
export const siteInfo = {
  origin: manifest.origin,
  name: site.name,
  telegram: site.telegram,
  telegramHandle: site.telegramHandle,
  email: site.email,
};

/** Все страницы сборки, кроме страницы ошибки. */
export const pages = allPages;

/** Задания для браузерной сборки: адрес render.html и файл результата. */
export function buildJobs() {
  return [
    { url: 'render.html?page=home', file: homePage.file, page: homePage },
    { url: 'render.html?page=catalog', file: catalogPage.file, page: catalogPage },
    { url: 'render.html?page=privacy', file: privacyPage.file, page: privacyPage },
    { url: 'render.html?page=not-found', file: notFoundPage.file, page: notFoundPage },
    ...casePages.map((page) => ({
      url: `render.html?page=case&id=${page.work.slug}`,
      file: page.file,
      page,
    })),
  ];
}
