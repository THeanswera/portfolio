// Уборка служебных файлов сборки: render.html нужен только во время пререндера,
// в выгрузку он попадать не должен — ни в dist, ни в репозитории.
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

for (const file of [path.join(root, 'dist', 'render.html'), path.join(root, 'render.html')]) {
  await rm(file, { force: true });
}

console.log('  служебные файлы сборки удалены');
