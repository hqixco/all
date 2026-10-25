import sharp from 'sharp';
import fs from 'node:fs';
const images=[['08c72c99-0193-4e34-9289-807b7984c4c8','related-balcony-block'],['7bef444c-316d-416b-bd2e-7f57f141d724','related-mosquito-net'],['762c7511-f1ad-4c3e-8220-c4ce14896c03','related-window-installation'],['1b2da6d1-96a4-48b9-b5c7-81ddbdde763b','related-window-prices']];
let source=fs.readFileSync('scripts/generate-seo.mjs','utf8');
for(const [original,name] of images){
 const output=`public/assets/${name}.webp`;
 const info=await sharp(`C:/Users/User/Downloads/${original}.png`).resize({width:570,withoutEnlargement:true}).webp({quality:82}).toFile(output);
 const pattern=new RegExp(`(${name}\\.webp\\\\" width=\\\\")\\d+(\\\\" height=\\\\")\\d+`,'g');
 source=source.replace(pattern,`$1${info.width}$2${info.height}`);
 console.log(name,info.width,info.height,info.size);
}
fs.writeFileSync('scripts/generate-seo.mjs',source);
