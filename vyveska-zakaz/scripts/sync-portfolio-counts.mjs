import fs from 'node:fs/promises';
import {load} from 'cheerio';
const source='pages/portfolio/index.html';
const $=load(await fs.readFile(source,'utf8'));
const plural=n=>n%100>=11&&n%100<=14?'работ':n%10===1?'работа':n%10>=2&&n%10<=4?'работы':'работ';
const results=[];
for(const node of $('.catalog-grid > a').toArray()){
 const card=$(node),url=card.attr('href');
 const gallery=load(await fs.readFile('pages'+url+'index.html','utf8'));
 let count=gallery('main .legacy__gallery img,main .portfolio-core__gallery img,main .box-gallery__works img').length;
 if(!count)count=gallery('main .home-works .work-card').length;
 if(!count)throw Error('Cannot count portfolio works: '+url);
 card.find('.portfolio-core__card-count').remove();
 card.append($('<span class="portfolio-core__card-count"></span>').text(count+' '+plural(count)));
 results.push({url,count});
}
await fs.writeFile(source,$.html());
console.log('Portfolio counts synchronized: '+JSON.stringify(results));
