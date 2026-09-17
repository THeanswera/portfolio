// Крошечный статический сервер для локальной проверки dist/.
// Запуск: node scripts/serve.mjs [порт]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('dist');
const PORT = Number(process.argv[2] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let filePath = path.join(ROOT, decodeURIComponent(url.pathname));

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }

    if (!info) {
      const notFound = path.join(ROOT, '404.html');
      const body = await readFile(notFound).catch(() => 'Не найдено');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500).end(String(error));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`http://127.0.0.1:${PORT}/ — dist/`);
});
