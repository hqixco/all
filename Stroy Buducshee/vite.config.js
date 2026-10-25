import { fileURLToPath, URL } from "node:url";

export default {
  build: {
    cssTarget: "safari13",
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        pristroyki: fileURLToPath(new URL("./pristroyki/index.html", import.meta.url)),
        "zamena-krovli": fileURLToPath(new URL("./zamena-krovli/index.html", import.meta.url)),
        "zamena-polov": fileURLToPath(new URL("./zamena-polov/index.html", import.meta.url)),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
};
