import fs from 'node:fs';
import path from 'node:path';
const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else files.push(p)}}walk('dist');
let count=0;for(const file of files.filter(f=>f.endsWith('.html'))){const h=fs.readFileSync(file,'utf8');const nav=h.match(/<nav class="global-header__links"[\s\S]*?<\/nav>/)?.[0]||'';for(const m of nav.matchAll(/href="([^"]+)"/g)){if(!m[1].startsWith('#')||!h.includes('id="'+m[1].slice(1)+'"'))throw Error(file+' invalid '+m[1]);count++}for(const m of h.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)){if(!fs.existsSync('dist'+m[1]))throw Error('Missing '+m[1])}}
for(const file of files.filter(f=>f.endsWith('.css'))){if(/@media[^{}]*\(\s*width\s*[<>]/.test(fs.readFileSync(file,'utf8')))throw Error('Unsupported media syntax')}
console.log('Verified '+count+' local menu anchors and HTML asset links; CSS media syntax OK');
