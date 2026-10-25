import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pages } from '../seo-pages/data.js';
import { addCardInstallments } from './card-installments.mjs';

const sample = '<article class="home-product-card"><strong>от 13 950 ₽</strong></article><article class="home-product-card"><strong>По расчёту</strong></article><article class="case-card"><strong>147 000 ₽</strong></article>';
const output = addCardInstallments(sample);
assert(output.includes('от 388&nbsp;₽/мес.'));
assert(output.includes('от 4 084&nbsp;₽/мес.'));
assert.equal((output.match(/data-card-installment/g)||[]).length,2);
assert.equal(addCardInstallments(output),output,'Repeat generation must not duplicate badges');
assert(!addCardInstallments('<p>Стоимость от 13 950 ₽</p>').includes('data-card-installment'),'Only card prices get badges');
let total=0;
for(const file of ['index.html','balkony/index.html',...pages.map(page=>`${page.slug}/index.html`)]) {
 const html=fs.readFileSync(file,'utf8');
 assert(!/Расч[её]т по размерам|По запросу|Индивидуальный расчёт/.test(html),`${file}: price placeholder remains`);
 assert.equal(addCardInstallments(html),html,`${file}: missed price or unstable markup`);
 total+=(html.match(/data-card-installment/g)||[]).length;
}
console.log(`Verified monthly amounts, repeat generation and ${total} static card installment badges.`);
