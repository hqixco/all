import fs from 'node:fs';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import sharp from 'sharp';
const route='/oformlenie-fasadov/';const origin='https://xn----7sbbagavscye2ftg.xn--p1ai';
const source=load(fs.readFileSync('pages/oformlenie-fasadov/index.html','utf8'));
const $=load(fs.readFileSync('dist/oformlenie-fasadov/index.html','utf8'));
const pages=JSON.parse(fs.readFileSync('config/site-pages.json','utf8'));
assert.equal(pages.find(p=>p.url===route).indexable,false);
assert.equal($('meta[name="robots"]').attr('content'),'noindex, follow');
assert.equal($('link[rel="canonical"]').attr('href'),origin+route);
assert(!fs.readFileSync('dist/sitemap.xml','utf8').includes(route));
assert.equal($('h1').length,1);assert.equal($('h1').text(),'Оформление фасадов в Нижнем Новгороде');
assert.equal($('title').text(),'Оформление фасадов в Нижнем Новгороде на заказ — РПК Ресурс');
assert.equal($('main').text().replace(/\s+/g,' ').trim(),source('main').text().replace(/\s+/g,' ').trim());
const graph=JSON.parse($('script[type="application/ld+json"]').text())['@graph'];
const faq=graph.find(n=>n['@type']==='FAQPage');assert.equal(faq.mainEntity.length,8);
$('.facade__question').each((i,node)=>{assert.equal($(node).find('h3').text(),faq.mainEntity[i].name);assert.equal($(node).find('p').text(),faq.mainEntity[i].acceptedAnswer.text);});
const crumb=graph.find(n=>n['@type']==='BreadcrumbList');assert.equal(crumb.itemListElement.at(-1).item,origin+route);
const service=graph.find(n=>n['@type']==='Service');assert.equal(service.url,origin+route);assert.equal(service.areaServed.name,'Нижний Новгород');
for(const forbidden of ['offers','aggregateRating','review','price'])assert(!Object.hasOwn(service,forbidden));
const required=['services','naruzhnaya-reklama','fasadnye-vyveski','vyveski','obemnye-bukvy','svetovye-vyveski','svetovye-koroba','vxodnye-gruppy','frizy','panel-kronshtejny','dizajn','soglasovanie-naruzhnoj-reklamy','montazh-naruzhnoj-reklamy','portfolio','ceny','spar','malinka'];
for(const slug of required)assert($(`main a[href="/${slug}/"]`).length,slug);
for(const node of $('main a[href]').toArray()){
 const href=$(node).attr('href');if(href.startsWith('mailto:'))continue;
 if(href.startsWith('#'))assert($(href).length,href);
 else assert(pages.some(p=>p.url===href),href);
}
for(const node of $('main img').toArray()){
 const img=$(node);const path='dist'+img.attr('src');assert(fs.existsSync(path));const meta=await sharp(path).metadata();assert.equal(+img.attr('width'),meta.width);assert.equal(+img.attr('height'),meta.height);assert(img.attr('alt'));assert(fs.statSync(path).size<300000);
}
const form=$('.facade__form');assert.equal(form.attr('action'),'/mail.php');assert.equal(form.attr('method'),'post');assert.equal(form.find('[name="form-type"]').length,1);assert.equal(form.find('[name="form-type"]').attr('value'),'order');
for(const name of ['your-name','your-phone','acceptance-962'])assert(form.find(`[name="${name}"]`).is('[required]'));
const css=fs.readFileSync('dist/assets/facade.css','utf8');assert(!/@media[^{}]*(?:min-width|width\s*<=)/i.test(css));assert(!css.includes('!important'));assert(!/overflow-x\s*:\s*hidden/.test(css));
console.log('Facade audit: metadata, noindex, 8 matching FAQ answers, BreadcrumbList, Service, 17 required contextual destinations, images, native form and Safari-compatible media queries passed.');
