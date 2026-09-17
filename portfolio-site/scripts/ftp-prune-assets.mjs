// Уборка устаревших файлов в папке assets на хостинге.
// Имена файлов сборки содержат хеш, поэтому после каждой сборки появляются новые,
// а старые остаются на сервере. Скрипт удаляет только те файлы из assets/,
// которых нет в свежем dist/assets — страницы, robots.txt и прочее не трогает.
//
// Запуск:
//   $env:FTP_USER='...'; $env:FTP_PASS='...'; $env:FTP_DIR='/www/домен'
//   node scripts/ftp-prune-assets.mjs [--write]
import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const host = process.env.FTP_HOST ?? '31.31.196.221';
/** curl на Windows вызывается как curl.exe, на остальных системах — как curl. */
const CURL = process.platform === 'win32' ? 'curl.exe' : 'curl';
const user = process.env.FTP_USER;
const pass = process.env.FTP_PASS;
const dir = (process.env.FTP_DIR ?? '').replace(/\/$/, '');
const dist = path.resolve(process.env.FTP_SRC ?? 'dist');
const write = process.argv.includes('--write');

if (!user || !pass || !dir) {
  console.error('Нужны переменные окружения FTP_USER, FTP_PASS и FTP_DIR.');
  process.exit(1);
}

const run = (config) => spawnSync(CURL, ['--config', '-'], { input: config, encoding: 'utf8' });
const base = `user = "${user}:${pass}"\nftp-pasv\nconnect-timeout = 25\nsilent\nshow-error\n`;

/** Список имён файлов в папке на сервере. */
function list(remote) {
  const config = `${base}url = "ftp://${host}${remote}/"\n`;
  const result = run(config);
  if (result.status !== 0) throw new Error(`Не удалось получить список ${remote}: ${result.stderr?.trim()}`);
  return result.stdout
    .split('\n')
    .map((line) => line.trim().split(/\s+/).pop())
    .filter((name) => name && name !== '.' && name !== '..');
}

const local = await readdir(path.join(dist, 'assets'), { withFileTypes: true });
const localFiles = new Set(local.filter((entry) => entry.isFile()).map((entry) => entry.name));

const remoteFiles = list(`${dir}/assets`);
const stale = remoteFiles.filter((name) => !localFiles.has(name));

console.log(`Локально в сборке: ${localFiles.size} файлов`);
console.log(`На сервере: ${remoteFiles.length} файлов`);
console.log(`Свежих: ${remoteFiles.length - stale.length}, устаревших: ${stale.length}\n`);

if (stale.length === 0) {
  console.log('Удалять нечего.');
  process.exit(0);
}

for (const name of stale) {
  process.stdout.write(`→ assets/${name} `);
  if (!write) {
    console.log('— к удалению');
    continue;
  }
  const config = `${base}url = "ftp://${host}${dir}/assets/"\noutput = ${process.platform === 'win32' ? '"NUL"' : '"/dev/null"'}\nquote = "DELE ${dir}/assets/${name}"\n`;
  const result = run(config);
  console.log(result.status === 0 ? '✓ удалён' : `ошибка: ${result.stderr?.trim()}`);
}

console.log(
  write
    ? '\nГотово.'
    : `\nЭто пробный запуск. Запустите с --write, чтобы удалить ${stale.length} файлов.`,
);
