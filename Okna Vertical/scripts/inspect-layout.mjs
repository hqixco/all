import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>console.log(e.stack));
await page.goto('http://127.0.0.1:4173/okna-v-kvartiru/');
console.log(await page.evaluate(()=>({width:document.documentElement.scrollWidth,header:document.querySelector('header').outerHTML,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right})).slice(0,15)})));
await page.screenshot({path:'tmp/header.png'});
for (const width of [1440,1024,768,390]) {
 await page.setViewportSize({width,height:1000});
 await page.screenshot({path:`tmp/hero-${width}.png`});
 console.log(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,benefits:document.querySelectorAll('.seo-hero-benefit').length})));
}
await browser.close();
