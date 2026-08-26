import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        redirect: 'index.html',
        main: 'zamena-krovli/index.html',
        privacy: 'privacy.html',
        cookies: 'cookies.html',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/chunk.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith('.css'))) {
            return 'assets/styles.css';
          }

          return 'assets/[name][extname]';
        },
      },
    },
  },
});
