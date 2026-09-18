/** Крошечный статический сервер: используется и для просмотра, и для проверок. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.php': 'text/plain; charset=utf-8',
};

/** Поднимает сервер над папкой и возвращает { server, url, close }. */
export async function startServer({ root = 'dist', port = 4173, host = '127.0.0.1' } = {}) {
  const base = path.resolve(root);

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://${host}`);
      let filePath = path.join(base, decodeURIComponent(url.pathname));

      if (!filePath.startsWith(base)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      let info = await stat(filePath).catch(() => null);
      if (info?.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        info = await stat(filePath).catch(() => null);
      }

      if (!info) {
        const body = await readFile(path.join(base, '404.html')).catch(() => 'Не найдено');
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

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  return {
    server,
    url: `http://${host}:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
