import fs from 'node:fs';
import {load} from 'cheerio';
if(!process.argv.includes('--from-layout-baseline')){console.log('One-time layout migration: use --from-layout-baseline explicitly; current HTML is not changed.');process.exit(0);}const pages=JSON.parse(fs.readFileSync('config/site-pages.json')),changes=[],decor=[],rules=[];
const before=p=>fs.readFileSync('tmp/legacy-layout-before/'+p.source,'utf8');
const sources=new Map(pages.map(p=>[p.url,load(before(p))]));
const photoFor=url=>{const q=sources.get(url);return q?.('main img').filter((i,n)=>q(n).attr('alt')?.trim()&&!q(n).closest('.primaries,.legacy__advantages,.partners,form').length).first().attr('src');};
let current='';
function decorCard($,node,url){const photo=photoFor(url);if(!photo)return;const key='legacy-layout__picture-'+decor.length;$(node).addClass('legacy-layout__picture '+key);rules.push('.'+key+'::before{background-image:url("'+photo+'")}');decor.push({page:current,link:url,photo,kind:'Decorative category image from linked existing source, no technical inference'});}
for(const p of pages){
 current=p.url;const $=load(before(p)),main=$('main');let changed=false;
 if(p.url==='/'){
  const carousel=$('.home__carousel'),intro=$('.home__hero'),directions=$('#home-directions');carousel.prependTo(main);
  carousel.find('h2.home__carousel-heading').remove();intro.find('.home__eyebrow').remove();
  carousel.after(directions);directions.after(intro);
  const grid=directions.find('.home__cards').first();grid.removeClass('home__cards legacy__cards').addClass('legacy-layout__directions');
  const notes=$('<div class="root__width legacy-layout__direction-notes"></div>');intro.append(notes);
  const art=grid.children('article');art.each((i,n)=>{$(n).removeClass('legacy__card').addClass('legacy-layout__direction');notes.append($(n).children('p'));});
  const imgs=['/assets/images/signs-hub-hero.webp','/assets/images/home-slide-services.webp','/assets/images/home-work-entrance.webp','/assets/images/home-slide-printing.webp','/assets/theme/img/icon-3.svg','/assets/images/home-work-vehicle.webp'];
  art.each((i,n)=>{const key='legacy-layout__direction-'+i;$(n).addClass(key);rules.push('.'+key+'::before{background-image:url("'+imgs[i]+'")}');decor.push({page:p.url,photo:imgs[i],kind:i===4?'Original interface graphic, not milling photo evidence':'Existing real category photo or illustration'});});
  main.addClass('legacy-layout--home');changed=true;
 }else if(main.hasClass('legacy-page--portfolio')){
  const hero=main.find('.legacy__hero').first(),gallery=main.find('.legacy__gallery,.box-gallery__grid').first();
  if(hero.length&&gallery.length){gallery.addClass('legacy__gallery');hero.addClass('legacy-layout__case-heading');const target=gallery.closest('section');hero.find('.legacy__links').filter((i,n)=>$(n).find('a').length&&!$(n).find('h1').length).each((i,n)=>{const block=$('<div class="legacy-layout__case-actions"></div>');target.after(block);block.append(n);});main.addClass('legacy-layout--case');if(gallery.find('img').length<=3)gallery.addClass('legacy-layout__small-gallery');changed=true;}
 }else if(main.hasClass('legacy-page--commercial')||main.hasClass('legacy-page--hub')){
  if(['/ceny/','/karta-sajta/'].includes(p.url))continue;
  const hero=main.find('.legacy__hero').first(),h1=hero.find('h1').first();if(!h1.length)continue;
  const host=hero.parent(),title=$('<div class="legacy-layout__title"></div>');if(!host.hasClass('root__width'))title.addClass('root__width');hero.before(title);title.append(h1);hero.removeClass('legacy__hero').addClass('legacy-layout__explanation');main.addClass('legacy-layout--product');
  const units=host.children('section,header,div').not(hero).not(title);let primary;
  if(p.url==='/vyveski/'){
   const catalog=$('<section class="root__width legacy-layout__catalog"><div class="legacy-layout__catalog-grid"></div></section>'),grid=catalog.find('div'),types=$('#signs-hub-elements'),articles=types.find('.signs-hub__element');
   const items=[['/fasadnye-vyveski/','.signs-hub__hero-photo'],['/obemnye-bukvy/','img[src="/assets/images/signs-hub-letters.webp"]'],['/svetovye-koroba/','img[src="/assets/images/signs-hub-lightbox.webp"]'],['/neonovye-vyveski/','img[src="/assets/images/signs-hub-neon.webp"]']];
   for(const [url,sel]of items){const art=articles.filter((i,n)=>$(n).find('h3 a').attr('href')===url).first(),fig=$(sel).is('figure')?$(sel):$(sel).closest('figure');art.addClass('legacy-layout__product-card');art.prepend(fig);fig.find('figcaption a').addClass('legacy__button');grid.append(art);}
   title.after(catalog);primary=catalog;const choose=$('#signs-hub-choice');catalog.after(choose);choose.addClass('legacy-layout__illustrated');choose.addClass('legacy-layout__band');choose.find('.signs-hub__choice>article').addClass('legacy-layout__illustrated-item');choose.after(hero);hero.after($('.signs-hub__jump'));const notes=$('<div class="legacy-layout__catalog-notes"></div>');hero.append(notes);catalog.find('.legacy-layout__product-card').each((i,n)=>{const note=$('<div></div>');note.append($(n).children('.signs-hub__number,p'));notes.append(note);});catalog.find('figcaption').each((i,n)=>{const last=$(n).contents().last(),a=$(n).find('a').last();if(last[0]?.type==='text'&&last.text().trim()==='.'&&a.length)a.append($('<span class="legacy-layout__caption-end"></span>').append(last));});const more=$('<div class="legacy-layout__selection-notes"></div>');hero.append(more);choose.find('.signs-hub__intro,.legacy-layout__illustrated-item>p').each((i,n)=>more.append(n));changed=true;
  }else{
   primary=units.filter((i,n)=>$(n).find('.legacy__cards a[href], [class$="__elements"] a[href]').length>=2).first();
   if(!primary.length)primary=units.filter((i,n)=>$(n).find('.legacy__gallery img').length>0).first();
   if(!primary.length)primary=units.filter((i,n)=>$(n).find('h2').length&&!$(n).find('form').length).first();
   if(primary.length){title.after(primary);primary.addClass('legacy-layout__catalog');const intro=primary.find('h2').first().parent().children('p');intro.remove();
    const grid=primary.find('.legacy__cards,[class$="__elements"]').first();if(grid.length){grid.addClass('legacy-layout__catalog-grid');const count=grid.children('article').length;if(count===2)grid.addClass('legacy-layout__catalog-grid--two');else if(count===3||count===6)grid.addClass('legacy-layout__catalog-grid--three');grid.children('article').each((i,n)=>{const url=$(n).find('a[href]').first().attr('href');$(n).addClass('legacy-layout__product-card');if(!$(n).find('img').length&&url)decorCard($,n,url);$(n).children('a[href]').last().addClass('legacy__button');});}
    const facts=units.filter((i,n)=>$(n).find('.legacy__advantages,.primaries').length||/Преимущества/.test($(n).find('h2').first().text())).first();if(facts.length&&facts[0]!==primary[0]){primary.after(facts);facts.after(hero);}else primary.after(hero);changed=true;
   }
   if(hero.find('figure').length)hero.addClass('legacy-layout__media-text');
  }
  hero.find('.legacy__split,[class$="__split"]').addClass('legacy-layout__content-flow');
 }
 if(changed){if(main.hasClass('legacy-layout--product')){const h1=main.find('h1').first();if(!h1.attr('id'))h1.attr('id','legacy-layout-title');main.find('.legacy-layout__explanation').attr('aria-labelledby',h1.attr('id'));}if(p.url==='/pechat/'){main.find('.legacy-layout__catalog .legacy-layout__product-card').eq(0).addClass('legacy-layout__picture legacy-layout__print-wide');main.find('.legacy-layout__catalog .legacy-layout__product-card').eq(1).addClass('legacy-layout__picture legacy-layout__print-interior');}if(p.url==='/vyveski-portfolio/'){main.addClass('legacy-layout--case-feature');const fig=main.find('.legacy__gallery>figure').first(),img=fig.find('img').first(),picture=$('<picture></picture>');picture.append($('<source>').attr({media:'(max-width:760px)',srcset:img.attr('src')}));picture.append($('<source>').attr('srcset',fig.find('a[href]').first().attr('href')));img.before(picture);picture.append(img);}main.find('section').filter((i,n)=>/Виды|вариант|направлен|работ|Преимущества|партн|Отзывы|Рассчитать|Обсудить/.test($(n).find('h2').first().text())&&!$(n).closest('.legacy__faq').length).addClass('legacy-layout__band');fs.writeFileSync(p.source,$.html());changes.push(p.url);}
}
fs.writeFileSync('tmp/legacy-layout-changes.json',JSON.stringify({pages:changes,decorativeImages:decor},null,2));
fs.writeFileSync('tmp/legacy-layout-picture-rules.css',rules.join('\n'));
console.log('Static layout reordered:',changes.length);
