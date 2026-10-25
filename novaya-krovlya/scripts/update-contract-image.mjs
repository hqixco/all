import fs from 'node:fs';
import sharp from 'sharp';

const source=process.argv[2];
if(!source)throw new Error('Pass the edited document image path.');
const target='public/assets/roofing-contract-document.png';
await sharp(source).resize({width:800,withoutEnlargement:true}).png({compressionLevel:9,palette:true,colours:64,dither:0,effort:10}).toFile(target);
const {width,height}=await sharp(target).metadata();
for(const slug of ['zamena-krovli','pristroyki','uteplenie-fasadov','zamena-polov','karkasnye-doma']) {
 const file=slug+'/index.html';
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<img\b[^>]*src="\/assets\/roofing-contract-document.png"[^>]*>/g,`<img src="/assets/roofing-contract-document.png" alt="Образец договора подряда — Новая Кровля" width="${width}" height="${height}" loading="lazy">`);
 fs.writeFileSync(file,html);
}
console.log(`Document updated: ${width} × ${height}, ${Math.round(fs.statSync(target).size/1024)} KB`);
