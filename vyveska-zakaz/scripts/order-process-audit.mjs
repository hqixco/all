import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
const blocks=JSON.parse(await fs.readFile('config/order-process.json','utf8'));
const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));
const bySource=new Map(blocks.map(block=>[block.source,block]));
assert.equal(bySource.size,blocks.length,'Repeated process page');
const checkedImages=new Set();
for(const production of [false,true]){
  let count=0;
  for(const page of pages){
    const html=await fs.readFile(production?'dist'+page.url+'index.html':page.source,'utf8');
    if(!bySource.has(page.source)&&!/<ol\b|legacy__process|class="[^"\n]*\border-process\b/i.test(html))continue;
    const $=load(html);
    assert.equal($('main ol:not(.order-process__steps),main .legacy__process').length,0,'Old process markup: '+page.url);
    const block=bySource.get(page.source);
    assert.equal($('.order-process').length,block?1:0,'Process coverage: '+page.url);
    if(!block)continue;
    const section=$('section.'+block.selector+'.order-process');
    assert.equal(section.length,1,'Unique section selector: '+page.url);
    assert.equal(section.attr('aria-labelledby'),block.titleId);
    assert.equal(section.find('h2').text(),block.title);
    assert.equal(section.find('#'+block.titleId).length,1);
    assert.equal(section.find('.order-process__steps').attr('role'),'list');
    const cards=section.find('.order-process__card');
    assert.equal(cards.length,4);
    for(const [index,node] of cards.toArray().entries()){
      const card=$(node),step=block.steps[index],img=card.find('img');
      assert.equal(card.find('h3').text(),step.title);
      assert.equal(card.find('.order-process__description').text(),step.text);
      assert.equal(img.length,1);
      for(const key of ['src','alt','width','height'])assert.equal(img.attr(key),String(step.image[key]),page.url+' '+key);
      assert.ok(step.text.length>=20,'Empty process description: '+page.url);
      const filename=(production?'dist':'public')+step.image.src;
      if(!checkedImages.has(filename)){await fs.access(filename);checkedImages.add(filename);}
    }
    assert.equal(section.find('.order-process__note').text(),block.note);
    assert.equal(section.find('button[data-src="#formModalOrder"]').text(),block.button);
    assert.equal($('#formModalOrder').length,1);
    for(const stylesheet of ['order-process','info-note','shared-layout'])assert.equal($('link[href="/assets/'+stylesheet+'.css"]').length,1,page.url+' '+stylesheet);
    count++;
  }
  assert.equal(count,blocks.length);
}
console.log(JSON.stringify({status:'passed',pages:blocks.length,steps:blocks.length*4,sourceAndDist:true}));
