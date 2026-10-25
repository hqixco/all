import fs from 'node:fs';
const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const code=`const apartmentReviews = () => {
 let content = home.match(/<section class="reviews-section okna-reviews"[^>]*>[\\s\\S]*?<\\/section>/)[0];
 content = content.replace('Что говорят заказчики после установки окон','Отзывы после замены окон в квартире');
 content = content.replace(/<article class="review-card">[\\s\\S]*?<\\/article>/g, card => {
  if (!/квартир/i.test(card)) return '';
  const stars = '<strong aria-label="Оценка: 5 из 5"><svg viewBox="0 0 120 24" width="100" height="20" fill="currentColor" aria-hidden="true">' + Array.from({length:5},(_,i)=>'<path transform="translate('+i*24+' 0)" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z"/>').join('') + '</svg></strong>';
  return card.replace(/<strong>★+<\\/strong>/,stars).replace(/<\\/p>/,'</p><button class="review-card__toggle" type="button" aria-label="Показать отзыв полностью" aria-expanded="false" hidden></button>');
 });
 content = content.replaceAll('<b aria-hidden="true">→</b>','<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>');
 return content;
};
`;
s=s.replace('const blocks = {',code+'const blocks = {').replace('${p.solutions ? localReviews(p) : \'\'}', '${p.solutions ? (p.slug === \'okna-v-kvartiru\' ? apartmentReviews() : localReviews(p)) : \'\'}');fs.writeFileSync(f,s);
s=fs.readFileSync('src/main.js','utf8');s=s.replace('      text.insertAdjacentElement("afterend", toggle);\n\n      toggle.addEventListener', '      text.insertAdjacentElement("afterend", toggle);\n    }\n    if (!toggle.dataset.reviewToggleReady) {\n      toggle.dataset.reviewToggleReady = "true";\n      toggle.addEventListener');fs.writeFileSync('src/main.js',s);
