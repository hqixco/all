import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {load} from 'cheerio';

const blocks=JSON.parse(await fs.readFile('config/order-process.json','utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let updated=0;
for(const block of blocks){
  let html=await fs.readFile(block.source,'utf8');
  const $=load(html,{sourceCodeLocationInfo:true});
  const section=$('section.'+block.selector);
  assert.equal(section.length,1,'Missing order process: '+block.url);
  assert.equal(block.steps.length,4,'Order process needs four steps: '+block.url);
  const original=section.get(0).sourceCodeLocation;
  const clone=section.clone().attr('class','legacy__section order-process '+block.selector).attr('aria-labelledby',block.titleId);
  clone.html('<div class="order-process__inner"><h2 class="order-process__title" id="'+escape(block.titleId)+'">'+escape(block.title)+'</h2><ol class="order-process__steps" role="list" aria-label="Этапы заказа">'+block.steps.map((step,index)=>'<li class="legacy__card order-process__card"><div class="order-process__image"><img class="order-process__photo" src="'+escape(step.image.src)+'" width="'+step.image.width+'" height="'+step.image.height+'" alt="'+escape(step.image.alt)+'" loading="lazy" decoding="async"></div><span class="order-process__number">Этап '+(index+1)+'</span><h3 class="order-process__step-title">'+escape(step.title)+'</h3><div class="order-process__description">'+escape(step.text)+'</div></li>').join('')+'</ol><div class="order-process__footer"><aside class="info-note order-process__note">'+escape(block.note)+'</aside><button class="legacy__button order-process__button" type="button" data-fancybox="" data-src="#formModalOrder" data-service-popup-title="'+escape(block.popupTitle)+'">'+escape(block.button)+'</button></div></div>');
  html=html.slice(0,original.startOffset)+clone.toString()+html.slice(original.endOffset);
  for(const stylesheet of ['shared-layout','info-note','order-process'])if(!html.includes('href="/assets/'+stylesheet+'.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/'+stylesheet+'.css">\n</head>');
  await fs.writeFile(block.source,html);
  updated++;
}
console.log('Shared order process synchronized: '+updated+' blocks');
