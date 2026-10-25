import fs from 'node:fs';
import path from 'node:path';
const roots = ['index.html', 'pages', 'search', 'public', 'dist'];
const files = [];
function walk(p) {
  if (!fs.existsSync(p)) return;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) for (const name of fs.readdirSync(p)) walk(path.join(p, name));
  else if (/\.(html|css|js|json|xml|txt)$/i.test(p)) files.push(p);
}
roots.forEach(walk);
const bad = [];
for (const file of files) {
  const data = fs.readFileSync(file, 'utf8');
  if (/<br\b/i.test(data)) bad.push(`${file}: br tag`);
  if (/@media[^{}]*\bmin-width\s*:/i.test(data)) bad.push(`${file}: min-width media query`);
  if (/!important/i.test(data)) bad.push(`${file}: !important`);
  if (/\/wp-(?:admin|content|includes|json)|wp-comments-post\.php/i.test(data)) bad.push(`${file}: WordPress link`);
  if (/document\.createElement|\.innerHTML\s*=|insertAdjacentHTML/i.test(data)) bad.push(`${file}: runtime markup creation`);
  if (/content\s*:\s*["'][^"']+["']/i.test(data)) bad.push(`${file}: text-based CSS icon/content`);
}
const missing = new Set();
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:src|href|srcset|content)=["'](\/(?:assets|uploads|cache)\/[^"'#?,\s]+)/g)) {
    const asset = path.join('dist', match[1].slice(1));
    if (!fs.existsSync(asset)) missing.add(`${file} -> ${match[1]}`);
  }
}
for (const file of files.filter((f) => f.startsWith('dist') && f.endsWith('.css'))) {
  const css = fs.readFileSync(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    const reference = match[1].split(/[?#]/, 1)[0];
    if (!reference || /^(?:data:|https?:|\/\/|#)/i.test(reference)) continue;
    const target = reference.startsWith('/')
      ? path.join('dist', reference.slice(1))
      : path.resolve(path.dirname(file), reference);
    if (!fs.existsSync(target)) missing.add(`${file} -> ${reference}`);
  }
}
if (bad.length || missing.size) {
  console.error([...bad, ...missing].join('\n'));
  process.exitCode = 1;
} else console.log(`Checked ${files.length} files; no forbidden tags, paths, or missing local assets.`);
