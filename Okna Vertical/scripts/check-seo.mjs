import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import { pages } from '../seo-pages/data.js';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const errors = [];
const titles = new Set();
for (const p of pages) {
 const html = fs.readFileSync(`dist/${p.slug}/index.html`,'utf8');
 const title = html.match(/<title>(.*?)<\/title>/)[1];
 if(titles.has(title)) errors.push('Duplicate title '+p.slug); titles.add(title);
 if((html.match(/<h1[ >]/g)||[]).length!==1) errors.push('H1 '+p.slug);
 if(!html.includes(`rel="canonical" href="https://okna-vertical.ru/${p.slug}/"`)) errors.push('Canonical '+p.slug);
 for(const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
  let file = 'dist'+decodeURI(m[1]);
  if(file.endsWith('/'))file+='index.html';
  if(!fs.existsSync(file))errors.push('Missing '+m[1]);
 }
 for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) JSON.parse(m[1]);
}
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
page.on('pageerror',e=>{ errors.push('JS '+e.message); console.log('JS ERROR',e.message); });
await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
let checked=0;
for(const width of [1440,1024,768,390]) {
 await page.setViewportSize({width,height:900});
 for(const slug of ['', 'balkony',...pages.map(p=>p.slug)]) {
 const response = await page.goto('http://127.0.0.1:4173/'+(slug?slug+'/':''), {waitUntil:'domcontentloaded'});
 await page.waitForTimeout(80);
  if(response.status()!==200)errors.push('Status '+slug+' '+response.status());
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  if(overflow)errors.push(`Overflow ${slug} ${width}`);
  checked++;
 }
 await page.goto('http://127.0.0.1:4173/okna-v-kvartiru/');
 await page.screenshot({path:`tmp/seo-${width}.png`,fullPage:true});
}
const response = await page.goto('http://127.0.0.1:4173/test-404-page-xyz/');
if(response.status()!==404)errors.push('404 status '+response.status());
await page.goto('http://127.0.0.1:4173/okna-v-kvartiru/');
await page.locator('.seo-form input[name=phone]').fill('+7 (999) 123-45-67');
await page.locator('.seo-form input[type=checkbox]').check();
await page.locator('.seo-form button').click();
await page.waitForTimeout(800);
if(!(await page.locator('.home-form-status').textContent({timeout:2000}).catch(()=>'' )).includes('Спасибо')) errors.push('Local form submission failed at '+page.url());
await page.goto('http://127.0.0.1:4173/portfolio/');
await page.locator('#project-filter').selectOption('apartments');
if(await page.locator('[data-project-type="houses"]:visible').count())errors.push('Filter failed');
for (const slug of ['', 'balkony/']) {
 await page.goto('http://127.0.0.1:4173/'+slug);
 const form = page.locator('.home-lead-form');
 await form.locator('input[name=phone]').fill('+7 (999) 123-45-67');
 await form.locator('input[type=checkbox][required]').check();
 await form.locator('button[type=submit]').click();
 await page.waitForTimeout(800);
 if(!(await form.locator('.home-form-status').textContent()).includes('Спасибо')) errors.push('Existing form failed '+slug);
}
await browser.close();
fs.writeFileSync('tmp/seo-check.json',JSON.stringify({checked,errors},null,2));
console.log(JSON.stringify({checked,errors},null,2));
if(errors.length)process.exitCode=1;
