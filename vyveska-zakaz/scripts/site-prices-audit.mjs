import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {load} from 'cheerio';
const registry=JSON.parse(await fs.readFile('config/site-prices.json','utf8'));
const groups=JSON.parse(await fs.readFile('config/prices-catalog.json','utf8'));
let checked=0;
for(const target of ['source','dist']){
 for(const [url,record] of Object.entries(registry)){
  const html=await fs.readFile(target==='source'?record.source:'dist'+url+'index.html','utf8');const $=load(html);const block=$(record.selector).find('.price-summary');
  assert.equal(block.length,1,url);assert.equal(block.find('.price-summary__item').length,record.rows.length,url);
  for(const [i,row] of record.rows.entries()){
   const item=block.find('.price-summary__item').eq(i);assert.equal(item.find('dt').text(),row.label,url);
   assert.ok(item.find('.price-summary__value').text().includes(new Intl.NumberFormat('ru-RU').format(row.amount)),url);
   assert.ok(item.text().includes(row.unit==='задача'?'задачу':row.unit),url);
   if(row.kind==='market')assert.ok(/рыночный ориентир/i.test(item.text()),url);
  }
  assert.equal($('link[href="/assets/price-summary.css"]').length,1,url);assert.ok(!/<br\b/i.test(html),url);checked++;
 }
 const $=load(await fs.readFile(target==='source'?'pages/ceny/index.html':'dist/ceny/index.html','utf8'));
 for(const group of groups){const rows=$(group.selector).find('tbody tr');assert.equal(rows.length,group.rows.length);for(const [i,[url,index]] of group.rows.entries()){const value=registry[url].rows[index];assert.ok(rows.eq(i).children('td').first().text().includes(new Intl.NumberFormat('ru-RU').format(value.amount)),url)}}
}
console.log(JSON.stringify({status:'passed',pages:Object.keys(registry).length,sourceAndDist:true,checked,catalogRows:groups.reduce((n,g)=>n+g.rows.length,0)}));
