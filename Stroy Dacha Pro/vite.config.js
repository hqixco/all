import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        main: 'index.html',
        cookies: 'cookies/index.html',
        privacyPolicy: 'privacy-policy/index.html',
        extensions: 'pristroyki/index.html',
        floorReplacement: 'zamena-polov/index.html',
        'roof-insulation': 'uteplenie-krovli/index.html',
        urgentRoofRepair: 'srochnyj-remont-krovli/index.html'
      },
      output: {
        entryFileNames: 'assets/chunks/[name].js',
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
