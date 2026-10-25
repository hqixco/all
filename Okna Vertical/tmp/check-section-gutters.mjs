import {createRequire} from 'node:module';
import {componentPages} from '../seo-pages/components/index.js';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.route(/https?:\/\/(?!127\.0\.0\.1)|\.mp4(?:\?|$)/,r=>r.abort());const failures=[];
 for(const width of [480,320]){
  await page.setViewportSize({width,height:900});
  for(const slug of ['',...Object.keys(componentPages)]){
   await page.goto('http://127.0.0.1:4173/'+(slug?slug+'/':''),{waitUntil:'domcontentloaded'});
   const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,wraps:[...document.querySelectorAll('main .home-wrap')].filter(e=>e.getBoundingClientRect().width).map(e=>({class:e.className,left:getComputedStyle(e).paddingLeft,right:getComputedStyle(e).paddingRight})),reviewX:document.querySelector('.reviews-container')?.getBoundingClientRect().x}));
   if(result.overflow)failures.push({slug,width,overflow:true});
   for(const wrap of result.wraps)if(wrap.left!=='10px'||wrap.right!=='10px')failures.push({slug,width,wrap});
   if(result.reviewX!==undefined&&Math.abs(result.reviewX-10)>1)failures.push({slug,width,reviewX:result.reviewX});
  }
  console.log('Checked width '+width);
 }
 console.log(JSON.stringify({pages:Object.keys(componentPages).length+1,failures},null,2));if(failures.length)process.exitCode=1;
}finally{await browser.close();}
