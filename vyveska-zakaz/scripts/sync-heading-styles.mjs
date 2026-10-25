import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
import {adjacentHeading} from './heading-adjacency.mjs';
const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));let count=0;
for(const p of pages){const html=await fs.readFile(p.source,'utf8'),$=cheerio.load(html);$('.heading-as-text').removeClass('heading-as-text');$('.first-heading').removeClass('first-heading');const first=$('main h2').first();first.addClass('first-heading');if(first.length&&!$('link[href="/assets/heading-as-text.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/heading-as-text.css">');const heading=adjacentHeading($);if(heading){$(heading).addClass('heading-as-text');count++;if(!$('link[href="/assets/heading-as-text.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/heading-as-text.css">');}if(first.length||heading||html.includes('heading-as-text'))await fs.writeFile(p.source,$.html());}
console.log('Adjacent H2 styled as text: '+count+' pages');
