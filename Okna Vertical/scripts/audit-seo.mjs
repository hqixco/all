import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {pages} from '../seo-pages/data.js';
const findings=[];
for(const file of fs.readdirSync('dist/assets').filter(n=>n.endsWith('.css'))) {
 const css=fs.readFileSync('dist/assets/'+file,'utf8');
 if(/@media[^{}]*\(width\s*[<>]/.test(css))findings.push('Unsupported media range '+file);
}
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
if(sitemap.includes('okna-vertikal.ru')||sitemap.includes('404'))findings.push('Invalid sitemap');
for(const p of pages)if(!sitemap.includes('/'+p.slug+'/'))findings.push('Missing sitemap route '+p.slug);
const images=[];
for(const file of fs.readdirSync('dist/assets').filter(n=>n.startsWith('seo-')&&n.endsWith('.webp'))) {
 const buffer=fs.readFileSync('dist/assets/'+file);const meta=await sharp(buffer).metadata();
 images.push({file,width:meta.width,height:meta.height,bytes:buffer.length});
 if(buffer.length>300000)findings.push('Heavy image '+file);
}
for(const file of fs.readdirSync('dist/assets').filter(n=>/^(main|seo).*\.(js|css)$/.test(n)))if(!/^(main|seo)\.(js|css)$/.test(file))findings.push('Unstable build name '+file);
for(const route of ['/test-404-page-xyz/','/okna-v-kvartiru']) {
 const response=await fetch('http://127.0.0.1:4173'+route,{redirect:'manual'});
 const expected=route.endsWith('/')?404:301;
 if(response.status!==expected)findings.push('HTTP '+route+' '+response.status);
}
fs.writeFileSync('tmp/seo-audit.json',JSON.stringify({findings,images},null,2));
console.log(JSON.stringify({findings,images:images.length,maxBytes:Math.max(...images.map(i=>i.bytes))},null,2));
if(findings.length)process.exitCode=1;
