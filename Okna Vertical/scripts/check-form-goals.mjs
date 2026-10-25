import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {componentPages} from '../seo-pages/components/index.js';
import {pageLeadGoal} from '../src/components/lead-goals.js';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const routes=['/',...Object.keys(componentPages).map(slug=>'/'+slug+'/')];
assert.equal(new Set(routes.map(pageLeadGoal)).size,routes.length);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
page.setDefaultTimeout(7000);
let accepted=true;
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{window.testGoals=[];window.ym=(...args)=>{if(args[1]==='reachGoal')window.testGoals.push(args[2]);};});
await page.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.hostname!=='okna.test')return route.abort();
 if(url.pathname==='/mail.php')return route.fulfill({status:accepted?200:500,json:{success:accepted,message:accepted?'OK':'Test failure'}});
 const file=path.join(process.cwd(),'dist',url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname);
 try {
  const contentType={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.otf':'font/otf'}[path.extname(file)]||'application/octet-stream';
  return route.fulfill({body:await fs.readFile(file),contentType});
 }catch{return route.abort();}
});
async function submit(route){
 await page.goto('http://okna.test'+route+'?utm_source=goals-test',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(document.querySelector('.package-modal input[name=phone]')?.pattern));
 await page.locator('.global-header__photo').click();
 const form=page.locator('.package-modal__form');
 await form.locator('input[name=phone]').fill('9991234567');
 await form.locator('input[name=policy]').check();
 await form.locator('button[type=submit]').click();
}
try {
 for(const route of routes){
  await submit(route);
  await page.waitForFunction(()=>window.testGoals.length>0);
  const goals=await page.evaluate(()=>window.testGoals);
  assert.equal(goals.filter(g=>g===pageLeadGoal(route)).length,1,route+': page goal');
  assert.equal(goals.filter(g=>g==='lead_form_submit').length,1,route+': general goal');
 }
 accepted=false;
 await submit('/zhalyuzi/');
 await page.locator('.package-modal__status').filter({hasText:'Test failure'}).waitFor();
 assert.deepEqual(await page.evaluate(()=>window.testGoals),[],'Rejected submission must not count');
 assert.deepEqual(errors,[],'JavaScript errors');
 console.log('Passed: '+routes.length+' unique page goals, general goal preserved, no duplicate events, failed submission excluded. No real requests sent.');
} finally {await browser.close();}
