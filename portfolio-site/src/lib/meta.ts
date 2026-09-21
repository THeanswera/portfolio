/**
 * Обновление заголовка и canonical в браузере.
 * В исходном HTML эти теги уже стоят — генератор страниц пишет их на сборке,
 * а этот модуль нужен для переходов без перезагрузки и для локальной разработки.
 */
export function applyPageMeta({
  title,
  description,
  canonical,
}: {
  title: string;
  description?: string;
  canonical?: string;
}) {
  if (typeof document === 'undefined') return;

  document.title = title;

  if (description) {
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.append(tag);
    }
    tag.setAttribute('content', description);
  }

  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.append(link);
  }
  if (canonical) link.setAttribute('href', canonical);
}
