import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const pages = JSON.parse(await fs.readFile('config/site-pages.json','utf8'));
const data = JSON.parse(await fs.readFile('config/page-faq.json','utf8'));
const origin = 'https://xn----7sbbagavscye2ftg.xn--p1ai';
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const icon = '<svg class="home-faq__question-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="home-faq__question-icon-path" d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
function withoutFaq(value) {
  if (Array.isArray(value)) return value.map(withoutFaq).filter(Boolean);
  if (!value || typeof value !== 'object') return value;
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes('FAQPage')) return null;
  const result = {...value};
  if (result['@graph']) result['@graph'] = withoutFaq(result['@graph']);
  if (result['@graph'] && !result['@graph'].length && Object.keys(result).every(key=>['@graph','@context'].includes(key))) return null;
  return result;
}
let total=0;
for (const page of pages) {
  const faq=data[page.url];
  if (faq?.enabled === false) {
    let html=await fs.readFile(page.source,'utf8');
    const doc=cheerio.load(html,{sourceCodeLocationInfo:true});
    const edits=[];
    doc('.home-faq').each((_,node)=>{const loc=node.sourceCodeLocation;edits.push({start:loc.startOffset,end:loc.endOffset,value:''});});
    doc('script[type="application/ld+json"]').each((_,node)=>{
      const raw=doc(node).text();
      if(!raw.includes('FAQPage')&&doc(node).attr('id')!=='page-faq-schema')return;
      const cleaned=withoutFaq(JSON.parse(raw));const loc=node.sourceCodeLocation;
      edits.push({start:loc.startOffset,end:loc.endOffset,value:cleaned?'<script type="application/ld+json">'+JSON.stringify(cleaned)+'</script>':''});
    });
    for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.value+html.slice(edit.end);
    html=html.replace(/<link[^>]*href="\/assets\/home-faq.css"[^>]*>/g,'');
    await fs.writeFile(page.source,html);
    continue;
  }
  if (!faq || faq.items.length<11) throw new Error('Missing FAQ: '+page.url);
  let html=await fs.readFile(page.source,'utf8');
  const doc=cheerio.load(html,{sourceCodeLocationInfo:true});
  const current=doc('.home-faq');
  if (current.length>1) throw new Error('Duplicate FAQ: '+page.url);
  const id=current.attr('id') || 'page-faq';
  const titleId=current.find('h2').attr('id') || id+'-title';
  const title=faq.title==='Частые вопросы'&&current.length ? current.find('h2').first().text() : faq.title;
  const items=faq.items.map(item=>{
    if (!item.q.trim() || item.a.length<2 || item.a.some(p=>!p.trim())) throw new Error('Incomplete FAQ: '+page.url);
    return '<details class="home-faq__item"><summary class="home-faq__question"><h3 class="home-faq__question-title">'+escape(item.q)+'</h3>'+icon+'</summary><div class="home-faq__answer">'+item.a.map(p=>'<p class="home-faq__answer-text">'+escape(p)+'</p>').join('')+'</div></details>';
  });
  const split=Math.ceil(items.length/2);
  const block='<section class="home__section legacy__section home__section--faq home-faq" id="'+escape(id)+'" aria-labelledby="'+escape(titleId)+'"><div class="home-faq__wrapper"><h2 class="home-faq__title" id="'+escape(titleId)+'">'+escape(title)+'</h2>'+(faq.lead?'<p class="home-faq__lead">'+escape(faq.lead)+'</p>':'')+'<div class="home-faq__columns"><div class="home-faq__column">'+items.slice(0,split).join('')+'</div><div class="home-faq__column">'+items.slice(split).join('')+'</div></div></div></section>';
  const edits=[];
  if(current.length){const loc=current.get(0).sourceCodeLocation;edits.push({start:loc.startOffset,end:loc.endOffset,value:block});}
  else {const contact=doc('main .home-contact').first().get(0);const main=doc('main').get(0);if(!main)throw new Error('Missing main: '+page.url);const offset=contact?contact.sourceCodeLocation.startOffset:main.sourceCodeLocation.endTag.startOffset;edits.push({start:offset,end:offset,value:block+'\n'});}
  doc('script[type="application/ld+json"]').each((_,node)=>{
    const raw=doc(node).text();
    if(!raw.includes('FAQPage')&&doc(node).attr('id')!=='page-faq-schema')return;
    const cleaned=withoutFaq(JSON.parse(raw));const loc=node.sourceCodeLocation;
    edits.push({start:loc.startOffset,end:loc.endOffset,value:cleaned?'<script type="application/ld+json">'+JSON.stringify(cleaned).replaceAll('<','\u003c')+'</script>':''});
  });
  for(const edit of edits.sort((a,b)=>b.start-a.start)) html=html.slice(0,edit.start)+edit.value+html.slice(edit.end);
  const schema={'@context':'https://schema.org','@type':'FAQPage','@id':origin+page.url+'#'+id,mainEntity:faq.items.map(item=>({'@type':'Question',name:item.q,acceptedAnswer:{'@type':'Answer',text:item.a.join('\n\n')}}))};
  html=html.replace('</head>','<script id="page-faq-schema" type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\u003c')+'</script></head>');
  if(!html.includes('href="/assets/home-faq.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/home-faq.css"></head>');
  await fs.writeFile(page.source,html);total+=faq.items.length;
}
console.log('Static FAQ synchronized: '+pages.length+' pages, '+total+' questions');
