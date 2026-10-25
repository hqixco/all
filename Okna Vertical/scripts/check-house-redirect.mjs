import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const base='http://127.0.0.1:4173';
const target='/okna-v-chastnyj-dom/';
for(const source of ['/osteklenie-kottedzhey','/osteklenie-kottedzhey/','/osteklenie-kottedzhey/index.html']){
 for(const query of ['', '?utm_source=test&utm_campaign=cottage']){
  const response=await fetch(base+source+query,{redirect:'manual'});
  assert.equal(response.status,301,source+query);
  assert.equal(response.headers.get('location'),target+query,'Redirect destination');
 }
}
assert(!fs.existsSync('dist/osteklenie-kottedzhey/index.html'),'Old page remains in build');
assert(!fs.readFileSync('dist/sitemap.xml','utf8').includes('osteklenie-kottedzhey'),'Old URL in sitemap');
function checkLinks(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())checkLinks(path);else if(path.endsWith('.html'))assert(!fs.readFileSync(path,'utf8').includes('/osteklenie-kottedzhey/'),'Old link in '+path);}}
checkLinks('dist');
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();const errors=[];
 await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,768,480,390,320]){
  await page.setViewportSize({width,height:900});
  const response=await page.goto(base+target,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
  assert.equal(await page.locator('h1').count(),1);
  assert((await page.locator('h1').textContent()).includes('коттеджа'));
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://okna-vertical.ru'+target);
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Overflow '+width);
 }
 await page.goto(base+'/osteklenie-kottedzhey/?utm_source=test',{waitUntil:'domcontentloaded'});
 assert.equal(page.url(),base+target+'?utm_source=test');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('House page: 5 widths passed; 6 HTTP 301 variants passed; query preserved; old page and links absent.');
}finally{await browser.close();}
