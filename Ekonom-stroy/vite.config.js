import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    target: "safari13",
    cssTarget: "safari13",
    rollupOptions: {
      input: {
        root: path.resolve("index.html"),
        "zamena-krovli": path.resolve("zamena-krovli/index.html"),
        "zamena-polov": path.resolve("zamena-polov/index.html"),
        pristroyki: path.resolve("pristroyki/index.html"),
        privacy: path.resolve("privacy.html"),
        cookies: path.resolve("cookies.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
