import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());const failures=[];
 for(const width of [767,480,390,320]){
  await page.setViewportSize({width,height:900});
  for(const slug of ['', 'okna-v-kvartiru','okna-v-chastnyj-dom','panoramnye-okna','balkony']){
   await page.goto('http://127.0.0.1:4173/'+(slug?slug+'/':''),{waitUntil:'domcontentloaded'});
   const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...document.querySelectorAll('.card-price-row')].filter(e=>{const card=e.closest('.home-hero-card,.home-product-card,.case-card');if(!card||!card.getBoundingClientRect().width)return false;return [...e.children].some(child=>child.getBoundingClientRect().right>card.getBoundingClientRect().right+1);}).map(e=>e.textContent.trim()),fonts:[...document.querySelectorAll('.home-hero-card .card-price-row b,.home-product-card .card-price-row > strong,.home-product-card .card-installment__amount')].slice(0,8).map(e=>({class:e.className||e.tagName,size:getComputedStyle(e).fontSize}))}));
   const stacked=await page.locator('.home-hero-card .card-price-row,.home-product-card .card-price-row').evaluateAll(rows=>rows.some(row=>getComputedStyle(row).flexDirection==='column'));
   if(result.overflow||result.clipped.length||stacked)failures.push({slug,width,stacked,...result});
   if(slug==='')console.log(JSON.stringify({width,fonts:result.fonts}));
   if(width===390&&slug===''){await page.locator('.home-hero__products').screenshot({path:'tmp/mobile-hero-prices.png'});await page.locator('.home-product-grid').first().screenshot({path:'tmp/mobile-product-prices.png'});}
  }
 }
 console.log(JSON.stringify({checked:20,failures},null,2));if(failures.length)process.exitCode=1;
}finally{await browser.close();}
