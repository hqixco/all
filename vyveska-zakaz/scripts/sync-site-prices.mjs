import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
const registry=JSON.parse(await fs.readFile('config/site-prices.json','utf8'));
const money=n=>new Intl.NumberFormat('ru-RU').format(n);
const priceText=row=>'от '+money(row.amount)+' ₽'+(row.unit==='задача'?' за задачу':'/'+row.unit);
let rows=0;
for(const [url,record] of Object.entries(registry)){
 const $=load(await fs.readFile(record.source,'utf8'));
 const target=$(record.selector);assert.equal(target.length,1,'Price target: '+url);
 $('.price-summary').remove();
 const block=$('<div class="price-summary" data-price-summary=""></div>');
 block.append('<p class="price-summary__title">Базовые цены</p>');
 const list=$('<dl class="price-summary__list"></dl>');
 for(const row of record.rows){
  assert.ok(row.amount>0&&row.unit&&row.source,'Missing price evidence: '+url);
  const item=$('<div class="price-summary__item"></div>');
  item.append($('<dt class="price-summary__label"></dt>').text(row.label));
  item.append($('<dd class="price-summary__value"></dd>').text(priceText(row)));
  if(row.detail||row.kind==='market')item.append($('<dd class="price-summary__detail"></dd>').text((row.kind==='market'&&!/рыночный ориентир/i.test(row.detail)?'Рыночный ориентир. ':'')+row.detail));
  list.append(item);rows++;
 }
 block.append(list);
 if(record.example)block.append($('<p class="price-summary__example"></p>').text(record.example));
 block.append('<p class="price-summary__note">Опубликованные ориентиры для предварительной оценки. Актуальную стоимость, комплектацию, монтаж и доставку подтвердим в смете.</p>');
 const heading=target.find('h2').first();
 if(heading.length)heading.after(block);else target.append(block);
 target.find('p').not('.price-summary p').each((i,e)=>{
  const paragraph=$(e),text=paragraph.text();
  if(text.includes('Старый единый тариф не используется'))paragraph.text(text.replace('Старый единый тариф не используется для оценки нового заказа.','Базовая расценка приведена выше; итог зависит от материала и операций.'));
 });
 if(!$('link[href="/assets/price-summary.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/price-summary.css">');
 await fs.writeFile(record.source,$.html());
}
console.log('Concrete prices synchronized: '+Object.keys(registry).length+' pages, '+rows+' price rows');

const catalog=JSON.parse(await fs.readFile('config/prices-catalog.json','utf8'));
const $=load(await fs.readFile('pages/ceny/index.html','utf8'));
let catalogRows=0;
for(const group of catalog){
 const section=$(group.selector),body=section.find('tbody');assert.equal(body.length,1,'Catalog table '+group.selector);
 body.empty();
 for(const [url,index,title] of group.rows){
  const row=registry[url].rows[index];assert.ok(row,'Catalog price missing '+url);
  const tr=$('<tr></tr>');
  tr.append($('<th class="shared-table__label" scope="row"></th>').text(title));
  tr.append($('<td class="shared-table__cell" data-label="Ориентир цены"></td>').text(priceText(row)));
  tr.append($('<td class="shared-table__cell" data-label="Условие расчёта"></td>').text((row.kind==='market'&&!/рыночный ориентир/i.test(row.detail)?'Рыночный ориентир. ':'')+(row.detail||'Базовая расценка опубликованного прайса. Комплектация уточняется в смете.')));
  tr.append($('<td class="shared-table__cell" data-label="Подробнее"></td>').append($('<a></a>').attr('href',url).text('Об услуге')));
  body.append(tr);catalogRows++;
 }
}
$('#prices-design h2').first().text('Дизайн, монтаж и сопровождение');
$('main p').filter((i,e)=>$(e).text().startsWith('Указаны базовые расценки из опубликованного прайса')).first().text('Указаны базовые расценки опубликованного прайса РПК «Ресурс» и отдельно отмеченные рыночные ориентиры других производителей. Единицы расчёта относятся к указанному изделию или операции. Актуальную стоимость и состав заказа подтвердим в смете.');
await fs.writeFile('pages/ceny/index.html',$.html());
console.log('Price catalog synchronized: '+catalogRows+' rows');
