import { calculateEstimate } from '../src/components/calculator.js';
import { defaultWallDetails } from '../src/components/installation.js';
import fs from 'node:fs';

const templates = new Map();
export const componentNames = ['hero','hero-actions','cross-link','card-installment','products','quiz','cases','included','installation','warranty','reviews','review-card','faq','calculator','consultation','comparison-preview','comparison-actions','compare','content','document','related','footer','gallery-modal','photo-modal'];
const escape = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll("'",'&#39;');
componentNames.push('company','policy');
const json = value => JSON.stringify(value).replaceAll('<','\\u003c');
const lookup = (data,key) => key.split('.').reduce((value,part)=>value?.[part],data);

function parse(template) {
 const root=[];const stack=[{children:root}];let offset=0;
 const tokens=/{{{([\w.]+)}}}|{{([#/]?)([\w.]+)}}/g;
 for(const match of template.matchAll(tokens)){
  stack.at(-1).children.push({text:template.slice(offset,match.index)});offset=match.index+match[0].length;
  if(match[2]==='#'){const node={key:match[3],children:[]};stack.at(-1).children.push(node);stack.push(node);}
  else if(match[2]==='/'){if(stack.length===1||stack.at(-1).key!==match[3])throw Error('Unmatched component collection: '+match[3]);stack.pop();}
  else stack.at(-1).children.push({key:match[1]||match[3],raw:Boolean(match[1])});
 }
 if(stack.length!==1)throw Error('Unclosed component collection');root.push({text:template.slice(offset)});return root;
}
function renderNodes(nodes,data,component){
 return nodes.map(node=>{
  if('text' in node)return node.text;
  const value=lookup(data,node.key);if(value===undefined)throw Error(`Missing ${component}.${node.key}`);
  if(node.children){if(Array.isArray(value))return value.map(item=>renderNodes(node.children,item,component)).join('');return value?renderNodes(node.children,typeof value==='object'?value:data,component):'';}
  return node.raw?String(value ?? ''):escape(value);
 }).join('');
}

function quizOptions(questions){
 const question=questions[0];if(!question?.options?.length)throw Error('Quiz requires at least one question');
 const capacity=Math.max(5,...questions.map(item=>item.options.length));
 return Array.from({length:capacity},(_,index)=>{
  const label=question.options[index];const image=question.images?.[index];
  return `<button class="quiz-option" type="button"${label?'':' hidden'}><i class="quiz-img"${image?` style="background-image:url(${escape(image)})"`:''} aria-hidden="true"></i><b><em></em><span class="quiz-option__copy"><span>${label?`${index+1}. ${escape(typeof label==='string'?label:label.label)}`:''}</span></span></b></button>`;
 }).join('');
}
function caseGallery(item){
 const photos=item.photos;if(!photos?.length)throw Error('Case requires a photo');
 const photosHtml=photos.map((photo,index)=>`<img class="${index===0?'is-active':''}" src="${escape(photo.src)}"${photo.width?` width="${photo.width}" height="${photo.height}"`:''} alt="${escape(photo.alt)}" loading="lazy">`).join('')+(photos.length>1?'<button class="case-slider__nav case-slider__nav--prev" type="button" aria-label="Предыдущее фото"></button><button class="case-slider__nav case-slider__nav--next" type="button" aria-label="Следующее фото"></button>':'');
 const thumbsHtml=photos.length>1?'<div class="case-slider__thumbs" aria-label="Миниатюры кейса">'+photos.map((photo,index)=>`<button class="case-slider__thumb${index===0?' is-active':''}" type="button" aria-label="Показать фото ${index+1}" aria-pressed="${index===0}" style="background-image:url(${escape(photo.src)})"></button>`).join('')+'</div>':'';
 const category=item.category||(/балкон|лоджи/i.test(item.titleHtml)?'balconies':/квартир/i.test(item.titleHtml)?'apartments':'houses');
 const details=item.details.some(detail=>detail.labelHtml==='Что сделали')?item.details:[...item.details,{labelHtml:'Что сделали',valueHtml:item.titleHtml}];
 return {...item,details,photosHtml,thumbsHtml,category};
}

// Runs at build time only. Browser JavaScript never creates these blocks.
export function renderComponent(name,data={}){
 if(name==='cross-link')data={rich:false,simple:true,...data};
 if(name==='consultation')data={blinds:false,...data};
 if(name==='products')data={...data,items:data.items.map(item=>({showImage:true,showBrand:true,photoUpload:false,noImage:false,...item}))};
 if(name==='content')data={sectionClass:'',...data,items:(data.items||[]).map(item=>({iconHtml:'',map:false,photo:false,action:false,noInstallment:false,priceRows:[],...item,contactLinks:item.contactLinks?{...item.contactLinks,items:item.contactLinks.items.map(link=>({icon:false,external:false,...link}))}:false,cardClass:item.iconHtml?'content-card--icon'+(item.accent?' content-card--accent':''):''}))};
 if(!componentNames.includes(name))throw Error('Unknown component: '+name);
 if(!templates.has(name))templates.set(name,parse(fs.readFileSync(new URL(`../components/${name}.html`,import.meta.url),'utf8')));
 if(name==='quiz')data={...data,questionTitleHtml:escape(data.questions[0].title),questionDescriptionHtml:escape(data.questions[0].description),questionMetaHtml:`Вопрос 1 из ${data.questions.length}`,questionsJson:json(data.questions),optionsHtml:quizOptions(data.questions)};
 if(name==='calculator'){
  data={countQuestionHtml:'Сколько окон нужно?',widthLabelHtml:'Ширина одного окна',heightLabelHtml:'Высота одного окна',countOptions:[{value:2,labelHtml:'1–2 окна',checked:true},{value:4,labelHtml:'3–5 окон',checked:false},{value:7,labelHtml:'6+ окон',checked:false},{value:10,labelHtml:'Другое количество',checked:false}],widthRange:{min:400,max:5000,step:50,value:1300},heightRange:{min:400,max:3500,step:50,value:1400},...data};
  data.showInstallationOption=data.showInstallationOption!==false;
  const selected=data.countOptions.find(item=>item.checked)||data.countOptions[0];
  const values=new Map([['windows_count',selected.value],['window_width',data.widthRange.value],['window_height',data.heightRange.value],['installation_place',data.installationPlace||data.places?.find(item=>item.checked)?.value]]);
  const total=calculateEstimate(values,data.model);
  const installmentHtml=data.installments===false?'':renderComponent('card-installment',{amount:new Intl.NumberFormat('ru-RU').format(Math.ceil(total/36))}).replace('data-card-installment','data-calculator-installment');
  data={...data,modelJson:json(data.model||{}),initialPrice:new Intl.NumberFormat('ru-RU').format(total),installmentHtml,widthId:data.id+'-window-width',heightId:data.id+'-window-height',placeGroup:data.places?.length?{items:data.places}:false};
 }
 if(name==='installation')data={...data,walls:data.walls.map(wall=>({imageWidth:data.imageWidth,imageHeight:data.imageHeight,...wall})),wallDetailsJson:json(data.wallDetails||defaultWallDetails),wallPointsJson:json(data.wallPoints||{})};
 if(name==='reviews'||name==='footer')data={extraClass:'',ctaHref:'#calculator',modalSubmit:'Получить расчёт',...data};
 if(name==='hero-actions')data={...data,modalHeading:data.primaryLabel,modalDescription:data.primaryLabel.includes('замерщика')?'Оставьте телефон — согласуем удобное время замера и обсудим ваш заказ.':'Оставьте телефон — менеджер свяжется с вами и ответит на вопросы.'};
 if(name==='reviews')data={...data,cardsHtml:data.items.map(item=>renderComponent('review-card',item)).join('')};
 if(name==='cases')data={leadHtml:'В каждой карточке — фотографии объекта, срок выполнения и стоимость работ: от замера до готового монтажа.',...data,showMore:data.items.length>0,items:data.items.map(caseGallery)};
 if(name==='hero')data={...data,products:(data.products||[]).map(item=>({modalTitle:item.titleHtml,modalHeading:'Рассчитать: '+item.titleHtml,modalDescription:'Уточним размеры и комплектацию, подготовим расчёт с выбранными работами.',...item})),visualHtml:data.preview?renderComponent('comparison-preview',data.preview):'',layoutClass:data.preview?'page-hero--preview':data.products?.length?'':'page-hero--simple',actionsHtml:data.preview?renderComponent('comparison-actions'):renderComponent('hero-actions',{primaryHref:'#calculator',primaryLabel:'Вызвать замерщика',secondaryHref:'/portfolio/',secondaryLabel:'Смотреть примеры работ',...data.actions})};
 if(name==='hero')data.products=data.products.map(item=>({...item,cardTag:item.calculatorHref?'a':'button',cardAttributes:item.calculatorHref?`href="${escape(item.calculatorHref)}"`:`type="button" data-package-title="${escape(item.modalTitle)}" data-package-modal-title="${escape(item.modalHeading)}" data-package-description="${escape(item.modalDescription)}" data-package-image="${escape(item.imageSrc)}" data-package-submit="Получить расчёт"`}));
 if(name==='hero'){
  data.showKicker=data.showKicker!==false;
  data.showLead=data.showLead!==false;
  data.showBenefits=Boolean(data.benefits?.length);
  data.showFacts=data.showFacts!==false;
  if(data.actions===false)data.actionsHtml='';
 }
 return renderNodes(templates.get(name),data,name);
}
export function renderPageComponent(config,key,overrides={}){
 const block=config.sections[key];if(!block)throw Error('Missing page block: '+key);
 return renderComponent(block.component,{...block.data,...overrides});
}
export function faqEntries(config){
 return config.sections.faq.data.items.map(item=>[item.questionHtml,item.answerHtml]);
}
