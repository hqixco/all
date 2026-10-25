import fs from 'node:fs';
const file='public/assets/header.css';let css=fs.readFileSync(file,'utf8');
css=css.replace('padding: 10px 7px; border-radius: 6px;', 'padding: 10px 11px; border-radius: 6px;');
css=css.replace('.global-header__links a { font-size: 12px; padding: 10px 5px; }', '.global-header__links a { font-size: 12px; padding: 10px 8px; }');
fs.writeFileSync(file,css);
