// Готовит картинки для превью ссылок: по одной на каждый кейс.
//
// Раньше og:image у всех страниц был общий, поэтому в мессенджере все шесть
// кейсов выглядели одинаково. Здесь берётся первый экран проекта (1440×900) и
// обрезается до формата превью 1200×630, сохраняя верх кадра.
//
// Запуск: node scripts/build-og-images.mjs (вызывается из npm run build)
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { casePages } from './lib/pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = path.join(root, 'public', 'shots');
const target = path.join(root, 'public', 'og');

const WIDTH = 1200;
const HEIGHT = 630;

await mkdir(target, { recursive: true });

const built = [];

for (const page of casePages) {
  const slug = page.work.slug;
  const input = path.join(source, `${slug}.webp`);
  const output = path.join(target, `${slug}.jpg`);

  const image = sharp(input);
  const meta = await image.metadata();

  const buffer = await image
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  await writeFile(output, buffer);
  built.push({ slug, from: `${meta.width}×${meta.height}`, size: Math.round(buffer.length / 1024) });
}

for (const item of built) {
  console.log(`  og/${item.slug}.jpg — из ${item.from}, ${item.size} КБ`);
}
