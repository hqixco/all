import {componentPages} from '../seo-pages/components/index.js';
const a=componentPages['okna-v-chastnyj-dom'],b=componentPages['osteklenie-kottedzhey'];
for(const [name,c]of [['house',a],['cottage',b]])console.log(JSON.stringify({name,hero:c.sections.hero.data.products.map(p=>p.titleHtml),faq:c.sections.faq.data.items,calculator:c.sections.calculator.data.model},null,2));
for(const key of ['cases','reviews','warranty']){
 const x=a.sections[key].data.items,y=b.sections[key].data.items;
 console.log(key+': items exactly equal '+(JSON.stringify(x)===JSON.stringify(y)));
}
