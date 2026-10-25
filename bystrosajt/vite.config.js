import { defineConfig } from "vite";

export default defineConfig({
  build: {
    cssTarget: "safari13",
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
      input: {
        main: "index.html",
        cookie: "cookie.html",
        policy: "policy.html",
        requisites: "requisites.html",
        "one-day": "one-day/index.html",
        stroitelstvo: "stroitelstvo/index.html",
        "stroitelstvo-old": "stroitelstvo-old/index.html",
        okna: "okna/index.html",
      },
    },
  },
});
