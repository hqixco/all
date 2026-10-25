import fs from 'node:fs';const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');const start=s.indexOf('const apartmentFooter =');const pos=s.indexOf(' content = content.replaceAll',start);s=s.slice(0,pos)+` content = content.replace('Нужны окна для квартиры, дачи или дома?', 'Нужны новые окна в квартиру?');
`+s.slice(pos);fs.writeFileSync(f,s);
