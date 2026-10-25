import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const home = cheerio.load(await fs.readFile('index.html', 'utf8'));
const templates = { contact: home('#home-contact').prop('outerHTML'), clients: home('#partners').prop('outerHTML'), reviews: home('#home-reviews').prop('outerHTML') };
const assets = { contact: ['contact.css'], clients: ['partners.css'], reviews: ['home-reviews.css','home-reviews.js'] };
const targets = JSON.parse(await fs.readFile('config/shared-home-blocks.json', 'utf8'));
for (const target of targets) {
  let html = await fs.readFile(target.source, 'utf8');
  const doc = cheerio.load(html, { sourceCodeLocationInfo: true });
  const edits = target.blocks.map(item => {
    const start = '<!-- shared-home-' + item.type + ':start -->';
    const end = '<!-- shared-home-' + item.type + ':end -->';
    let markup = templates[item.type];
    if (!markup) throw new Error('Missing home template: ' + item.type);
    if (item.id) {
      const original = item.type === 'contact' ? 'home-contact' : item.type === 'reviews' ? 'home-reviews' : 'partners';
      markup = markup.replace('id="' + original + '"', 'id="' + item.id + '"');
    }
    const value = start + '\n' + markup + '\n' + end;
    if (html.includes(start)) return { start: html.indexOf(start), end: html.indexOf(end) + end.length, value };
    const node = doc('main section').get(item.index);
    if (!node || doc(node).find('h2').first().text().trim() !== item.title) throw new Error('Section changed: ' + target.source + ' ' + item.type);
    return { start: node.sourceCodeLocation.startOffset, end: node.sourceCodeLocation.endOffset, value };
  }).sort((a,b)=>b.start-a.start);
  for (const edit of edits) html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
  for (const asset of new Set(target.blocks.flatMap(item=>assets[item.type]))) {
    if (html.includes('"/assets/' + asset + '"')) continue;
    const tag = asset.endsWith('.css') ? '<link rel="stylesheet" href="/assets/' + asset + '">' : '<script type="module" src="/assets/' + asset + '"></script>';
    html = html.replace('</head>', tag + '</head>');
  }
  await fs.writeFile(target.source, html);
}
console.log('Home contact, clients and reviews synchronized: ' + targets.length + ' pages');
