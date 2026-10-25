import fs from 'node:fs';
const path='scripts/generate-seo.mjs';
let s=fs.readFileSync(path,'utf8');
const addition=`const apartmentCalculator = () => {
  const template = home.match(/<section class="home-calculator" id="calculator">[\\s\\S]*?<\\/section>/)?.[0];
  if (!template) throw new Error('Homepage calculator template not found');
  return template
    .replace('class="home-calculator"', 'class="home-calculator home-page"')
    .replace('Узнайте ориентировочную стоимость окон', 'Узнайте стоимость окон в квартиру')
    .replace('Ответьте на несколько вопросов — получите расчёт стоимости окон с учётом монтажа и доставки.', 'Укажите количество и размеры окон в квартире, выберите необходимые работы — получите предварительный расчёт.')
    .replace('указываем финальную цену', 'согласуем смету после замера')
    .replace(/<p>Куда устанавливаем\\?<\\/p>\\s*<div class="home-calc-options home-calc-options--place">[\\s\\S]*?<\\/div>/, '<input type="hidden" name="installation_place" value="apartment" />')
    .replace('<form class="home-lead-form home-calculator__form">', '<form class="home-lead-form home-calculator__form" action="/mail.php" method="post"><input type="hidden" name="source_name" value="Калькулятор: окна в квартиру" />');
};
`;
if(s.includes('const apartmentCalculator'))throw Error('already added');
s=s.replace('const apartmentFooter =',addition+'const apartmentFooter =');
s=s.replace('${faq}${form(p)}','${faq}${p.slug === "okna-v-kvartiru" ? apartmentCalculator() : form(p)}');
fs.writeFileSync(path,s);
