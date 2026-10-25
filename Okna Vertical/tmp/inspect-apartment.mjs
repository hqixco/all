import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
page.on('pageerror',error=>console.log(error.message));
await page.goto('http://127.0.0.1:4173/okna-v-kvartiru/');
for (const width of [1920,1536,1440,1024,768,767,390,320]) {
 await page.setViewportSize({width,height:1000});
 await page.locator('.apartment-hero__products').scrollIntoViewIfNeeded();
 console.log(await page.evaluate(()=>({width:innerWidth,edges:[".global-header__top",".global-header__nav-inner",".apartment-hero__content"].map(selector=>{const element=document.querySelector(selector);const rect=element.getBoundingClientRect();const css=getComputedStyle(element);return {selector,left:rect.left+parseFloat(css.paddingLeft),right:rect.right-parseFloat(css.paddingRight)};}),overflow:document.documentElement.scrollWidth>innerWidth,cards:document.querySelectorAll('.apartment-hero__products .home-hero-card').length,images:[...document.querySelectorAll('.apartment-hero__products img')].map(img=>({loaded:img.complete&&img.naturalWidth>0,sourceWidth:img.naturalWidth,displayWidth:Math.round(img.getBoundingClientRect().width)}))})));
 if(width===390) await page.screenshot({path:'tmp/apartment-tiles-mobile.png'});
}
await browser.close();
