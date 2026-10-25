import fs from 'node:fs';
const html = fs.readFileSync('dist/zamena-krovli/index.html', 'utf8');
const errors = [];
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"|url\(['"]?([^)'"\s]+)/g)) {
  const value = match[1] || match[2];
  if (!value.startsWith('/') || value.startsWith('//')) continue;
  const target = `dist${value.endsWith('/') ? value + 'index.html' : value}`;
  if (!fs.existsSync(target)) errors.push(`Missing link: ${value}`);
}
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) if (!ids.has(id)) errors.push(`Missing anchor: ${id}`);
if ((html.match(/<h1[ >]/g) || []).length !== 1) errors.push('Expected one H1');
if (!html.includes('https://stroy-profi-77.ru/zamena-krovli/')) errors.push('Missing canonical');
if (html.includes('/src/main.js')) errors.push('Legacy renderer');
if (/innerHTML|insertAdjacentHTML|createElement/.test(fs.readFileSync('src/roof-replacement.js', 'utf8'))) errors.push('Dynamic permanent markup');
const css = fs.readFileSync('dist/assets/styles.css', 'utf8');
if (/@media[^{}]*\bwidth\s*[<>]=?/.test(css)) errors.push('Range media query');
if (/@media[^{}]*min-width/.test(css)) errors.push('Min-width media query');
for (const entry of fs.readdirSync('dist/assets', {withFileTypes: true, recursive: true})) if (entry.isFile() && !/^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/.test(entry.name)) errors.push(`Unexpected output name: ${entry.name}`);
if (errors.length) throw new Error(errors.join('\n'));
console.log('OK: assets, local links, anchors, canonical, static markup, stable build filenames and Safari media syntax');
