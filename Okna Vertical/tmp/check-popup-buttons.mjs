import fs from 'node:fs';
import { componentPages } from '../seo-pages/components/index.js';
const files=['index.html',...Object.keys(componentPages).map(slug=>slug+'/index.html')];
let count=0;
for(const file of files){
 const html=fs.readFileSync(file,'utf8');
 for(const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/g)){
  const href=match[1].match(/href="([^"]*)"/)?.[1]||'';
  const cls=match[1].match(/class="([^"]*)"/)?.[1]||'';
  if(href.includes('#')&&/button|home-hero-card|home-hero__measure|cross-link-card__(?:primary|secondary)/.test(cls))throw Error(file+' '+cls+' '+href);
  if(/data-package-title/.test(match[1]))throw Error('Popup anchor remains: '+file);
 }
 count+=(html.match(/<button\b[^>]*data-package-title=/g)||[]).length;
}
const comparison=fs.readFileSync('proverka-smety/index.html','utf8');
if(!comparison.includes('data-package-upload="estimate"'))throw Error('Estimate upload missing');
console.log(`${files.length} pages checked; ${count} popup buttons; no action anchors.`);
