import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
const records=JSON.parse(await fs.readFile('config/shared-tables.json','utf8'));let count=0;
for(const target of ['source','dist'])for(const r of records){const $=cheerio.load(await fs.readFile(target==='source'?r.source:'dist'+r.url+'index.html','utf8'));assert.equal($('table.shared-table').length,r.tables.length,r.url);$('table').each((i,e)=>{const n=$(e);assert.ok(n.parent().hasClass('shared-table__wrap'),r.url);assert.equal(n.children('colgroup').children('col').length,r.tables[i].cols);assert.deepEqual(n.find('tr').map((i,tr)=>$(tr).children('th,td').map((i,c)=>$(c).text().replace(/\s+/g,' ').trim()).get()).get().flat(),r.tables[i].rows,r.url);if(target==='source')count++;});assert.equal($('link[href="/assets/shared-table.css"]').length,1);}
console.log(JSON.stringify({status:'passed',pages:records.length,tables:count,sourceAndDist:true}));
