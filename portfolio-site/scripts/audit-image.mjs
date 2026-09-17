// Разбор готового снимка страницы на визуальные дефекты: длинные однотонные полосы
// (пустые экраны), которые означают, что блоки не отрисовались или не появились.
// Запуск: node scripts/audit-image.mjs <файл.png|webp> [...] [--min-run 220]
import path from 'node:path';
import { findFlatBands, emptyShare } from './lib/image-bands.mjs';

const args = process.argv.slice(2);
const minRunIndex = args.indexOf('--min-run');
const MIN_RUN = minRunIndex === -1 ? 220 : Number(args[minRunIndex + 1]);
const files = args.filter((value, index) => !value.startsWith('--') && index !== minRunIndex + 1);

if (files.length === 0) {
  console.error('Использование: node scripts/audit-image.mjs <файл> [...] [--min-run 220]');
  process.exit(1);
}

let total = 0;

for (const file of files) {
  const { width, height, bands } = await findFlatBands(file, { minRun: MIN_RUN });
  const empty = emptyShare(bands, height);
  console.log(`\n${path.basename(file)} — ${width}×${height}, пусто ${(empty * 100).toFixed(1)}% высоты`);
  if (bands.length === 0) {
    console.log(`  ровный контент: однотонных полос длиннее ${MIN_RUN}px нет`);
  } else {
    for (const band of bands.slice(0, 12)) {
      const percent = ((band.from / height) * 100).toFixed(1);
      console.log(
        `  ${band.px}px пусто (${(band.share * 100).toFixed(1)}% высоты), от ${percent}% — ${band.color}, яркость ${band.luminance}`,
      );
    }
    total += bands.length;
  }
}

if (files.length > 1) console.log(`\nВсего полос: ${total}`);
process.exitCode = total > 0 ? 1 : 0;
