import fs from 'node:fs';

const pages=['zamena-krovli','pristroyki','uteplenie-fasadov','zamena-polov','karkasnye-doma'];
const check=process.argv.includes('--check');
function section(html,className) {
 const start=html.search(new RegExp('<section\\b[^>]*class="[^"]*\\b'+className+'\\b[^"]*"'));
 if(start<0)throw new Error('Missing section: '+className);
 let depth=0;
 const tags=/<\/?section\b[^>]*>/g;
 tags.lastIndex=start;
 for(let match;(match=tags.exec(html));) {
  depth+=match[0].startsWith('</')?-1:1;
  if(!depth)return {start,end:tags.lastIndex,text:html.slice(start,tags.lastIndex)};
 }
 throw new Error('Unclosed section: '+className);
}
for(const page of pages) {
 const file=(check?'dist/':'')+page+'/index.html';
 let html=fs.readFileSync(file,'utf8');
 let cases=section(html,'cases');
 if(!check) {
  html=html.slice(0,cases.start)+html.slice(cases.end);
  const quiz=section(html,'quiz');
  html=html.slice(0,quiz.end)+'\n      '+cases.text+html.slice(quiz.end);
  fs.writeFileSync(file,html);
 }
 const quiz=section(html,'quiz');
 cases=section(html,'cases');
 if(cases.start<quiz.end||html.slice(quiz.end,cases.start).trim())throw new Error('Cases must immediately follow quiz: '+file);
 console.log('Verified quiz → cases:',file);
}
