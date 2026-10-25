import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { HtmlValidate } from 'html-validate';

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = walk('dist').filter(file => file.endsWith('.html'));
const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const validator = new HtmlValidate({
  extends: ['html-validate:standard'],
  rules: { 'void-style': 'off', 'attr-quotes': 'off', 'doctype-style': 'off', 'no-trailing-whitespace': 'off' },
});
const issues = [];
const titles = new Map();
const descriptions = new Map();
const pages = new Map();
for (const file of files) {
  const route = '/' + path.relative('dist', path.dirname(file)).replaceAll('\\', '/').replace(/^\.$/, '');
  const url = route === '/' ? route : route + '/';
  pages.set(url, { file, $: load(fs.readFileSync(file, 'utf8')) });
}
for (const [url, {file,$}] of pages) {
  const fail = message => issues.push(`${file}: ${message}`);
  const validation = await validator.validateFile(file);
  for (const result of validation.results) for (const error of result.messages) fail(`${error.line}: ${error.message}`);
  if ($('html').attr('lang') !== 'ru') fail('missing Russian document language');
  if ($('main').length !== 1) fail('expected one main landmark');
  if ($('h1').length !== 1 || !$('h1').text().trim()) fail('expected one nonempty h1');
  const noindex = /noindex/i.test($('meta[name="robots"]').attr('content') || '');
  const title = $('title').text().trim();
  if ($('title').length !== 1 || !title) fail('missing or duplicate title');
  if (!noindex) {
    const description = $('meta[name="description"]').attr('content')?.trim();
    if ($('meta[name="description"]').length !== 1 || !description) fail('missing or duplicate description');
    if ($('link[rel="canonical"]').length !== 1 || $('link[rel="canonical"]').attr('href') !== origin + url) fail('incorrect canonical URL');
    if (titles.has(title)) fail(`duplicate title with ${titles.get(title)}`);
    titles.set(title,file);
    if (description) {
      if (descriptions.has(description)) fail(`duplicate description with ${descriptions.get(description)}`);
      descriptions.set(description,file);
    }
  }
  $('section').each((_, section) => {
    if (!$(section).find('h1,h2,h3,h4,h5,h6').length && !$(section).attr('aria-label') && !$(section).attr('aria-labelledby')) fail(`unnamed section .${$(section).attr('class')}`);
  });
  $('img').each((_, img) => {
    if ($(img).attr('alt') === undefined) fail('image without alt attribute');
    if (!Number($(img).attr('width')) || !Number($(img).attr('height'))) fail(`missing image dimensions: ${$(img).attr('src')}`);
  });
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (/^(?:mailto:|tel:|javascript:)/i.test(href)) return;
    let link;
    try { link = new URL(href, origin + url); } catch { fail(`invalid link: ${href}`); return; }
    if (link.origin !== origin) return;
    const target = pages.get(link.pathname);
    if (!target && !fs.existsSync(path.join('dist', decodeURIComponent(link.pathname)))) fail(`broken local link: ${href}`);
    if (target && link.hash.length > 1 && !target.$('[id]').toArray().some(el => target.$(el).attr('id') === decodeURIComponent(link.hash.slice(1)))) fail(`broken fragment: ${href}`);
  });
  $('[itemtype$="/BreadcrumbList"]').each((_, list) => {
    $(list).find('[itemprop="itemListElement"]').each((i,item) => {
      if (Number($(item).find('[itemprop="position"]').attr('content')) !== i + 1) fail('invalid breadcrumb position');
      if (!$(item).find('[itemprop="name"]').text().trim()) fail('empty breadcrumb name');
    });
  });
}
const sitemap = load(fs.readFileSync('dist/sitemap.xml', 'utf8'), { xmlMode: true });
const sitemapUrls = new Set();
const registry = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
const expectedSitemap = new Set(registry.filter(page => page.indexable === true).map(page => origin + page.url));
sitemap('url > loc').each((_, loc) => {
  try {
    const url = new URL(sitemap(loc).text());
    if (url.origin !== origin || !pages.has(url.pathname)) issues.push(`sitemap.xml: unknown URL ${url.href}`);
    if (sitemapUrls.has(url.href)) issues.push(`sitemap.xml: duplicate URL ${url.href}`);
    sitemapUrls.add(url.href);
    if (!expectedSitemap.has(url.href)) issues.push(`sitemap.xml: URL not explicitly indexable in registry: ${url.href}`);
  } catch { issues.push('sitemap.xml: malformed URL'); }
});
for (const url of expectedSitemap) if (!sitemapUrls.has(url)) issues.push(`sitemap.xml: missing registry URL ${url}`);
for (const page of registry) {
  if (typeof page.indexable !== 'boolean') issues.push(`registry: explicit boolean indexable required for ${page.url}`);
  const built = pages.get(page.url);
  if (!built) { issues.push(`registry: missing production page ${page.url}`); continue; }
  const noindex = /noindex/i.test(built.$('meta[name="robots"]').attr('content') || '');
  if (page.indexable === noindex) issues.push(`registry: HTML indexing policy mismatch for ${page.url}`);
}
for (const [url, {file,$}] of pages) {
  if (!/noindex/i.test($('meta[name="robots"]').attr('content') || '') && !sitemapUrls.has(origin + url)) issues.push(`${file}: missing from sitemap`);
}
const robots = fs.readFileSync('dist/robots.txt','utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) issues.push('robots.txt: missing absolute sitemap URL');
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else console.log(`HTML validity and SEO checked on ${files.length} production pages: headings, sections, metadata, images, links, breadcrumbs, sitemap and robots.txt. Sitemap: ${sitemapUrls.size} explicitly indexable URLs.`);
