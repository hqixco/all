import fs from 'node:fs';
const f='src/style.css';let s=fs.readFileSync(f,'utf8').replace('.package-modal__form label input {','.package-modal__upload[hidden] { display: none; }\n.package-modal__upload input[type="file"] { padding: 12px; }\n.package-modal__form label input {');fs.writeFileSync(f,s);
