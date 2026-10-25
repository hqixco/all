import fs from 'node:fs/promises';
import {load} from 'cheerio';
import {markNavigation} from './navigation-state.mjs';
const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));
let marked=0;
for (const page of pages) {
  const html=await fs.readFile(page.source,'utf8');
  const $=load(html,{sourceCodeLocationInfo:true});
  const node=$('.root__head .site-nav').get(0);
  if(!node)throw new Error('Missing navigation: '+page.url);
  if(markNavigation($,page.url,pages))marked++;
  const loc=node.sourceCodeLocation;
  const updated=html.slice(0,loc.startOffset)+$(node).prop('outerHTML')+html.slice(loc.endOffset);
  if(updated!==html)await fs.writeFile(page.source,updated);
}
console.log('Menu current-page state synchronized: '+marked+' of '+pages.length+' pages');
