import fs from 'node:fs';
import sharp from 'sharp';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
const errors=[],images=new Map();page.on('pageerror',e=>errors.push(e.message));
for(const width of [1920,1440,1024,768,600,480,390,320]){
 await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{for(const image of document.images){if(image.getAttribute('src')){image.loading='eager';await image.decode().catch(()=>{});}}});
 const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&!i.naturalWidth).map(i=>i.src),images:[...document.images].filter(i=>i.getAttribute('src')).map(i=>({src:i.getAttribute('src'),display:i.getBoundingClientRect().width}))}));
 if(result.overflow)errors.push('Home overflow '+width);errors.push(...result.broken);
 for(const image of result.images)images.set(image.src,Math.max(images.get(image.src)||0,image.display));
 if([1440,390].includes(width))await page.screenshot({path:`tmp/audit-home-${width}.png`,fullPage:true});
}
await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4173/');await page.locator('.global-header__photo').click();if(!await page.locator('.package-modal').evaluate(e=>e.classList.contains('is-open')))errors.push('Home modal');await page.keyboard.press('Escape');
const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
await staticPage.goto('http://127.0.0.1:4173/');if(!await staticPage.locator('h1').isVisible())errors.push('Home no-JS H1');if(await staticPage.locator('main').count()!==1)errors.push('Home main count');
const heavy=[];for(const [src,display]of images){if(!src.startsWith('/assets/')||src.endsWith('.svg'))continue;const file='dist'+src;const bytes=fs.statSync(file).size;const meta=await sharp(file).metadata();if(bytes>300000&&display>0)heavy.push({src,bytes,width:meta.width,display:Math.round(display)});}
await browser.close();fs.writeFileSync('tmp/home-audit-results.json',JSON.stringify({errors,heavy},null,2));console.log(JSON.stringify({errors,heavy},null,2));if(errors.length)process.exitCode=1;
