// Исправление двойного перекодирования: текст был прочитан как UTF-8, но записан
// байтами Windows-1251. Скрипт делает обратное преобразование.
// Запуск: node scripts/fix-mojibake.mjs <файл> [--write]
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';

const [fileArg, flag] = process.argv.slice(2);
if (!fileArg) {
  console.error('Использование: node scripts/fix-mojibake.mjs <файл> [--write]');
  process.exit(1);
}

const file = path.resolve(fileArg);
const markers = ['Р°', 'Рµ', 'РЅ', 'Рѕ', 'СЃ', 'С‚', 'Р»', 'Рё', 'РІ', 'РЎ'];

const original = await readFile(file, 'utf8');
const countMarkers = (text) => markers.reduce((sum, marker) => sum + text.split(marker).length - 1, 0);

const before = countMarkers(original);
const restored = iconv.decode(iconv.encode(original, 'win1251'), 'utf8');
const after = countMarkers(restored);

console.log(`Файл: ${path.basename(file)}`);
console.log(`Признаков порчи до: ${before}`);
console.log(`Признаков порчи после обратного перекодирования: ${after}`);
console.log(`Пример до: ${original.slice(original.indexOf('<title>'), original.indexOf('<title>') + 90)}`);
console.log(`Пример после: ${restored.slice(restored.indexOf('<title>'), restored.indexOf('<title>') + 90)}`);

if (after >= before) {
  console.error('\nОбратное перекодирование не улучшает текст — файл не изменён.');
  process.exit(1);
}

if (flag === '--write') {
  await copyFile(file, `${file}.bak`);
  await writeFile(file, restored, 'utf8');
  console.log(`\nЗаписано. Резервная копия: ${path.basename(file)}.bak`);
} else {
  console.log('\nПробный режим: добавьте --write, чтобы записать исправление.');
}
