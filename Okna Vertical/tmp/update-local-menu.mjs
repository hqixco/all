import fs from 'node:fs';
let s=fs.readFileSync('scripts/sync-header.mjs','utf8');
const start=s.indexOf('export const headerMarkup');
s=s.slice(0,start)+`const localLinks = route => {
 const page = pages.find(p => route === '/' + p.slug + '/');
 if (page?.solutions) {
  const subject = page.name.toLowerCase();
  return [['#examples', page.slug === 'okna-v-kvartiru' ? 'Примеры окон в квартиру' : 'Примеры: ' + subject], ['#reviews', page.slug === 'okna-v-kvartiru' ? 'Отзывы по окнам в квартиру' : 'Отзывы клиентов'], ['#prices', page.slug === 'okna-v-kvartiru' ? 'Цены на окна в квартиру' : 'Цены: ' + subject]];
 }
 if (route === '/' || route === '/balkony/' || route === '/osteklenie-kottedzhey/') return [['#works','Примеры работ'],['#reviews','Отзывы'],['#calculator','Расчёт стоимости']];
 if (page) return [['#faq','Вопросы и ответы'],['#calculator','Расчёт и консультация']];
 return [];
};
`+s.slice(start);
const old="${[['/o-kompanii/','О компании'],['/portfolio/','Портфолио'],['/#reviews','Отзывы'],['/ceny/','Цены'],['/rassrochka/','Рассрочка'],['/garantiya/','Гарантия'],['/kontakty/','Контакты']].map";
if(s.split(old).length!==3) throw Error('Expected two link lists');
s=s.split(old).join('${localLinks(route).map').replace('class="global-header__links" aria-label="О компании"','class="global-header__links" aria-label="Разделы страницы"');
fs.writeFileSync('scripts/sync-header.mjs',s);
let g=fs.readFileSync('scripts/generate-seo.mjs','utf8');
g=g.replace("solutions:p=>section('Варианты для вашего объекта',cards(p.solutions))", "solutions:p=>section('Варианты для вашего объекта',cards(p.solutions),'examples')");
g=g.replace("</p><a href=\"/ceny/\">Посмотреть прайс и состав заказа</a>`)","</p><a href=\"/ceny/\">Посмотреть прайс и состав заказа</a>`,'prices')");
const reviews = `const localReviews = p => {
 const articles = [...home.matchAll(/<article class="review-card">([\\s\\S]*?)<\\/article>/g)].filter(m => p.slug !== 'okna-v-kvartiru' || /квартир/i.test(m[1])).slice(0,3).map(m => '<article class="seo-card">' + m[1].replace(/<div[\\s\\S]*?<\\/div>/,'').replace(/<strong>[\\s\\S]*?<\\/strong>/,'') + '</article>').join('');
 return section('Отзывы клиентов', '<div class="seo-grid">' + articles + '</div>', 'reviews');
};
`;
g=g.replace('const sourceCases =',reviews+'const sourceCases =');
g=g.replace("${p.blocks.map(b=>blocks[b](p)).join('')}${faq}","${p.blocks.map(b=>blocks[b](p)).join('')}${p.solutions ? localReviews(p) : ''}${faq}");
fs.writeFileSync('scripts/generate-seo.mjs',g);
