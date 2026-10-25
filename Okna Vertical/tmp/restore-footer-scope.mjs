import fs from 'node:fs';
let renderer=fs.readFileSync('scripts/components.mjs','utf8').replace("if(name==='reviews')data={extraClass:'',...data};","if(name==='reviews'||name==='footer')data={extraClass:'',...data};");fs.writeFileSync('scripts/components.mjs',renderer);
let footer=fs.readFileSync('components/footer.html','utf8').replace('class="site-footer home-site-footer"','class="site-footer home-site-footer{{#extraClass}} {{extraClass}}{{/extraClass}}"');fs.writeFileSync('components/footer.html',footer);
let generator=fs.readFileSync('scripts/generate-seo.mjs','utf8').replace("...componentPage.footer,menuHtml:footerMenuMarkup", "...componentPage.footer,extraClass:componentPage.prefix+'-footer',menuHtml:footerMenuMarkup");fs.writeFileSync('scripts/generate-seo.mjs',generator);
