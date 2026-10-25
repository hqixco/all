import fs from 'node:fs';
const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const block=`const apartmentCases = () => {
 let content = home.match(/<section class="cases-section"[^>]*>[\\s\\S]*?<\\/section>/)[0];
 content = content.replace('id="works"','id="apartment-cases"').replace('class="cases-section"','class="cases-section" data-case-category="apartments"');
 content = content.replace('Показываем установленные окна на реальных объектах','Примеры установки окон в квартирах');
 content = content.replace(/<nav class="cases-menu"[\\s\\S]*?<\\/nav>/,'');
 content = content.replace(/<article class="case-card">[\\s\\S]*?<\\/article>/g,card => /src="\\/assets\\/apartment-window-/.test(card) ? card : '');
 content = content.replace(/<img([^>]*src="\\/assets\\/apartment-window-[^>]*?)\\s*\\/?>/g,'<img$1 loading="lazy">');
 content = content.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 return content;
};
const galleryMarkup = home.match(/<div class="gallery-modal"[\\s\\S]*?<div class="gallery-modal__counter"><\\/div>\\s*<\\/div>\\s*<\\/div>/)[0];
`;
s=s.replace('const blocks = {',block+'const blocks = {').replace(' process:p=>', " apartmentCases,\n process:p=>");s=s.replace(' const darkHero = true;', " const pageBlocks = p.slug === 'okna-v-kvartiru' ? ['choice','apartmentCases','solutions','price','process','warranty'] : p.blocks;\n const darkHero = true;");s=s.replace("${p.blocks.map(b=>blocks[b](p)).join('')}","${pageBlocks.map(b=>blocks[b](p)).join('')}").replace("['hero',...p.blocks,", "['hero',...pageBlocks.map(b=>b === 'apartmentCases' ? 'cases' : b),");s=s.replace('${footer}${photoModalMarkup}<script', '${footer}${photoModalMarkup}${p.slug === "okna-v-kvartiru" ? galleryMarkup : ""}<script');
// The not-found page has no page data.
s=s.replace('${p.slug === "okna-v-kvartiru" ? galleryMarkup : ""}<script', '${p.slug === "okna-v-kvartiru" ? galleryMarkup : ""}<script');const nf=s.indexOf('const notFound =');s=s.slice(0,nf)+s.slice(nf).replace('${p.slug === "okna-v-kvartiru" ? galleryMarkup : ""}','');fs.writeFileSync(f,s);
s=fs.readFileSync('src/main.js','utf8').replace('  selectCategory("balconies");', '  selectCategory(section.dataset.caseCategory || "balconies");');fs.writeFileSync('src/main.js',s);
s=fs.readFileSync('scripts/sync-header.mjs','utf8').replace("return [['#examples', page.slug", "return [[page.slug === 'okna-v-kvartiru' ? '#apartment-cases' : '#examples', page.slug");fs.writeFileSync('scripts/sync-header.mjs',s);
