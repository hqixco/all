import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'node:fs';
import path from 'node:path';

function getHtmlEntries(dir) {
  const entries = {};

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.html')) {
        const key = path
          .relative(dir, fullPath)
          .replaceAll(path.sep, '/')
          .replace(/\.html$/, '');
        entries[key] = fullPath;
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return entries;
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/partials/*',
          dest: 'partials',
        },
        {
          src: 'src/images/*',
          dest: 'images',
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        root: path.resolve('index.html'),
        ...getHtmlEntries(path.resolve('src/pages')),
      },
    },
  },
});
