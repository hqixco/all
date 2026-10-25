import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{
 let file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
 let checked=0;
 for(const slug of ['','holodnoe-osteklenie-balkonov','osteklenie-kottedzhey','okna-v-kvartiru','panoramnye-okna']){
  await page.goto(`${origin}/${slug}/`,{waitUntil:'networkidle'});
  const cards=page.locator('.home-hero__products .home-hero-card:not([data-package-no-image="true"])');
  for(let i=0;i<await cards.count();i++){
   const card=cards.nth(i);const heading=await card.getAttribute('data-package-modal-title');
   const picture=await card.locator('img').getAttribute('src');
   const before=await page.evaluate(()=>scrollY);
   await card.click();
   assert.equal(await page.locator('#package-modal-title').textContent(),heading);
   assert.equal(await page.locator('.package-modal').getAttribute('aria-hidden'),'false');
   assert.equal(await page.locator('.package-modal img').first().getAttribute('src'),picture);
   assert(await page.locator('.package-modal__visual img').isVisible(),'Popup image must be visible');
   await page.waitForFunction(()=>{const image=document.querySelector('.package-modal__visual img');return image.complete&&image.naturalWidth>0;});
   assert.equal(await page.evaluate(()=>location.hash),'');
   assert.equal(await page.evaluate(()=>scrollY),before);
   await page.keyboard.press('Escape');checked++;
  }
 }
 console.log(`Verified ${checked} hero cards: correct modal, photo, no anchor or scrolling.`);
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
