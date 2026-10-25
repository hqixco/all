import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {load} from 'cheerio';

const registry=JSON.parse(await fs.readFile('config/section-selectors.json','utf8'));
const expected=new Set(registry.flatMap(page=>page.sections.map(section=>section.selector)));
const results=[];
for(const production of [false,true]){
  const counts=new Map();
  let sections=0;
  for(const page of registry){
    const filename=production?'dist'+page.url+'index.html':page.source;
    const html=await fs.readFile(filename,'utf8');
    const $=load(html);
    assert.equal($('section,.legacy__section').length,page.sections.length,'Section count: '+filename);
    $('[class]').each((_,node)=>{for(const name of ($(node).attr('class')||'').split(/\s+/))if(expected.has(name))counts.set(name,(counts.get(name)||0)+1);});
    const assigned=new Set(page.sections.map(section=>section.selector));
    $('section,.legacy__section').each((_,node)=>{
      const names=($(node).attr('class')||'').split(/\s+/).filter(name=>expected.has(name));
      assert.equal(names.length,1,'Each section needs exactly one unique selector: '+filename);
      assert.ok(assigned.has(names[0]),'Selector belongs to another page: '+filename+' '+names[0]);
      sections++;
    });
    for(const entry of page.sections)assert.equal($('.'+entry.selector).length,1,'Missing or repeated selector: '+filename+' '+entry.selector);
    assert.ok(!/<\s*br\b/i.test(html),'Forced line break: '+filename);
  }
  for(const name of expected)assert.equal(counts.get(name),1,'Selector must occur once across the site: '+name);
  results.push({target:production?'dist':'source',pages:registry.length,sections,uniqueSelectors:counts.size});
}
console.log(JSON.stringify({status:'passed',results}));
