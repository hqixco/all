import sharp from 'sharp';
import fs from 'node:fs';

const source=process.argv[2];
if(!source)throw new Error('Pass the source image path.');
const target='public/assets/quiz-roofing-foreman.webp';
await sharp(source).rotate().resize({width:800,withoutEnlargement:true}).webp({quality:82}).toFile(target);
const metadata=await sharp(target).metadata();
console.log(`${target}: ${metadata.width} × ${metadata.height}, ${Math.round(fs.statSync(target).size/1024)} KB`);
