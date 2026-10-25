import fs from 'node:fs';
import {createRequire} from 'node:module';
import {headerMarkup} from '../scripts/sync-header.mjs';
import {componentPages} from '../seo-pages/components/index.js';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const css=fs.readFileSync(process.argv.includes('--dist')?'dist/assets/header.css':'public/assets/header.css','utf8');
const failures=[];
for(const width of [2560,1920,1710,1700,1536,1440,1400,1366,1301,1300,1024,768,601,600,390,320]){
 await page.setViewportSize({width,height:900});
 for(const route of ['/',...Object.keys(componentPages).map(slug=>'/'+slug+'/')]){
  await page.setContent('<style>body{margin:0}'+css+'</style>'+headerMarkup(route));
  const result=await page.evaluate(()=>{
   const top=document.querySelector('.global-header__top');const box=top.getBoundingClientRect();const style=getComputedStyle(top);
   const right=box.right-parseFloat(style.paddingRight);const left=box.left+parseFloat(style.paddingLeft);
   return [...top.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>right+1||r.left<left-1)}).map(e=>({class:e.className,right:e.getBoundingClientRect().right,limit:right}));
  });
  if(result.length)failures.push({width,route,items:result});
 }
}
console.log(JSON.stringify({failures},null,2));
await browser.close();
if(failures.length)process.exitCode=1;
