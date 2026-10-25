import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8')+fs.readFileSync('balkony/index.html','utf8')+fs.readFileSync('okna-v-kvartiru/index.html','utf8');
const buttons=[...html.matchAll(/<button\b[^>]*>/g)].map(([tag])=>tag.match(/class="([^"]+)"/)?.[1]||'(unclassed)');
console.log([...new Set(buttons)].sort().join('\n'));
