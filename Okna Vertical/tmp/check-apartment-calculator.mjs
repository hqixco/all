import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
await page.goto('http://127.0.0.1:4173/okna-v-kvartiru/');
const calc=page.locator('.apartment-calculator');
if(await calc.count()!==1)throw Error('calculator count');
if(await calc.locator('.home-calculator__form').count()!==1)throw Error('form missing');
if(await calc.locator('[name="installation_place"]').count()!==1)throw Error('place count');
const price=calc.locator('.home-calculator__price');
const initial=await price.textContent();
await calc.locator('.home-calc-options--count label').filter({hasText:'3–5 окон'}).click();
if(await price.textContent()===initial)throw Error('count does not update price');
await calc.locator('[name="window_width"]').evaluate(el=>{el.value='2000';el.dispatchEvent(new Event('input',{bubbles:true}));});
if(!(await calc.locator('output[for="home-window-width"]').textContent()).includes('2000'))throw Error('range does not update');
for(const width of [1440,1100,900,390]){
 await page.setViewportSize({width,height:1000});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('overflow '+width);
 console.log(width, await calc.locator('.home-calculator__visual').evaluate(el=>Math.round(el.getBoundingClientRect().width)));
}
await browser.close();
console.log('Calculator controls and responsive layout passed');

