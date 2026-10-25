import fs from 'node:fs';
import { createRequire } from 'node:module';
import {homeComponents} from '../seo-pages/components/home.js';
import {apartmentPage} from '../seo-pages/components/apartment.js';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.setContent(homeComponents.sections.warranty.data.ctaHtml);
const result=await page.locator('.warranty-cta').evaluate(root=>{
 const data={};const field=(selector,key,attr)=>{const el=root.querySelector(selector);if(attr){data[key]=el.getAttribute(attr)||'';el.setAttribute(attr,'{{'+key+'}}');}else{data[key]=el.innerHTML;el.innerHTML='{{{'+key+'}}}';}};
 field('strong','titleHtml');field('div > span','descriptionHtml');field('img','imageSrc','src');field('img','imageAlt','alt');field('a','modalTitle','data-package-title');field('a','modalHeading','data-package-modal-title');field('a','modalImage','data-package-image');
 return {data,template:root.outerHTML.replaceAll('<span>→</span>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>')};
});
fs.writeFileSync('components/warranty-cta.html',result.template+'\n');homeComponents.sections.warranty.data.cta=result.data;delete homeComponents.sections.warranty.data.ctaHtml;apartmentPage.sections.warranty.data.cta=false;delete apartmentPage.sections.warranty.data.ctaHtml;apartmentPage.prefix='apartment';
for(const [file,name,value]of[['home','homeComponents',homeComponents],['apartment','apartmentPage',apartmentPage]])fs.writeFileSync('seo-pages/components/'+file+'.js','// Page content only. Layouts live in components/*.html.\nexport const '+name+' = '+JSON.stringify(value,null,2)+';\n');
let renderer=fs.readFileSync('scripts/components.mjs','utf8').replace("'warranty','reviews'","'warranty','warranty-cta','reviews'");renderer=renderer.replace("if(name==='reviews')", "if(name==='warranty')data={...data,ctaHtml:data.cta?renderComponent('warranty-cta',data.cta):''};\n if(name==='reviews')");fs.writeFileSync('scripts/components.mjs',renderer);
await browser.close();

