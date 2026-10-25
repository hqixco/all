import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.route('**/*',route=>route.abort());
const css=fs.readFileSync('dist/assets/main.css','utf8');
const failures=[];let count=0;
for(const file of ['dist/index.html','dist/okna-v-kvartiru/index.html','dist/osteklenie-kottedzhey/index.html','dist/balkony/index.html']){
 const html=fs.readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');
 for(const width of [1920,1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.setContent(html,{waitUntil:'domcontentloaded'});
  await page.addStyleTag({content:css});
  const values=await page.locator('.contact-method-select').evaluateAll(elements=>elements.map(e=>({font:getComputedStyle(e).fontSize,context:e.parentElement.parentElement.className})));
  count+=values.length;
  for(const value of values)if(value.font!=='12px')failures.push({file,width,...value});
 }
}
await browser.close();
console.log(JSON.stringify({count,failures},null,2));
if(failures.length)process.exitCode=1;
