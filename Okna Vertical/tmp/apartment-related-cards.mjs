import fs from 'node:fs';import sharp from 'sharp';
const items=[
 ['balkonnye-bloki','balcony-block-window.jpg','related-balcony-block.webp','Балконные блоки','Окно и балконная дверь в одном комплекте. Подберём размеры, открывание и отделку проёма.'],
 ['moskitnye-setki','quiz-balcony-extra-mosquito.webp','related-mosquito-net.webp','Москитные сетки','Сетки для новых и существующих окон: подходящее полотно, крепления и удобное снятие.'],
 ['montazh-okon','installation-brick.webp','related-window-installation.webp','Монтаж окон','Подготовка проёма, крепление рамы и защита монтажного шва с учётом материала стен.'],
 ['ceny','window-calculator-visual.jpg','related-window-prices.webp','Цены на окна','Стоимость изделий, монтажа и дополнительных работ — чтобы заранее оценить состав заказа.']
];
for(const [slug,input,output] of items){await sharp('public/assets/'+input).resize({width:570,height:356,fit:'cover',withoutEnlargement:true}).webp({quality:82}).toFile('public/assets/'+output);const meta=await sharp('public/assets/'+output).metadata();console.log({output,width:meta.width,height:meta.height,bytes:fs.statSync('public/assets/'+output).size})}
const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const markup='<section class="related-section home-page"><div class="home-wrap"><h2>Также может быть интересно</h2><div class="related-grid">'+items.map(([slug,,output,title,description])=>'<a class="related-card" href="/'+slug+'/"><img src="/assets/'+output+'" width="570" height="356" loading="lazy" alt="'+title+'"><div class="related-card__content"><h3>'+title+'</h3><p>'+description+'</p><span class="related-card__link">Подробнее<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></span></div></a>').join('')+'</div></div></section>';
s=s.replace('const blocks = {','const apartmentRelated = () => '+JSON.stringify(markup)+';\nconst blocks = {');
s=s.replace("${section('Связанные направления',links(p.related))}","${p.slug === 'okna-v-kvartiru' ? apartmentRelated() : section('Связанные направления',links(p.related))}");fs.writeFileSync(f,s);
