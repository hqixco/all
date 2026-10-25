import assert from 'node:assert/strict';
import fs from 'node:fs';
import { componentPages } from '../seo-pages/components/index.js';
import { reviewsForPage } from '../seo-pages/components/reviews.js';

const groups = {
  'okna-v-kvartiru':'apartment',
  'okna-v-chastnyj-dom':'house',
  'okna-na-dachu':'house',
  'balkonnye-bloki':'balcony-block',
  'panoramnye-okna':'panoramic',
  'osteklenie-verand-terras':'terrace',
  'laminirovannye-okna':'laminated',
  'dveri-pvh':'door',
  'otdelka-balkonov':'finishing',
  'balkony':'balcony',
};
for (const [slug,category] of Object.entries(groups)) {
  const items=componentPages[slug].sections.reviews.data.items;
  assert(items.length,`${slug}: no relevant reviews`);
  assert(items.every(item=>item.categories.includes(category)),`${slug}: unrelated review`);
}
for (const [slug,page] of Object.entries(componentPages)) {
  if (!page.order.includes('reviews')) {
    assert(!page.navigation?.some(item=>item.section==='reviews'),`${slug}: dangling navigation`);
    continue;
  }
  const items=page.sections.reviews.data.items;
  const html=fs.readFileSync(`dist/${slug}/index.html`,'utf8');
  assert.equal((html.match(/class="review-card"/g)||[]).length,items.length,`${slug}: rendered review count`);
  assert.equal((html.match(/class="review-card__topic"/g)||[]).length,items.length,`${slug}: chip count`);
  for (const item of items) {
    assert(html.includes(item.titleHtml),`${slug}: missing customer`);
    assert(html.includes(item.topic),`${slug}: missing topic`);
    const asset=item.mediaStyle.match(/\/assets\/([^"\)]+)/)?.[1];
    assert(asset&&fs.existsSync(`dist/assets/${asset}`),`${slug}: missing review photo`);
  }
}
for (const slug of ['moskitnye-setki','holodnoe-osteklenie-balkonov','teploe-osteklenie-balkonov']) {
  assert.equal(reviewsForPage(slug).length,0);
  const html=fs.readFileSync(`dist/${slug}/index.html`,'utf8');
  assert(!html.includes('data-component="reviews"'),`${slug}: unrelated review section`);
}
const home=fs.readFileSync('dist/index.html','utf8');
assert.equal((home.match(/class="review-card__topic"/g)||[]).length,reviewsForPage('home').length);
console.log('Review relevance, static chips, photos and navigation passed on every page.');
