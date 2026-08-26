import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        main: 'index.html',
        otmostki: 'otmostki/index.html',
        zamenaKrovli: 'zamena-krovli/index.html',
        privacy: 'politika-konfidentsialnosti/index.html',
        cookie: 'cookie/index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
