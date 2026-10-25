import fs from 'node:fs';import sharp from 'sharp';
const output='public/assets/apartment-estimate.webp';await sharp('public/assets/window-installation-estimate.jpg').resize({width:473,withoutEnlargement:true}).webp({quality:83}).toFile(output);const meta=await sharp(output).metadata();console.log({width:meta.width,height:meta.height,bytes:fs.statSync(output).size});
const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const block=`const apartmentIncluded = () => {
 let content = home.match(/<section class="home-included">[\\s\\S]*?<\\/section>/)[0];
 content = content.replace('class="home-included"','class="home-included home-page" id="prices"');
 content = content.replace(/src="\\/assets\\/window-installation-estimate.jpg"/,'src="/assets/apartment-estimate.webp" width="${meta.width}" height="${meta.height}" loading="lazy"');
 content = content.replace('Что входит в стоимость','Что входит в стоимость окон в квартиру');
 content = content.replace(/(<p class="home-included__lead">)[\\s\\S]*?<\\/p>/,'$1В смете отдельно указываем окна и выбранные работы: доставку, демонтаж, монтаж и отделку проёмов. Комплектацию и итоговую цену согласуем после замера до начала работ.</p>');
 content = content.replaceAll('Включено в базовую цену','В составе согласованной сметы').replace('Доставка в пределах Рыбинска','Доставка по Рыбинску').replace('<b>Замер</b','<b>Замер проёмов квартиры</b').replace('<b>Демонтаж</b','<b>Демонтаж старых окон</b').replace('<b>Монтаж</b','<b>Монтаж новых окон</b');
 content = content.replace(/<div class="quiz-success"[\\s\\S]*?<h3>Заявка отправлена<\\/h3>[\\s\\S]*?<\\/div>/,'');
 return content;
};
`;
s=s.replace('const blocks = {',block+'const blocks = {').replace("price:p=>p.slug==='ceny'?pricing():section", "price:p=>p.slug==='okna-v-kvartiru'?apartmentIncluded():p.slug==='ceny'?pricing():section");fs.writeFileSync(f,s);
