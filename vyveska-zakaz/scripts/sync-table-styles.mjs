import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));let count=0,changed=0;
for(const p of pages){const $=cheerio.load(await fs.readFile(p.source,'utf8'));if(!$('table').length)continue;changed++;
 $('table').each((i,e)=>{const table=$(e),cols=table.find('tr').first().children('th,td').length;table.addClass('shared-table');let wrap=table.parent();if(!wrap.hasClass('shared-table__wrap')){if(wrap.children().length===1&&!wrap.is('section,main,article')&&!wrap.hasClass('root__width'))wrap.addClass('shared-table__wrap');else{table.wrap('<div class="shared-table__wrap"></div>');wrap=table.parent();}}
 table.children('colgroup').remove();const group=$('<colgroup></colgroup>');const widths=cols===3?[30,30,40]:p.url==='/ceny/'?[24,29,32,15]:cols===4?[28,24,24,24]:cols===5?[24,19,19,19,19]:Array(cols).fill(100/cols);for(const w of widths)group.append($('<col>').attr('style','width:'+w+'%'));table.find('caption').first().length?table.find('caption').first().after(group):table.prepend(group);
 table.find('thead th').addClass('shared-table__heading');table.find('tbody th').addClass('shared-table__label');table.find('td').addClass('shared-table__cell');table.find('.home-cost__table-price').addClass('shared-table__price');count++;});
 if(!$('link[href="/assets/shared-table.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/shared-table.css">');await fs.writeFile(p.source,$.html());}
console.log('Shared table styles synchronized: '+count+' tables on '+changed+' pages');
