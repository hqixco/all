import fs from 'node:fs';
const dataFile='seo-pages/data.js';
let data=fs.readFileSync(dataFile,'utf8');
data=data.replace("service('okna-v-chastnyj-dom','Окна в частный дом','Пластиковые окна для частного дома в Рыбинске','permanent-home.jpg','Остекление дома по размерам проёмов. Согласуем окна, двери и крупные конструкции в одном проекте.'","service('okna-v-chastnyj-dom','Окна в частный дом и коттедж','Пластиковые окна для частного дома и коттеджа в Рыбинске','permanent-home.jpg','Остекление частных домов и коттеджей в Рыбинске: пластиковые окна, двери и панорамные конструкции по размерам проёмов. Замер, доставка и монтаж — в одной смете.'");
data=data.replace('Для расчёта пригодятся план дома, размеры проёмов и сведения о материале стен. Для деревянного дома отдельно обсудим подготовку проёмов.','Для расчёта остекления частного дома или коттеджа пришлите план, размеры проёмов и сведения о материале стен и отоплении. Согласуем цвет пластиковых окон и дверей, открывание и монтаж. Для деревянного дома отдельно обсудим подготовку проёмов.');
fs.writeFileSync(dataFile,data);
for(const file of ['seo-pages/components/service-pages.js','seo-pages/components/catalog.js','seo-pages/components/reviews.js','scripts/check-reviews.mjs']){
 const source=fs.readFileSync(file,'utf8').split(/\r?\n/).filter(line=>!line.includes("'osteklenie-kottedzhey'")).join('\n');
 fs.writeFileSync(file,source);
}
const headerCheck='scripts/check-header.mjs';fs.writeFileSync(headerCheck,fs.readFileSync(headerCheck,'utf8').replace("'/osteklenie-kottedzhey/', ",''));
const sections='scripts/page-sections.mjs';fs.writeFileSync(sections,fs.readFileSync(sections,'utf8').replace(", 'osteklenie-kottedzhey': 'cottage'",''));
