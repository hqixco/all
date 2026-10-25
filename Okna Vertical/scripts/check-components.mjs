import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderComponent, renderPageComponent, faqEntries } from './components.mjs';
import { scopeSections } from './page-sections.mjs';
import { apartmentPage } from '../seo-pages/components/apartment.js';
import { homeComponents } from '../seo-pages/components/home.js';
import { componentPages } from '../seo-pages/components/index.js';
import { calculateEstimate } from '../src/components/calculator.js';
import { relatedCards } from '../seo-pages/components/related.js';

const relatedByDestination=new Map();
function verifyNoBreaks(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=directory+'/'+entry.name;
  if(entry.isDirectory())verifyNoBreaks(file);
  else if(entry.name.endsWith('.html'))assert(!/<br\b[^>]*>/i.test(fs.readFileSync(file,'utf8')),`${file}: br tags are forbidden`);
 }
}
verifyNoBreaks('dist');
for(const config of [homeComponents,...Object.values(componentPages)]){
 for(const [key,block]of Object.entries(config.sections)){
  if(block.component==='related')for(const item of block.data.items){
   const existing=relatedByDestination.get(item.href);
   if(existing)assert.deepEqual(item,existing,`${config.prefix}: related destination must have identical data on every page`);
   else relatedByDestination.set(item.href,item);
   const shared=relatedCards[item.href.split('/')[1]];
   if(shared)assert.deepEqual(item,shared,`${config.prefix}: related card must use shared destination data`);
  }
  if(key==='calculator')assert.equal(block.component,'calculator',`${config.prefix}: calculator must not be replaced by a consultation form`);
  const html=renderPageComponent(config,key);
  assert(!/<br\b[^>]*>/i.test(html),`${config.prefix}/${key}: br tags are forbidden`);
  assert(!/{{|collection-/.test(html),`${key}: unresolved template`);
  assert(html.includes(`data-component="${block.component}"`),`${key}: component hook`);
 }
}
// Prove that another route can reuse every layout without apartment selectors.
const page=JSON.parse(JSON.stringify(apartmentPage));
page.prefix='sample';page.sections.hero.data.titleHtml='Окна для нового объекта';
page.sections.solutions.data.items=page.sections.solutions.data.items.slice(0,2);
page.sections.cases.data.items=page.sections.cases.data.items.slice(0,1);
page.sections.cases.data.items[0].photos.push({src:'/assets/apartment-window-2.webp',alt:'Второе фото'});
page.sections.choice.data.questions=[{title:'Новая задача?',description:'Подбор для нового объекта.',options:['Первый вариант','Второй вариант']}];
const content=scopeSections(page.order.map(key=>renderPageComponent(page,key)).join(''),'sample-route',page.order,page.prefix);
for(const key of page.order)assert(content.includes('sample-'+key),key+': reusable scope');
assert(!/class="[^"]*\bapartment-/.test(content),'page classes leaked into shared templates');
assert.equal((renderPageComponent(page,'solutions').match(/class="home-product-card"/g)||[]).length,2);
assert(renderPageComponent(page,'cases').includes('aria-label="Показать фото 2"'));
assert(renderPageComponent(page,'choice').includes('Вопрос 1 из 1'));
assert.equal(faqEntries(page).length,9);
assert.throws(()=>renderComponent('related',{titleHtml:'Missing cards'}),/related.items/);
// A second calculator has distinct ids and a server-rendered custom price.
const calculator=renderComponent('calculator',{...page.sections.calculator.data,id:'second-calculator',model:{basePrice:10000}});
assert(calculator.includes('id="second-calculator-window-width"'));
assert(calculator.includes('от 10'));
const values=new Map([['windows_count',2],['installation_place','apartment'],['window_width',1300],['window_height',1400]]);
assert.equal(calculateEstimate(values),8350);
values.set('installation','yes');values.set('delivery','yes');
assert.equal(calculateEstimate(values),13250);
assert.equal(calculateEstimate(values,{basePrice:10000}),14900);
for(const file of ['dist/index.html','dist/okna-v-kvartiru/index.html']){
 const html=fs.readFileSync(file,'utf8');
 assert(!/{{|collection-/.test(html),`${file}: unresolved template`);
 for(const component of ['products','quiz','cases','included','installation','reviews','faq','calculator','footer'])assert(html.includes(`data-component="${component}"`),`${file}: ${component} missing`);
}
for(const [slug,config]of Object.entries(componentPages)){
 if(!config.sections.hero.data.products.length)continue;
 const html=fs.readFileSync(`dist/${slug}/index.html`,'utf8');
 const heroImages=[...html.matchAll(/<(?:button|a) class="home-hero-card"[^>]*><img[^>]*src="([^"]+)"/g)].map(match=>match[1]);
 const productImages=[...html.matchAll(/<div class="home-product-card__visual"><img[^>]*src="([^"]+)"/g)].map(match=>match[1]);
 if(config.order.some(key=>config.sections[key].component==='products'))assert.deepEqual(productImages,heroImages,`${slug}: product photos differ from hero`);
 const quiz=html.match(/<script type="application\/json" data-quiz-questions="">([\s\S]*?)<\/script>/);
 if(quiz)assert.deepEqual(JSON.parse(quiz[1])[0].images,heroImages,`${slug}: quiz photos differ from hero`);
 for(const src of heroImages)assert(fs.existsSync('dist'+src),`${slug}: missing photo ${src}`);
}
const installationCalculator=componentPages['montazh-okon'].sections.calculator.data;
const installationValues=new Map([['windows_count',2],['window_width',1300],['window_height',1400],['installation_place','apartment']]);
assert.equal(calculateEstimate(installationValues,installationCalculator.model),3150);
installationValues.set('installation','yes');
assert.equal(calculateEstimate(installationValues,installationCalculator.model),3150,'Installation charged twice');
installationValues.set('dismantling','yes');
assert.equal(calculateEstimate(installationValues,installationCalculator.model),4250);
const installationHtml=fs.readFileSync('dist/montazh-okon/index.html','utf8');
assert(!installationHtml.includes('Нужен монтаж?'),'Installation question remains on installation page');
assert(fs.readFileSync('dist/okna-v-kvartiru/index.html','utf8').includes('Нужен монтаж?'),'Installation option missing from window calculator');
console.log('Shared templates, nested collections, new-page reuse, static HTML, calculator models and subpage product photos passed.');
