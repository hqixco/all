import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssCodeSplit: false,
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        redirect: 'index.html',
        'roof-repair': 'remont-krovli/index.html',
        'roof-replacement': 'zamena-krovli/index.html',
        'floor-insulation': 'uteplenie-polov/index.html',
        'foundation-repair': 'remont-fundamenta/index.html',
        privacy: 'privacy.html',
        cookies: 'cookies.html',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/main.js',
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
