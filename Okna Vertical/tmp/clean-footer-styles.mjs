import fs from 'node:fs';import postcss from 'postcss';
const file='src/style.css';const root=postcss.parse(fs.readFileSync(file,'utf8'));
const footerSelector=/\.(?:site-footer(?:[\w-]*)?|footer-[\w-]+|home-site-footer|legal-footer[\w-]*)\b/;
root.walkRules(rule=>{const kept=rule.selectors.filter(s=>!footerSelector.test(s));if(!kept.length)rule.remove();else rule.selectors=kept;});
root.walkAtRules('media',rule=>{if(!rule.nodes?.length)rule.remove()});fs.writeFileSync(file,root.toString());
let main=fs.readFileSync('src/main.js','utf8');main=main.replace('import "./style.css";','import "./style.css";\nimport "./footer.css";');fs.writeFileSync('src/main.js',main);
