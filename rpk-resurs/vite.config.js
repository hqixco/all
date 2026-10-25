import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const staticFiles = ['favicon.png', 'hero-background.jpg', 'mail.php'];

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    writeBundle(options) {
      const outputDir = options.dir;
      if (!outputDir) return;

      for (const file of staticFiles) {
        copyFileSync(resolve(file), join(outputDir, file));
      }

      const assetsDir = join(outputDir, 'assets');
      mkdirSync(assetsDir, { recursive: true });
      for (const file of readdirSync(resolve('assets'))) {
        const target = join(assetsDir, file);
        if (!existsSync(target)) copyFileSync(resolve('assets', file), target);
      }
    },
  };
}

export default defineConfig({
  plugins: [copyStaticFiles()],
  build: {
    cssTarget: 'safari13',
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        cookies: resolve('cookies/index.html'),
        privacy: resolve('privacy-policy/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
