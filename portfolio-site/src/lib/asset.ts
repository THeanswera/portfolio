/**
 * Путь к файлу из public/.
 *
 * На опубликованном сайте результат абсолютный: '/privacy.html', '/cases/'.
 * Так ссылка работает с любой глубины — со страницы кейса вложенные пути вида
 * './cases/sextant/' вели бы внутрь папки кейса. Сборка страницы 404 тоже
 * полагается на это: ошибку отдаёт адрес вроде /nope, и относительная ссылка
 * искала бы файл рядом с ним, а не в корне сайта.
 *
 * В разработке Vite отдаёт страницы по своему базовому адресу, поэтому там
 * префикс берётся из настроек сервера.
 */
export function asset(relativePath = ''): string {
  const base = import.meta.env.DEV ? (import.meta.env.BASE_URL || '/') : '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const tail = relativePath.replace(/^\/+/, '');

  return tail ? `${prefix}${tail}` : prefix;
}
