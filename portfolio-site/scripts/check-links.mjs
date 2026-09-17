// Проверка внутренних ссылок статического сайта: каждая ссылка должна вести на существующий файл.
// Запуск: node scripts/check-links.mjs <папка-сайта>
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const [dirArg] = process.argv.slice(2);
if (!dirArg) {
  console.error('Использование: node scripts/check-links.mjs <папка-сайта>');
  process.exit(1);
}

const root = path.resolve(dirArg);

async function collect(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (/^(\.git|node_modules|\.tmp)/.test(entry.name)) continue;
      files.push(...(await collect(path.join(dir, entry.name), rel)));
    } else if (entry.name.endsWith('.html')) {
      files.push(rel);
    }
  }
  return files;
}

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

const pages = await collect(root);
let broken = 0;
let checked = 0;
const idsByFile = new Map();

// Сначала собираем все якоря, потом проверяем ссылки — иначе ссылки на страницы,
// которые ещё не обработаны, ложно считаются битыми.
for (const page of pages) {
  const html = await readFile(path.join(root, page), 'utf8');
  idsByFile.set(page, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

for (const page of pages) {
  const html = await readFile(path.join(root, page), 'utf8');

  const hrefs = [...html.matchAll(/href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((href) => !/^(https?:|tel:|mailto:|data:|javascript:)/.test(href));

  for (const href of hrefs) {
    checked += 1;
    const [rawTarget, hash] = href.split('#');
    const target = (rawTarget ?? '').split('?')[0];
    const targetPage = target === '' ? page : target;
    const targetPath = path.join(root, targetPage);

    if (!(await exists(targetPath))) {
      console.log(`БИТАЯ ССЫЛКА  ${page} → ${href}`);
      broken += 1;
      continue;
    }

    if (hash && target) {
      await readFile(targetPath, 'utf8');
      const targetIds = idsByFile.get(targetPage) ?? new Set();
      if (!targetIds.has(hash)) {
        console.log(`НЕТ ЯКОРЯ    ${page} → ${href}`);
        broken += 1;
      }
    }
  }
}

console.log(`\nСтраниц: ${pages.length}, проверено ссылок: ${checked}, проблем: ${broken}`);
process.exit(broken > 0 ? 1 : 0);
