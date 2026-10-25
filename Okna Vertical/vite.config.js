import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import { pages } from "./seo-pages/data.js";
import { redirectTarget } from "./seo-pages/redirects.js";

const static404 = () => ({
 name: 'static-404',
 configureServer(server) { install404(server); },
 configurePreviewServer(server) { install404(server, true); },
});
function install404(server, preview = false) {
 server.middlewares.use((req, res, next) => {
  const pathname = decodeURI((req.url || '/').split('?')[0]);
  const target = redirectTarget(pathname);
  if (target) {
   res.statusCode = 301; res.setHeader('Location', target + ((req.url || '').includes('?') ? '?' + req.url.split('?')[1] : '')); res.end(); return;
  }
  const known = ['/', '/balkony/', '/cookie/', '/politika-konfidentsialnosti/', ...pages.map(p => `/${p.slug}/`)];
  if (known.includes(pathname + '/') && pathname !== '/') {
   res.statusCode = 301; res.setHeader('Location', pathname + '/' + ((req.url || '').includes('?') ? '?' + req.url.split('?')[1] : '')); res.end(); return;
  }
  if (pathname === '/404.html' || (!known.includes(pathname) && (!path.extname(pathname) || (pathname.endsWith('.html') && !fs.existsSync(path.resolve(preview ? 'dist' : '.', '.' + pathname)))) && !pathname.startsWith('/@'))) {
   const file = path.resolve(preview ? 'dist/404.html' : '404.html');
   const html = fs.readFileSync(file, 'utf8');
   const send = content => { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(content); };
   if (preview) send(html); else server.transformIndexHtml(pathname, html).then(send).catch(next);
   return;
  }
  next();
 });
}

export default defineConfig({
	plugins: [static404()],
	build: {
		cssTarget: "safari13",
		target: "safari13",
		rollupOptions: {
			input: {
				home: path.resolve(__dirname, "index.html"),
				balkony: path.resolve(__dirname, "balkony/index.html"),
                cookie: path.resolve(__dirname, "cookie/index.html"),
                privacy: path.resolve(__dirname, "politika-konfidentsialnosti/index.html"),
				...Object.fromEntries(pages.map(p => [p.slug, path.resolve(__dirname, p.slug, 'index.html')])),
				'not-found': path.resolve(__dirname, '404.html'),
			},
			output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: ({ name }) =>
					"assets/[name][extname]",
			},
		},
	},
});
