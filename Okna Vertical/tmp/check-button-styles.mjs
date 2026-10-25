import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
for (const route of ['/','/balkony/','/okna-v-kvartiru/','/okna-v-chastnyj-dom/']) {
 await page.goto('http://127.0.0.1:4173'+route);
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  console.log(await page.evaluate(()=>({route:location.pathname,width:innerWidth,different:[...document.querySelectorAll('button,.button,.home-button,.home-hero__measure,.home-hero__works-button,.apartment-hero__measure,.global-header__photo,.reviews-platform-button,.service-link')].filter(el=>getComputedStyle(el).borderRadius!=='13px').map(el=>({class:el.className,radius:getComputedStyle(el).borderRadius})).filter((item,index,items)=>items.findIndex(other=>other.class===item.class&&other.radius===item.radius)===index)})));
 }
}
await browser.close();
