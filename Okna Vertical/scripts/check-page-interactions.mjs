import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {componentPages} from '../seo-pages/components/index.js';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
await page.route(/https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
const failures=[];page.on('pageerror',e=>failures.push(e.message));
for(const [slug,config] of Object.entries(componentPages)){
 if(process.argv.length>2&&!process.argv.slice(2).includes(slug))continue;
 await page.goto('http://127.0.0.1:4173/'+slug+'/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(document.querySelector('.home-lead-form')?.dataset.calculatorReady)||!document.querySelector('.home-lead-form'));
 const primary=page.locator('[data-component="hero-actions"] .home-button');
 if(await primary.count()&&await primary.getAttribute('href')==='#calculator'){
  const label=await primary.locator('span').textContent();await primary.click();
  assert.equal(await page.locator('#package-modal-title').textContent(),label,slug+': hero modal context');
  await page.keyboard.press('Escape');
 }
 const quiz=page.locator('[data-component="quiz"]');
 if(await quiz.count()){
  for(let i=0;i<config.sections.choice.data.questions.length;i++){
   await quiz.locator('.quiz-option:visible').first().click();
   if(i<config.sections.choice.data.questions.length-1)await quiz.locator('.question-meta').filter({hasText:`Вопрос ${i+2} из`}).waitFor();
  }
  assert(await quiz.locator('.quiz-result').isVisible(),slug+': quiz result');
  assert(!(await quiz.locator('.quiz-result__form').innerHTML()).includes('Лоджия 3 м'),slug+': foreign result');
 }
 const installation=page.locator('[data-component="installation"]');
 if(await installation.count()){
  for(const tab of await installation.locator('.wall-tab').all()){
   await tab.click();const expected=await tab.getAttribute('data-wall-image');
   assert.equal(await installation.locator('.installation-diagram img').getAttribute('src'),expected,slug+': installation image');
   const key=await tab.getAttribute('data-wall-key');
   const details=config.sections.process.data.wallDetails?.[key];
   if(details)assert((await installation.locator('.installation-details').textContent()).includes(details[0][1]),slug+': installation copy');
  }
 }
 const gallery=page.locator('.case-photo[data-static-gallery]:visible').filter({has:page.locator('img:nth-of-type(2)')}).first();
 if(await gallery.count()){
  await gallery.locator('.case-slider__nav--next').click();
  assert(await gallery.locator('img:nth-of-type(2)').evaluate(e=>e.classList.contains('is-active')),slug+': gallery');
 }
 const calculator=page.locator('[data-component="calculator"]');
 if(await calculator.count()){
  const before=await calculator.locator('.home-calculator__price').textContent();
  const option=calculator.locator('input[name="installation"][value="yes"]');
  if(await option.count())await option.locator('..').click();
  else await calculator.locator('input[name="delivery"][value="yes"]').locator('..').click();
  const after=await calculator.locator('.home-calculator__price').textContent();assert.notEqual(after,before,slug+': calculator update');
  if(config.installments!==false){
   const total=Number(after.replace(/[^\d]/g,''));
   const monthly=Number((await calculator.locator('.card-installment__amount').textContent()).replace(/[^\d]/g,''));
   assert.equal(monthly,Math.ceil(total/36),slug+': monthly price');
  }
 }
 const form=page.locator('.home-lead-form').first();
 if(await form.count()){
  await form.locator('input[name="phone"]').fill('+7 (999) 123-45-67');
  const consent=form.locator('input[type="checkbox"][required]');
  await consent.focus();if(!await consent.isChecked())await consent.press('Space');
  assert(await consent.isChecked(),slug+': consent');
  await form.locator('button[type="submit"]').click();
  await page.waitForFunction(()=>document.querySelector('.home-form-status')?.textContent.includes('Спасибо'));
 }
 await page.locator('.global-header__photo').click();
 assert(await page.locator('.package-modal').evaluate(e=>e.classList.contains('is-open')),slug+': photo modal');
 await page.keyboard.press('Escape');
 assert(!(await page.locator('.package-modal').evaluate(e=>e.classList.contains('is-open'))),slug+': modal close');
 console.log('Interactions: '+slug);
}
const staticContext=await browser.newContext({javaScriptEnabled:false});const staticPage=await staticContext.newPage();
for(const slug of Object.keys(componentPages)){
 await staticPage.goto('http://127.0.0.1:4173/'+slug+'/',{waitUntil:'domcontentloaded'});
 assert(await staticPage.locator('main h1').isVisible(),slug+': static hero');
 assert((await staticPage.locator('main section').count())>=componentPages[slug].order.length,slug+': static sections');
}
await browser.close();
console.log(JSON.stringify({pages:Object.keys(componentPages).length,withoutJavascript:true,failures},null,2));
if(failures.length)process.exitCode=1;
