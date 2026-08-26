import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'static-assets-cache-version',
      enforce: 'post',
      transformIndexHtml(html) {
        return html
          .replace('/assets/styles.css', '/assets/styles.css?v=20260818-1')
          .replace(/\/assets\/main\d*\.js/g, (asset) => `${asset}?v=20260818-1`);
      },
    },
  ],
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        redirect: 'index.html',
        roofReplacement: 'zamena-krovli/index.html',
        extensions: 'pristroyki/index.html',
        homeRecovery: 'vosstanovlenie-domov/index.html',
        privacy: 'privacy.html',
        cookies: 'cookies.html',
      },
      output: {
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
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
