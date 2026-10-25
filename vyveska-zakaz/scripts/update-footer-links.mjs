import './sync-footer.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
const pages=JSON.parse(fs.readFileSync('config/site-pages.json','utf8'));
for(const page of pages){const $=load(fs.readFileSync(page.source,'utf8'));assert.equal($('footer .site-footer__policy-link').length,2,page.source);assert.equal($('footer a[href="/cookies/"]').length,1,page.source);}
assert(load(fs.readFileSync('pages/cookies/index.html','utf8'))('h1').length);
console.log('Footer legal links verified on '+pages.length+' pages');
