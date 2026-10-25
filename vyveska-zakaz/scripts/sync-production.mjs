import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const records=JSON.parse(await fs.readFile('config/shared-production.json','utf8'));
const home=cheerio.load(await fs.readFile('index.html','utf8'));
const reference=home('#home-production').toString();
for(const r of records){const $=cheerio.load(await fs.readFile(r.source,'utf8')),old=$('.'+r.selector);if(old.length!==1)throw Error(r.url);
 const t=cheerio.load(reference),block=t('section').first();block.attr('class','home__section legacy__section home__section--production production-block '+r.selector).attr('id',r.id).attr('aria-labelledby',r.id+'-title');
 const wrapper=block.find('.home-production__wrapper');wrapper.removeClass('root__width');wrapper.children('h2').attr('id',r.id+'-title').text(r.title);wrapper.children('p').remove();const grid=wrapper.children('.home__production-links');
 for(const html of r.paragraphs)grid.before(t('<p class="home-production__wrapper-text"></p>').html(html));
 if(r.url==='/services/')block.find('.home-production__wrapper-link').attr('href','/services/').text('Все услуги компании');else block.find('.home-production__wrapper-link').attr('href','/services/').text('Перейти в полный каталог');
 if(r.popupActions){
  const requestButton=(action,text)=>t('<button class="legacy__button home-production__request" type="button" data-fancybox="" data-src="#formModalOrder"></button>').text(text).attr({'data-service-popup-title':action.title,'data-service-popup-placeholder':action.placeholder,'data-request-title':action.title,'data-request-context':action.title+' — производство для рекламного агентства','data-request-placeholder':action.placeholder,'data-request-submit':'Получить расчёт','aria-label':action.title});
  grid.children('a').each((i,node)=>{
   const link=t(node),label=link.find('h3').text().trim(),action=r.popupActions.find(item=>item.label===label);
   if(!action)throw Error('Production popup missing: '+label);
   const card=t('<article></article>').attr('class',link.attr('class'));
   card.append(link.contents());card.find('.home-production__card-action').replaceWith(requestButton(action,action.button).addClass('home-production__request--card'));
   link.replaceWith(card);
  });
  block.find('.home-production__wrapper-link').replaceWith(requestButton(r.catalogPopup,r.catalogPopup.button));
 }
 old.replaceWith(block.toString());for(const asset of ['production.css','shared-layout.css'])if(!$('link[href="/assets/'+asset+'"]').length)$('head').append('<link rel="stylesheet" href="/assets/'+asset+'">');await fs.writeFile(r.source,$.html());}
console.log('Shared production synchronized: '+records.length+' blocks');
