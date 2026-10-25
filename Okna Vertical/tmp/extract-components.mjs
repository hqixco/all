import fs from 'node:fs';
import {createRequire} from 'node:module';
import {apartmentQuizQuestions} from '../src/apartment-quiz.js';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
fs.mkdirSync('components',{recursive:true});fs.mkdirSync('seo-pages/components',{recursive:true});
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
await page.setContent(fs.readFileSync('okna-v-kvartiru/index.html','utf8'));
const result=await page.evaluate(()=>{
 const templates={};const sections={};
 function field(root,selector,key,data,attribute){
  const el=selector?root.querySelector(selector):root;if(!el)throw Error('Missing '+selector+' '+key);
  if(attribute){data[key]=el.getAttribute(attribute)||'';el.setAttribute(attribute,'{{'+key+'}}');}
  else{data[key]=el.innerHTML;el.innerHTML='{{{'+key+'}}}';}
 }
 function fields(root,mapping,data){for(const [key,selector,attribute] of mapping)field(root,selector,key,data,attribute);}
 function image(root,selector,data){fields(root,[['imageSrc',selector,'src'],['imageWidth',selector,'width'],['imageHeight',selector,'height'],['imageAlt',selector,'alt']],data);}
 function collection(root,selector,key,data,compile){
  const els=[...root.querySelectorAll(selector)];if(!els.length){data[key]=[];return;}
  let itemTemplate;data[key]=els.map((el,i)=>{const item={};compile(el,item);if(i===0)itemTemplate=el.outerHTML;return item;});
  const marker=document.createComment('collection-'+key);els[0].before(marker);els.forEach(el=>el.remove());
  replacements.push(['<!--collection-'+key+'-->','{{#'+key+'}}'+itemTemplate+'{{/'+key+'}}']);
 }
 let replacements=[];
 function component(name,selector,compile){replacements=[];const root=document.querySelector(selector).cloneNode(true);root.className=root.className.replace(/\bapartment-[\w-]+\b/g,'').trim();root.setAttribute('data-component',name);const data={};if(root.id)field(root,'','id',data,'id');compile(root,data);let html=root.outerHTML;for(const [from,to] of replacements)html=html.replace(from,to);templates[name]=html+'\n';return data;}
 const modal=(root,selector,data)=>fields(root,[['modalTitle',selector,'data-package-title'],['modalHeading',selector,'data-package-modal-title'],['modalDescription',selector,'data-package-description'],['modalImage',selector,'data-package-image']],data);
 const hero=component('hero','.apartment-hero',(root,data)=>{
  root.classList.add('page-hero');root.innerHTML=root.innerHTML.replaceAll('apartment-hero__','page-hero__');
  image(root,'.page-hero__backdrop',data);fields(root,[['kickerHtml','.hero-kicker'],['titleHtml','h1'],['leadHtml','.page-hero__lead']],data);
  field(root,'.seo-breadcrumbs','breadcrumbHtml',data);const nav=root.querySelector('.seo-breadcrumbs');nav.outerHTML='{{{breadcrumbHtml}}}';
  collection(root,'.page-hero__cards article','benefits',data,(el,item)=>fields(el,[['iconHtml','svg'],['titleHtml','strong'],['descriptionHtml','p']],item));
  collection(root,'.home-hero-card','products',data,(el,item)=>{image(el,'img',item);fields(el,[['href','','href'],['titleHtml','span'],['captionHtml','b']],item);});
 });
 templates.hero+=document.querySelector('.home-facts').outerHTML+'\n';sections.hero={component:'hero',data:hero};
 sections.solutions={component:'products',data:component('products','.home-products',(root,data)=>{
  fields(root,[['titleHtml','h2'],['leadHtml','.home-section-lead']],data);
  collection(root,'.home-product-card','items',data,(el,item)=>{
   image(el,'.home-product-card__visual > img',item);
   fields(el,[['kickerHtml','.home-product-card__content > span'],['titleHtml','h3'],['descriptionHtml','.home-product-card__content > p'],['priceHtml','.home-product-card__content > strong']],item);
   collection(el,'dl > div','features',item,(row,f)=>fields(row,[['labelHtml','dt'],['valueHtml','dd']],f));modal(el,'button',item);
  });
 })};
 sections.choice={component:'quiz',data:component('quiz','.quiz-section',(root,data)=>{
  root.setAttribute('data-static-quiz','');fields(root,[['titleHtml','.quiz-heading h2'],['leadHtml','.quiz-heading p'],['questionMetaHtml','.question-meta'],['questionTitleHtml','.quiz-card h3'],['questionDescriptionHtml','.quiz-card > p'],['resultTitleHtml','.quiz-result h3'],['resultLeadHtml','.quiz-result__lead'],['commentPlaceholder','.quiz-result textarea','placeholder'],['sourceName','.quiz-result [name="source_name"]','value'],['successHtml','.quiz-success p']],data);
  field(root,'.quiz-options','optionsHtml',data);
  root.insertAdjacentHTML('beforeend','<script type="application/json" data-quiz-questions>{{{questionsJson}}}</script>');
 })};
 sections.cases={component:'cases',data:component('cases','.cases-section',(root,data)=>{
  fields(root,[['titleHtml','h2'],['category','','data-case-category']],data);
  collection(root,'.case-card','items',data,(el,item)=>{
   field(el,'h3','titleHtml',item);
   field(el,'.case-photo','photosHtml',item);el.querySelector('.case-photo').classList.remove('is-case-slider');el.querySelector('.case-photo').setAttribute('data-static-gallery','');
   const thumbs=el.querySelector('.case-slider__thumbs');item.thumbsHtml=thumbs?.outerHTML||'';if(thumbs)thumbs.remove();el.querySelector('.case-photo').insertAdjacentHTML('afterend','{{{thumbsHtml}}}');
   collection(el,'.case-breakdown > div','details',item,(row,f)=>fields(row,[['labelHtml','span'],['valueHtml','strong']],f));
  });
 })};
 sections.price={component:'included',data:component('included','.home-included',(root,data)=>{
  image(root,'.home-estimate > img',data);fields(root,[['titleHtml','h2'],['kickerHtml','.home-kicker'],['leadHtml','.home-included__lead'],['promiseTitleHtml','.home-included__promise strong'],['promiseTextHtml','.home-included__promise span']],data);
  collection(root,'.home-table > div:not(.home-table__head)','items',data,(el,item)=>{
   fields(el,[['labelHtml','b'],['conditionHtml','span'],['conditionClass','span','class']],item);
  });
 })};
 sections.process={component:'installation',data:component('installation','.installation-section',(root,data)=>{
  fields(root,[['kickerHtml','.eyebrow'],['titleHtml','h2'],['leadHtml','.installation-heading p'],['noteTitleHtml','.installation-note strong'],['noteHtml','.installation-note span']],data);image(root,'.installation-diagram img',data);
  collection(root,'.wall-tab','walls',data,(el,item)=>fields(el,[['key','','data-wall-key'],['imageSrc','','data-wall-image'],['className','','class'],['titleHtml','span']],item));
  collection(root,'.installation-details > div','details',data,(el,item)=>fields(el,[['titleHtml','strong'],['descriptionHtml','span']],item));
  collection(root,'.installation-points > li','points',data,(el,item)=>field(el,'','textHtml',item));
  collection(root,'.installation-benefits > div','benefits',data,(el,item)=>fields(el,[['imageSrc','img','src'],['textHtml','span']],item));
 })};
 sections.warranty={component:'warranty',data:component('warranty','.warranty-section',(root,data)=>{
  fields(root,[['titleHtml','h2'],['leadHtml','.warranty-lead'],['footnoteHtml','.warranty-footnote span']],data);
  collection(root,'.warranty-row','items',data,(el,item)=>{field(el,'svg','iconHtml',item);fields(el,[['titleHtml','strong'],['termHtml','b'],['descriptionHtml','span']],item);});
  collection(root,'.warranty-info__item','information',data,(el,item)=>{field(el,'svg','iconHtml',item);field(el,'div','contentHtml',item);});
 })};
 sections.reviews={component:'reviews',data:component('reviews','.reviews-section',(root,data)=>{
  field(root,'h2','titleHtml',data);
  collection(root,'.review-card','items',data,(el,item)=>fields(el,[['mediaStyle','.review-card__media','style'],['titleHtml','h3'],['textHtml','p'],['sourceHtml','.review-card__source'],['sourceClass','.review-card__source','class']],item));
 })};
 sections.faq={component:'faq',data:component('faq','.home-faq',(root,data)=>{
  field(root,'h2','titleHtml',data);collection(root,'details','items',data,(el,item)=>fields(el,[['questionHtml','summary'],['answerHtml','p']],item));
 })};
 sections.calculator={component:'calculator',data:component('calculator','.home-calculator',(root,data)=>{
  image(root,'.home-calculator__visual',data);fields(root,[['titleHtml','h2'],['leadHtml','.home-calculator__intro > p:not(.home-kicker)'],['sourceName','[name="source_name"]','value'],['installationPlace','[name="installation_place"]','value']],data);
 })};
 sections.related={component:'related',data:component('related','.related-section',(root,data)=>{
  field(root,'h2','titleHtml',data);collection(root,'.related-card','items',data,(el,item)=>{image(el,'img',item);fields(el,[['href','','href'],['titleHtml','h3'],['descriptionHtml','p']],item);});
 })};
 const footer=component('footer','.site-footer',(root,data)=>{
  fields(root,[['descriptionHtml','.footer-brand > p'],['ctaTitleHtml','.footer-cta strong']],data);modal(root,'.footer-cta a',data);
  root.querySelector('.footer-navigation').outerHTML='{{{menuHtml}}}';
 });
 const gallery=document.querySelector('.gallery-modal');templates['gallery-modal']=gallery.outerHTML+'\n';
 return {templates,sections,footer};
});
result.sections.choice.data.questionsJson=JSON.stringify(apartmentQuizQuestions).replaceAll('<','\\u003c');
for(const [name,html]of Object.entries(result.templates))fs.writeFileSync(`components/${name}.html`,html);
fs.writeFileSync('seo-pages/components/apartment.js','// Page content only. Layouts live in components/*.html.\nexport const apartmentPage = '+JSON.stringify({order:['hero','choice','cases','solutions','price','process','warranty','reviews','faq','calculator','related'],sections:result.sections,footer:result.footer},null,2)+';\n');
await browser.close();
console.log('Extracted '+Object.keys(result.templates).length+' universal templates');


