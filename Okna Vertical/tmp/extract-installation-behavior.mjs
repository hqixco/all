import fs from 'node:fs';
let main=fs.readFileSync('src/main.js','utf8');let start=main.indexOf('const wallDetails =');let end=main.indexOf('document.querySelectorAll(".faq-item button")',start);
const definitions=main.slice(start,main.indexOf('const wallTabs =',start)).replace('const wallDetails =','export const defaultWallDetails =');
fs.writeFileSync('src/components/installation.js',definitions+`
export function initInstallationBlocks() {
 document.querySelectorAll('.installation-section').forEach(section=>{
  const config=section.querySelector('[data-wall-details]');
  const details=config?JSON.parse(config.textContent):defaultWallDetails;
  const diagram=section.querySelector('.installation-diagram img');
  const container=section.querySelector('.installation-details');
  section.querySelectorAll('.wall-tab').forEach(tab=>tab.addEventListener('click',()=>{
   section.querySelectorAll('.wall-tab').forEach(item=>item.classList.toggle('is-active',item===tab));
   if(diagram){diagram.src=tab.dataset.wallImage;diagram.alt=tab.dataset.wallAlt||'Схема монтажного узла: '+tab.textContent.trim();}
   if(container&&details[tab.dataset.wallKey])container.innerHTML=details[tab.dataset.wallKey].map(([title,text])=>'<div><strong>'+title+'</strong><span>'+text+'</span></div>').join('');
  }));
 });
}
`);
main=main.slice(0,start)+'initInstallationBlocks();\n\n'+main.slice(end);main="import { initInstallationBlocks } from './components/installation.js';\n"+main;fs.writeFileSync('src/main.js',main);
let renderer=fs.readFileSync('scripts/components.mjs','utf8');renderer="import { calculateEstimate } from '../src/components/calculator.js';\nimport { defaultWallDetails } from '../src/components/installation.js';\n"+renderer;
renderer=renderer.replace("if(name==='calculator')data={...data,placeGroup:data.places?.length?{items:data.places}:false};",`if(name==='calculator'){
  data={countQuestionHtml:'Сколько окон нужно?',widthLabelHtml:'Ширина одного окна',heightLabelHtml:'Высота одного окна',countOptions:[{value:2,labelHtml:'1–2 окна',checked:true},{value:4,labelHtml:'3–5 окон',checked:false},{value:7,labelHtml:'6+ окон',checked:false},{value:10,labelHtml:'Другое количество',checked:false}],widthRange:{min:400,max:5000,step:50,value:1300},heightRange:{min:400,max:3500,step:50,value:1400},...data};
  const selected=data.countOptions.find(item=>item.checked)||data.countOptions[0];
  const values=new Map([['windows_count',selected.value],['window_width',data.widthRange.value],['window_height',data.heightRange.value],['installation_place',data.installationPlace||data.places?.find(item=>item.checked)?.value]]);
  data={...data,modelJson:json(data.model||{}),initialPrice:new Intl.NumberFormat('ru-RU').format(calculateEstimate(values,data.model)),widthId:data.id+'-window-width',heightId:data.id+'-window-height',placeGroup:data.places?.length?{items:data.places}:false};
 }
 if(name==='installation')data={...data,wallDetailsJson:json(data.wallDetails||defaultWallDetails)};`);
fs.writeFileSync('scripts/components.mjs',renderer);
let calc=fs.readFileSync('components/calculator.html','utf8').replace('<p>Сколько окон нужно?</p>','<p>{{{countQuestionHtml}}}</p>');
calc=calc.replace(/(<div class="home-calc-options home-calc-options--count">)[\s\S]*?<\/div>/,'$1{{#countOptions}}<label><input type="radio" name="windows_count" value="{{value}}"{{#checked}} checked{{/checked}}><span>{{{labelHtml}}}</span></label>{{/countOptions}}</div>');
calc=calc.replaceAll('home-window-width','{{widthId}}').replaceAll('home-window-height','{{heightId}}').replace('Ширина одного окна','{{{widthLabelHtml}}}').replace('Высота одного окна','{{{heightLabelHtml}}}');
calc=calc.replace('1300 мм','{{widthRange.value}} мм').replace('1400 мм','{{heightRange.value}} мм').replace('min="400" max="5000" step="50" value="1300"','min="{{widthRange.min}}" max="{{widthRange.max}}" step="{{widthRange.step}}" value="{{widthRange.value}}"').replace('min="400" max="3500" step="50" value="1400"','min="{{heightRange.min}}" max="{{heightRange.max}}" step="{{heightRange.step}}" value="{{heightRange.value}}"');
calc=calc.replace('от 8 350 ₽','от {{initialPrice}} ₽').replace(/<\/section>\s*$/,'<script type="application/json" data-calculator-model>{{{modelJson}}}</script></section>\n');fs.writeFileSync('components/calculator.html',calc);
let installation=fs.readFileSync('components/installation.html','utf8').replace(/<\/section>\s*$/,'<script type="application/json" data-wall-details>{{{wallDetailsJson}}}</script></section>\n');fs.writeFileSync('components/installation.html',installation);
