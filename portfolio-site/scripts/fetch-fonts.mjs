// Скачивает woff2 (кириллица + латиница) для Manrope / Inter / JetBrains Mono
// в public/fonts и генерирует src/fonts.css — самохостинг без Google CDN.
// Запуск: node scripts/fetch-fonts.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap';
const KEEP_SUBSETS = new Set(['cyrillic', 'latin']);
const OUT_DIR = path.resolve('src/fonts');
const CSS_OUT = path.resolve('src/fonts.css');

const css = await fetch(CSS_URL, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  },
}).then((r) => r.text());

const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/g)];
if (blocks.length === 0) {
  console.error('Не удалось разобрать CSS Google Fonts.');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

const rules = [];
for (const [, subset, block] of blocks) {
  if (!KEEP_SUBSETS.has(subset)) continue;
  const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
  const style = block.match(/font-style:\s*([^;]+);/)?.[1]?.trim() ?? 'normal';
  const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim();
  const unicodeRange = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
  const url = block.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!family || !url) continue;

  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const stylePart = style === 'italic' ? '-italic' : '';
  const file = `${slug}-${subset}${stylePart}.woff2`;
  const buf = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  await writeFile(path.join(OUT_DIR, file), buf);

  rules.push(
    [
      `/* ${family} · ${subset} · ${style} */`,
      '@font-face {',
      `  font-family: '${family}';`,
      `  font-style: ${style};`,
      `  font-weight: ${weight};`,
      '  font-display: swap;',
      `  src: url('./fonts/${file}') format('woff2');${unicodeRange ? `\n  unicode-range: ${unicodeRange};` : ''}`,
      '}',
    ].join('\n'),
  );
  console.log(`✓ ${file} (${(buf.length / 1024).toFixed(1)} КБ)`);
}

const header = [
  '/* Сгенерировано scripts/fetch-fonts.mjs — самохостинг шрифтов. Не редактировать вручную. */',
  '',
].join('\n');
await writeFile(CSS_OUT, header + rules.join('\n\n') + '\n');
console.log(`\nГотово: ${rules.length} файлов шрифтов, CSS → src/fonts.css`);
