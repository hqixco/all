import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
const dirs=fs.readdirSync('dist',{withFileTypes:true}).filter(d=>d.isDirectory()&&fs.existsSync('dist/'+d.name+'/index.html'));
const seen=new Map();let count=0;
for(const d of dirs){const html=fs.readFileSync('dist/'+d.name+'/index.html','utf8');for(const m of html.matchAll(/<a class="related-card"[\s\S]*?<\/a>/g)){const src=m[0].match(/src="([^"]+)"/)[1];if(!fs.existsSync('dist'+src))throw Error('Missing '+src);seen.set(m[0].match(/href="([^"]+)"/)[1],src);count++;}}
console.log('All '+count+' related-card asset links exist');console.log(JSON.stringify([...seen],null,2));
for(const width of [1440,1100,768,600,380]){await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:4173/garantiya/');await page.locator('.related-grid').scrollIntoViewIfNeeded();await page.waitForTimeout(250);console.log(width,await page.locator('.related-card > img').evaluateAll(imgs=>imgs.map(img=>({width:Math.round(img.getBoundingClientRect().width),loaded:img.complete&&img.naturalWidth>0}))));if(width===1100)await page.locator('.related-section').screenshot({path:'tmp/related-photos-preview.png'});}
await browser.close();
