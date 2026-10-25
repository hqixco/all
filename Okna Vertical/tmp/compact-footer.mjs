import fs from 'node:fs';const file='scripts/sync-header.mjs';let s=fs.readFileSync(file,'utf8');const start=s.indexOf('export const footerMenuMarkup');const end=s.indexOf('export const syncFooterMenus',start);
const code=`const footerGroups = [
 ['Окна и двери', [0,1,2,4,5].flatMap(i=>groups[i][2])],
 ['Балконы и лоджии', groups[3][2]],
 ['Услуги и цены', [...groups[7][2],groups[6][2][0],['/ceny/','Цены'],['/rassrochka/','Рассрочка']]],
 ['О компании', groups[8][2]]
];
export const footerMenuMarkup = (route = '/') => '<nav class="footer-navigation" aria-label="Карта сайта">' + footerGroups.map(([title,links]) => '<details class="footer-column" open><summary>'+title+'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="footer-links">' + [...new Map(links.map(link=>[link[0],link])).values()].map(([url,label]) => '<a href="'+url+'"'+(url===route?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</div></details>').join('')+'</nav>';
`;
s=s.slice(0,start)+code+s.slice(end);fs.writeFileSync(file,s);
const css='src/style.css';s=fs.readFileSync(css,'utf8');const at=s.indexOf('\n.footer-navigation {');s=s.slice(0,at)+`
.footer-navigation { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; padding: 24px 0; border-top: 1px solid #44484d; }
.footer-navigation .footer-column { display: block; }
.footer-navigation summary { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; color: #fff; font-size: 15px; font-weight: 600; list-style: none; }
.footer-navigation summary::-webkit-details-marker { display: none; }
.footer-navigation summary svg { display: none; }
.footer-links { display: grid; gap: 8px; }
.footer-links a { font-size: 13px; line-height: 1.4; }
.footer-navigation a[aria-current="page"] { color: #fff; }
@media (max-width: 900px) { .footer-navigation { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 20px; } }
@media (max-width: 600px) {
 .footer-navigation { display: block; padding: 10px 0 20px; }
 .footer-navigation .footer-column { border-bottom: 1px solid #44484d; }
 .footer-navigation summary { min-height: 48px; margin: 0; cursor: pointer; font-size: 14px; }
 .footer-navigation summary svg { display: block; }
 .footer-navigation details[open] summary svg { transform: rotate(180deg); }
 .footer-links { gap: 10px; padding: 0 0 16px; }
}
`;fs.writeFileSync(css,s);
const js='public/assets/header.js';s=fs.readFileSync(js,'utf8');s+=`
(() => {
 const groups = [...document.querySelectorAll('.footer-navigation details')];
 const mobile = window.matchMedia('(max-width: 600px)');
 const adapt = () => groups.forEach(group => { group.open = !mobile.matches; });
 groups.forEach(group => group.querySelector('summary').addEventListener('click', event => { if (!mobile.matches) event.preventDefault(); }));
 if (mobile.addEventListener) mobile.addEventListener('change', adapt); else mobile.addListener(adapt);
 adapt();
})();
`;fs.writeFileSync(js,s);
