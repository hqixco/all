import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        main: 'index.html',
        pristroyki: 'pristroyki/index.html',
        roofRepair: 'remont-krovli/index.html',
        roofReplacement: 'zamena-krovli/index.html',
        otmostki: 'otmostki/index.html',
        zamenaVencov: 'zamena-vencov/index.html',
        dostroitVtoroyEtazh: 'dostroit-vtoroy-etazh/index.html',
        privacy: 'politika-konfidentsialnosti/index.html',
        consent: 'soglasie-na-obrabotku-personalnyh-dannyh/index.html',
        cookie: 'cookie/index.html',
        rekvizity: 'rekvizity/index.html',
        garantiya: 'garantiya/index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
