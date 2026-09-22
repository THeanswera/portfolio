// Публикация собранного сайта (dist) на хостинг по FTP.
// Пароль не хранится в файлах: он передаётся через переменные окружения.
// Запуск:
//   $env:FTP_USER='...'; $env:FTP_PASS='...'; $env:FTP_DIR='/www/домен'
//   node scripts/deploy.mjs [--dry-run]
//
// FTP_SRC — что выгружаем (по умолчанию dist).
// FTP_EXCLUDE — имена файлов и папок, которые на сервер не нужны, через запятую:
// у демо «ТехРемонт» это README.md с инструкцией по правке.
import { spawnSync } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

/** curl на Windows вызывается как curl.exe, на остальных системах — как curl. */
const CURL = process.platform === 'win32' ? 'curl.exe' : 'curl';

const host = process.env.FTP_HOST ?? '31.31.196.221';
const user = process.env.FTP_USER;
const pass = process.env.FTP_PASS;
const dir = (process.env.FTP_DIR ?? '').replace(/\/$/, '');
const dist = path.resolve(process.env.FTP_SRC ?? 'dist');
const dryRun = process.argv.includes('--dry-run');
const port = process.env.FTP_PORT ?? '21';

if (!user || !pass) {
  console.error('Нужны переменные окружения FTP_USER и FTP_PASS.');
  process.exit(1);
}
if (!dir) {
  console.error('Нужна переменная окружения FTP_DIR — папка сайта на сервере, например /www/example.ru');
  process.exit(1);
}

const IGNORED = /(^|\/)(node_modules|\.git|\.tmp[A-Za-z-]*)(\/|$)|\.(bak|log|tmp|psd|fig|zip)$/i;

/** Что не выгружаем сверх IGNORED: FTP_EXCLUDE=README.md,docs */
const EXCLUDED = (process.env.FTP_EXCLUDE ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const skip = (rel) => IGNORED.test(rel) || EXCLUDED.some((name) => rel === name || rel.startsWith(`${name}/`));

async function walk(root, prefix = '') {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(root, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (skip(rel)) continue;
    if (entry.isDirectory()) files.push(...(await walk(abs, rel)));
    else files.push({ abs, rel, size: (await stat(abs)).size });
  }
  return files;
}

const files = await walk(dist);
if (files.length === 0) {
  console.error('Папка dist пуста — сначала выполните npm run build.');
  process.exit(1);
}

const toPosix = (value) => value.split(path.sep).join('/');
const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

console.log(`Хостинг: ${host}:${port}`);
console.log(`Папка сайта: ${dir}`);
console.log(`Файлов: ${files.length}, объём: ${(totalBytes / 1024).toFixed(1)} КБ${dryRun ? ' (пробный запуск)' : ''}\n`);

let uploaded = 0;
for (const file of files) {
  process.stdout.write(`→ ${file.rel} (${(file.size / 1024).toFixed(1)} КБ) `);
  if (dryRun) {
    console.log('— пропущено');
    continue;
  }

  // Пароль передаём через конфиг на stdin, чтобы он не попадал в аргументы процесса.
  const config = [
    `user = "${user}:${pass}"`,
    'ftp-pasv',
    'ftp-create-dirs',
    'connect-timeout = 30',
    'silent',
    'show-error',
    `upload-file = "${toPosix(file.abs)}"`,
    `url = "ftp://${host}:${port}${dir}/${file.rel}"`,
  ].join('\n');

  let result = { status: 1, stderr: '' };
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    result = spawnSync(CURL, ['--config', '-'], { input: config, encoding: 'utf8' });
    if (result.status === 0) break;
    process.stdout.write(`попытка ${attempt} не прошла, повтор… `);
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }

  if (result.status !== 0) {
    console.error(`\nОшибка загрузки (код ${result.status}): ${result.stderr?.trim() || 'без описания'}`);
    process.exit(1);
  }
  uploaded += 1;
  console.log('✓');
}

console.log(`\nЗагружено файлов: ${uploaded} из ${files.length}.`);
