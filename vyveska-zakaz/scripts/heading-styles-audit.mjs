import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import {adjacentHeading} from './heading-adjacency.mjs';
const pages=JSON.parse(await fs.readFile('config/site-pages.json','utf8'));let count=0;
for(const target of ['source','dist'])for(const p of pages){const $=cheerio.load(await fs.readFile(target==='source'?p.source:'dist'+p.url+'index.html','utf8')),heading=adjacentHeading($);assert.equal($('.heading-as-text').length,heading?1:0,p.url);if(heading){assert.ok($(heading).hasClass('heading-as-text'),p.url);assert.equal(heading.name,'h2');assert.equal($('link[href="/assets/heading-as-text.css"]').length,1);if(target==='source')count++;}}
console.log(JSON.stringify({status:'passed',pages:pages.length,adjacentHeadings:count,sourceAndDist:true}));
