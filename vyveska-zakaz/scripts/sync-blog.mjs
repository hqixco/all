import fs from 'node:fs';
import sharp from 'sharp';

const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const { tags, articles } = JSON.parse(fs.readFileSync('config/blog-articles.json', 'utf8'));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const dateText = value => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' }).format(new Date(value + 'T12:00:00+03:00')).replace(' г.', '');
const modified = '2026-10-20T12:00:00+03:00';
function meta(html, key, value) {
  const attr = key.includes(':') && !key.startsWith('twitter:') ? 'property' : 'name';
  const re = new RegExp('<meta\\b[^>]*\\b(?:name|property)="' + key + '"[^>]*>', 'g');
  const tag = '<meta ' + attr + '="' + key + '" content="' + escape(value) + '">';
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', tag + '\n</head>');
}
function common(html, title, description) {
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/, '<title class="document-head__title">' + escape(title) + '</title>');
  for (const [key, value] of Object.entries({ description, 'og:title': title, 'og:description': description, 'twitter:title': title, 'twitter:description': description })) html = meta(html, key, value);
  html = meta(html, 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  if (!html.includes('href="/assets/blog.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/assets/blog.css">\n</head>');
  return html;
}
function schema(html, id, value) {
  html = html.replace(new RegExp('<script id="' + id + '"[^>]*>[\\s\\S]*?<\\/script>\\s*', 'g'), '');
  return html.replace('</head>', '<script id="' + id + '" type="application/ld+json">' + JSON.stringify(value).replaceAll('<', '\\u003c') + '</script>\n</head>');
}
function chips(keys) {
  return '<ul class="blog-tags" aria-label="Темы статьи">' + keys.map(key => '<li class="blog-tags__item" data-tag="' + key + '">' + '<span class="blog-tags__label">' + escape(tags[key]) + '</span></li>').join('') + '</ul>';
}
for (const article of articles) {
  let html = fs.readFileSync(article.source, 'utf8');
  html = common(html, article.title, article.description);
  const published = article.date + 'T12:00:00+03:00';
  for (const [key, value] of Object.entries({ author: 'РПК Ресурс', keywords: article.tags.map(key => tags[key]).join(', '), 'article:published_time': published, 'article:modified_time': modified, 'article:section': article.section, 'og:image': origin + article.images[0].src, 'og:image:alt': article.images[0].alt, 'twitter:image': origin + article.images[0].src, 'twitter:data1': 'РПК Ресурс' })) html = meta(html, key, value);
  html = html.replace(/<div class="article-meta"[\s\S]*?<\/div>\s*/g, '');
  const byline = '<div class="article-meta" data-tags="' + article.tags.join(' ') + '"><p class="article-meta__line"><span>Опубликовано: <time datetime="' + published + '">' + dateText(article.date) + '</time></span><span>Автор: <a href="/o-kompanii/">РПК Ресурс</a></span><span>Обновлено: <time datetime="' + modified + '">20 октября 2026</time></span></p>' + chips(article.tags) + '</div>';
  html = html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/, '$1\n' + byline);
  html = html.replace(/<div class="article-practice">[\s\S]*?<\/div>\s*/g, '');
  const start = html.indexOf('<section class="news-detail');
  const end = html.indexOf('</section>', start);
  if (start < 0 || end < 0) throw new Error('Article body missing: ' + article.url);
  const practical = '<div class="article-practice"><h2 class="article-practice__title">Что проверить перед заказом</h2><ul class="article-practice__list">' + article.checklist.map(text => '<li>' + escape(text) + '</li>').join('') + '</ul><p>Дополнительные материалы и примеры: <a href="' + article.relatedUrl + '">' + escape(article.section) + '</a>.</p></div>\n';
  html = html.slice(0, end) + practical + html.slice(end);
  for (const image of article.images) {
    html = html.replace(/<img\b[^>]*>/g, tag => {
      if (!tag.includes('src="' + image.src + '"')) return tag;
      return /\balt="/.test(tag) ? tag.replace(/\balt="[^"]*"/, 'alt="' + escape(image.alt) + '"') : tag.replace('<img', '<img alt="' + escape(image.alt) + '"');
    });
  }
  const imageSize = await sharp('public' + article.images[0].src).metadata();
  if (article.images[0].src === '/assets/images/agency-milling.webp') html = html.replace(/<img\b[^>]*>/g, tag => tag.includes('src="' + article.images[0].src + '"') ? tag.replace(/width="[^"]*"/, 'width="' + imageSize.width + '"').replace(/height="[^"]*"/, 'height="' + imageSize.height + '"') : tag);
  if (!html.includes('src="' + article.images[0].src + '"')) {
    html = html.replace(/(<div class="html page-content-section__html">)/, '$1<figure class="article-figure"><img src="' + article.images[0].src + '" alt="' + escape(article.images[0].alt) + '" width="' + imageSize.width + '" height="' + imageSize.height + '" decoding="async" fetchpriority="high"><figcaption>Оборудование для фрезерной обработки материалов</figcaption></figure>');
  }
  html = schema(html, 'article-schema', { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': origin + article.url + '#article', url: origin + article.url, mainEntityOfPage: { '@type': 'WebPage', '@id': origin + article.url }, headline: article.headline, description: article.description, image: article.images.map(image => origin + image.src), datePublished: published, dateModified: modified, author: { '@type': 'Organization', name: 'РПК Ресурс', url: origin + '/o-kompanii/' }, publisher: { '@type': 'Organization', name: 'РПК Ресурс', url: origin + '/', logo: { '@type': 'ImageObject', url: origin + '/assets/theme/img/logo-head.svg' } }, inLanguage: 'ru-RU', articleSection: article.section, keywords: article.tags.map(key => tags[key]), isPartOf: { '@type': 'Blog', '@id': origin + '/blog/#blog', name: 'Блог РПК Ресурс', url: origin + '/blog/' } });
  fs.writeFileSync(article.source, html);
}
const ordered = [...articles].sort((a, b) => b.date.localeCompare(a.date));
const arrow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
for (const page of [1, 2]) {
  const source = page === 1 ? 'pages/blog/index.html' : 'pages/blog/page/2/index.html';
  const route = page === 1 ? '/blog/' : '/blog/page/2/';
  const selected = ordered.slice((page - 1) * 10, page * 10);
  let html = fs.readFileSync(source, 'utf8');
  const title = page === 1 ? 'Блог о вывесках и рекламном производстве | РПК Ресурс' : 'Блог о вывесках — страница 2 | РПК Ресурс';
  const description = page === 1 ? 'Статьи РПК Ресурс о вывесках, входных группах, неоне, печати и обработке материалов. Советы по подготовке макета и выбору рекламной конструкции.' : 'Вторая страница блога РПК Ресурс: подготовка вывесок и крышных установок, размещение на фасаде и вопросы для обсуждения проекта.';
  html = common(html, title, description);
  html = meta(html, 'og:type', 'website');
  html = meta(html, 'og:image', origin + selected[0].images[0].src);
  html = meta(html, 'og:image:alt', selected[0].images[0].alt);
  html = meta(html, 'twitter:image', origin + selected[0].images[0].src);
  html = html.replace(/<section class="[^"]*\b(?:blog-content|blog-page-2-content)\b[^"]*"[\s\S]*?<\/section>/, '<section class="legacy__section page-content-section ' + (page === 2 ? 'blog-page-2-content' : 'blog-content') + '" aria-label="Статьи блога">\n' + selected.map((article, i) => '<a class="blog-card" href="' + article.url + '" data-tags="' + article.tags.join(' ') + '" data-published="' + article.date + '"><div class="blog-card__photo"><img class="blog-card__image" src="' + article.images[0].src + '" alt="" width="600" height="400" loading="' + (i < 3 ? 'eager' : 'lazy') + '" decoding="async"></div><div class="blog-card__body"><time class="blog-card__date" datetime="' + article.date + 'T12:00:00+03:00">' + dateText(article.date) + '</time><h2 class="blog-card__title">' + escape(article.headline) + '</h2>' + chips(article.tags) + '<span class="blog-card__link">Читать статью ' + arrow + '</span></div></a>').join('\n') + '\n</section>');
  html = html.replace(/<nav class="blog-pagination"[\s\S]*?<\/nav>\s*/g, '');
  const nav = '<nav class="blog-pagination" aria-label="Страницы блога">' + [1, 2].map(n => n === page ? '<span class="blog-pagination__current" aria-current="page">' + n + '</span>' : '<a class="blog-pagination__link" href="' + (n === 1 ? '/blog/' : '/blog/page/2/') + '" rel="' + (n < page ? 'prev' : 'next') + '">' + n + '</a>').join('') + '</nav>';
  const sectionStart = html.search(/<section class="legacy__section page-content-section (?:blog-content|blog-page-2-content)/);
  const sectionEnd = html.indexOf('</section>', sectionStart) + '</section>'.length;
  html = html.slice(0, sectionEnd) + '\n' + nav + html.slice(sectionEnd);
  html = schema(html, 'blog-schema', { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': origin + route + '#collection', url: origin + route, name: title, description, inLanguage: 'ru-RU', isPartOf: { '@type': 'Blog', '@id': origin + '/blog/#blog', name: 'Блог РПК Ресурс', url: origin + '/blog/' }, mainEntity: { '@type': 'ItemList', itemListElement: selected.map((a, i) => ({ '@type': 'ListItem', position: (page - 1) * 10 + i + 1, url: origin + a.url, name: a.headline })) } });
  fs.writeFileSync(source, html);
}
const registry = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
const pagination = registry.find(page => page.url === '/blog/page/2/');
pagination.indexable = true;
delete pagination.indexabilityReason;
fs.writeFileSync('config/site-pages.json', JSON.stringify(registry, null, 2) + '\n');
console.log('Blog SEO synchronized: 12 articles, 2 listing pages, stable topics and publication dates.');
