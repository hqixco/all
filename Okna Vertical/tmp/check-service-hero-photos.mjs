import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
for(const width of [1440,1100,900,767,380]){await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4173/teploe-osteklenie-balkonov/');const images=await page.locator('.home-hero-card img').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0,width:Math.round(img.getBoundingClientRect().width)})));if(images.length!==3||images.some(i=>!i.loaded||!i.src.includes('related-')))throw Error('Hero images mismatch: '+JSON.stringify(images));console.log(width,JSON.stringify(images));if(width===1440)await page.locator('.home-hero__products').screenshot({path:'tmp/warm-hero-photos-preview.png'});}
await browser.close();
