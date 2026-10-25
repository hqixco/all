import fs from 'node:fs';
const file='scripts/generate-seo.mjs';let s=fs.readFileSync(file,'utf8');
const block=`const apartmentWarranty = () => {
 let content = home.match(/<section class="warranty-section"[^>]*>[\\s\\S]*?<\\/section>/)[0];
 content = content.replace(/(<div class="warranty-table-wrap">\\s*<h2>)[\\s\\S]*?<\\/h2>/,'$1Гарантия на окна в квартиру и монтажные работы</h2>');
 content = content.replace(/(<p class="warranty-lead">)[\\s\\S]*?<\\/p>/,'$1Гарантия распространяется на оконные конструкции, стеклопакеты, фурнитуру и монтаж. Сроки и условия вашего заказа фиксируем в договоре.</p>');
 content = content.replace('Оконные конструкции (ПВХ и алюминий)','Оконные конструкции (ПВХ)').replace('info@vertical-rybinsk.ru','mail@vertyar.ru');
 content = content.replaceAll('/assets/warranty-cta.jpg','/assets/apartment-two-sash-card.webp').replace('alt="Загородный дом с панорамным остеклением"','width="535" height="401" loading="lazy" alt="Пластиковое окно в квартире"');
 content = content.replace('href="#compare"','href="#calculator"').replace('data-package-title="гарантии и сервису"','data-package-title="гарантии на окна в квартире"').replace('data-package-modal-title="Гарантия и сервисное обслуживание"','data-package-modal-title="Сервисная заявка по окнам в квартире" data-package-description="Укажите телефон — уточним номер договора, проблему с окном и согласуем дальнейшие действия."');
 content = content.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 return content;
};
`;
s=s.replace('const blocks = {',block+'const blocks = {').replace(" : process(),warranty,cases:()=>portfolio,", " : process(),warranty:p=>p.slug === 'okna-v-kvartiru' ? apartmentWarranty() : warranty(),cases:()=>portfolio,");fs.writeFileSync(file,s);
const css='src/seo.css';s=fs.readFileSync(css,'utf8').replaceAll('.seo-page p:not(.hero-kicker):not(.home-section-lead), .seo-page li', '.seo-section p, .seo-section li, .seo-hero-copy > p:not(.hero-kicker)');fs.writeFileSync(css,s);
