import fs from 'node:fs';
const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');
const block=`const apartmentInstallation = () => {
 let content = home.match(/<section class="installation-section"[^>]*>[\\s\\S]*?<\\/section>/)[0];
 content = content.replace('class="installation-section"','class="installation-section"');
 content = content.replace('Подбираем монтажный узел под материал стен','Монтаж окон в квартире с учётом материала стен');
 content = content.replace(/(<div class="installation-heading">[\\s\\S]*?<p>)[\\s\\S]*?<\\/p>/,'$1Перед заменой окон проверяем материал и состояние проёмов, откосы и примыкания. Подбираем крепление и защиту монтажного шва, чтобы сохранить тепло и защитить квартиру от продувания.</p>');
 content = content.replace(/<button\\s+class="wall-tab"[\\s\\S]*?data-wall-key="(?:frame|wood)"[\\s\\S]*?<\\/button>/g,'');
 content = content.replace('Кирпичный дом','Кирпичные стены');
 content = content.replace(/>До изготовления проверяем проёмы, стены, фасад и будущую\\s+отделку\. Подбираем решение, которое будет работать\\s+десятилетиями\./,'>До изготовления проверяем проёмы квартиры, состояние кладки, подоконники и откосы. Согласуем крепление, монтажные материалы и отделку до начала работ.');
 content = content.replace('Наружная отделка фасада','Защита наружного примыкания');
 content = content.replace(/(<img\\s+src="\\/assets\\/installation-aerated.webp"[^>]*)(>)/,'$1 loading="lazy"$2');
 return content;
};
`;
s=s.replace('const blocks = {',block+'const blocks = {').replace(' process,warranty,cases:()=>portfolio,', " process:p=>p.slug === 'okna-v-kvartiru' ? apartmentInstallation() : process(),warranty,cases:()=>portfolio,");fs.writeFileSync(f,s);
s=fs.readFileSync('src/main.js','utf8').replace('const wallDetailsElement = document.querySelector(".installation-details");\n','');s=s.replace('    wallTabs.forEach((item) => item.classList.remove("is-active"));','    const section = tab.closest(".installation-section");\n    const wallDetailsElement = section.querySelector(".installation-details");\n    section.querySelectorAll(".wall-tab").forEach((item) => item.classList.remove("is-active"));').replace('    document.querySelector(".installation-diagram img").src =\n      tab.dataset.wallImage;', '    const diagram = section.querySelector(".installation-diagram img");\n    diagram.src = tab.dataset.wallImage;\n    diagram.alt = "Схема монтажного узла: " + tab.textContent.trim().replace(/\\s+/g, " ");');fs.writeFileSync('src/main.js',s);
