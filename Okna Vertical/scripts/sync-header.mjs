import { componentPages } from '../seo-pages/components/index.js';
import { renderComponent } from './components.mjs';
import { scopeSections } from './page-sections.mjs';
import fs from 'node:fs';
import { pages } from '../seo-pages/data.js';
const svg = body => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${body}</svg>`;
const icons = {
 apartment: '<rect x="5" y="2" width="14" height="20" rx="1"/><path d="M9 6h1M14 6h1M9 10h1M14 10h1M9 14h1M14 14h1M10 22v-4h4v4"/>',
 house: '<path d="m2 10 10-8 10 8M5 8v14h14V8M10 22v-8h4v8"/>',
 balcony: '<path d="M4 2h16v13H4zM12 2v13M2 15h20M4 15v7M9 15v7M15 15v7M20 15v7M2 22h20"/>',
 door: '<rect x="6" y="2" width="12" height="20" rx="1"/><path d="M9 5h6v8H9zM9 17h2"/>',
 extra: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="m7 9 5-4 5 4M12 5v14M7 15l5 4 5-4"/>',
 tools: '<path d="M15 3a6 6 0 0 0-7 8L2 19l3 3 8-7a6 6 0 0 0 8-7l-4 4-4-4 2-5Z"/>',
 list: '<path d="M8 5h14M8 12h14M8 19h14M2 5h1M2 12h1M2 19h1"/>',
 phone: '<path d="m6 2 4 5-3 3c2 4 4 6 8 8l3-3 4 4c-1 3-4 4-7 2C8 18 4 14 2 7 1 4 3 2 6 2Z"/>',
 calculator: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 5h8v4H8zM8 13h1M15 13h1M8 17h1M15 17h1"/>',
 camera: '<path d="M2 7h5l2-3h6l2 3h5v14H2z"/><circle cx="12" cy="13" r="4"/>',
 chevron: '<path d="m6 9 6 6 6-6"/>',
};
const groups = [
 ['В квартиру','apartment',[['/okna-v-kvartiru/','Окна в квартиру'],['/laminirovannye-okna/','Ламинированные окна']]],
 ['В частный дом','house',[['/okna-v-chastnyj-dom/','Окна в частный дом и коттедж'],['/okna-na-dachu/','Окна на дачу'],['/panoramnye-okna/','Панорамные окна']]],
 ['Балконы и лоджии','balcony',[['/balkony/','Балконы и лоджии'],['/balkonnye-bloki/','Балконные блоки'],['/holodnoe-osteklenie-balkonov/','Холодное остекление'],['/teploe-osteklenie-balkonov/','Тёплое остекление'],['/otdelka-balkonov/','Отделка балконов']]],
 ['Веранды и террасы','balcony',[['/osteklenie-verand-terras/','Веранды и террасы']]],
 ['Двери ПВХ','door',[['/dveri-pvh/','Двери ПВХ']]],
 ['Дополнительно','extra',[['/moskitnye-setki/','Москитные сетки'],['/zhalyuzi/','Жалюзи и рулонные шторы'],['/laminirovannye-okna/','Ламинированные окна'],['/panoramnye-okna/','Панорамные окна']]],
 ['Услуги','tools',[['/montazh-okon/','Монтаж окон'],['/raschet-stoimosti/','Расчёт стоимости'],['/proverka-smety/','Проверка сметы']]],
 ['О компании','list',[['/o-kompanii/','О компании'],['/portfolio/','Портфолио'],['/garantiya/','Гарантия'],['/kontakty/','Контакты'],['/cookie/','Политика cookie'],['/politika-konfidentsialnosti/','Политика конфиденциальности']]],
];
const footerGroups = [
 ['Окна и двери', [0,1,3,4].flatMap(i=>groups[i][2])],
 ['Балконы и лоджии', groups[2][2]],
 ['Услуги и цены', [...groups[6][2],groups[5][2][0],groups[5][2][1],['/ceny/','Цены'],['/rassrochka/','Рассрочка']]],
 ['О компании', groups[7][2]]
];
export const footerMenuMarkup = (route = '/') => '<nav class="footer-navigation" aria-label="Карта сайта">' + footerGroups.map(([title,links]) => '<details class="footer-column" open><summary>'+title+'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="footer-links">' + [...new Map(links.map(link=>[link[0],link])).values()].map(([url,label]) => '<a href="'+url+'"'+(url===route?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</div></details>').join('')+'</nav>';
export const syncFooterMenus = (html, route = '/') => html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g, footer => {
 footer = footer.replace(/<nav class="footer-navigation"[^>]*>[\s\S]*?<\/nav>/g,'').replace(/<div class="footer-column">[\s\S]*?<\/div>/g,'');
 const menu = footerMenuMarkup(route);
 if (footer.includes('class="legal-footer"')) return footer.replace(/<nav>[\s\S]*?<\/nav>/,'').replace(/<\/div>\s*<\/footer>$/,menu+'</div></footer>').replace('class="legal-footer"','class="site-footer home-site-footer"').replace('class="legal-footer__inner"','class="footer-container"');
 if (footer.includes('<div class="footer-cta">')) return footer.replace('<div class="footer-cta">',menu+'<div class="footer-cta">');
 if (footer.includes('<div class="footer-bottom">')) return footer.replace('<div class="footer-bottom">',menu+'<div class="footer-bottom">');
 if (footer.includes('class="footer-container"')) return footer.replace(/<\/div>\s*<\/footer>$/,menu+'</div></footer>');
 return footer.replace('</footer>',menu+'</footer>');
});
const groupMarkup = ([title,icon,links],route) => {
 const active = links.some(([url])=>url===route);
 if (links.length === 1) return `<a class="global-header__item${active?' is-active':''}" href="${links[0][0]}"${active?' aria-current="page"':''}>${svg(icons[icon])}<span>${title}</span></a>`;
 return `<details class="global-header__group${active?' is-active':''}"><summary>${svg(icons[icon])}<span>${title}</span>${svg(icons.chevron)}</summary><div class="global-header__dropdown">${links.map(([url,label])=>`<a href="${url}"${url===route?' aria-current="page"':''}>${label}</a>`).join('')}</div></details>`;
};
const localLinks = route => {
 const config = componentPages[route.replace(/^\/|\/$/g,'')];
 if (config?.navigation) return config.navigation.map(item => {
  const id = config.sections[item.section]?.data.id;
  if (!id || !config.order.includes(item.section)) throw Error('Invalid local navigation section: '+item.section);
  return ['#'+id,item.label,item.icon];
 });
 const page = pages.find(p => route === '/' + p.slug + '/');
 if (page?.solutions) {
  const subject = page.name.toLowerCase();
  return [['#examples', 'Примеры: ' + subject], ['#reviews', 'Отзывы клиентов'], ['#prices', 'Цены: ' + subject]];
 }
 if (route === '/') return [['#works','Примеры работ'],['#reviews','Отзывы'],['#warranty','Гарантия'],['#installment','Рассрочка'],['#calculator','Калькулятор','calculator']];
 if (route === '/balkony/') return [['#works','Примеры балконов и лоджий'],['#reviews','Отзывы по балконам и лоджиям'],['#calculator','Цены на окна для балконов']];
 if (page) return [['#faq','Вопросы и ответы'],['#calculator','Расчёт и консультация']];
 return [];
};
export const headerMarkup = (route='/') => `<header class="global-header"><div class="global-header__top"><a class="global-header__logo" href="/" aria-label="Вертикаль — на главную"><img src="/assets/logo.webp" width="178" height="29" alt="Вертикаль — оконные системы"></a><p class="global-header__note">Окна напрямую от производителя <span>VEKA</span> в Рыбинске с 2005 года</p><nav class="global-header__links" aria-label="Разделы страницы">${localLinks(route).map(([url,title,icon])=>`<a href="${url}"${icon ? ' class="global-header__anchor-icon"' : ''}>${icon ? svg(icons[icon]) : ''}${title}</a>`).join('')}</nav><div class="global-header__contact">${svg(icons.phone)}<div><a href="tel:+74855205586">8 (4855) 20-55-86</a><span>Пн–Пт: 9:00 – 18:00</span></div></div><a class="global-header__photo" href="#photo-estimate" data-package-title="остекления по фото" data-package-modal-title="Расчёт остекления по фото" data-package-description="Прикрепите фото и оставьте телефон — уточним размеры и подготовим расчёт." data-package-image="/assets/hero-product-window.jpg" data-package-upload="photo" aria-haspopup="dialog">${svg(icons.camera)}<span>Рассчитать по фото</span></a><button class="global-header__toggle" type="button" aria-controls="global-navigation" aria-expanded="false" aria-label="Открыть меню">${svg('<path d="M3 6h18M3 12h18M3 18h18"/>')}</button></div><nav class="global-header__nav" id="global-navigation" aria-label="Направления и услуги"><div class="global-header__nav-inner">${groups.map(group=>groupMarkup(group,route)).join('')}<div class="global-header__mobile-links">${localLinks(route).map(([url,title,icon])=>`<a href="${url}"${icon ? ' class="global-header__anchor-icon"' : ''}>${icon ? svg(icons[icon]) : ''}${title}</a>`).join('')}</div></div></nav></header>`;
export const photoModalMarkup = renderComponent('photo-modal');
