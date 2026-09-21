// Сборка статических страниц: создаёт точку входа, собирает проект vite build.
//
// render.html нужен только на время сборки: его открывает headless-браузер,
// чтобы снять готовую разметку. В репозитории и в выгрузке файла нет.
//
// Запуск (из npm run build): node scripts/build-assets.mjs
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Сборка страниц</title>
    <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="prerender-root"></div>
    <script type="module" src="/src/entries/render.tsx"></script>
  </body>
</html>
`;

await writeFile(path.join(root, 'render.html'), html, 'utf8');

const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const result = spawnSync(process.execPath, [vite, 'build'], { cwd: root, stdio: 'inherit' });
process.exit(result.status ?? 1);
