// Работа с FTP хостинга: список файлов и выгрузка папки.
// Доступы берутся из переменных окружения FTP_USER и FTP_PASS
// или из локального файла .env.ftp в корне репозитория (в git не попадает).
//
// Запуск:
//   node scripts/ftp-list.mjs <удалённая-папка>
//   node scripts/ftp-pull.mjs <удалённая-папка> <локальная-папка> [макс. файлов]
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const host = process.env.FTP_HOST ?? '31.31.196.221';
const port = process.env.FTP_PORT ?? '21';
const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';

/** Читает .env.ftp, если переменные окружения не заданы. */
async function readCredentials() {
	let user = process.env.FTP_USER;
	let pass = process.env.FTP_PASS;

	if (user && pass) return { user, pass };

	const envPath = path.resolve(process.env.FTP_ENV ?? '../.env.ftp');

	try {
		const text = await readFile(envPath, 'utf8');

		for (const line of text.split(/\r?\n/)) {
			const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
			if (!match) continue;
			if (match[1] === 'FTP_USER') user = match[2];
			if (match[1] === 'FTP_PASS') pass = match[2];
		}
	} catch {
		/* файла нет — работаем на переменных окружения */
	}

	return { user, pass };
}

const { user, pass } = await readCredentials();

if (!user || !pass) {
	console.error('Нужны FTP_USER и FTP_PASS: переменные окружения или .env.ftp в корне репозитория.');
	process.exit(1);
}

function config(args) {
	return [
		`user = "${user}:${pass}"`,
		'ftp-pasv',
		'connect-timeout = 30',
		'silent',
		'show-error',
		...args,
	].join('\n');
}

function run(args, { capture = false, maxBuffer = 64 * 1024 * 1024 } = {}) {
	const result = spawnSync(curl, ['--config', '-'], {
		input: config(args),
		encoding: capture ? 'utf8' : 'inherit',
		maxBuffer,
	});

	if (result.status !== 0 && result.status !== null) {
		throw new Error(`curl завершился с кодом ${result.status}`);
	}

	return result.stdout ?? '';
}

/** Разбор листинга FTP в список записей. */
function parseListing(listing) {
	const entries = [];

	for (const line of listing.split(/\r?\n/)) {
		const match = line.match(/^([dl-])([rwxst-]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$/);
		if (!match) continue;

		const [, type, , size, name] = match;
		if (name === '.' || name === '..') continue;
		entries.push({ type, size: Number(size), name });
	}

	return entries;
}

const [remoteDirArg, localDirArg, limitArg] = process.argv.slice(2);
const limit = limitArg ? Number(limitArg) : Infinity;
const remoteDir = (remoteDirArg ?? '/').replace(/\/$/, '');

if (!remoteDirArg) {
	console.error('Использование: node scripts/ftp-list.mjs <удалённая-папка> [локальная-папка]');
	process.exit(1);
}

// Без локальной папки — просто показываем содержимое.
if (!localDirArg) {
	const entries = parseListing(run([`url = "ftp://${host}:${port}${remoteDir}/"`], { capture: true }));

	if (entries.length === 0) {
		console.log(`${remoteDir}/ — пусто или папки нет`);
		process.exit(0);
	}

	console.log(`${remoteDir}/`);
	for (const entry of entries) {
		const kind = entry.type === 'd' ? 'папка' : `${(entry.size / 1024).toFixed(1)} КБ`;
		console.log(`  ${entry.name.padEnd(40)} ${kind}`);
	}

	process.exit(0);
}

const localDir = path.resolve(localDirArg);
let downloaded = 0;
let bytes = 0;

async function walk(remote, local, prefix = '') {
	await mkdir(local, { recursive: true });
	const entries = parseListing(run([`url = "ftp://${host}:${port}${remote}/"`], { capture: true }));

	for (const entry of entries) {
		if (downloaded >= limit) return;

		const remotePath = `${remote}/${entry.name}`;
		const localPath = path.join(local, entry.name);

		if (entry.type === 'd') {
			await walk(remotePath, localPath, `${prefix}${entry.name}/`);
			continue;
		}

		const body = spawnSync(curl, ['--config', '-'], {
			input: Buffer.from(config([`url = "ftp://${host}:${port}${encodeURI(remotePath)}"`]), 'utf8'),
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

await walk(remoteDir, localDir);
console.log(`\nСкачано файлов: ${downloaded}, объём: ${(bytes / 1024 / 1024).toFixed(2)} МБ → ${localDir}`);
