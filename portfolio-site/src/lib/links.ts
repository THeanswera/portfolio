/**
 * Ссылки на разделы сайта, одинаковые со всех страниц.
 *
 * На странице кейса адреса из подвала (#services, #works и т.д.) вели в никуда:
 * таких секций там нет. Поэтому «разделы главной» всегда собираются от корня
 * сайта, а не как якорь текущего документа.
 */
import { asset } from './asset';

/** Адрес каталога кейсов. */
export function catalogUrl(): string {
  return asset('cases/');
}

/** Адрес страницы кейса: /cases/<slug>/. */
export function caseUrl(id: string): string {
  return asset(`cases/${id}/`);
}

/**
 * Раздел главной страницы: /#works, /#contact и т.д.
 * Адрес всегда указывает на главную целиком — иначе якорь со страницы кейса
 * искал бы раздел внутри самой страницы кейса, где его нет.
 */
export function homeUrl(hash?: string): string {
  const base = asset('');
  if (!hash) return base;
  return `${base}${hash.startsWith('#') ? hash : `#${hash}`}`;
}

/** Страница политики конфиденциальности. */
export function privacyUrl(): string {
  return asset('privacy.html');
}

/** Абсолютный адрес страницы на опубликованном домене — для canonical и Open Graph. */
export const SITE_ORIGIN = 'https://rootlost.ru';

export function absoluteUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `${SITE_ORIGIN}/${clean}`;
}
