/**
 * Страницы сайта: адреса, метаданные и признак индексации.
 *
 * Адреса и настройки страниц лежат в `manifest.json` — из него же собираются
 * статические страницы и карта сайта, поэтому список адресов существует в одном
 * месте. Тексты кейсов берутся из данных (`site.ts`), а не дублируются.
 *
 * Раньше адреса, метаданные и карта сайта жили отдельно и расходились:
 * sitemap знал только главную, а все шесть кейсов отдавали один canonical.
 */
import { manifest } from './manifest.ts';
import { works } from './site.ts';
import type { Work } from './site.ts';

export type PageKind = 'home' | 'catalog' | 'case' | 'privacy' | 'not-found';

export type PageMeta = {
  kind: PageKind;
  /** Путь от корня сайта: '/', '/cases/sextant/'. */
  route: string;
  /** Файл на хостинге после сборки: 'index.html', 'cases/sextant/index.html'. */
  file: string;
  title: string;
  description: string;
  heading: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** Дата существенного обновления содержимого — идёт в lastmod карты сайта. */
  updated: string;
  changefreq: string;
  priority: string;
  noindex: boolean;
  inSitemap: boolean;
  work?: Work;
};

export const SITE_ORIGIN = manifest.origin;

type ManifestPage = {
  route: string;
  file: string;
  title: string;
  description: string;
  heading: string;
  updated: string;
  changefreq: string;
  priority: string;
  noindex: boolean;
  inSitemap: boolean;
};

function fromManifest(kind: PageKind, page: ManifestPage, work?: Work): PageMeta {
  return {
    kind,
    route: page.route,
    file: page.file,
    title: page.title,
    description: page.description,
    heading: page.heading,
    canonical: `${SITE_ORIGIN}${page.route}`,
    updated: page.updated,
    changefreq: page.changefreq,
    priority: page.priority,
    noindex: page.noindex,
    inSitemap: page.inSitemap,
    work,
  };
}

/** Опубликованные кейсы: только они получают страницу и запись в карте сайта. */
export const publishedWorks: Work[] = works.filter((work) => work.published);

function manifestCase(work: Work) {
  const entry = manifest.cases.find((item) => item.id === work.id);
  if (!entry) {
    throw new Error(`Кейс «${work.id}» опубликован, но не описан в src/data/manifest.json`);
  }
  return entry;
}

/** Slug — часть адреса кейса. Хранится отдельно от id, чтобы адрес не «переезжал». */
export function workSlug(work: Work): string {
  return manifestCase(work).slug;
}

export function caseRoute(work: Work): string {
  return `/cases/${workSlug(work)}/`;
}

export const casePages: PageMeta[] = publishedWorks.map((work) => {
  const entry = manifestCase(work);

  return {
    ...fromManifest(
      'case',
      {
        route: `/cases/${entry.slug}/`,
        file: `cases/${entry.slug}/index.html`,
        title: `${work.title} — ${entry.titleSuffix}`,
        description: work.summary,
        heading: work.title,
        updated: entry.updated,
        changefreq: 'monthly',
        priority: '0.8',
        noindex: false,
        inSitemap: true,
      },
      work,
    ),
    ogTitle: `${work.title} — ${entry.titleSuffix}`,
    ogDescription: work.lead ?? work.summary,
    ogImage: entry.ogImage,
  };
});

export const catalogPage: PageMeta = fromManifest('catalog', manifest.catalog);
export const homePage: PageMeta = fromManifest('home', manifest.home);
export const privacyPage: PageMeta = fromManifest('privacy', manifest.privacy);
export const notFoundPage: PageMeta = fromManifest('not-found', manifest.notFound);

/** Все генерируемые страницы, кроме страницы ошибки. */
export const allPages: PageMeta[] = [homePage, catalogPage, ...casePages, privacyPage];

/** Страницы для карты сайта: только канонические и открытые для индексации. */
export const sitemapPages: PageMeta[] = allPages.filter((page) => page.inSitemap && !page.noindex);

/** Канонические адреса — для проверок и карты редиректов. */
export const canonicalRoutes = [homePage, catalogPage, ...casePages].map((page) => page.route);
