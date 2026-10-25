import fs from 'node:fs';
import sharp from 'sharp';
await sharp('public/assets/novaya-krovlya-favicon.svg').resize(64,64).png().toFile('public/assets/novaya-krovlya-favicon.png');
const files=['index.html','privacy.html','cookies.html',...['zamena-krovli','pristroyki','uteplenie-fasadov','zamena-polov','karkasnye-doma'].map(s=>s+'/index.html')];
for(const file of files) {
 let text=fs.readFileSync(file,'utf8');
 text=text.replace(/<link rel="icon" type="image\/svg\+xml" href="\/assets\/novaya-krovlya-favicon.svg"\s*\/?>/g,'<link rel="icon" type="image/png" sizes="64x64" href="/assets/novaya-krovlya-favicon.png" />');
 text=text.replace(/(<img\s+class="brand-logo")/g,'$1 width="530" height="230"');
 fs.writeFileSync(file,text);
}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.devDependencies.playwright='^1.58.2';
pkg.scripts.audit='node scripts/project-audit.mjs';
fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
