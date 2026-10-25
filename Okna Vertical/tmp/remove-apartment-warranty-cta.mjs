import fs from 'node:fs';
const file='scripts/generate-seo.mjs';let source=fs.readFileSync(file,'utf8');
const start=source.indexOf('const apartmentWarranty = () => {');
const end=source.indexOf('\n};',start);
if(start<0||end<0)throw Error('Apartment warranty generator not found');
const block=source.slice(start,end);
source=source.slice(0,start)+block.replace(' return content;', ' content = content.replace(/<div class="warranty-cta">[\\s\\S]*?<\\/div>\\s*<\\/div>\\s*<\\/section>/, \'</div></section>\');\n return content;')+source.slice(end);
fs.writeFileSync(file,source);
