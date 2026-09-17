/**
 * Картинка для соцсетей: собирается кодом на Canvas, без внешних библиотек.
 * Запуск: node scripts/og.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { site } from '../src/data/site.mjs';

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chrome) {
	console.error('Не найден Chrome или Edge.');
	process.exit(1);
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #05070d; color: #eef2ff;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background-image:
      radial-gradient(700px 420px at 12% -10%, rgba(139,92,255,.28), transparent 62%),
      radial-gradient(600px 420px at 92% 8%, rgba(46,230,168,.16), transparent 62%);
    padding: 64px;
    display: grid; align-content: space-between;
  }
  .top { display: flex; align-items: center; gap: 16px; }
  .mark {
    width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center;
    border: 1px solid rgba(139,92,255,.5); background: rgba(139,92,255,.16);
  }
  .name { font-size: 26px; font-weight: 600; letter-spacing: -.02em; }
  .note { font: 12px ui-monospace, monospace; letter-spacing: .16em; text-transform: uppercase; color: #7b86a6; }
  h1 { font-size: 76px; line-height: 1.02; letter-spacing: -.035em; max-width: 16ch; }
  h1 span { background: linear-gradient(100deg,#fff 10%,#c9b6ff 45%,#8b5cff 90%); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .row { display: flex; gap: 40px; align-items: flex-end; }
  .stat strong { display: block; font: 34px ui-monospace, monospace; color: #2ee6a8; }
  .stat span { font-size: 14px; color: #7b86a6; }
  .url { margin-left: auto; font: 15px ui-monospace, monospace; color: #b3bcd8; }
</style></head>
<body>
  <div class="top">
    <span class="mark">
      <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
        <path d="M4 20L11 6l4 8 3.2-6L24 20" stroke="#8b5cff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="11" cy="6" r="2.2" fill="#2ee6a8"/>
      </svg>
    </span>
    <span>
      <span class="name">${site.name}</span>
      <span class="note" style="display:block">${site.tagline}</span>
    </span>
  </div>

  <h1>Earn with <span>AI-powered</span> crypto arbitrage</h1>

  <div class="row">
    <span class="stat"><strong>${site.dailyLow}–${site.dailyHigh} %</strong><span>daily on closed routes</span></span>
    <span class="stat"><strong>12</strong><span>exchanges in one feed</span></span>
    <span class="stat"><strong>900 ms</strong><span>time-box per route</span></span>
    <span class="url">masterskaya-forma.online</span>
  </div>
</body></html>`;

const tmp = path.resolve('.tmp-og');
await mkdir(tmp, { recursive: true });
const htmlPath = path.join(tmp, 'og.html');
await writeFile(htmlPath, html, 'utf8');

const port = 9355;
const browser = spawn(
	chrome,
	[
		'--headless=new',
		'--disable-gpu',
		'--hide-scrollbars',
		'--no-first-run',
		'--no-default-browser-check',
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${path.join(tmp, 'profile')}`,
		'about:blank',
	],
	{ stdio: 'ignore' },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
	let ready = false;
	for (let attempt = 0; attempt < 60 && !ready; attempt += 1) {
		try {
			const res = await fetch(`http://127.0.0.1:${port}/json/version`);
			ready = res.ok;
		} catch {
			await sleep(250);
		}
	}
	if (!ready) throw new Error('Браузер не запустился');

	const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((res) => res.json());
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	const pending = new Map();
	let nextId = 1;

	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve);
		socket.addEventListener('error', reject);
	});

	socket.addEventListener('message', (event) => {
		const message = JSON.parse(event.data);
		const handler = pending.get(message.id);
		if (!handler) return;
		pending.delete(message.id);
		if (message.error) handler.reject(new Error(message.error.message));
		else handler.resolve(message.result);
	});

	const send = (method, params = {}) =>
		new Promise((resolve, reject) => {
			const id = nextId++;
			pending.set(id, { resolve, reject });
			socket.send(JSON.stringify({ id, method, params }));
		});

	await send('Page.enable');
	await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
	await send('Page.navigate', { url: `file:///${htmlPath.replace(/\\/g, '/')}` });
	await sleep(1200);

	const shot = await send('Page.captureScreenshot', { format: 'png' });
	await mkdir(path.resolve('public/assets/img'), { recursive: true });
	await writeFile(path.resolve('public/assets/img/og.png'), Buffer.from(shot.data, 'base64'));
	console.log('✓ public/assets/img/og.png');

	socket.close();
} finally {
	browser.kill();
	await sleep(300);
}
