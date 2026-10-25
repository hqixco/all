import fs from 'node:fs';import sharp from 'sharp';
const m=await sharp('public/assets/logo.webp').metadata();console.log({width:m.width,height:m.height,bytes:fs.statSync('public/assets/logo.webp').size,maxHeaderWidth:200});
const f='scripts/sync-header.mjs';let s=fs.readFileSync(f,'utf8');s=s.replace('src="/assets/logo-vert-os.png" width="220" height="50"',`src="/assets/logo.webp" width="${m.width}" height="${m.height}"`);fs.writeFileSync(f,s);
