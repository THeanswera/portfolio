// Скачивает woff2 (кириллица + латиница) для Cormorant Garamond, Golos Text
// и JetBrains Mono в src/assets/fonts и собирает fonts.css — самохостинг
// без обращения к Google на живом сайте.
// Запуск: node scripts/fetch-fonts.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Golos+Text:wght@400..900&family=JetBrains+Mono:wght@300..700&display=swap';
const KEEP_SUBSETS = new Set(['cyrillic', 'latin']);
const OUT_DIR = path.resolve('src/assets/fonts');
const CSS_OUT = path.join(OUT_DIR, 'fonts.css');

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
  const buffer = Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
  await writeFile(path.join(OUT_DIR, file), buffer);

  rules.push(
    [
      `/* ${family} · ${subset} · ${style} */`,
      '@font-face {',
      `  font-family: '${family}';`,
      `  font-style: ${style};`,
      `  font-weight: ${weight};`,
      '  font-display: swap;',
      `  src: url('./${file}') format('woff2');${unicodeRange ? `\n  unicode-range: ${unicodeRange};` : ''}`,
      '}',
    ].join('\n'),
  );
  console.log(`✓ ${file} (${(buffer.length / 1024).toFixed(1)} КБ)`);
}

const header = [
  '/* Сгенерировано scripts/fetch-fonts.mjs — самохостинг шрифтов. Не редактировать вручную. */',
  '',
].join('\n');
await writeFile(CSS_OUT, header + rules.join('\n\n') + '\n');
console.log(`\nГотово: ${rules.length} файлов шрифтов, CSS → src/assets/fonts/fonts.css`);
