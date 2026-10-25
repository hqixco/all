import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const records=JSON.parse(await fs.readFile('config/service-intro.json','utf8'));
const reference=cheerio.load(await fs.readFile('pages/interernye-vyveski/index.html','utf8'))('.interior-signs-hero').toString();
for(const record of records){
 const html=await fs.readFile(record.source,'utf8'),$=cheerio.load(html),old=$('.'+record.selector);
 if(old.length!==1)throw Error('Expected one introduction: '+record.url);
 const template=cheerio.load(reference),block=template('section').first();
 block.attr('class','home__section home__section--soft legacy__section home__section--company home-company service-intro '+record.selector).attr('id',record.id).attr('aria-labelledby',record.id+'-title');
 block.find('h2').attr('id',record.id+'-title').text(record.title);
 block.find('img').each((i,e)=>{const im=record.images[i];template(e).attr({src:im.src,width:im.width,height:im.height,alt:im.alt,loading:'lazy',decoding:'async'}).removeAttr('fetchpriority');});
 const paragraphs=block.find('.home__company-copy p');
 if(record.paragraphs.length!==2||record.images.length!==2)throw Error('Expected two paragraphs and photos: '+record.url);
 paragraphs.each((i,e)=>template(e).text(record.paragraphs[i]));
 block.find('button').text(record.button).attr('data-service-popup-title',record.popupTitle);
 old.replaceWith(block.toString());
 if(!$('link[href="/assets/company-layout.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/company-layout.css">');
 await fs.writeFile(record.source,$.html());
}
console.log('Shared service introductions synchronized: '+records.length+' blocks');
