import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin='https://okna-vertical.ru';
const files=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(file.endsWith('.html'))files.push(file);}}
walk('dist');
const errors=[], warnings=[], records=[], titles=new Map(), descriptions=new Map();
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
let current='';
page.on('pageerror',e=>errors.push(`${current}: JS ${e.message}`));
try{
for(const file of files){
 const route='/'+path.relative('dist',file).replaceAll('\\','/').replace(/index\.html$/,'');current=route;
 const html=fs.readFileSync(file,'utf8');
 await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'domcontentloaded'});
 const data=await page.evaluate(()=>{
  const meta=name=>document.querySelector(`meta[name="${name}"]`)?.content;
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
  return {title:document.title,description:meta('description'),robots:meta('robots'),canonical:document.querySelector('link[rel=canonical]')?.href,
   h1:[...document.querySelectorAll('h1')].map(e=>e.textContent.trim()),lang:document.documentElement.lang,
   duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),links:[...document.querySelectorAll('a[href]')].map(e=>e.getAttribute('href')),
   images:[...document.images].map(e=>({src:e.getAttribute('src'),alt:e.getAttribute('alt'),width:e.getAttribute('width'),height:e.getAttribute('height')})),
   schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>e.textContent),
   ogImage:document.querySelector('meta[property="og:image"]')?.content};
 });
 const notFound=route==='/404.html';
 if(!data.title||!data.description)errors.push(`${route}: missing title/description`);
 if(data.h1.length!==1)errors.push(`${route}: H1 count ${data.h1.length}`);
 if(data.lang!=='ru')errors.push(`${route}: lang`);
 if(data.canonical!==origin+route)errors.push(`${route}: canonical ${data.canonical}`);
 if(notFound?!data.robots?.includes('noindex'):data.robots?.includes('noindex'))errors.push(`${route}: robots ${data.robots}`);
 if(!notFound&&!urls.includes(origin+route))errors.push(`${route}: absent from sitemap`);
 for(const [map,value,label]of [[titles,data.title,'title'],[descriptions,data.description,'description']]){
  if(map.has(value))errors.push(`${route}: duplicate ${label} with ${map.get(value)}`);map.set(value,route);
 }
 for(const id of data.duplicateIds)errors.push(`${route}: duplicate id ${id}`);
 for(const schema of data.schemas){try{JSON.parse(schema);}catch{errors.push(`${route}: invalid JSON-LD`);}}
 if(!notFound&&!data.schemas.length)errors.push(`${route}: missing structured data`);
 for(const image of data.images){if(!image.src)continue;if(image.alt===null)warnings.push(`${route}: no alt ${image.src}`);if(!image.width||!image.height)warnings.push(`${route}: no image dimensions ${image.src}`);}
 const refs=[...data.links,...[...html.matchAll(/(?:src|poster)="([^"]+)"/g)].map(m=>m[1]),data.ogImage].filter(Boolean);
 for(const ref of new Set(refs)){
  if(/^(tel:|mailto:|data:|javascript:)/.test(ref))continue;
  const url=new URL(ref,origin+route);if(url.origin!==origin)continue;
  let target=path.join('dist',decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(`${route}: missing target ${ref}`);continue;}
  if(url.hash&&target.endsWith('.html')&&!fs.readFileSync(target,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))errors.push(`${route}: missing anchor ${ref}`);
 }
 const response=await page.request.get('http://127.0.0.1:4173'+route);
 if(response.status()!==(notFound?404:200))errors.push(`${route}: HTTP ${response.status()}`);
 records.push({route,title:data.title,description:data.description,h1:data.h1[0],schemas:data.schemas.length,links:data.links.length});
}
for(const url of urls)if(!records.some(r=>origin+r.route===url))errors.push(`Sitemap nonexistent URL ${url}`);
for(const [url,status]of [['/not-existing-audit-page/',404],['/okna-v-kvartiru',301]]){const r=await page.request.get('http://127.0.0.1:4173'+url,{maxRedirects:0});if(r.status()!==status)errors.push(`${url}: expected ${status}, got ${r.status()}`);}
}finally{await browser.close();}
const result={pages:records.length,sitemap:urls.length,errors:[...new Set(errors)],warnings:[...new Set(warnings)],records};
fs.writeFileSync('tmp/site-seo-report.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,records:undefined},null,2));
if(errors.length)process.exitCode=1;
