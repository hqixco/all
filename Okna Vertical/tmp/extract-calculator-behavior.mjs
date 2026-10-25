import fs from 'node:fs';
let main=fs.readFileSync('src/main.js','utf8');const start=main.indexOf('const homeLeadForm =');const end=main.indexOf('const installmentForm =',start);const old=main.slice(start,end);
fs.writeFileSync('tmp/calculator-behavior-before.txt',old);
main=main.slice(0,start)+'initCalculators(submitLeadForm);\nconst homePriceForm = document.querySelector("#price-form");\nconst homePriceStatus = homePriceForm?.querySelector(".home-price__status");\n\n'+main.slice(end);
main="import { initCalculators } from './components/calculator.js';\n"+main;
fs.writeFileSync('src/main.js',main);
