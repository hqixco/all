import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { popupButtons } from './popup-buttons.mjs';
import { syncHomeComponents } from './sync-home-components.mjs';
import { renderComponent, renderPageComponent, faqEntries } from './components.mjs';
import { componentPages } from '../seo-pages/components/index.js';
import { serviceMetadata } from '../seo-pages/components/service-pages.js';
import { legalContent } from '../seo-pages/components/legal.js';
import { pages } from '../seo-pages/data.js';
import { crossLinks } from '../seo-pages/components/cross-links.js';
import { addCardInstallments, addCalculatorInstallments } from './card-installments.mjs';
import { scopeSections } from './page-sections.mjs';
import { headerMarkup, photoModalMarkup, footerMenuMarkup, syncFooterMenus } from './sync-header.mjs';
const origin='https://okna-vertical.ru';
const topMailCounter=fs.readFileSync('components/top-mail-counter.html','utf8');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const jsonLd=data=>'<script type="application/ld+json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>';
const imageDimensions=new Map();
async function addImageDimensions(html){
 for(const match of html.matchAll(/<img\b[^>]*>/g)){
  const tag=match[0].replace(/\s(?:width|height)=""/g,'');const src=tag.match(/\bsrc="(\/assets\/[^"?#]+)(?:[?#][^"]*)?"/)?.[1];
  if(!src||(/\bwidth="/.test(tag)&&/\bheight="/.test(tag)))continue;
  if(!imageDimensions.has(src))imageDimensions.set(src,await sharp('public'+src).metadata());
  const {width,height}=imageDimensions.get(src);if(!width||!height)continue;
  let replacement=tag;
  if(!/\bwidth="/.test(tag))replacement=replacement.replace('<img','<img width="'+width+'"');
  if(!/\bheight="/.test(tag))replacement=replacement.replace('<img','<img height="'+height+'"');
  html=html.replace(match[0],replacement);
 }
 return html;
}
syncHomeComponents(footerMenuMarkup('/'));
let home=fs.readFileSync('index.html','utf8');
home=home.replace(/<!-- Top\.Mail\.Ru counter -->[\s\S]*?<!-- \/Top\.Mail\.Ru counter -->\s*/g,'');
home=home.replace(/(<body\b[^>]*>)/,'$1\n'+topMailCounter);
home=home.replace(/<header class="global-header">[\s\S]*?<\/header>/,headerMarkup('/'));
home=syncFooterMenus(home,'/');
fs.writeFileSync('index.html',await addImageDimensions(popupButtons(addCardInstallments(addCalculatorInstallments(home)))));
const metrika=home.match(/<!-- Yandex.Metrika counter -->[\s\S]*?<!-- \/Yandex.Metrika counter -->/)?.[0]||'';
const business=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const metadata=[...pages,...serviceMetadata.filter(p=>!pages.some(existing=>existing.slug===p.slug)),...Object.entries(legalContent).map(([slug,data])=>({slug,name:data.title,h1:data.title,lead:data.lead,image:'company-office.jpg'}))];
// Every page uses components. Derivatives have stable names and are reused across routes.
const optimized=new Map();
async function image(file,width,role='card'){
 const key=file+':'+width+':'+role;if(optimized.has(key))return optimized.get(key);
 const source=path.join('public/assets',file);if(!fs.existsSync(source))throw Error('Missing image: '+file);
 const meta=await sharp(source).metadata();
 const name=`component-${file.replace(/\.[^.]+$/,'')}-${role}.webp`;
 const buffer=await sharp(source).resize({width:Math.min(meta.width,width),withoutEnlargement:true}).webp({quality:82}).toBuffer();
 fs.writeFileSync('public/assets/'+name,buffer);
 const dimensions=await sharp(buffer).metadata();
 const result={src:'/assets/'+name,width:dimensions.width,height:dimensions.height};optimized.set(key,result);return result;
}
async function optimizeData(data,component){
 if(Array.isArray(data)){for(const item of data)await optimizeData(item,component);return;}
 if(!data||typeof data!=='object')return;
 if(data.imageSrc?.startsWith('/assets/')&&!/\.svg$/.test(data.imageSrc)){
  const visual=component==='content'?{width:880,role:'card'}:component==='included'?{width:500,role:'estimate'}:component==='installation'?{width:644,role:'installation'}:component==='related'?{width:570,role:'related'}:component==='reviews'?{width:320,role:'review'}:{width:600,role:'card'};
  const img=await image(data.imageSrc.slice(8),visual.width,visual.role);
  data.imageSrc=img.src;data.imageWidth=img.width;data.imageHeight=img.height;
 }
 if(data.photos)for(const photo of data.photos){const img=await image(photo.src.slice(8),640,'case');photo.src=img.src;photo.width=img.width;photo.height=img.height;}
 if(data.images)for(let i=0;i<data.images.length;i++)if(typeof data.images[i]==='string'&&data.images[i].startsWith('/assets/'))data.images[i]=(await image(data.images[i].slice(8),320,'quiz')).src;
 if(data.modalImage?.startsWith('/assets/')&&!/\.svg$/.test(data.modalImage)){const img=await image(data.modalImage.slice(8),600,'card');data.modalImage=img.src;}
 for(const [key,value]of Object.entries(data))if(key!=='photos'&&key!=='wallDetails')await optimizeData(value,component);
}
// Subpages share one photo per product across hero, product cards and quiz.
// The home page is rendered separately and keeps its own image choices.
function syncProductImages(config){
 const products=config.sections.hero.data.products;
 if(!products.length)return;
 for(const key of config.order){
  const section=config.sections[key];
  if(section.component==='products'){
   if(section.data.items.length!==products.length)throw Error(`${config.prefix}: product image count mismatch`);
   section.data.items.forEach((item,index)=>{
    const photo=products[index];
    item.imageSrc=photo.imageSrc;item.imageWidth=photo.imageWidth;item.imageHeight=photo.imageHeight;
    item.modalImage=photo.imageSrc;
   });
  }
  if(section.component==='quiz'){
   const question=section.data.questions[0];
   if(question.options.length!==products.length)throw Error(`${config.prefix}: quiz product count mismatch`);
   question.images=products.map(item=>item.imageSrc);
  }
 }
 products.forEach(item=>{item.modalImage=item.imageSrc;});
}
function document(meta,config,content,img,schemas=[]){
 const url=origin+'/'+meta.slug+(meta.slug.endsWith('.html')?'':'/');
 return `<!doctype html><html lang="ru" class="page-seo"><head><script src="https://p.dmp.one/sync?stock_key=edb950e37ef8487ef93b947ceb3e205a" async referrerpolicy="no-referrer-when-downgrade" charset="UTF-8"></script><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(meta.title||meta.h1)} | Окна Вертикаль</title><meta name="description" content="${escape(meta.lead)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${url}"><link rel="icon" href="/assets/favicon-vert.png"><meta property="og:type" content="website"><meta property="og:title" content="${escape(meta.h1)}"><meta property="og:description" content="${escape(meta.lead)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${origin+img.src}">${metrika}${schemas.map(jsonLd).join('')}<link rel="stylesheet" href="/assets/header.css"></head><body class="home-site">${topMailCounter}${headerMarkup('/'+meta.slug+'/')}<main class="seo-page" id="top">${content}</main>${renderComponent('footer',{...config.footer,extraClass:config.prefix+'-footer',menuHtml:footerMenuMarkup('/'+meta.slug+'/')})}${photoModalMarkup}${renderComponent('gallery-modal')}<script src="/assets/quiz-video.js" defer></script><script type="module" src="/src/main.js"></script><script type="module" src="/src/seo.js"></script><script src="/assets/header.js" defer></script></body></html>`;
}
for(const meta of metadata){
 const config=structuredClone(componentPages[meta.slug]);
 if(!config)throw Error('Page does not have component data: '+meta.slug);
 for(const key of config.order)if(key!=='hero')await optimizeData(config.sections[key].data,config.sections[key].component);
 for(const item of config.sections.hero.data.products)await optimizeData(item,'products');
 syncProductImages(config);
 const img=await image(config.heroImage||meta.image,2112,'backdrop');
 const crumbs=[{name:'Главная',url:'/'},...(/^(holodnoe|teploe|otdelka|balkonnye)/.test(meta.slug)?[{name:'Балконы и лоджии',url:'/balkony/'}]:[]),{name:meta.name,url:'/'+meta.slug+'/'}];
 const breadcrumbHtml=`<nav class="seo-breadcrumbs seo-breadcrumbs--compact home-wrap" aria-label="Хлебные крошки"><ol>${crumbs.map((c,i)=>`<li>${i===crumbs.length-1?`<span aria-current="page">${escape(c.name)}</span>`:`<a href="${c.url}">${escape(c.name)}</a>`}</li>`).join('')}</ol></nav>`;
 const crossLink=crossLinks[meta.slug];
 const content=config.order.map(key=>renderPageComponent(config,key,key==='hero'?{imageSrc:img.src,imageWidth:img.width,imageHeight:img.height,breadcrumbHtml}:{} )+(crossLink&&key===(crossLink.after||'hero')?renderComponent('cross-link',crossLink):'')).join('');
 const schemas=[{...business,image:origin+img.src},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:origin+c.url}))}];
 if(config.sections.faq)schemas.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqEntries(config).map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))});
 const html=scopeSections(document(meta,config,content,img,schemas),meta.slug,config.order,config.prefix);
 const output=config.installments===false?html.replace(/<a\b[^>]*href="\/rassrochka\/"[^>]*>[\s\S]*?<\/a>/g,''):addCardInstallments(html);
 fs.mkdirSync(meta.slug,{recursive:true});fs.writeFileSync(meta.slug+'/index.html',await addImageDimensions(popupButtons(output,meta.name.toLowerCase())));
}
const notFound=renderComponent('content',{id:'not-found',kicker:'404',title:'Страница не найдена',lead:'Проверьте адрес страницы или выберите нужное направление в меню.',items:[],afterHtml:'<a class="home-button" href="/">На главную</a>'}).replace('<h2>Страница не найдена</h2>','<h1>Страница не найдена</h1>');
const fallback=componentPages.kontakty;
fs.writeFileSync('404.html',await addImageDimensions(document({slug:'404.html',h1:'Страница не найдена',lead:'Страница не найдена'},fallback,scopeSections(notFound,'404.html',['content']),{src:'/assets/logo.webp'}).replace('content="index, follow"','content="noindex, follow"').replaceAll('href="#calculator"','href="/#calculator"')));
fs.writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...metadata.map(p=>p.slug)].map(s=>`\n<url><loc>${origin}/${s?s+'/':''}</loc></url>`).join('')}\n</urlset>\n`);
fs.writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generated ${metadata.length} component pages and 404.`);
