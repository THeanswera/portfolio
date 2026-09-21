// Проверка внутренних ссылок статического сайта: каждая ссылка должна вести на
// существующий файл, а якорь — на существующий элемент целевой страницы.
//
// Запуск: node scripts/check-links.mjs <папка-сайта>
//
// Дополняет check-seo.mjs: тот проверяет метаданные и карту сайта, этот — только
// ссылки. Держим оба, потому что этот скрипт умеет работать с любой папкой сборки
// (например с выгрузкой с хостинга), а не только со своим dist.
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [dirArg] = process.argv.slice(2);
if (!dirArg) {
  console.error('Использование: node scripts/check-links.mjs <папка-сайта>');
  process.exit(1);
}

const root = path.resolve(dirArg);
const problems = [];
let checked = 0;

async function collect(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (/^(\.git|node_modules|\.tmp)/.test(entry.name)) continue;
      files.push(...(await collect(path.join(dir, entry.name), rel)));
    } else {
      files.push(rel);
    }
  }
  return files;
}

const exists = async (file) => {
  try {
    await access(path.join(root, file));
    return true;
  } catch {
    return false;
  }
};

const allFiles = new Set(await collect(root));
const pages = [...allFiles].filter((file) => file.endsWith('.html'));

const html = new Map();
for (const page of pages) html.set(page, await readFile(path.join(root, page), 'utf8'));

const idsByFile = new Map();
for (const [page, source] of html) {
  idsByFile.set(page, new Set([...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
}

/**
 * Куда ведёт ссылка. Адрес от корня ('/assets/app.js') и относительный
 * ('../cases/') приводятся к пути файла внутри папки сборки; каталог — к его
 * index.html, как это делает хостинг.
 */
function resolveTarget(href, fromFile) {
  const [rawTarget, hash] = href.split('#');
  const target = (rawTarget ?? '').split('?')[0];

  if (target === '') return { file: fromFile, hash };

  const relative = target.replace(/^\/+/, '');
  const base = path.posix.dirname(fromFile);
  const joined = path.posix.join(base === '.' ? '' : base, relative);
  const resolved = path.posix.normalize(`./${joined}`).replace(/^\.\//, '');

  if (resolved === '' || resolved === '.' || resolved.endsWith('/')) {
    return { file: `${resolved === '.' ? '' : resolved}index.html`, hash };
  }
  return { file: resolved, hash };
}

for (const [page, source] of html) {
  for (const match of source.matchAll(/\b(href|src)="([^"]+)"/g)) {
    const href = match[2];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(href)) continue;
    checked += 1;

    const { file, hash } = resolveTarget(href, page);
    if (!allFiles.has(file)) {
      problems.push(`${page}: ссылка «${href}» ведёт на несуществующий файл ${file}`);
      continue;
    }
    if (hash && html.has(file) && !idsByFile.get(file).has(hash)) {
      problems.push(`${page}: ссылка «${href}» — в ${file} нет элемента #${hash}`);
    }
  }
}

console.log(`Файлов: ${allFiles.size}, страниц: ${pages.length}, проверено ссылок: ${checked}`);
if (problems.length === 0) {
  console.log('Битых ссылок и якорей нет.');
  process.exit(0);
}

for (const problem of problems) console.log(`  ✗ ${problem}`);
console.log(`\nЗамечаний: ${problems.length}`);
process.exit(1);
