import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const home = cheerio.load(await fs.readFile('index.html', 'utf8'));
const section = home('#home-spar').prop('outerHTML');
const modal = home('#sparGallery').prop('outerHTML');
if (!section || !modal) throw new Error('Shared SPAR component missing');
const targets = [
  { source: 'pages/oformlenie-seti-magazinov/index.html', selector: '#store-network-cases' },
  { source: 'pages/o-kompanii/index.html', selector: '#company-shops' },
];
const start = '<!-- shared-home-spar:start -->';
const end = '<!-- shared-home-spar:end -->';
for (const target of targets) {
  let html = await fs.readFile(target.source, 'utf8');
  const id = target.selector.slice(1);
  const markup = section.replace('id="home-spar"', 'id="' + id + '"').replace('class="home__section ', 'class="' + id + ' home__section ');
  const block = start + '\n' + markup + '\n' + modal + '\n' + end;
  if (html.includes(start)) {
    html = html.slice(0, html.indexOf(start)) + block + html.slice(html.indexOf(end) + end.length);
  } else {
    const doc = cheerio.load(html, { sourceCodeLocationInfo: true });
    const node = doc(target.selector).get(0);
    if (!node) throw new Error('SPAR target missing: ' + target.source);
    html = html.slice(0, node.sourceCodeLocation.startOffset) + block + html.slice(node.sourceCodeLocation.endOffset);
  }
  for (const asset of ['home-spar.css', 'home-spar.js', 'gallery-popup.css', 'gallery-popup.js']) {
    if (html.includes('"/assets/' + asset + '"')) continue;
    const tag = asset.endsWith('.css') ? '<link rel="stylesheet" href="/assets/' + asset + '">' : '<script type="module" src="/assets/' + asset + '"></script>';
    html = html.replace('</head>', tag + '</head>');
  }
  await fs.writeFile(target.source, html);
}
console.log('Shared SPAR synchronized: ' + targets.length + ' pages');
