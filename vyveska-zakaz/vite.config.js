import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
const pages = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
const urls = new Set();
for (const page of pages) {
  if (urls.has(page.url)) throw new Error(`Duplicate URL: ${page.url}`);
  urls.add(page.url);
  if (typeof page.indexable !== 'boolean') throw new Error(`Explicit boolean indexable required: ${page.url}`);
  const expected = page.url === '/' ? 'index.html' : page.url === '/search/' ? 'search/index.html' : `pages${page.url}index.html`;
  if (page.source !== expected) throw new Error(`Unexpected source for ${page.url}`);
  const html = fs.readFileSync(page.source, 'utf8');
  const noindex = /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  if (page.indexable === noindex) throw new Error(`Indexing policy mismatch: ${page.url}`);
}
for (const page of pages) {
  if (page.parent && !urls.has(page.parent)) throw new Error(`Missing parent: ${page.url}`);
}

function pageInputs() {
  return Object.fromEntries(pages.map(page => {
    if (!fs.existsSync(page.source)) throw new Error(`Missing HTML source: ${page.source}`);
    return [page.url === '/' ? 'home' : page.url.slice(1,-1).replaceAll('/', '-'), path.resolve(page.source)];
  }));
}

const ownedRoutes = () => ({
  name: 'owned-static-pages',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const url = new URL(request.url || '/', 'http://localhost');
      const page = pages.find(candidate => candidate.url === url.pathname);
      if (page && page.url !== '/') request.url = '/' + page.source + url.search;
      next();
    });
  },
  closeBundle() {
    const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(page => page.indexable === true).map(page => `  <url><loc>${origin}${page.url}</loc></url>`).join('\n')}\n</urlset>\n`;
    fs.writeFileSync('dist/sitemap.xml', sitemap);
    fs.copyFileSync('config/robots.txt', 'dist/robots.txt');
  },
});

const flattenRoutes = () => ({
  name: 'flatten-static-routes',
  closeBundle() {
    const generatedPages = path.resolve('dist/pages');
    if (!fs.existsSync(generatedPages)) return;
    for (const source of walkOutput(generatedPages)) {
      const route = path.relative(generatedPages, source);
      const destination = path.resolve('dist', route);
      if (!destination.startsWith(path.resolve('dist') + path.sep)) throw new Error('Refusing to move a page outside dist');
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.renameSync(source, destination);
    }
    fs.rmSync(generatedPages, { recursive: true, force: true });
  },
});

function walkOutput(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const full = path.join(dir, item.name);
    return item.isDirectory() ? walkOutput(full) : [full];
  });
}

export default defineConfig({
  appType: 'mpa',
  plugins: [flattenRoutes(), ownedRoutes()],
  publicDir: 'public',
  build: {
    cssTarget: 'safari13', target: 'safari13',
    modulePreload: { polyfill: false },
    rollupOptions: { input: pageInputs(), output: {
      entryFileNames: 'assets/[name].js', chunkFileNames: 'assets/[name].js',
      assetFileNames: 'assets/[name][extname]',
    } },
  },
});
