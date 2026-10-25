import fs from 'node:fs';
let s=fs.readFileSync('scripts/generate-seo.mjs','utf8');s="import { syncHomeComponents } from './sync-home-components.mjs';\n"+s;s=s.replace("const home = fs.readFileSync('index.html','utf8');","syncHomeComponents(footerMenuMarkup('/'));\nconst home = fs.readFileSync('index.html','utf8');");fs.writeFileSync('scripts/generate-seo.mjs',s);
