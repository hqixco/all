import fs from 'node:fs';
const path = 'public/assets/theme/css/main.css';
let css = fs.readFileSync(path, 'utf8');
css = css.replace(/\t\.root__head \.line--1 \.head__callback \.button \{\s*min-width: 62px\s*\}\s*\.root__head \.line--1 \.head__callback \.button \.fa \{\s*display: block\s*\}\s*\.root__head \.line--1 \.head__callback \.button \.t \{\s*display: none\s*\}/, '\t.root__head .line--1 .head__callback {\n\t\tdisplay: none;\n\t}');
// The 1000px rule also covers the smaller breakpoint.
let hiddenRuleSeen = false;
css = css.replace(/\t\.root__head \.line--1 \.head__callback \{\s*display: none;?\s*\}/g, rule => {
  if (hiddenRuleSeen) return '';
  hiddenRuleSeen = true;
  return rule;
});
fs.writeFileSync(path, css);
const legacy = 'public/assets/legacy-theme.css';
fs.writeFileSync(legacy, fs.readFileSync(legacy, 'utf8').replace('.root__head .line--1 .head__callback{display:none}', ''));
