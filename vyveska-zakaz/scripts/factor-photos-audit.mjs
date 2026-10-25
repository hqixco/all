import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
const records=JSON.parse(await fs.readFile('config/factor-photos.json','utf8'));
for(const target of ['source','dist'])for(const r of records){const $=cheerio.load(await fs.readFile(target==='source'?r.source:'dist'+r.url+'index.html','utf8'));const items=$('li[class*="factors-item"]');assert.equal(items.length,r.items.length,r.url);for(const [i,e] of items.toArray().entries()){const n=$(e),im=n.children('img.factor-card__photo');assert.equal(im.length,1,r.url+' '+i);assert.equal(im.attr('src'),r.items[i].src);assert.ok(im.attr('alt'));assert.ok(+im.attr('width')>0&&+im.attr('height')>0);await fs.access('public'+im.attr('src'));}assert.equal($('link[href="/assets/factor-cards.css"]').length,1);}
console.log(JSON.stringify({status:'passed',pages:records.length,photos:records.reduce((n,r)=>n+r.items.length,0),sourceAndDist:true}));
