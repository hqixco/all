import fs from 'node:fs';
import sharp from 'sharp';

const pages=['zamena-krovli','pristroyki','uteplenie-fasadov','zamena-polov','karkasnye-doma'];
const assets=['team-foreman-on-site.webp','team-roofing-crew.webp'];
const check=process.argv.includes('--check');
if(!check) {
 const inputs=process.argv.slice(2);
 if(inputs.length!==2)throw new Error('Pass foreman and crew source image paths.');
 for(let i=0;i<2;i++) {
  const target='public/assets/'+assets[i];
  await sharp(inputs[i]).rotate().resize({width:1000,withoutEnlargement:true}).webp({quality:82}).toFile(target);
  console.log(assets[i],Math.round(fs.statSync(target).size/1024)+' KB');
 }
 for(const page of pages) {
  const file=page+'/index.html';
  let html=fs.readFileSync(file,'utf8');
  let index=0;
  html=html.replace(/(<div class="team-media">)([\s\S]*?)(<\/div>)/,(match,open,body,close)=>open+body.replace(/<img\b[^>]*>/g,img=>{
   const asset=assets[index++];
   if(!asset)throw new Error('Unexpected third team image: '+file);
   return img.replace(/src="[^"]*"/,'src="/assets/'+asset+'"').replace(/\s+(?:width|height|loading)="[^"]*"/g,'').replace(/>$/,' width="1000" height="750" loading="lazy">');
  })+close);
  if(index!==2)throw new Error('Expected two team photos: '+file);
  fs.writeFileSync(file,html);
 }
}else {
 for(const page of pages) {
  const html=fs.readFileSync('dist/'+page+'/index.html','utf8');
  const body=html.match(/<div class="team-media">([\s\S]*?)<\/div>/)?.[1];
  const images=[...body.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
  if(images.join('|')!==assets.map(a=>'/assets/'+a).join('|'))throw new Error('Wrong photos: '+page);
  for(const asset of assets)if(!fs.existsSync('dist/assets/'+asset))throw new Error('Missing asset: '+asset);
  console.log('Team photos verified:',page);
 }
}
