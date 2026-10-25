import fs from 'node:fs';
import {apartmentPage} from '../seo-pages/components/apartment.js';
for(const item of apartmentPage.sections.cases.data.items){
 item.photos=[...item.photosHtml.matchAll(/<img\b[^>]*>/g)].map(([tag])=>({src:tag.match(/src="([^"]*)"/)[1],alt:tag.match(/alt="([^"]*)"/)?.[1]||''}));
 delete item.photosHtml;delete item.thumbsHtml;
}
const quiz=apartmentPage.sections.choice.data;quiz.questions=JSON.parse(quiz.questionsJson);delete quiz.questionsJson;delete quiz.optionsHtml;
fs.writeFileSync('seo-pages/components/apartment.js','// Page content only. Layouts live in components/*.html.\nexport const apartmentPage = '+JSON.stringify(apartmentPage,null,2)+';\n');
let cases=fs.readFileSync('components/cases.html','utf8').replace('data-static-gallery=""','data-static-gallery="" class-marker=""');cases=cases.replace('class-marker=""','').replace('class="case-photo case-photo--gallery"','class="case-photo case-photo--gallery is-case-slider"');fs.writeFileSync('components/cases.html',cases);
for(const name of fs.readdirSync('components')){
 let html=fs.readFileSync('components/'+name,'utf8');
 // Expand nested scaffold markers into proper collection templates.
 if(name==='products.html')html=html.replace('<!--collection-features-->','{{#features}}<div><dt>{{{labelHtml}}}</dt><dd>{{{valueHtml}}}</dd></div>{{/features}}');
 if(name==='cases.html')html=html.replace('<!--collection-details-->','{{#details}}<div><span>{{{labelHtml}}}</span><strong>{{{valueHtml}}}</strong></div>{{/details}}');
 fs.writeFileSync('components/'+name,html);
}
