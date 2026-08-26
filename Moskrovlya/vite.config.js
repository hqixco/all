import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'politika-konfidentsialnosti/index.html',
        cookie: 'cookie/index.html',
        garantiya: 'garantiya/index.html',
        zamenaKrovli: 'zamena-krovli/index.html',
        otmostki: 'otmostki/index.html',
        pristroyki: 'pristroyki/index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
