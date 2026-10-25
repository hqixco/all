import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
for(const route of ['/','/okna-v-kvartiru/']){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173'+route);
 for(const width of [1440,1100,900,390]){
  await page.setViewportSize({width,height:900});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(route+' overflow '+width);
 }
 const quiz=page.locator('main [data-static-quiz]');if(await quiz.count()!==1)throw Error('Quiz count '+route);
 const cases=page.locator('main [data-component="cases"]');await cases.scrollIntoViewIfNeeded();
 const controls=cases.locator('.case-slider__nav--next:visible');if(await controls.count()){await controls.first().click();const images=controls.first().locator('..').locator('img.is-active');if(await images.count()!==1)throw Error('Gallery selection');}
 const install=page.locator('main [data-component="installation"]');await install.locator('[data-wall-key="brick"]').click();
 if(!(await install.locator('.installation-diagram img').getAttribute('src')).includes('brick'))throw Error('Installation '+route);
 const calc=page.locator('main [data-component="calculator"]');const price=calc.locator('.home-calculator__price');const original=await price.textContent();
 await calc.locator('.home-calc-options--count label').filter({hasText:'3–5 окон'}).click();if(await price.textContent()===original)throw Error('Calculator '+route);
 await calc.locator('[name="window_width"]').evaluate(input=>{input.value='2000';input.dispatchEvent(new Event('input',{bubbles:true}));});if(!(await calc.locator('.home-calc-sizes output').first().textContent()).includes('2000'))throw Error('Range '+route);
 await calc.locator('[name="phone"]').fill('9991234567');await calc.locator('.home-consent input').check({force:true});await calc.locator('button[type="submit"]').click();await calc.locator('.home-form-status').filter({hasText:'Спасибо'}).waitFor();
 const faq=page.locator('main [data-component="faq"] details').first();await faq.locator('summary').click();if(await faq.getAttribute('open')===null)throw Error('FAQ '+route);
 const product=page.locator('main [data-component="products"] .home-product-card__button').first();await product.click();if(!await page.locator('.package-modal.is-open').count())throw Error('Product popup '+route);await page.keyboard.press('Escape');
 for(let step=0;step<5;step++){await quiz.locator('.quiz-option:not([hidden])').first().click();await page.waitForTimeout(300);}
 if(!await quiz.locator('.quiz-result').isVisible())throw Error('Quiz result '+route);
 await quiz.locator('[name="phone"]').fill('9991234567');await quiz.locator('[name="policy"]').check({force:true});await quiz.locator('button[type="submit"]').click();await quiz.locator('.quiz-success').waitFor({state:'visible'});
 if(errors.length)throw Error(route+' JS errors: '+errors.join('|'));
 await page.setViewportSize({width:1440,height:1000});await page.locator('main').first().locator('section').first().screenshot({path:route==='/'?'tmp/components-home-hero.png':'tmp/components-apartment-hero.png'});
 console.log(route+' interactive blocks, forms and four viewport widths passed');await page.close();
}
for(const route of ['/','/okna-v-kvartiru/']){
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:4173'+route);
 for(const name of ['quiz','cases','products','included','installation','reviews','faq','calculator'])if(!await page.locator(`main [data-component="${name}"]`).first().isVisible())throw Error(route+' no-JS '+name);
 const order=await page.locator('main').first().locator(':scope > section').evaluateAll(sections=>sections.slice(0,3).map(s=>s.dataset.component||s.className));
 if(order[1]!=='quiz'||order[2]!=='cases')throw Error(route+' initial order '+order.join(','));
 console.log(route+' static content and quiz/cases order passed without JavaScript');await context.close();
}
for(const route of ['/balkony/','/osteklenie-kottedzhey/']){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173'+route);if(errors.length)throw Error(route+' '+errors.join('|'));console.log(route+' smoke check passed');await page.close();
}
await browser.close();

