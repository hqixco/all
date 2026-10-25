import { defineConfig } from 'vite';
import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
    {
      name: 'stable-main-filename',
      async closeBundle() {
        const distDir = path.resolve('dist');
        const assetsDir = path.join(distDir, 'assets');
        const assetNames = await readdir(assetsDir);
        const generatedMainName = assetNames.find((fileName) => /^main\d+\.js$/.test(fileName));
        if (!generatedMainName) return;

        await rename(path.join(assetsDir, generatedMainName), path.join(assetsDir, 'main.js'));

        const updateHtml = async (directory) => {
          const entries = await readdir(directory, { withFileTypes: true });
          await Promise.all(entries.map(async (entry) => {
            const entryPath = path.join(directory, entry.name);
            if (entry.isDirectory()) return updateHtml(entryPath);
            if (!entry.name.endsWith('.html')) return;
            const html = await readFile(entryPath, 'utf8');
            const updatedHtml = html.replaceAll(`/assets/${generatedMainName}`, '/assets/main.js');
            if (updatedHtml !== html) await writeFile(entryPath, updatedHtml);
          }));
        };

        await updateHtml(distDir);
      },
    },
  ],
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        redirect: 'index.html',
        roofReplacement: 'zamena-krovli/index.html',
        floorReplacement: 'zamena-polov/index.html',
        fences: 'zabory/index.html',
        insulation: 'uteplenie-doma/index.html',
        privacy: 'privacy-policy/index.html',
        cookies: 'cookies/index.html',
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
