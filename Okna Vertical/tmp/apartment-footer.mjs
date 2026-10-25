import fs from 'node:fs';const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const block=`const apartmentFooter = (() => {
 let content = home.match(/<footer class="site-footer home-site-footer">[\\s\\S]*?<\\/footer>/)[0];
 content = content.replace('class="site-footer home-site-footer"','class="site-footer home-site-footer apartment-footer"');
 content = content.replace(/(<div class="footer-brand">[\\s\\S]*?<p>)[\\s\\S]*?<\\/p>/,'$1Пластиковые окна и балконные блоки для квартир с монтажом в Рыбинске и Ярославской области.</p>');
 let column = 0;
 content = content.replace(/<div class="footer-column">[\\s\\S]*?<\\/div>/g, () => ++column === 1
  ? '<div class="footer-column"><strong>Окна в квартиру</strong><a href="#apartment-quiz">Подобрать окна</a><a href="#apartment-cases">Наши проекты</a><a href="#examples">Варианты окон</a><a href="#installation">Монтаж</a><a href="#warranty">Гарантия</a><a href="#reviews">Отзывы</a><a href="#faq">Вопросы и ответы</a></div>'
  : '<div class="footer-column"><strong>Клиентам</strong><a href="/ceny/">Цены</a><a href="/rassrochka/">Рассрочка</a><a href="/o-kompanii/">О компании</a><a href="/kontakty/">Контакты</a><a href="#calculator">Расчёт стоимости</a><a href="/montazh-okon/">Услуги монтажа</a></div>');
 content = content.replace('data-package-title="расчёта окон"','data-package-title="окон в квартиру"').replace('data-package-modal-title="Расчёт окон по фото и размерам"','data-package-modal-title="Рассчитать окна в квартиру" data-package-description="Прикрепите фото или укажите размеры проёмов — подготовим расчёт окон и монтажа для вашей квартиры."');
 content = content.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>').replace('Вернуться наверх ↑','Вернуться наверх');
 content = content.replace('src="/assets/logo.webp"','src="/assets/logo.webp" width="178" height="29"');
 return content;
})();
`;
s=s.replace('const blocks = {',block+'const blocks = {');const idx=s.indexOf(' const html = `');if(idx<0)throw Error('Page template');s=s.slice(0,idx)+s.slice(idx).replace('${footer}${photoModalMarkup}', '${p.slug === "okna-v-kvartiru" ? apartmentFooter : footer}${photoModalMarkup}');fs.writeFileSync(f,s);
