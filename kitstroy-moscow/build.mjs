// Сборка темы: SCSS в CSS и копирование скриптов в assets/dist.
// Запуск: node build.mjs
import { spawnSync } from 'node:child_process';
import { mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.');
const src = path.join(root, 'assets/src');
const dist = path.join(root, 'assets/dist');
const entry = path.join(src, 'scss/style.scss');
const output = path.join(dist, 'css/main.css');

/** Ищем Sass: свой в теме, затем в соседних проектах, затем через npx. */
async function compileStyles() {
	const candidates = [
		path.join(root, 'node_modules/sass/sass.js'),
		path.resolve(root, '../portfolio-site/node_modules/sass/sass.js'),
		path.resolve(root, '../../portfolio-site/node_modules/sass/sass.js'),
	];
	const args = ['--no-source-map', '--style=expanded', `${entry}:${output}`];

	for (const candidate of candidates) {
		const exists = await stat(candidate).then(() => true).catch(() => false);

		if (!exists) continue;

		const result = spawnSync(process.execPath, [candidate, ...args], { stdio: 'inherit' });

		if (result.status === 0) return path.relative(root, candidate);
	}

	const fallback = spawnSync('npx', ['--yes', 'sass@1.80.6', ...args], {
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});

	if (fallback.status === 0) return 'npx sass@1.80.6';

	throw new Error('Не удалось собрать стили: Sass недоступен.');
}

async function copyScripts() {
	const from = path.join(src, 'js');
	const to = path.join(dist, 'js');
	await mkdir(to, { recursive: true });

	for (const file of await readdir(from)) {
		if (!file.endsWith('.js')) continue;
		await copyFile(path.join(from, file), path.join(to, file));
	}
}

console.log('Сборка темы «КИТ-Строй.Москва»');
const sass = await compileStyles();
console.log(`  стили собраны через: ${sass}`);
await copyScripts();
console.log('  скрипты скопированы в assets/dist/js');
console.log('Готово.');
