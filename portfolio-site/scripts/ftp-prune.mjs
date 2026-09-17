// Чистка устаревших файлов на хостинге: удаляет из папки assets только те файлы,
// на которые не ссылаются живые страницы и CSS. Сначала проверяет, что все нужные
// файлы отвечают 200 — иначе ничего не удаляет.
// Запуск:
//   $env:FTP_USER='...'; $env:FTP_PASS='...'
//   node scripts/ftp-prune.mjs --base http://example.ru --dir /www/example.ru/assets --pages /,/privacy.html [--write]
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const get = (name, fallback = '') => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const host = process.env.FTP_HOST ?? '31.31.196.221';
const port = process.env.FTP_PORT ?? '21';
const user = process.env.FTP_USER;
const pass = process.env.FTP_PASS;
const base = get('--base').replace(/\/$/, '');
const remoteDir = (get('--dir') ?? '').replace(/\/$/, '');
const pages = get('--pages', '/').split(',').map((page) => page.trim());
const write = args.includes('--write');

if (!user || !pass || !base || !remoteDir) {
  console.error('Нужны FTP_USER, FTP_PASS и аргументы --base <url> --dir <удалённая-папка> [--pages /,/privacy.html] [--write]');
  process.exit(1);
}

const fetchText = (url) => {
  const result = spawnSync('curl.exe', ['-sS', '--max-time', '40', url], { encoding: 'utf8' });
  return result.status === 0 ? (result.stdout ?? '') : '';
};

const status = (url) =>
  spawnSync('curl.exe', ['-s', '-o', 'NUL', '-w', '%{http_code}', '--max-time', '30', url], {
    encoding: 'utf8',
  }).stdout?.trim();

const assetName = (path) => path.split('/').pop();

const referenced = new Set();

for (const page of pages) {
  const html = fetchText(`${base}${page}`);
  if (!html) {
    console.error(`Не удалось получить страницу ${base}${page} — прерываю, чтобы ничего не удалить лишнего.`);
    process.exit(1);
  }

  for (const match of html.matchAll(/(?:src|href)="([^"]*assets\/[^"]+)"/g)) {
    referenced.add(assetName(match[1]));
  }

  for (const match of html.matchAll(/(?:src|href)="([^"]*assets\/[^"]+\.css)"/g)) {
    const cssUrl = new URL(match[1], `${base}/`).href;
    const css = fetchText(cssUrl);
    for (const font of css.matchAll(/url\(['"]?([^'")]+\.woff2)['"]?\)/g)) {
      referenced.add(assetName(font[1]));
    }
  }
}

if (referenced.size === 0) {
  console.error('Не найдено ни одной ссылки на файлы — прерываю.');
  process.exit(1);
}

console.log(`Нужны страницам (${referenced.size}): ${[...referenced].join(', ')}\n`);

const missing = [...referenced].filter((name) => status(`${base}/assets/${name}`) !== '200');
if (missing.length > 0) {
  console.error(`Эти файлы не отвечают 200: ${missing.join(', ')}. Ничего не удаляю.`);
  process.exit(1);
}

const listing = spawnSync(
  'curl.exe',
  ['--config', '-'],
  {
    input: Buffer.from(
      [`user = "${user}:${pass}"`, 'ftp-pasv', 'connect-timeout = 30', 'silent', 'show-error', `url = "ftp://${host}:${port}${remoteDir}/"`].join('\n'),
      'utf8',
    ),
    encoding: 'utf8',
  },
).stdout ?? '';

const remoteFiles = [];
for (const line of listing.split(/\r?\n/)) {
  const match = line.match(/^-\S+\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$/);
  if (match) remoteFiles.push({ name: match[2], size: Number(match[1]) });
}

const stale = remoteFiles.filter((file) => !referenced.has(file.name));
if (stale.length === 0) {
  console.log('Устаревших файлов нет.');
  process.exit(0);
}

let freed = 0;
for (const file of stale) {
  console.log(`${write ? 'удаляю' : 'к удалению'}: ${file.name} (${(file.size / 1024).toFixed(1)} КБ)`);
  freed += file.size;
  if (!write) continue;

  const result = spawnSync(
    'curl.exe',
    ['-sS', '-u', `${user}:${pass}`, '--max-time', '40', `ftp://${host}:${port}${remoteDir}/`, '-Q', `DELE ${remoteDir}/${file.name}`, '-o', process.platform === 'win32' ? 'NUL' : '/dev/null'],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) console.error(`  не удалось удалить: ${result.stderr?.trim()}`);
}

console.log(`\nВсего: ${stale.length} файлов, ${(freed / 1024).toFixed(1)} КБ.${write ? '' : ' Запустите с --write, чтобы удалить.'}`);
