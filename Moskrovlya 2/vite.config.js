import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = process.cwd();
const ignoredDirectories = new Set(["dist", "node_modules", ".git"]);

function collectHtmlFiles(directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : collectHtmlFiles(absolutePath);
    }

    return entry.name.endsWith(".html") ? [absolutePath] : [];
  });
}

function optimizeImagesInHtml() {
  return {
    name: "optimize-images-in-html",
    transformIndexHtml(html) {
      return html.replace(/<img\b[^>]*>/gi, (tag) => {
        const isCritical = /(?:site-header__|hero__|brand__mark)/i.test(tag);
        const attributes = [];

        if (!/\bdecoding=/i.test(tag)) attributes.push('decoding="async"');
        if (!isCritical && !/\bloading=/i.test(tag)) {
          attributes.push('loading="lazy"', 'fetchpriority="low"');
        }

        return attributes.length
          ? tag.replace(/<img\b/i, `<img ${attributes.join(" ")}`)
          : tag;
      });
    },
  };
}

export default defineConfig({
  plugins: [optimizeImagesInHtml()],
  server: {
    host: "localhost",
    port: 5173,
  },
  preview: {
    host: "localhost",
    port: 4173,
  },
  build: {
    cssTarget: "safari13",
    rollupOptions: {
      input: collectHtmlFiles(),
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
