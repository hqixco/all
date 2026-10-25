import fs from 'node:fs';
for(const file of ['okna-v-kvartiru/index.html','dist/okna-v-kvartiru/index.html']){
 const html=fs.readFileSync(file,'utf8');const block=html.match(/<section class="warranty-section apartment-warranty"[\s\S]*?<\/section>/)?.[0];
 if(!block||block.includes('class="warranty-cta"'))throw Error('Warranty CTA still present: '+file);
 if((block.match(/class="warranty-row"/g)||[]).length!==6||!block.includes('class="warranty-info"'))throw Error('Warranty content lost');
}
console.log('Warranty CTA removed; table and service conditions preserved');
