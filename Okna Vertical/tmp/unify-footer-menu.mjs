import fs from 'node:fs';let s=fs.readFileSync('scripts/sync-header.mjs','utf8');const idx=s.indexOf('const groupMarkup');
const code=`export const footerMenuMarkup = (route = '/') => '<nav class="footer-navigation" aria-label="Карта сайта">' + groups.map(([title,,links]) => '<div class="footer-column"><strong>' + title + '</strong>' + links.map(([url,label]) => '<a href="'+url+'"'+(url===route?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</div>').join('') + '<div class="footer-column"><strong>Оплата и цены</strong><a href="/ceny/">Цены</a><a href="/rassrochka/">Рассрочка</a></div></nav>';
export const syncFooterMenus = (html, route = '/') => html.replace(/<footer\\b[^>]*>[\\s\\S]*?<\\/footer>/g, footer => {
 footer = footer.replace(/<nav class="footer-navigation"[^>]*>[\\s\\S]*?<\\/nav>/g,'').replace(/<div class="footer-column">[\\s\\S]*?<\\/div>/g,'');
 const menu = footerMenuMarkup(route);
 if (footer.includes('class="legal-footer"')) return footer.replace(/<nav>[\\s\\S]*?<\\/nav>/,menu);
 if (footer.includes('<div class="footer-cta">')) return footer.replace('<div class="footer-cta">',menu+'<div class="footer-cta">');
 if (footer.includes('<div class="footer-bottom">')) return footer.replace('<div class="footer-bottom">',menu+'<div class="footer-bottom">');
 return footer.replace('</footer>',menu+'</footer>');
});
`;
s=s.slice(0,idx)+code+s.slice(idx);s=s.replace(' fs.writeFileSync(file,html);',' html=syncFooterMenus(html,route);\n fs.writeFileSync(file,html);');fs.writeFileSync('scripts/sync-header.mjs',s);
s=fs.readFileSync('scripts/generate-seo.mjs','utf8').replace('headerMarkup, photoModalMarkup','headerMarkup, photoModalMarkup, syncFooterMenus');s=s.replace("scopeSections(html,p.slug,", "scopeSections(syncFooterMenus(html,'/'+p.slug+'/'),p.slug,");s=s.replace("scopeSections(notFound.replaceAll('href=\"#calculator\"','href=\"/#calculator\"'),'404.html'", "scopeSections(syncFooterMenus(notFound.replaceAll('href=\"#calculator\"','href=\"/#calculator\"'),'/404.html'),'404.html'");fs.writeFileSync('scripts/generate-seo.mjs',s);
// Stop overwriting the shared footer menu with the former apartment-only columns.
s=fs.readFileSync('scripts/generate-seo.mjs','utf8').replace(/ let column = 0;[\s\S]*?(?= content = content.replace\('data-package-title)/,'');fs.writeFileSync('scripts/generate-seo.mjs',s);
s=fs.readFileSync('src/style.css','utf8');s=s.replace(/(\.footer-top \{[^}]*?grid-template-columns:)\s*[^;]+;/g,'$1 minmax(0, 1fr) minmax(0, 1fr);');
s += '\n.footer-navigation { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 34px 28px; padding: 36px 0; border-top: 1px solid #44484d; }\n.footer-navigation a[aria-current="page"] { color: #fff; }\n@media (max-width: 900px) { .footer-navigation { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px 20px; } }\n@media (max-width: 600px) { .footer-navigation { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 18px; padding: 28px 0; } }\n';fs.writeFileSync('src/style.css',s);
