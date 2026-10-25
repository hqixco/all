import fs from 'node:fs';
const file='scripts/generate-seo.mjs';let s=fs.readFileSync(file,'utf8');s=s.replace('class="home-site">${header}<main class="seo-page">','class="home-site">${headerMarkup("/404.html")}<main class="seo-page">');fs.writeFileSync(file,s);
const css='public/assets/header.css';s=fs.readFileSync(css,'utf8').replace('.global-header__links a { font-size: 13px; white-space: nowrap;', '.global-header__links a { font-size: 13px; line-height: 1.4;');fs.writeFileSync(css,s);
