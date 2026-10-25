import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {load} from 'cheerio';

const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));
const registry=JSON.parse(await fs.readFile('config/section-selectors.json','utf8'));
const known=new Set(registry.flatMap(page=>page.sections.map(section=>section.selector)));
assert.equal(known.size,registry.reduce((sum,page)=>sum+page.sections.length,0),'Repeated section selector in registry');
assert.deepEqual(registry.map(page=>page.source).sort(),pages.map(page=>page.source).sort(),'Register selectors for every page');
const title=($,node)=>$(node).find('h1,h2,h3').first().text().replace(/\s+/g,' ').trim();
const changes=[];
let sections=0;
for(const page of registry){
  const html=await fs.readFile(page.source,'utf8');
  const $=load(html,{sourceCodeLocationInfo:true});
  const nodes=$('section,.legacy__section').toArray();
  assert.equal(nodes.length,page.sections.length,'Update section registry: '+page.url);
  const assigned=new Map();
  for(const [index,entry] of page.sections.entries()){
    let matches=nodes.filter(node=>($(node).attr('class')||'').split(/\s+/).includes(entry.selector));
    if(!matches.length&&entry.tag)matches=nodes.filter(node=>node.tagName===entry.tag);
    if(!matches.length&&entry.id)matches=nodes.filter(node=>$(node).attr('id')===entry.id);
    if(!matches.length&&entry.title)matches=nodes.filter(node=>title($,node)===entry.title);
    if(matches.length!==1){
      const node=nodes[index];
      assert.ok(node&&!assigned.has(node)&&title($,node)===entry.title,'Cannot identify section '+entry.selector+' on '+page.url);
      matches=[node];
    }
    assert.ok(!assigned.has(matches[0]),'Two selectors refer to one section on '+page.url);
    assigned.set(matches[0],entry.selector);
  }
  const edits=[];
  for(const node of nodes){
    const classes=($(node).attr('class')||'').split(/\s+/).filter(value=>value&&!known.has(value));
    classes.push(assigned.get(node));
    const location=node.sourceCodeLocation.startTag;
    const opening=html.slice(location.startOffset,location.endOffset);
    const updated=/\bclass\s*=/.test(opening)?opening.replace(/(\bclass\s*=\s*)(["'])(.*?)\2/s,(_,key,quote)=>key+quote+classes.join(' ')+quote):opening.replace(/^<([a-z][\w-]*)\b/i,(_,tag)=>'<'+tag+' class="'+classes.join(' ')+'"');
    if(updated!==opening)edits.push({start:location.startOffset,end:location.endOffset,text:updated});
    sections++;
  }
  let updated=html;
  for(const edit of edits.sort((a,b)=>b.start-a.start))updated=updated.slice(0,edit.start)+edit.text+updated.slice(edit.end);
  if(updated!==html)changes.push({source:page.source,html:updated});
}
for(const change of changes)await fs.writeFile(change.source,change.html);
console.log('Unique section selectors synchronized: '+sections+' sections, '+changes.length+' pages updated');
