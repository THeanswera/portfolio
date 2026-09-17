// Режет длинный снимок на читаемые части — чтобы смотреть страницу глазами,
// а не по числам. Запуск: node scripts/slice-image.mjs <файл> --out <папка> [--parts 6] [--width 900]
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const file = args.find((value) => !value.startsWith('--'));
if (!file) {
  console.error('Использование: node scripts/slice-image.mjs <файл> --out <папка> [--parts 6] [--width 900]');
  process.exit(1);
}

const outDir = path.resolve(arg('out', '.tmp-slices'));
const width = Number(arg('width', 900));
const parts = Number(arg('parts', 6));
await mkdir(outDir, { recursive: true });

const meta = await sharp(file).metadata();
const resized = await sharp(file).resize({ width }).png().toBuffer();
const info = await sharp(resized).metadata();
const total = info.height ?? 0;
const partWidth = info.width ?? width;
const step = Math.ceil(total / parts);
const base = path.basename(file).replace(/\.[^.]+$/, '');

console.log(`${path.basename(file)} → ${partWidth}×${total} (исходник ${meta.width}×${meta.height}), частей ${parts} по ${step}px`);

for (let index = 0; index < parts; index += 1) {
  const top = index * step;
  const height = Math.min(step, total - top);
  if (height <= 0) break;
  const out = path.join(outDir, `${base}-${String(index + 1).padStart(2, '0')}.png`);
  await sharp(resized).extract({ left: 0, top, width: partWidth, height }).png().toFile(out);
  console.log(`  ${path.relative(process.cwd(), out)} — часть ${index + 1}, от ${top}px`);
}
