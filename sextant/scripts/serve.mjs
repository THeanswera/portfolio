// Просмотр собранного сайта: node scripts/serve.mjs [порт]
import { startServer } from './lib/server.mjs';

const port = Number(process.argv[2] ?? 4173);
const { url } = await startServer({ root: 'dist', port });

console.log(`${url}/ — папка dist/, остановить: Ctrl+C`);
