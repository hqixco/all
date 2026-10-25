import fs from 'node:fs';
import { renderComponent } from './components.mjs';
import { homeComponents } from '../seo-pages/components/home.js';

const selectors = {solutions:'home-products',price:'home-included',process:'installation-section',cases:'cases-section',faq:'home-faq',calculator:'home-calculator',compare:'compare-section'};
export function syncHomeComponents(menuHtml) {
 let html=fs.readFileSync('index.html','utf8');
 const companyStart='<!-- component:company -->';const companyEnd='<!-- /component:company -->';
 if(!html.includes(companyStart))throw Error('Missing homepage company component slot');
 html=html.replace(new RegExp(companyStart+'[\\s\\S]*?'+companyEnd),companyStart+'\n'+renderComponent('company',homeComponents.sections.company.data)+'\n'+companyEnd);
 for(const [key,className] of Object.entries(selectors)){
  const block=homeComponents.sections[key];const markup=renderComponent(block.component,block.data);
  const start=`<!-- component:${block.component} -->`;const end=`<!-- /component:${block.component} -->`;
  const marked=new RegExp(start+'[\\s\\S]*?'+end);
  const original=new RegExp('<section class="'+className+'[^"\\n]*"[^>]*>[\\s\\S]*?<\\/section>');
  const pattern=html.includes(start)?marked:original;
  if(!pattern.test(html))throw Error('Missing homepage slot: '+key);
  html=html.replace(pattern,start+'\n'+markup+end);
 }
 const quiz=homeComponents.sections.choice;const quizStart='<!-- component:quiz -->';const quizEnd='<!-- /component:quiz -->';
 const quizMarkup=quizStart+'\n'+renderComponent('quiz',quiz.data)+quizEnd;
 if(html.includes(quizStart))html=html.replace(new RegExp(quizStart+'[\\s\\S]*?'+quizEnd),quizMarkup);
 else html=html.replace(/(<section class="home-hero"[\s\S]*?<\/section>)/,'$1\n'+quizMarkup);
 const caseBlock=html.match(/<!-- component:cases -->[\s\S]*?<!-- \/component:cases -->/)[0];
 html=html.replace(caseBlock,'').replace(quizEnd,quizEnd+'\n'+caseBlock);
 // The review slot used to be filled and shuffled in browser JavaScript.
 const reviewMarkup='<!-- component:reviews -->\n'+renderComponent('reviews',homeComponents.sections.reviews.data)+'<!-- /component:reviews -->';
 if(html.includes('<!-- component:reviews -->'))html=html.replace(/<!-- component:reviews -->[\s\S]*?<!-- \/component:reviews -->/,reviewMarkup);
 else html=html.replace(/<div id="home-reviews-slot"[^>]*><\/div>/,reviewMarkup);
 const warranty=homeComponents.sections.warranty;
 const warrantyMarkup='<!-- component:warranty -->\n'+renderComponent(warranty.component,warranty.data)+'<!-- /component:warranty -->';
 html=html.replace(/<!-- component:warranty -->[\s\S]*?<!-- \/component:warranty -->/,'');
 html=html.replace('<!-- component:reviews -->',warrantyMarkup+'\n<!-- component:reviews -->');
 const footerMarkup=renderComponent('footer',{...homeComponents.footer,menuHtml});
 html=html.replace(/<footer\b(?=[^>]*class="[^"]*\bhome-site-footer\b)[^>]*>[\s\S]*?<\/footer>/,footerMarkup);
 fs.writeFileSync('index.html',html);
}
