import fs from 'node:fs';
import path from 'node:path';

const forms=[['Денисом','Александром'],['Денису','Александру'],['Дениса','Александра'],['Денисе','Александре'],['Денис','Александр']];
function walk(dir,check=false) {
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  if(['node_modules','dist','.git'].includes(entry.name)&&!check)continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())walk(file,check);
  else if(/\.(html|js|mjs|json|txt|php)$/.test(file)&&file!==path.join('scripts','update-foreman.mjs')) {
   let text=fs.readFileSync(file,'utf8');
   if(check) {
    if(/Денис/.test(text))throw new Error('Previous foreman name remains: '+file);
   }else {
    for(const [before,after] of forms)text=text.split(before).join(after);
    text=text.replace(/<div class="portrait"><span>Д<\/span><\/div>/g,'');
    fs.writeFileSync(file,text);
   }
  }
 }
}
const check=process.argv.includes('--check');
walk(check?'dist':'.',check);
console.log(check?'Production checked: previous foreman name removed.':'Foreman name updated to Александр, including grammatical forms.');
