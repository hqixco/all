import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "safari13",
    cssTarget: "safari13",
    rollupOptions: {
      input: {
        main: "index.html",
        privacy: "politika-konfidentsialnosti/index.html",
        cookie: "cookie/index.html",
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: ({ name, originalFileNames = [] }) => {
          if (name?.endsWith(".css")) {
            return originalFileNames.some(file => file.endsWith("legal.css")) || name === "legal.css"
              ? "assets/legal.css"
              : "assets/styles.css";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },
});
