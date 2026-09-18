// Скачивание папки с хостинга по FTP (резервная копия перед изменениями).
// Доступы берутся из переменных окружения FTP_USER и FTP_PASS или из .env.ftp
// в корне репозитория (файл в git не попадает).
//
// Запуск: node scripts/ftp-pull.mjs <удалённая-папка> <локальная-папка> [расширения]
// Пример: node scripts/ftp-pull.mjs /www/site/remont .tmp-remont html,css,js
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const host = process.env.FTP_HOST ?? '31.31.196.221';
const port = process.env.FTP_PORT ?? '21';
const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';

async function credentials() {
	let user = process.env.FTP_USER;
	let pass = process.env.FTP_PASS;

	if (user && pass) return { user, pass };

	const text = await readFile(path.resolve('../.env.ftp'), 'utf8').catch(() => '');

	for (const line of text.split(/\r?\n/)) {
		const match = line.match(/^\s*(FTP_USER|FTP_PASS)\s*=\s*(.+?)\s*$/);
		if (!match) continue;
		if (match[1] === 'FTP_USER') user = match[2];
		if (match[1] === 'FTP_PASS') pass = match[2];
	}

	return { user, pass };
}

const { user, pass } = await credentials();

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

/** Листинг папки: пустой массив, если папки нет или она недоступна. */
function listing(remote) {
	const result = spawnSync(curl, ['--config', '-'], {
		input: config([`url = "ftp://${host}:${port}${remote}/"`]),
		encoding: 'utf8',
		maxBuffer: 32 * 1024 * 1024,
	});

	if (result.status !== 0) return [];

	return (result.stdout ?? '')
		.split(/\r?\n/)
		.map((line) => line.match(/^([dl-])[rwxst-]{9}\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$/))
		.filter(Boolean)
		.map((match) => ({ type: match[1], size: Number(match[2]), name: match[3] }))
		.filter((entry) => entry.name !== '.' && entry.name !== '..');
}

async function pull(remote, local, extensions, prefix = '') {
	await mkdir(local, { recursive: true });
	let downloaded = 0;

	for (const entry of listing(remote)) {
		const remotePath = `${remote}/${entry.name}`;
		const localPath = path.join(local, entry.name);

		if (entry.type === 'd') {
			downloaded += await pull(remotePath, localPath, extensions, `${prefix}${entry.name}/`);
			continue;
		}

		if (extensions.length && !extensions.some((ext) => entry.name.endsWith(ext))) continue;

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
		downloaded += 1;
		console.log(`↓ ${prefix}${entry.name} (${((await stat(localPath)).size / 1024).toFixed(1)} КБ)`);
	}

	return downloaded;
}

const [remoteArg, localArg, extArg] = process.argv.slice(2);
const extensions = extArg ? extArg.split(',').map((value) => `.${value.replace(/^\./, '')}`) : [];

if (!remoteArg || !localArg) {
	console.error('Использование: node scripts/ftp-pull.mjs <удалённая-папка> <локальная-папка> [html,css,js]');
	process.exit(1);
}

const total = await pull(remoteArg.replace(/\/$/, ''), path.resolve(localArg), extensions);
console.log(`\nСкачано файлов: ${total}`);
