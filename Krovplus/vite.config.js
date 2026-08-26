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
        roofRepair: 'remont-krovli/index.html',
        leakRepair: 'ustranenie-protechek/index.html',
        junctionRepair: 'remont-primykaniy/index.html',
        extensions: 'pristroyki/index.html',
        crownReplacement: 'zamena-vencov/index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
