// Поиск испорченной кодировки (двойное перекодирование UTF-8 → CP1251).
// Запуск: node scripts/check-mojibake.mjs <папка> [расширения через запятую]
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const [dirArg, extArg = 'html,css,js,json,md,php'] = process.argv.slice(2);
if (!dirArg) {
  console.error('Использование: node scripts/check-mojibake.mjs <папка> [html,css,js]');
  process.exit(1);
}

const root = path.resolve(dirArg);
const extensions = new Set(extArg.split(',').map((value) => `.${value.trim().replace(/^\./, '')}`));
const markers = ['Р°', 'Рµ', 'РЅ', 'Рѕ', 'СЃ', 'С‚', 'Р»', 'Рё', 'РІ', 'РЎ', 'РЇ', 'С‡'];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      files.push(...(await walk(full)));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const files = await walk(root);
let corrupted = 0;

for (const file of files) {
  const text = await readFile(file, 'utf8');
  let hits = 0;
  for (const marker of markers) hits += text.split(marker).length - 1;
  const verdict = hits > 50 ? 'ИСПОРЧЕН' : hits > 5 ? 'проверить' : 'ок';
  if (hits > 50) corrupted += 1;
  console.log(
    `${verdict.padEnd(9)} ${String(hits).padStart(6)}  ${path.relative(root, file)}  (${(await stat(file)).size} Б)`,
  );
}

console.log(`\nВсего файлов: ${files.length}, испорченных: ${corrupted}`);
