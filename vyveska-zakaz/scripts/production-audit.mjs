import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
const records=JSON.parse(await fs.readFile('config/shared-production.json','utf8'));
const reference=cheerio.load(await fs.readFile('index.html','utf8'));const cards=reference('#home-production .home__production-links').toString();
for(const target of ['source','dist'])for(const r of records){const $=cheerio.load(await fs.readFile(target==='source'?r.source:'dist'+r.url+'index.html','utf8')),n=$('.production-block.'+r.selector);assert.equal(n.length,1,r.url);if(r.popupActions){
 const actual=n.find('.home__production-links').children();const expected=reference('#home-production .home__production-links').children();
 assert.equal(actual.length,r.popupActions.length,r.url);assert.equal(n.find('a').length,0,r.url);
 actual.each((i,node)=>{const card=$(node),original=reference(expected.get(i));assert.equal(node.tagName,'article');assert.equal(card.find('h3').text(),original.find('h3').text());assert.equal(card.find('.home-production__card-description').text(),original.find('.home-production__card-description').text());assert.equal(card.find('img').attr('src'),original.find('img').attr('src'));const action=r.popupActions.find(item=>item.label===card.find('h3').text().trim());assert.equal(card.find('button[data-src="#formModalOrder"]').length,1);assert.equal(card.find('button').attr('data-service-popup-title'),action.title);assert.equal(card.find('button').attr('data-service-popup-placeholder'),action.placeholder);});
 assert.equal(n.find('button[data-src="#formModalOrder"]').length,r.popupActions.length+1);
 assert.equal(n.find('.home-production__catalog-action button').attr('data-service-popup-title'),r.catalogPopup.title);
}else assert.equal(n.find('.home__production-links').toString(),cards,r.url);assert.equal(n.find('h2').text(),r.title);assert.equal(n.find('.home-production__wrapper > p').length,r.paragraphs.length);assert.equal(n.attr('aria-labelledby'),n.find('h2').attr('id'));assert.equal($('link[href="/assets/production.css"]').length,1);for(const im of n.find('img').toArray()){assert.ok($(im).attr('alt'));await fs.access('public'+$(im).attr('src'));}assert.ok(!/<br\b/i.test(n.toString()));}
console.log(JSON.stringify({status:'passed',blocks:records.length,sourceAndDist:true}));
