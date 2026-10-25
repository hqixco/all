import fs from 'node:fs';
import path from 'node:path';

const maxUrl='https://max.ru/u/f9LHodD0cOI_GhxoRneQqaq-UK9D9-6Px99nAfEblHezesp3QbViFz3iRBo';
function update(dir) {
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  if(['node_modules','dist','.git'].includes(entry.name))continue;
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())update(file);
  else if(file.endsWith('.html')) {
   let html=fs.readFileSync(file,'utf8');
   html=html.replace(/https:\/\/max\.ru\/u\/[^"'\s<>]+/g,maxUrl);
   html=html.replace(/\s*<a\b[^>]*href="https:\/\/t\.me\/[^"\s]+"[^>]*>[\s\S]*?<\/a>/g,'');
   fs.writeFileSync(file,html);
  }
 }
}
update('.');
const cssFile='src/styles.css';
let css=fs.readFileSync(cssFile,'utf8');
css=css.replace(/\.header-messenger--telegram svg\s*\{[^}]*\}/g,'');
fs.writeFileSync(cssFile,css);
if(fs.existsSync('public/assets/telegram-icon.svg'))fs.unlinkSync('public/assets/telegram-icon.svg');
console.log('MAX links updated; Telegram links removed.');
function verify(dir) {
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())verify(file);
  else if(file.endsWith('.html')) {
   const html=fs.readFileSync(file,'utf8');
   if(/https:\/\/t\.me\/|telegram-icon|Написать в Telegram/i.test(html))throw new Error('Telegram remains: '+file);
   for(const match of html.matchAll(/https:\/\/max\.ru\/u\/[^"'\s<>]+/g))if(match[0]!==maxUrl)throw new Error('Wrong MAX link: '+file);
  }
 }
}
if(fs.existsSync('dist'))verify('dist');
console.log('Production messenger links verified.');
