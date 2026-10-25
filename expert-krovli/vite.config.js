import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    target: 'safari13',
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'politika-konfidentsialnosti/index.html'),
        cookie: resolve(__dirname, 'cookie/index.html'),
        pristroyki: resolve(__dirname, 'pristroyki/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
