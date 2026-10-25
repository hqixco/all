import fs from 'node:fs';
// Extract the shared photo modal; it no longer depends on markup in index.html.
const home=fs.readFileSync('index.html','utf8');const modal=home.match(/<div class="package-modal"[\s\S]*?<div class="package-modal__success"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0];fs.writeFileSync('components/photo-modal.html',modal+'\n');
let renderer=fs.readFileSync('scripts/components.mjs','utf8').replace("'footer','gallery-modal'","'footer','gallery-modal','photo-modal'");fs.writeFileSync('scripts/components.mjs',renderer);
let sync=fs.readFileSync('scripts/sync-header.mjs','utf8');sync="import { renderComponent } from './components.mjs';\n"+sync;sync=sync.replace(/export const photoModalMarkup = fs\.readFileSync\('index\.html','utf8'\)\.match\([^\n]+\[0\];/,"export const photoModalMarkup = renderComponent('photo-modal');");sync=sync.replace(" if (!html.includes('class=\"package-modal\"')) html=html.replace('</body>',photoModalMarkup+'</body>');", " if (html.includes('class=\"package-modal\"')) html=html.replace(/<div class=\"package-modal\"[\\s\\S]*?<div class=\"package-modal__success\"[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<\\/div>/,photoModalMarkup);\n else html=html.replace('</body>',photoModalMarkup+'</body>');");fs.writeFileSync('scripts/sync-header.mjs',sync);
let homeSync=fs.readFileSync('scripts/sync-home-components.mjs','utf8');homeSync=homeSync.replace(' // The review slot',` const caseBlock=html.match(/<!-- component:cases -->[\\s\\S]*?<!-- \\/component:cases -->/)[0];
 html=html.replace(caseBlock,'').replace(quizEnd,quizEnd+'\\n'+caseBlock);
 // The review slot`);fs.writeFileSync('scripts/sync-home-components.mjs',homeSync);
let gen=fs.readFileSync('scripts/generate-seo.mjs','utf8');
const insert=" const mainContent = componentPage ? componentPage.order.map(key => key === 'hero' ? hero : renderBlock(key)).join('') : `${darkHero ? '' : breadcrumb}${hero}${pageBlocks.map(key => blocks[key](p)).join('')}${p.solutions ? localReviews(p) : ''}${faq}${form(p)}${section('Связанные направления',links(p.related))}`;\n";
gen=gen.replace(' const html = `<!doctype',insert+' const html = `<!doctype');
const mainStart=gen.indexOf('${darkHero ? "" : breadcrumb}',gen.indexOf(' const html ='));const mainEnd=gen.indexOf('</main>',mainStart);
gen=gen.slice(0,mainStart)+'${mainContent}'+gen.slice(mainEnd);
gen=gen.replace("p.slug,['hero',...pageBlocks,...(p.solutions ? ['reviews'] : []),'faq','calculator','related']", "p.slug,componentPage ? componentPage.order : ['hero',...pageBlocks,...(p.solutions ? ['reviews'] : []),'faq','calculator','related'],componentPage?.prefix");
fs.writeFileSync('scripts/generate-seo.mjs',gen);
let scope=fs.readFileSync('scripts/page-sections.mjs','utf8').replace('scopeSections(html, slug, blocks) {\r\n const prefix = prefixes[slug];','scopeSections(html, slug, blocks, prefix = prefixes[slug]) {').replace('scopeSections(html, slug, blocks) {\n const prefix = prefixes[slug];','scopeSections(html, slug, blocks, prefix = prefixes[slug]) {');fs.writeFileSync('scripts/page-sections.mjs',scope);
