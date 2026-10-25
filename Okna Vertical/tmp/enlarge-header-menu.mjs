import fs from 'node:fs';
const file='public/assets/header.css';let css=fs.readFileSync(file,'utf8');
css=css.replace('.global-header__links a { font-size: 13px; line-height: 1.4; padding: 10px 11px; border-radius: 6px; }', '.global-header__links a { font-size: 14px; line-height: 1.4; padding: 10px 15px; border-radius: 6px; }');
css=css.replace('.global-header__links a { font-size: 12px; padding: 10px 8px; }', '.global-header__links a { font-size: 13px; padding: 10px 11px; }');
fs.writeFileSync(file,css);
