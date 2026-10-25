import fs from 'node:fs';
import path from 'node:path';

const display='+7 (919) 254-97-57';
const phone='+79192549757';
const checking=process.argv.includes('--check');
let links=0;
function walk(dir) {
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  if(['node_modules','dist','.git'].includes(entry.name)&&!checking)continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())walk(file);
  else if(/\.(html|js|mjs|json|php|xml|txt)$/.test(file)&&file!==path.join('scripts','update-phone.mjs')) {
   let text=fs.readFileSync(file,'utf8');
   if(checking) {
    if(/79688200909|\(968\)\s*820-09-09/.test(text))throw new Error('Old phone: '+file);
    for(const match of text.matchAll(/tel:([^"'\s<>]+)/g)) {
     if(match[1]!==phone)throw new Error('Incorrect phone link: '+file);
     links++;
    }
   } else {
    text=text.replace(/tel:[+\d() -]+(?=["'])/g,'tel:'+phone);
    text=text.replace(/\+?7\s*\(968\)\s*820-09-09/g,display).replace(/\+?79688200909/g,phone);
    fs.writeFileSync(file,text);
   }
  }
 }
}
walk(checking?'dist':'.');
console.log(checking?`Verified ${links} telephone links in production.`:'Phone updated throughout project.');
