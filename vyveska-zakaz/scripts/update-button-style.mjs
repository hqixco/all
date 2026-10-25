import fs from 'node:fs';
const path = 'public/assets/legacy-theme.css';
let css = fs.readFileSync(path, 'utf8');
css = css.replace('min-height:42px;max-width:100%;padding:10px 18px;border:1px solid #2d2572;border-radius:4px;', 'min-height:48px;max-width:100%;padding:12px 22px;border:1px solid #2d2572;border-radius:24px;')
  .replace('font:700 15px/1.4 Roboto,Arial,sans-serif;text-align:center;text-transform:uppercase', 'font:700 16px/1.4 Roboto,Arial,sans-serif;text-align:center;text-transform:uppercase')
  .replace('input.legacy__button{font-size:14px;padding:10px 14px}', 'input.legacy__button{font-size:15px;padding:12px 18px}');
fs.writeFileSync(path, css);
const themePath = 'public/assets/theme/css/main.css';
css = fs.readFileSync(themePath, 'utf8');
css = css.replace(/(\.button--default \{)([\s\S]*?)(\n\})/, (_, start, body, end) => start + body.replace('font-size: 15px', 'font-size: 16px').replace('padding: 15px 30px', 'padding: 16px 32px').replace('border-radius: 20px', 'border-radius: 28px') + end);
fs.writeFileSync(themePath, css);
const sitePath = 'public/assets/site.css';
css = fs.readFileSync(sitePath, 'utf8').replace('  padding: 12px 18px;\n  font-size: 16px;', '  padding: 12px 22px;\n  font-size: 16px;');
fs.writeFileSync(sitePath, css);
