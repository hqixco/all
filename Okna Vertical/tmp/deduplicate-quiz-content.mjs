import fs from 'node:fs';
import {homeComponents} from '../seo-pages/components/home.js';
import {apartmentPage} from '../seo-pages/components/apartment.js';
// Defaults for the homepage quiz have one authoring source, shared with legacy behavior.
delete homeComponents.sections.choice.data.questions;
for(const config of [homeComponents,apartmentPage]){
 for(const key of ['questionMetaHtml','questionTitleHtml','questionDescriptionHtml'])delete config.sections.choice.data[key];
}
apartmentPage.sections.hero.data.breadcrumbHtml='';
fs.writeFileSync('seo-pages/components/home.js',"import {firstQuizQuestion, generalQuizQuestions} from '../../src/components/quiz-data.js';\n\n// Page content only. Layouts live in components/*.html.\nexport const homeComponents = "+JSON.stringify(homeComponents,null,2)+";\nhomeComponents.sections.choice.data.questions = [firstQuizQuestion, ...generalQuizQuestions];\n");
fs.writeFileSync('seo-pages/components/apartment.js','// Page content only. Layouts live in components/*.html.\nexport const apartmentPage = '+JSON.stringify(apartmentPage,null,2)+';\n');
