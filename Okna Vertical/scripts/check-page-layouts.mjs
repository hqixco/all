import fs from 'node:fs';
import {createRequire} from 'node:module';
import {componentPages} from '../seo-pages/components/index.js';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();const failures=[];const measurements=[];
await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
page.on('pageerror',error=>failures.push(error.message));
for(const width of [1920,1536,1440,1301,1200,1024,768,600,390,320]){
 await page.setViewportSize({width,height:1000});
 for(const slug of Object.keys(componentPages)){
  const response=await page.goto('http://127.0.0.1:4173/'+slug+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(document.querySelector('.home-lead-form')?.dataset.calculatorReady)||!document.querySelector('.home-lead-form'));
  if(response.status()!==200)failures.push(slug+': HTTP '+response.status());
  const result=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>innerWidth,
    offenders:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&getComputedStyle(e).position!=='fixed';}).slice(0,6).map(e=>e.className),
    buttons:[...document.querySelectorAll('.page-hero .home-hero__actions a')].map(e=>({top:e.getBoundingClientRect().top,right:e.getBoundingClientRect().right})),
    broken:[...document.querySelectorAll('img')].filter(e=>e.getAttribute('src')&&e.complete&&!e.naturalWidth).map(e=>e.getAttribute('src')),
    clippedPrices:[...document.querySelectorAll('.card-price-row')].filter(e=>{const card=e.closest('.home-product-card, .case-card, .home-hero-card');if(!card)return false;const rect=card.getBoundingClientRect();return rect.width&&[...e.children].some(child=>child.getBoundingClientRect().right>rect.right+1);}).map(e=>e.textContent.trim()),
  }));
  if(result.overflow)failures.push({slug,width,overflow:result.offenders});
  if(width>767&&result.buttons.length===2&&Math.abs(result.buttons[0].top-result.buttons[1].top)>10)failures.push(slug+': hero buttons not in a row '+width);
  if(result.broken.length)failures.push({slug,width,broken:result.broken});
  if(result.clippedPrices.length)failures.push({slug,width,clippedPrices:result.clippedPrices});
  if(width===1440)measurements.push({slug,heroHeight:await page.locator('.page-hero').evaluate(e=>e.offsetHeight)});
 }
 console.log('Checked width '+width);
}
for(const [slug,width] of [['balkony',1440],['okna-v-chastnyj-dom',1440],['dveri-pvh',390],['kontakty',1440],['balkony',390]]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4173/'+slug+'/');
 await page.locator('.page-hero').screenshot({path:`tmp/model-${slug}-${width}.png`,animations:'disabled',timeout:60000});
}
await browser.close();
fs.writeFileSync('tmp/page-layout-results.json',JSON.stringify({failures,measurements},null,2));
console.log(JSON.stringify({pages:Object.keys(componentPages).length,widths:10,failures},null,2));
if(failures.length)process.exitCode=1;
