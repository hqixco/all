import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const { tags, articles } = JSON.parse(fs.readFileSync('config/blog-articles.json', 'utf8'));
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const seen = new Set();
for (const base of ['source', 'dist']) {
  for (const article of articles) {
    const file = base === 'source' ? article.source : 'dist' + article.url + 'index.html';
    const html = fs.readFileSync(file, 'utf8');
    const $ = load(html);
    assert.equal($('h1').length, 1, file);
    assert.equal($('title').text(), article.title);
    assert.equal($('meta[name="description"]').attr('content'), article.description);
    assert.ok(!/noindex/.test($('meta[name="robots"]').attr('content')));
    assert.equal($('link[rel="canonical"]').attr('href'), origin + article.url);
    assert.equal($('.article-meta').length, 1);
    assert.equal($('.article-practice').length, 1);
    assert.equal($('.article-meta').attr('data-tags'), article.tags.join(' '));
    assert.deepEqual($('.article-meta .blog-tags__item').map((i, el) => $(el).attr('data-tag')).get(), article.tags);
    const schema = JSON.parse($('#article-schema').text());
    assert.equal(schema['@type'], 'BlogPosting');
    assert.equal(schema.datePublished, article.date + 'T12:00:00+03:00');
    assert.equal(schema.datePublished, $('.article-meta time').first().attr('datetime'));
    assert.equal(schema.datePublished, $('meta[property="article:published_time"]').attr('content'));
    assert.equal(schema.dateModified, $('meta[property="article:modified_time"]').attr('content'));
    assert.equal(schema.author.name, 'РПК Ресурс');
    assert.ok(sitemap.includes(origin + article.url + '</loc>'));
    assert.equal($('br').length, 0);
    $('.news-detail img').each((i, el) => {
      assert.ok($(el).attr('alt').trim(), 'Empty content alt: ' + file);
      assert.ok(fs.existsSync('public' + $(el).attr('src')));
    });
    for (const key of article.tags) assert.ok(tags[key]);
    if (base === 'source') {
      assert.ok(!seen.has(article.date));
      seen.add(article.date);
    }
  }
  const listed = [];
  for (const page of [1, 2]) {
    const url = page === 1 ? '/blog/' : '/blog/page/2/';
    const file = base === 'source' ? 'pages' + url + 'index.html' : 'dist' + url + 'index.html';
    const $ = load(fs.readFileSync(file, 'utf8'));
    assert.equal($('.blog-card').length, page === 1 ? 10 : 2);
    assert.equal($('.blog-card a').length, 0);
    assert.equal($('.blog-pagination').length, 1);
    assert.equal($('.blog-pagination a').attr('href'), page === 1 ? '/blog/page/2/' : '/blog/');
    assert.ok(!/noindex/.test($('meta[name="robots"]').attr('content')));
    assert.equal($('link[rel="canonical"]').attr('href'), origin + url);
    assert.ok(sitemap.includes(origin + url + '</loc>'));
    assert.equal(JSON.parse($('#blog-schema').text())['@type'], 'CollectionPage');
    $('.blog-card').each((i, el) => {
      const a = articles.find(a => a.url === $(el).attr('href'));
      assert.ok(a);
      assert.equal($(el).attr('data-tags'), a.tags.join(' '));
      assert.equal($(el).attr('data-published'), a.date);
      assert.equal($(el).find('time').attr('datetime'), a.date + 'T12:00:00+03:00');
      assert.deepEqual($(el).find('.blog-tags__item').map((j, item) => $(item).text()).get(), a.tags.map(key => tags[key]));
      listed.push(a.url);
    });
  }
  assert.equal(new Set(listed).size, 12);
}
assert.equal(new Set(articles.map(a => a.date.slice(0, 7))).size, 12);
const css = fs.readFileSync('dist/assets/blog.css', 'utf8');
assert.ok(!/@media[^{]*(?:min-width|<=|>=)/.test(css));
assert.ok(!css.includes('!important'));
console.log('Blog audit passed: source and dist, 12 articles, monthly 2023 dates, schemas, topics, assets, metadata and pagination.');
