import fs from 'node:fs';
const pages = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
let count = 0;
for (const page of pages) {
  const original = fs.readFileSync(page.source, 'utf8');
  const html = original.replace(/<input\b[^>]*>/gi, tag => {
    if (!/type="tel"|name="(?:your-phone|phone)"/i.test(tag)) return tag;
    count++;
    let result = tag.replace(/\s(?:pattern|minlength|maxlength|placeholder|inputmode)="[^"]*"/gi, '');
    return result.replace(/\s*\/?>$/, ' placeholder="+7 (___) ___-__-__" inputmode="tel" maxlength="18" pattern="\\+7 \\([0-9]{3}\\) [0-9]{3}-[0-9]{2}-[0-9]{2}">');
  });
  if (html !== original) fs.writeFileSync(page.source, html);
}
const path = 'public/assets/site.js';
const source = fs.readFileSync(path, 'utf8');
if (!source.includes("import './phone-mask.js';")) fs.writeFileSync(path, "import './phone-mask.js';\n" + source);
console.log(`Updated ${count} telephone fields across ${pages.length} pages`);
