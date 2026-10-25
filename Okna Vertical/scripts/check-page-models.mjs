import assert from 'node:assert/strict';
import fs from 'node:fs';
import { componentPages } from '../seo-pages/components/index.js';
const failures=[];
const verify=(condition,message)=>{if(!condition)failures.push(message);};
for(const [slug,config]of Object.entries(componentPages)){
 const file='dist/'+slug+'/index.html';
 const html=fs.readFileSync(file,'utf8');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 verify((main.match(/<h1\b/g)||[]).length===1,slug+': h1');
 verify(!/legacy-page|{{|<br\b/.test(html),slug+': legacy or unresolved markup');
 verify(!/Подконструкцийник/.test(html),slug+': incorrect estimate copy');
 if(slug==='moskitnye-setki')verify(!config.sections.price.data.items.some(item=>/Демонтаж|откосы|Подоконник/.test(item.labelHtml)),slug+': unrelated estimate items');
 verify(html.includes(`rel="canonical" href="https://okna-vertical.ru/${slug}/"`),slug+': canonical');
 let previous=-1;
 for(const key of config.order){
  const marker=config.prefix+'-'+key;
  const index=main.search(new RegExp('<section\\b[^>]*class="[^"]*\\b'+marker+'\\b'));
  verify(index>previous,slug+': section order '+key);previous=index;
  verify(main.includes(`data-component="${config.sections[key].component}"`),slug+': component '+key);
 }
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 verify(new Set(ids).size===ids.length,slug+': duplicate ids');
 for(const match of html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^"#]*)?"/g)){
  const url=match[1];
  if(url.startsWith('#')){verify(ids.includes(url.slice(1)),slug+': missing anchor '+url);continue;}
  if(!url.startsWith('/'))continue;
  const [pathname,fragment]=url.split('#');
  const target='dist'+pathname+(pathname.endsWith('/')?'index.html':'');
  if(pathname==='/mail.php')continue;
  verify(fs.existsSync(target),slug+': missing link '+url);
  if(fragment&&fs.existsSync(target))verify(fs.readFileSync(target,'utf8').includes(`id="${fragment}"`),slug+': missing target anchor '+url);
 }
 for(const match of html.matchAll(/url\((?:&quot;|["'])?([^)'"&]+)(?:&quot;|["'])?\)/g))if(match[1].startsWith('/'))verify(fs.existsSync('dist'+match[1]),slug+': missing background '+match[1]);
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(match[1]);
}
for(const file of fs.readdirSync('dist/assets').filter(n=>n.endsWith('.css'))){
 const css=fs.readFileSync('dist/assets/'+file,'utf8');
 verify(!/@media[^{}]*\(\s*width\s*[<>]/.test(css),'Safari media syntax: '+file);
}
console.log(JSON.stringify({pages:Object.keys(componentPages).length,failures},null,2));
assert.equal(failures.length,0,'Page models failed');
