import fs from 'node:fs';
const f='scripts/sync-header.mjs';let s=fs.readFileSync(f,'utf8').replace(' fs.writeFileSync(file,html);',' if (file.startsWith("public/")) html=html.replace(\'src="/src/main.js"\',\'src="/assets/main.js"\');\n fs.writeFileSync(file,html);');fs.writeFileSync(f,s);
