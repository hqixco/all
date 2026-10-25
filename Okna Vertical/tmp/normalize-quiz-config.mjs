import fs from 'node:fs';
import { firstQuizQuestion, generalQuizQuestions, balconyQuizQuestions } from '../src/components/quiz-data.js';
fs.writeFileSync('src/components/quiz-data.js',[['firstQuizQuestion',firstQuizQuestion],['generalQuizQuestions',generalQuizQuestions],['balconyQuizQuestions',balconyQuizQuestions]].map(([name,value])=>'export const '+name+' = '+JSON.stringify(value,null,2)+';').join('\n\n')+'\n');
