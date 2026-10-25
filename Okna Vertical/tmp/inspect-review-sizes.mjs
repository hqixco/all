import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 for(const width of [767,480,390,320]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  console.log(await page.locator('.review-card').first().evaluate((card,width)=>{const star=card.querySelector('strong svg'),chip=card.querySelector('.review-card__topic');return {width,stars:[getComputedStyle(star).width,getComputedStyle(star).height],chipFont:getComputedStyle(chip).fontSize,chipPadding:getComputedStyle(chip).padding};},width));
 }
}finally{await browser.close();}
