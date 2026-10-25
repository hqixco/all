import fs from 'node:fs';
for(const file of ['index.html','balkony/index.html']){let s=fs.readFileSync(file,'utf8');const old='<section class="quiz-section" id="calculator">';if(!s.includes(old))throw Error('Quiz not found '+file);s=s.replace(old,'<section class="quiz-section" id="quiz">');fs.writeFileSync(file,s)}
