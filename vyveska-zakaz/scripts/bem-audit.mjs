import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import * as cheerio from 'cheerio';

const roots = ['index.html', 'pages', 'search', 'public', 'dist'];
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  if (fs.statSync(dir).isFile()) { if (/\.html$/i.test(dir)) files.push(dir); return; }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.html$/i.test(full)) files.push(full);
  }
}
roots.forEach(walk);
const invalid = new Set();
const classPattern = /^[a-z][a-z0-9-]*(?:__[a-z][a-z0-9-]*)?(?:--[a-z0-9-]+)?$/;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(html);
  $('*').each((index, element) => {
    if (!(element.attribs.class || '').trim()) invalid.add(`${file}: <${element.tagName}> without a BEM class`);
  });
  for (const match of html.matchAll(/\bclass=["']([^"']*)["']/g)) {
    for (const token of match[1].split(/\s+/).filter(Boolean)) if (!classPattern.test(token)) invalid.add(`${file}: ${token}`);
  }
}
for (const file of [...walkCss('public'), ...walkCss('dist')]) {
  const css = fs.readFileSync(file, 'utf8');
  const root = postcss.parse(css, { from: file });
  root.walkRules((rule) => {
    for (const match of rule.selector.matchAll(/\.([_A-Za-z][_A-Za-z0-9-]*)/g)) {
      if (!classPattern.test(match[1])) invalid.add(`${file}: ${match[1]}`);
    }
  });
}
function walkCss(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkCss(full) : full.endsWith('.css') ? [full] : [];
  });
}
if (invalid.size) {
  console.error([...invalid].slice(0, 100).join('\n'));
  console.error(`Invalid BEM class tokens: ${invalid.size}`);
  process.exitCode = 1;
} else console.log(`BEM naming checked in ${files.length} HTML files and CSS bundles.`);
