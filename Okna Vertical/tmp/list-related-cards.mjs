import fs from 'node:fs';
const dirs=['.',...fs.readdirSync('.',{withFileTypes:true}).filter(d=>d.isDirectory()&&!['node_modules','dist','tmp','.git','public','src','components','seo-pages','scripts','.openai'].includes(d.name)).map(d=>d.name)];
const unique=new Map();
for(const dir of dirs){const p=dir+'/index.html';if(!fs.existsSync(p))continue;const html=fs.readFileSync(p,'utf8');for(const m of html.matchAll(/<a\b[^>]*class="related-card"[^>]*>[\s\S]*?<\/a>/g)){const card=m[0];const href=card.match(/href="([^"]+)"/)?.[1];const title=card.match(/<h3>([\s\S]*?)<\/h3>/)?.[1].replace(/<[^>]+>/g,'');if(href)unique.set(href,title);}}
console.log(JSON.stringify([...unique].sort((a,b)=>a[0].localeCompare(b[0])),null,2));
