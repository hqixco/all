import fs from 'node:fs';
const report=JSON.parse(fs.readFileSync('tmp/site-seo-report.json','utf8'));
const html=fs.readFileSync('dist/index.html','utf8');
const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
console.log(JSON.stringify({schemas:schemas.map(s=>({type:s['@type'],address:s.address,telephone:s.telephone,aggregateRating:s.aggregateRating})),metadata:report.records.filter(p=>p.title.length>75||p.description.length>220).map(p=>({route:p.route,titleLength:p.title.length,descriptionLength:p.description.length}))},null,2));
const reachable=new Set(['/']),queue=['/'];
while(queue.length){const route=queue.shift();const file='dist'+route+'index.html';if(!fs.existsSync(file))continue;const text=fs.readFileSync(file,'utf8');for(const match of text.matchAll(/<a\b[^>]*href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){const target=match[1];if(target.endsWith('/')&&!reachable.has(target)){reachable.add(target);queue.push(target);}}}
console.log(JSON.stringify({orphanPages:report.records.filter(p=>p.route!=='/404.html'&&!reachable.has(p.route)).map(p=>p.route)},null,2));
