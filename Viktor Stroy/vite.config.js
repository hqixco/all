import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    cssTarget: "safari13",
    rollupOptions: {
      input: {
        main: resolve(rootDirectory, "index.html"),
        facade: resolve(rootDirectory, "uteplenie-fasada/index.html"),
        floorInsulation: resolve(rootDirectory, "uteplenie-polov/index.html"),
        privacy: resolve(
          rootDirectory,
          "politika-konfidentsialnosti/index.html",
        ),
        cookie: resolve(rootDirectory, "cookie/index.html"),
      },
      output: {
        entryFileNames: "assets/scripts.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.names.some((name) => name.endsWith(".css"))
            ? "assets/styles.css"
            : "assets/[name][extname]",
      },
    },
  },
});
