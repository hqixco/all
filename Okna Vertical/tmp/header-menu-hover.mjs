import fs from 'node:fs';
const file='public/assets/header.css';let css=fs.readFileSync(file,'utf8');
css=css.replace('.global-header__links a { font-size: 13px; line-height: 1.4; padding: 10px 7px; }','.global-header__links a { font-size: 13px; line-height: 1.4; padding: 10px 7px; border-radius: 6px; }');
css=css.replace('.global-header__links a:hover { color: #ed0b13; }\n','');
css=css.replace('.global-header__dropdown a:hover, .global-header__dropdown a:focus-visible { color: #ed0b13; background: #f5f5f5; }','.global-header__links a:hover, .global-header__links a:focus-visible, .global-header__dropdown a:hover, .global-header__dropdown a:focus-visible { color: #ed0b13; background: #f5f5f5; }');
fs.writeFileSync(file,css);
