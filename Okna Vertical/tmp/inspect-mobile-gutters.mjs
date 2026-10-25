import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:900}});await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 for(const slug of ['', 'okna-v-chastnyj-dom']){
  await page.goto('http://127.0.0.1:4173/'+(slug?slug+'/':''),{waitUntil:'domcontentloaded'});
  console.log(JSON.stringify({slug,sections:await page.locator('main > section').evaluateAll(sections=>sections.filter(e=>e.getBoundingClientRect().width).map(e=>{const heading=e.querySelector('h2,h1');const container=e.querySelector('.home-wrap,.reviews-container,.installation-container,.cases-container,.compare-container,.quiz-container,.warranty-container');return {class:e.className,sectionX:e.getBoundingClientRect().x,padding:getComputedStyle(e).padding,container:container?.className,containerX:container?.getBoundingClientRect().x,containerPadding:container?getComputedStyle(container).padding:null,headingX:heading?.getBoundingClientRect().x};}))},null,2));
 }
}finally{await browser.close();}
