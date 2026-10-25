import fs from 'node:fs';
for (const file of ['index.html','balkony/index.html']) {
 let html=fs.readFileSync(file,'utf8');
 html=html.replace('<body>','<body class="home-site">');
 const items=file==='index.html'?[['okna-v-kvartiru','Окна в квартиру'],['okna-v-chastnyj-dom','Окна в частный дом'],['okna-na-dachu','Окна на дачу'],['balkony','Балконы и лоджии'],['osteklenie-verand-terras','Веранды и террасы'],['panoramnye-okna','Панорамные окна'],['balkonnye-bloki','Балконные блоки'],['dveri-pvh','Двери ПВХ']]:[['holodnoe-osteklenie-balkonov','Холодное остекление'],['teploe-osteklenie-balkonov','Тёплое остекление'],['otdelka-balkonov','Отделка и утепление'],['balkonnye-bloki','Балконные блоки']];
 const block=`<section class="seo-directions"><div class="home-wrap"><h2>Выберите направление</h2><div class="seo-direction-links">${items.map(([s,n])=>`<a href="/${s}/">${n}</a>`).join('')}</div></div></section>`;
 html=html.replace(/<meta\s+name="keywords"[\s\S]*?\/>/,'');
 if(file!=='index.html' && !html.includes('class="seo-directions"')) html=html.replace(/(<\/section>)/,`$1${block}`);
 if (!html.includes('href="/ceny/"')) html=html.replace('<strong>Клиентам</strong>','<strong>Клиентам</strong><a href="/ceny/">Цены</a><a href="/rassrochka/">Рассрочка</a><a href="/garantiya/">Гарантия</a><a href="/portfolio/">Портфолио</a><a href="/o-kompanii/">О компании</a><a href="/kontakty/">Контакты</a>');
 if (file.startsWith('balkony')) {
  html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>Остекление балконов и лоджий в Рыбинске | Окна Вертикаль</title>');
  for(const [attribute,key,value] of [['name','description','Остекление балконов и лоджий в Рыбинске: холодные и тёплые конструкции, утепление и отделка. Замер и расчёт под ваш объект.'],['property','og:title','Остекление балконов и лоджий в Рыбинске'],['property','og:description','Холодное и тёплое остекление, утепление и отделка балконов в Рыбинске.']]) html=html.replace(new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*`),`$1${value}`);
 }
 fs.writeFileSync(file,html);
}
