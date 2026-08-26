import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        cookie: 'cookie.html',
        policy: 'policy.html',
        requisites: 'requisites.html',
        oneDay: 'one-day/index.html',
        stroitelstvo: 'stroitelstvo/index.html',
      },
    },
  },
});
