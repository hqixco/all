import fs from 'node:fs';
const metadataFile='seo-pages/components/service-pages.js';
let metadata=fs.readFileSync(metadataFile,'utf8');
metadata=metadata.replace("{slug:'balkony',name:","{slug:'balkony',title:'Остекление балконов и лоджий в Рыбинске',name:");
fs.writeFileSync(metadataFile,metadata);
const generatorFile='scripts/generate-seo.mjs';
let generator=fs.readFileSync(generatorFile,'utf8');
generator=generator.replace('<title>${escape(meta.h1)} |','<title>${escape(meta.title||meta.h1)} |');
fs.writeFileSync(generatorFile,generator);
