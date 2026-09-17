/**
 * Путь к файлу из public/ с учётом базового адреса сборки.
 * Позволяет открывать сайт и из корня домена, и из подпапки на хостинге.
 */
export function asset(relativePath: string): string {
  const base = import.meta.env.BASE_URL || './';
  return `${base.replace(/\/$/, '')}/${relativePath.replace(/^\//, '')}`;
}
