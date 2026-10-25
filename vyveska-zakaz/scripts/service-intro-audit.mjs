import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
const records=JSON.parse(await fs.readFile('config/service-intro.json','utf8'));
for(const target of ['source','dist'])for(const r of records){
 const file=target==='source'?r.source:'dist'+r.url+'index.html';
 const $=cheerio.load(await fs.readFile(file,'utf8')),n=$('.service-intro.'+r.selector);
 assert.equal(n.length,1,r.url);assert.equal(n.find('h2').text(),r.title,r.url);assert.equal(n.attr('aria-labelledby'),n.find('h2').attr('id'));
 assert.equal(n.find('.home__company-copy p').length,2);assert.equal(n.find('img').length,2);
 assert.equal(n.find('button[data-src="#formModalOrder"]').length,1);assert.equal($('#formModalOrder').length,1);
 assert.equal($('section.legacy-layout__explanation').length,0,r.url);
 for(const im of r.images){await fs.access('public'+im.src);assert.ok(im.alt&&im.width>0&&im.height>0);assert.equal(n.find('img[src="'+im.src+'"]').length,1);}
 assert.ok(!/<br\b/i.test(n.toString()));
}
console.log(JSON.stringify({status:'passed',blocks:records.length,sourceAndDist:true}));
