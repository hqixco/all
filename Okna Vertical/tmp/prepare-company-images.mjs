import sharp from 'sharp';
import fs from 'node:fs';
const sources = [
 ['company-director','Дмитрий, руководитель','Дмитрий, руководитель'],
 ['company-office','Офис и образцы окон','Офис и образцы окон'],
 ['company-surveyor','Замерщик','Замерщик'],
 ['company-team','Монтажная бригада','Монтажная бригада'],
 ['company-measurement','Процесс замера','Процесс замера'],
 ['company-delivery','Доставка конструкций','Доставка'],
 ['company-installation','Монтаж остекления','Монтаж'],
 ['panoramic-home','Готовый объект','Готовые объекты'],
];
const items=[];
for(const [source,imageAlt,caption] of sources){
 const name=source==='panoramic-home'?'company-gallery-project':source.replace('company-','company-gallery-');
 const output='public/assets/'+name+'.webp';
 await sharp('public/assets/'+source+'.jpg').resize({width:400,withoutEnlargement:true}).webp({quality:82}).toFile(output);
 const {width,height}=await sharp(output).metadata();
 items.push({imageSrc:'/assets/'+name+'.webp',imageWidth:width,imageHeight:height,imageAlt,caption});
 console.log(name,width,height,fs.statSync(output).size);
}
const data={id:'company',eyebrow:'Дмитрий и команда «Вертикаль»',title:'За проектом стоит конкретная компания и конкретные люди',lead:'Мы не передаём ваш проект подрядчикам и посредникам. От первого обращения до гарантийного обслуживания с вами работает одна команда.',officeTitle:'Офис в г. Рыбинске',address:'Центральный микрорайон, ул. Кирова, 6',officeNote:'Приезжайте посмотреть образцы окон',routeHref:'https://yandex.ru/maps/?mode=routes&rtext=~Россия%2C%20Ярославская%20область%2C%20Рыбинск%2C%20улица%20Кирова%2C%206&rtt=auto',items};
fs.writeFileSync('seo-pages/components/company.js','export const companyData = '+JSON.stringify(data,null,2)+';\n');
