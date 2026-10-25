import fs from 'node:fs';
import path from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright';

const server=await preview({preview:{host:'127.0.0.1',port:5180}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const slugs=['zamena-krovli','pristroyki','uteplenie-fasadov','zamena-polov','karkasnye-doma'];
const errors=[];
try {
for(const slug of slugs) {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(slug+': '+e.message));
 await page.route('https://**/*',route=>route.abort());
 await page.goto('http://127.0.0.1:5180/'+slug+'/');
 const result=await page.evaluate(()=>({title:document.title,overflows:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),modals:document.querySelectorAll('.estimate-modal').length,cases:document.querySelectorAll('.case-card').length}));
 if(result.broken.length||result.overflows||result.modals!==1)errors.push({slug,...result});
 await page.locator('.hero-actions .button-accent').click();
 if(!await page.locator('.estimate-modal').evaluate(el=>el.classList.contains('is-open')))errors.push(slug+': popup failed');
 await page.locator('.estimate-modal__close').click();
 await page.locator('.case-photo__open').first().click();
 if(!await page.locator('.gallery-modal').evaluate(el=>el.hasAttribute('open')))errors.push(slug+': gallery failed');
 await page.locator('.gallery-modal__close').click();
 await page.waitForTimeout(200);
 await page.locator('.quiz-option').first().click();
 await page.waitForTimeout(350);
 if(!await page.locator('.quiz-options input[name="quiz-answer-1"]').count())errors.push(slug+': quiz failed');
 await page.setViewportSize({width:390,height:844});
 await page.locator('.header-menu-toggle').click();
 if(await page.locator('.header-menu-toggle').getAttribute('aria-expanded')!=='true')errors.push(slug+': mobile menu failed');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push(slug+': mobile overflow');
 if(slug==='zamena-krovli') {
   await page.locator('.header-menu-toggle').click();
   await page.waitForTimeout(350);
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:'preview-mobile.png'});
   await page.setViewportSize({width:1440,height:1000});
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:'preview-desktop.png'});
 }
 await page.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});
 const staticPage=await nojs.newPage();
 await staticPage.goto('http://127.0.0.1:5180/'+slug+'/');
 if(!await staticPage.locator('.case-card').count()||!await staticPage.locator('.quiz-option').count())errors.push(slug+': missing static content');
 await nojs.close();
 console.log('Checked',slug,result.title);
}
for(const file of fs.readdirSync('dist/assets'))if(!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(file))errors.push('Invalid name: '+file);
function scan(dir) {
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
   const file=path.join(dir,entry.name);
   if(entry.isDirectory())scan(file);
   else if(/\.(html|css|js)$/.test(file)) {
     const text=fs.readFileSync(file,'utf8');
     if(/<br\s*\/?\s*>/i.test(text))errors.push(file+': forced break');
     if(/stroy-servis|Строй Сервис/i.test(text))errors.push(file+': old brand');
     if(file.endsWith('.css')&&/@media[^{}]*(?:min-width|width\s*[<>])/.test(text))errors.push(file+': invalid media query');
     for(const match of text.matchAll(/\/assets\/([a-zA-Z0-9._-]+\.[a-zA-Z0-9]+)/g))if(!fs.existsSync('dist/assets/'+match[1]))errors.push(file+': missing asset '+match[1]);
   }
 }
}
scan('dist');
console.log(JSON.stringify({errors},null,2));
if(errors.length)process.exitCode=1;
}finally {await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
