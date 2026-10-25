import fs from 'node:fs';const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const block=`const apartmentFaqEntries = [
 ['Можно заменить одно окно?', 'Да, можно рассчитать замену одного проёма. Сообщите его примерные размеры и пожелания к открыванию.'],
 ...[...home.match(/<section class="home-faq"[^>]*>[\\s\\S]*?<\\/section>/)[0].matchAll(/<details>\\s*<summary>([\\s\\S]*?)<\\/summary>\\s*<p>([\\s\\S]*?)<\\/p>\\s*<\\/details>/g)]
  .map(m => [m[1].replace(/\\s+/g,' ').trim(),m[2].replace(/\\s+/g,' ').trim()])
  .filter(([question]) => ['Сколько времени занимает изготовление окон?','Можно ли заказать окна с монтажом?','Как понять точную цену?','Можно ли заменить окна зимой?','Делаете ли вы демонтаж старых окон?','Можно ли заказать вывоз строительного мусора?','Входят ли подоконники, отливы и откосы в цену?','Какая гарантия действует на окна и монтаж?'].includes(question))
];
const apartmentFaq = () => '<section class="home-faq home-page" id="faq"><div class="home-wrap"><p class="home-kicker">FAQ</p><h2>Вопросы об окнах в квартиру</h2>' + apartmentFaqEntries.map(([question,answer])=>'<details><summary>'+question+'</summary><p>'+answer+'</p></details>').join('') + '</div></section>';
`;
s=s.replace('const blocks = {',block+'const blocks = {');s=s.replace("const faq = section('Вопросы и ответы',", "const faq = p.slug === 'okna-v-kvartiru' ? apartmentFaq() : section('Вопросы и ответы',");s=s.replace("mainEntity:[{'@type':'Question',name:p.faq[0],acceptedAnswer:{'@type':'Answer',text:p.faq[1]}}]", "mainEntity:(p.slug === 'okna-v-kvartiru' ? apartmentFaqEntries : [p.faq]).map(([question,answer])=>({'@type':'Question',name:question,acceptedAnswer:{'@type':'Answer',text:answer}}))");fs.writeFileSync(f,s);
