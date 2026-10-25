import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import postcss from 'postcss';
import sharp from 'sharp';
import { isLegacyClass, mapClass } from '../bem-classes.mjs';
import { normalizeHtml } from './normalize-html.mjs';

if (!process.argv.includes('--restore-wp-snapshot')) {
  throw new Error('Archived importer rewrites owned HTML. Restore only intentionally with --restore-wp-snapshot; ordinary builds never import WP.');
}

const old = 'C:/Users/User/Desktop/РПК Ресурс OLD/wp-content';
const cache = path.join(old, 'cache/page_enhanced/xn----7sbbagavscye2ftg.xn--p1ai');
const theme = path.join(old, 'themes/order/assets');
const pub = path.resolve('public');
fs.mkdirSync(pub, { recursive: true });
for (const generated of ['uploads', 'cache', 'assets/theme']) {
  const target = path.resolve(pub, generated);
  if (!target.startsWith(pub + path.sep)) throw new Error('Refusing to clean a path outside public');
  fs.rmSync(target, { recursive: true, force: true });
}
fs.cpSync(path.join(theme, 'img'), path.join(pub, 'assets/theme/img'), { recursive: true });
fs.copyFileSync(path.resolve('assets/image-placeholder.svg'), path.join(pub, 'assets/theme/img/image-placeholder.svg'));
fs.copyFileSync(path.resolve('assets/search.svg'), path.join(pub, 'assets/theme/img/search.svg'));
for (let index = 1; index <= 4; index++) fs.renameSync(path.join(pub, `assets/theme/img/icon_${index}.svg`), path.join(pub, `assets/theme/img/icon-${index}.svg`));
fs.mkdirSync(path.join(pub, 'assets/theme/kama'), { recursive: true });
fs.mkdirSync(path.join(pub, 'assets/theme/css'), { recursive: true });
for (const name of ['main.css', 'responsive.css']) fs.copyFileSync(path.join(theme, 'css', name), path.join(pub, 'assets/theme/css', name));
fs.copyFileSync(path.resolve('assets/favicon.png'), path.join(pub, 'favicon.png'));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const ignored = /^(wp-json|search|xn----7sbbagavscye2ftg\.xn--p1ai|www\.xn----7sbbagavscye2ftg\.xn--p1ai|page-sitemap\.xml|post-sitemap\.xml|sitemap_index\.xml|wp-links-opml\.php)/;
let count = 0;
const htmlFiles = [];
for (const file of walk(cache).filter((item) => item.endsWith('_index_slash_ssl.html'))) {
  const rel = path.relative(cache, file).replaceAll('\\', '/');
  const route = rel.replace(/\/_index_slash_ssl\.html$/, '').replaceAll('_index_slash_ssl.html', '');
  if (ignored.test(route)) continue;
  const dest = route ? path.join('pages', route, 'index.html') : 'index.html';
  const output = path.resolve(dest);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const cachedHtml = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<img\s+src="ERROR:[\s\S]*?>/gi, '<img>');
  const $ = load(cachedHtml);
  $('.slick-cloned').remove();
  $('br, script, noscript, iframe, .ct-widget, #wpadminbar, .wpcf7-response-output, .apbct_special_field').remove();
  $('form.comment-form, form#commentform, #respond').remove();
  $('link[rel="stylesheet"]').remove();
  $('link[rel="preload"][as="style"]').remove();
  $('style').each((_, el) => {
    const style = $(el).html() || '';
    if (/wp-|emoji|wordpress/i.test(style) || /!important/i.test(style)) $(el).remove();
  });
  $('meta[name="generator"]').remove();
  $('[src^="ERROR:"]').removeAttr('src');
  $('link[rel="https://api.w.org/"], link[rel="alternate"][type="application/json"]').remove();
  $('i.fa, i.fas, i.far, i.fab').remove();
  $('form.wpcf7-form').each((_, form) => {
    const $form = $(form);
    $form.removeAttr('action method novalidate data-status');
    $form.find('input[type="hidden"]').remove();
    $form.find('[class*="wpcf7-form-control-wrap"]').each((__, el) => $(el).replaceWith($(el).contents()));
    $form.find('[class*="wpcf7"]').removeClass('wpcf7-form init');
    $form.find('.wpcf7-validates-as-required').attr('required', 'required');
    $form.find('input[type="checkbox"][name^="acceptance-"]').attr('required', 'required');
    $form.attr('data-static-form', '');
    $form.prepend('<label class="form-honeypot" aria-hidden="true">Оставьте это поле пустым<input name="website" tabindex="-1" autocomplete="off"></label>');
    $form.append('<p class="form-status" data-form-status role="status" aria-live="polite" hidden></p>');
  });
  $('form#searchform').attr({ action: '/search/', method: 'get' });
  $('[class]').each((_, element) => {
    const $element = $(element);
    const classes = ($element.attr('class') || '').split(/\s+/).filter(Boolean).flatMap((name) => {
      const mapped = mapClass(name);
      if (!mapped || isLegacyClass(name)) return [];
      if (name === 'hamburger__1' || name === 'hamburger__2') return ['hamburger__line', mapped];
      if (/^current_page_(?:ancestor|parent|item)$/.test(name)) return ['breadcrumbs__item', mapped];
      return name === 'defBtn' ? ['button', mapped] : [mapped];
    });
    $element.attr('class', [...new Set(classes)].join(' '));
  });
  $('.b__block .b__list').addClass('carousel__track');
  $('.modal__content').attr({ hidden: '', 'aria-hidden': 'true' });
  $('.partners__list').each((_, list) => {
    $(list).wrap('<div class="partners__carousel"></div>');
    $(list).parent().prepend('<button class="partners__arrow partners__arrow--prev" type="button" aria-label="Предыдущие партнёры"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>');
    $(list).parent().append('<button class="partners__arrow partners__arrow--next" type="button" aria-label="Следующие партнёры"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>');
  });
  $('.b__block .b__list > .b__item').addClass('carousel__slide');
  $('.b__block .carousel__track').each((_, track) => {
    const $track = $(track);
    const slides = $track.children('.carousel__slide');
    if (slides.length < 2) return;
    $track.attr('data-carousel-count', slides.length);
    const copies = () => slides.clone().attr('aria-hidden', 'true').attr('data-carousel-copy', '').each((__, slide) => {
      $(slide).find('[id]').removeAttr('id');
      $(slide).removeAttr('id').find('a, button, input, select, textarea, [tabindex]').attr('tabindex', '-1');
    });
    $track.prepend(copies());
    $track.append(copies());
  });
  const host = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
  $('[src], [href], [srcset], [content]').each((_, el) => {
    for (const attr of ['src', 'href', 'srcset', 'content']) {
      const value = $(el).attr(attr);
      if (!value) continue;
      $(el).attr(attr, value.replaceAll(host + '/wp-content/themes/order/assets/', '/assets/theme/').replaceAll(host + '/wp-content/uploads/', '/uploads/').replaceAll(host + '/wp-content/cache/thumb/', '/cache/thumb/').replaceAll('//xn----7sbbagavscye2ftg.xn--p1ai/wp-content/themes/order/assets/', '/assets/theme/').replaceAll('//xn----7sbbagavscye2ftg.xn--p1ai/wp-content/uploads/', '/uploads/').replaceAll('//xn----7sbbagavscye2ftg.xn--p1ai/wp-content/cache/thumb/', '/cache/thumb/'));
    }
  });
  $('link[rel="icon"], link[rel="shortcut icon"]').remove();
  $('head').append('<link rel="icon" type="image/png" href="/favicon.png"><link rel="stylesheet" href="/assets/theme/css/main.css"><link rel="stylesheet" href="/assets/theme/css/responsive.css"><link rel="stylesheet" href="/assets/site.css"><script type="module" src="/assets/site.js"></script>');
  $('a[href^="http://xn----7sbbagavscye2ftg.xn--p1ai/"], a[href^="https://xn----7sbbagavscye2ftg.xn--p1ai/"]').each((_, el) => {
    const href = $(el).attr('href');
    $(el).attr('href', href.replace(/^https?:\/\/xn----7sbbagavscye2ftg\.xn--p1ai\//, '/'));
  });
  $('[style*="!important"]').removeAttr('style');
  fs.writeFileSync(output, $.html().replace(/<br\s*\/?>/gi, '').replaceAll(host + '/wp-content/uploads/', '/uploads/').replaceAll(host + '/wp-content/cache/thumb/', '/cache/thumb/').replaceAll('xn----7sbbagavscye2ftg.xn--p1ai/wp-content/themes/order/assets/kamano_photo.jpg', '/assets/theme/img/image-placeholder.svg').replaceAll('xn----7sbbagavscye2ftg.xn--p1ai/wp-content/themes/order/assets/', '/assets/theme/').replaceAll('xn----7sbbagavscye2ftg.xn--p1ai/wp-content/uploads/', '/uploads/').replaceAll('xn----7sbbagavscye2ftg.xn--p1ai/wp-content/cache/thumb/', '/cache/thumb/').replace(/icon_(\d+\.svg)/g, 'icon-$1'));
  htmlFiles.push(output);
  count++;
}
const rasterPaths = new Set();
const assetPattern = /(?:src|href|srcset|content)=["'](\/(?:uploads|cache\/thumb)\/[^"'#?,\s]+)|url\((?:["']?)(\/(?:uploads|cache\/thumb)\/[^"'\s)]+)/g;
const allHtml = [path.resolve('index.html'), ...htmlFiles];
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(assetPattern)) {
    const asset = match[1] || match[2];
    if (/\.(?:jpe?g|png|webp|tiff?)$/i.test(asset)) rasterPaths.add(asset);
  }
}
const imageMap = new Map([...rasterPaths].sort().map((asset, index) => [asset, `/assets/images/project-${String(index + 1).padStart(3, '0')}.webp`]));
const videos = new Set();
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  let rewritten = html;
  for (const [asset, publicAsset] of imageMap) rewritten = rewritten.replaceAll(asset, publicAsset);
  for (const match of html.matchAll(/(\/uploads\/[^"'?\s<>]+\.mp4)/gi)) videos.add(match[1]);
  const $ = load(rewritten);
  $('img[srcset]').each((_, img) => {
    const src = $(img).attr('src');
    const candidates = ($(img).attr('srcset') || '').split(',').map((candidate) => candidate.trim().split(/\s+/).at(-1)).filter(Boolean);
    if (src && candidates.length) $(img).attr('srcset', candidates.map((descriptor) => `${src} ${descriptor}`).join(', '));
  });
  fs.writeFileSync(file, $.html().replaceAll('/assets/theme/kamano_photo.jpg', '/assets/theme/img/image-placeholder.svg').replaceAll('https://xn----7sbbagavscye2ftg.xn--p1ai/wp-content/themes/order/assets/kamano_photo.jpg', '/assets/theme/img/image-placeholder.svg').replaceAll('http://xn----7sbbagavscye2ftg.xn--p1ai/wp-content/themes/order/assets/kamano_photo.jpg', '/assets/theme/img/image-placeholder.svg'));
}
fs.mkdirSync(path.join(pub, 'assets/images'), { recursive: true });
const imageCache = path.resolve('tmp/migrated-images');
fs.mkdirSync(imageCache, { recursive: true });
for (const [asset, publicAsset] of imageMap) {
  const source = asset.startsWith('/uploads/') ? path.join(old, 'uploads', asset.slice('/uploads/'.length)) : path.join(old, 'cache/thumb', asset.slice('/cache/thumb/'.length));
  const destination = path.join(pub, publicAsset.slice(1));
  if (fs.existsSync(source)) {
    const cached = path.join(imageCache, path.basename(publicAsset));
    if (!fs.existsSync(cached)) await sharp(source).rotate().resize({ width: 1800, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(cached);
    fs.copyFileSync(cached, destination);
  }
}
for (const [index, asset] of [...videos].sort().entries()) {
  const source = path.join(old, 'uploads', asset.slice('/uploads/'.length));
  const publicAsset = `/assets/videos/work-video-${String(index + 1).padStart(2, '0')}.mp4`;
  const destination = path.join(pub, publicAsset.slice(1));
  if (fs.existsSync(source)) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    for (const file of allHtml) {
      const html = fs.readFileSync(file, 'utf8');
      if (html.includes(asset)) fs.writeFileSync(file, html.replaceAll(asset, publicAsset));
    }
  }
}
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
for (const file of new Set(allHtml)) {
  const route = file === path.resolve('index.html') ? '' : path.relative('pages', path.dirname(file)).replaceAll('\\', '/');
  await normalizeHtml(file, route);
}
const searchEntries = htmlFiles.map((file) => {
  const $ = load(fs.readFileSync(file, 'utf8'));
  const title = $('title').text().split(' - ')[0].trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const slug = path.relative('pages', path.dirname(file)).replaceAll('\\', '/');
  const text = `${title} ${description}`.toLocaleLowerCase('ru');
  return `<li><a href="/${slug}/" data-search-text="${escapeHtml(text)}">${escapeHtml(title)}</a><p>${escapeHtml(description)}</p></li>`;
}).join('\n');
fs.mkdirSync('search', { recursive: true });
fs.writeFileSync('search/index.html', `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>Поиск по сайту — РПК Ресурс</title><link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/assets/theme/css/main.css"><link rel="stylesheet" href="/assets/theme/css/responsive.css"><link rel="stylesheet" href="/assets/site.css"><script type="module" src="/assets/site.js"></script></head><body><main class="root__main"><div class="root__width"><h1>Поиск по сайту</h1><form action="/search/" method="get" role="search"><label for="site-search">Поиск</label><input id="site-search" type="search" name="s" value=""><button type="submit">Найти</button></form><p data-search-status>Все страницы сайта. Введите запрос, чтобы отфильтровать результаты.</p><ul data-search-results>${searchEntries}</ul></div></main></body></html>`);
for (const file of walk(path.join(pub, 'assets/theme/css')).filter((item) => item.endsWith('.css'))) {
  const root = postcss.parse(fs.readFileSync(file, 'utf8'));
  root.walkRules((rule) => {
    rule.selector = rule.selector.replace(/\.([A-Za-z_][A-Za-z0-9_-]*)/g, (selector, name) => {
      const mapped = mapClass(name);
      return mapped ? `.${mapped}` : selector;
    });
    rule.selector = rule.selector.replace(/\.hamburger\.active/g, '.hamburger.hamburger--open').replace(/\.menu\.active/g, '.menu.menu--open');
    if (rule.selector === '.root__main .partners .partners__list .partners__slide' || rule.selector === '.root__main .partners .partners__list .partners__slide>img') rule.remove();
    if (rule.selector === '.root__main .reviews .reviews__item .reviews__item-pic>img' && rule.parent.type === 'root') {
      rule.append({ prop: 'height', value: 'auto' });
    }
  });
  root.walkAtRules('media', (rule) => {
    rule.params = rule.params.replace(/\(\s*min-width\s*:\s*(\d+(?:\.\d+)?)px\s*\)/g, (_, width) => `not all and (max-width: ${Math.max(0, Number(width) - 0.02)}px)`);
  });
  root.walkAtRules('font-face', (rule) => { if (/fontawesome/i.test(rule.toString())) rule.remove(); });
  root.walkDecls('content', (decl) => {
    if (/\\f[\da-f]{3}/i.test(decl.value) || /[•★✓→←⚑]/.test(decl.value) || !/^(?:['"]{2}|none|normal)$/i.test(decl.value.trim())) decl.remove();
  });
  root.walkDecls((decl) => {
    decl.value = decl.value.replace(/fonts\/([A-Z][A-Za-z0-9._-]+)/g, (_, name) => `fonts/${name.toLowerCase()}`);
    decl.value = decl.value.replace(/\s*!important\s*$/i, '');
    decl.important = false;
    if (decl.raws.important) delete decl.raws.important;
  });
  const css = root.toString().replace(/icon_(\d+\.svg)/g, 'icon-$1').replaceAll('source/.%20.%20../img/%20head-find%20.%20svg', '../img/search.svg');
  fs.writeFileSync(file, css);
  for (const match of css.matchAll(/url\(["']?(?:\.\/)?fonts\/([a-z0-9._-]+)/g)) {
    const outputName = match[1];
    const originalName = fs.readdirSync(path.join(theme, 'css/fonts')).find((name) => name.toLowerCase() === outputName);
    if (originalName) {
      const fontDir = path.join(path.dirname(file), 'fonts');
      fs.mkdirSync(fontDir, { recursive: true });
      fs.copyFileSync(path.join(theme, 'css/fonts', originalName), path.join(fontDir, outputName));
    }
  }
}
const routeUrls = walk(path.resolve('pages')).filter((item) => item.endsWith('index.html')).map((item) => `  <url><loc>https://вывеска-заказ.рф/${path.relative('pages', path.dirname(item)).replaceAll('\\', '/')}/</loc></url>`).join('\n');
fs.writeFileSync(path.join(pub, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://вывеска-заказ.рф/</loc></url>\n${routeUrls}\n</urlset>`);
console.log(`Migrated ${count} cached routes`);
