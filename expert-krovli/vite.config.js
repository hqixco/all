import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'politika-konfidentsialnosti/index.html'),
        cookie: resolve(__dirname, 'cookie/index.html'),
        slateReplacement: resolve(__dirname, 'zamena-shifera/index.html'),
        profnastilReplacement: resolve(__dirname, 'zamena-krovli-na-profnastil/index.html'),
        metalTileReplacement: resolve(__dirname, 'zamena-krovli-na-metallocherepitsu/index.html'),
        oldRoofRebuild: resolve(__dirname, 'rekonstruktsiya-staroj-kryshi/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith('.css'))) {
            return 'assets/[name][extname]';
          }

          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
