import fs from 'node:fs/promises';
import {load} from 'cheerio';
const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));
let converted=0;
for(const page of pages){
 let html=await fs.readFile(page.source,'utf8');
 const $=load(html);
 const topic=page.label || $('h1').first().text().trim();
 $('a.home-production__wrapper-link[href*="#"]').attr('href','/services/');
 $('main a[href^="#"]').each((i,node)=>{
  const a=$(node),href=a.attr('href');
  if(a.is('[data-fancybox]')||!/button|btn/.test(a.attr('class')||''))return;
  const text=a.text().trim();
  if(/расч[её]т|рассчитать|обсудить|оценку|заявк|передать проект/i.test(text)){
   const button=$('<button></button>');
   for(const [key,value] of Object.entries(node.attribs))if(key!=='href')button.attr(key,value);
   button.attr({type:'button','data-fancybox':'','data-src':'#formModalOrder','data-request-action':text}).html(a.html());
   a.replaceWith(button);converted++;
  }else{
   a.attr('class',(a.attr('class')||'').split(/\s+/).filter(c=>!/button|btn/.test(c)).join(' '));
  }
 });
 $('[data-src="#formModalOrder"]').each((i,node)=>{
  const button=$(node),text=button.attr('data-request-action')||button.text().trim();
  const title=button.attr('data-service-popup-title') || (button.attr('data-case-order')?'Расчёт по примеру: '+button.attr('data-case-order'):text && !/^(получить расч[её]т|запросить расч[её]т|оставить заявку|онлайн заявка)$/i.test(text)?text:'Расчёт: '+topic);
  const context=title+' — '+topic;
  const hint=button.attr('data-service-popup-placeholder') || (/pechat|plotternaya/.test(page.url)?'Укажите материал, размеры, тираж и сроки. Макет можно обсудить с менеджером.':/frezerovka/.test(page.url)?'Укажите материал, толщину, размеры деталей, количество и сроки.':/remont/.test(page.url)?'Опишите неисправность, размеры вывески и высоту установки. Прикрепите фото повреждений.':/montazh|soglasovanie/.test(page.url)?'Укажите адрес, тип конструкции, размеры и необходимые работы.':/brendirovanie/.test(page.url)?'Укажите модель автомобиля, количество машин и желаемую площадь оклейки.':/dizajn/.test(page.url)?'Расскажите, для чего нужен макет, есть ли логотип, размеры и пожелания по оформлению.':/seti-magazinov/.test(page.url)?'Укажите количество магазинов, города, состав оформления и сроки.':'Укажите размеры, количество, место размещения и желаемые сроки.');
  button.attr({'data-request-title':title,'data-request-context':context,'data-request-placeholder':hint,'data-request-submit':/обсудить|передать/i.test(text)?'Отправить запрос':'Получить расчёт'});
 });
 const form=$('#formModalOrder form');
 if(form.length&&!form.find('[name="request-context"]').length)form.prepend('<input type="hidden" name="request-context" value="">');
 await fs.writeFile(page.source,$.html());
}
console.log('Contextual request actions synchronized: '+pages.length+' pages, '+converted+' anchor buttons replaced');
