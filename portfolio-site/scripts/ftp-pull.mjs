// Скачивание папки с хостинга по FTP (резервная копия перед изменениями).
// Запуск:
//   $env:FTP_USER='...'; $env:FTP_PASS='...'
//   node scripts/ftp-pull.mjs <удалённая-папка> <локальная-папка> [макс. файлов]
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const host = process.env.FTP_HOST ?? '31.31.196.221';
const port = process.env.FTP_PORT ?? '21';
const user = process.env.FTP_USER;
const pass = process.env.FTP_PASS;
/** curl на Windows вызывается как curl.exe, на остальных системах — как curl. */
const CURL = process.platform === 'win32' ? 'curl.exe' : 'curl';
const [remoteDir, localDirArg, limitArg] = process.argv.slice(2);
const limit = limitArg ? Number(limitArg) : Infinity;

if (!user || !pass || !remoteDir || !localDirArg) {
  console.error('Нужны FTP_USER, FTP_PASS и аргументы: <удалённая-папка> <локальная-папка>');
  process.exit(1);
}

const localDir = path.resolve(localDirArg);

function ftp(args, { capture = false } = {}) {
  const config = [
    `user = "${user}:${pass}"`,
    'ftp-pasv',
    'connect-timeout = 30',
    'silent',
    'show-error',
    ...args,
  ].join('\n');

  const result = spawnSync(CURL, ['--config', '-'], {
    input: config,
    encoding: 'utf8',
    stdio: capture ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit'],
  });
  if (result.status !== 0) throw new Error(`curl завершился с кодом ${result.status}`);
  return result.stdout ?? '';
}

function parseListing(listing) {
  const entries = [];
  for (const line of listing.split(/\r?\n/)) {
    const match = line.match(
      /^([dl-])([rwxst-]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$/,
    );
    if (!match) continue;
    const [, type, , size, name] = match;
    if (name === '.' || name === '..') continue;
    entries.push({ type, size: Number(size), name });
  }
  return entries;
}

let downloaded = 0;
let bytes = 0;

async function walk(remote, local, prefix = '') {
  await mkdir(local, { recursive: true });
  const listing = ftp([`url = "ftp://${host}:${port}${remote}/"`], { capture: true });
  const entries = parseListing(listing);

  for (const entry of entries) {
    if (downloaded >= limit) return;
    const remotePath = `${remote}/${entry.name}`;
    const localPath = path.join(local, entry.name);

    if (entry.type === 'd') {
      await walk(remotePath, localPath, `${prefix}${entry.name}/`);
      continue;
    }

    const body = spawnSync(CURL, ['--config', '-'], {
      input: Buffer.from(
        [
          `user = "${user}:${pass}"`,
          'ftp-pasv',
          'connect-timeout = 30',
          'silent',
          'show-error',
          `url = "ftp://${host}:${port}${encodeURI(remotePath)}"`,
        ].join('\n'),
        'utf8',
      ),
      encoding: 'buffer',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (body.status !== 0) {
      console.error(`  ошибка загрузки: ${remotePath}`);
      continue;
    }
    await writeFile(localPath, body.stdout);
    const size = (await stat(localPath)).size;
    downloaded += 1;
    bytes += size;
    console.log(`↓ ${prefix}${entry.name} (${(size / 1024).toFixed(1)} КБ)`);
  }
}

await walk(remoteDir.replace(/\/$/, ''), localDir);
console.log(`\nСкачано файлов: ${downloaded}, объём: ${(bytes / 1024 / 1024).toFixed(2)} МБ → ${localDir}`);
