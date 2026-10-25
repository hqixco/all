import fs from 'node:fs';
const file='scripts/sync-header.mjs';let s=fs.readFileSync(file,'utf8');
s=s.replace(" if (route === '/' || route === '/balkony/'", " if (route === '/') return [['#works','Примеры работ'],['#reviews','Отзывы'],['#warranty','Гарантия'],['#installment','Рассрочка'],['#calculator','Калькулятор','calculator']];\n if (route === '/balkony/'");
s=s.replace(" camera: ", " calculator: '<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M8 5h8v4H8zM8 13h1M15 13h1M8 17h1M15 17h1\"/>',\n camera: ");
s=s.replaceAll('localLinks(route).map(([url,title])=>`<a href="${url}">${title}</a>`)', 'localLinks(route).map(([url,title,icon])=>`<a href="${url}"${icon ? \' class="global-header__anchor-icon"\' : \'\'}>${icon ? svg(icons[icon]) : \'\'}${title}</a>`)');
fs.writeFileSync(file,s);
const home='index.html';s=fs.readFileSync(home,'utf8').replace('<section class="installment-banner" aria-labelledby="installment-title">','<section class="installment-banner" id="installment" aria-labelledby="installment-title">');fs.writeFileSync(home,s);
const css='public/assets/header.css';s=fs.readFileSync(css,'utf8');s=s.replace('.global-header__links a:hover', '.global-header a.global-header__anchor-icon { display: flex; align-items: center; gap: 6px; }\n.global-header__anchor-icon svg { width: 18px; height: 18px; flex-basis: 18px; }\n.global-header__links a:hover');fs.writeFileSync(css,s);
