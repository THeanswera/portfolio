import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // Относительные пути: сайт работает и в корне домена, и в подпапке на хостинге.
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(root, 'index.html'),
        privacy: path.resolve(root, 'privacy.html'),
        case: path.resolve(root, 'case.html'),
      },
    },
  },
  server: { port: 5173, open: false },
});
