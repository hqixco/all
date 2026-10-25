import { blindsPage } from './blinds.js';
import { apartmentPage } from './apartment.js';
import { servicePages } from './service-pages.js';
import { informationPages } from './information.js';
import { legalContent } from './legal.js';

const legalPages = Object.fromEntries(Object.entries(legalContent).map(([slug,content]) => [slug, {
  prefix:content.prefix,heroImage:'company-office.jpg',order:['hero','document'],
  sections:{hero:{component:'hero',data:{...apartmentPage.sections.hero.data,titleHtml:content.title,leadHtml:'',showKicker:false,showLead:false,showFacts:false,benefits:[],products:[],productsLabel:content.title,actions:false}},document:{component:'policy',data:{id:'policy',lead:content.lead,dateHtml:content.dateHtml,items:content.order.map(key=>content.sections[key].data)}}},
  footer:{...apartmentPage.footer,ctaHref:'/kontakty/#calculator',descriptionHtml:'Окна, двери и остекление в Рыбинске.',ctaTitleHtml:'Остались вопросы?',modalTitle:'консультации',modalHeading:'Получить консультацию',modalDescription:'Оставьте телефон — ответим на ваши вопросы.'},
  navigation:[],
}]));

// Add a route here to assemble another page from the same components.
export const componentPages = {
  'zhalyuzi': blindsPage,
  ...servicePages,
  ...informationPages,
  ...legalPages,
  'okna-v-kvartiru': { ...apartmentPage, heroImage: 'hero-apartment-evening.webp' },
};
