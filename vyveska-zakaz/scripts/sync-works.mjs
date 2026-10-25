import fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
const home = await fs.readFile('index.html', 'utf8');
const source = cheerio.load(home);
const section = source('#home-works').prop('outerHTML');
const popup = source('#caseGallery').prop('outerHTML');
if (!section || !popup) throw new Error('Homepage works component missing');
const targets = JSON.parse(await fs.readFile('config/shared-works.json', 'utf8'));
const start = '<!-- shared-home-works:start -->';
const end = '<!-- shared-home-works:end -->';
for (const target of targets) {
  let html = await fs.readFile(target.source, 'utf8');
  const anchor = target.sections.find(item => item.id)?.id;
  const openingDoc = cheerio.load(html);
  const openingTitle = openingDoc('.legacy-layout__title').filter((i,e)=>openingDoc(e).find('h1').length).first();
  let sectionMarkup = anchor ? section.replace('id="home-works"', 'id="' + anchor + '"') : section;
  if (openingTitle.length && (openingTitle.closest('.home-works').length || openingTitle.next().hasClass('home-works'))) {
    const titleMarkup = openingTitle.clone().removeClass('root__width').addClass('page-opening__title').toString();
    const breadcrumbs = openingDoc('main .legacy__breadcrumbs').first();
    const breadcrumbsMarkup = breadcrumbs.length ? breadcrumbs.clone().removeClass('root__width').addClass('page-opening__breadcrumbs').toString() : '';
    breadcrumbs.remove();
    openingTitle.remove();
    html = openingDoc.html();
    const template = cheerio.load(sectionMarkup);
    template('section').first().addClass('page-opening');
    template('.home-works__wrapper').prepend(breadcrumbsMarkup + titleMarkup);
    sectionMarkup = template('section').first().toString();
  }
  const block = start + '\n' + sectionMarkup + '\n' + popup + '\n' + end;
  if (html.includes(start)) {
    html = html.slice(0, html.indexOf(start)) + block + html.slice(html.indexOf(end) + end.length);
  } else {
    const doc = cheerio.load(html, { sourceCodeLocationInfo: true });
    const edits = target.sections.map(item => {
      const node = doc('section').get(item.index);
      if (!node || doc(node).find('h2').first().text().trim() !== item.title) throw new Error('Section changed: ' + target.source);
      return { start: node.sourceCodeLocation.startOffset, end: node.sourceCodeLocation.endOffset };
    }).sort((a,b) => b.start-a.start);
    for (const edit of edits) html = html.slice(0, edit.start) + block + html.slice(edit.end);
  }
  const assets = ['home-cases.css', 'gallery-popup.css', 'home-cases.js', 'gallery-popup.js'];
  for (const asset of assets) {
    if (html.includes('"/assets/' + asset + '"')) continue;
    const tag = asset.endsWith('.css') ? '<link rel="stylesheet" href="/assets/' + asset + '">' : '<script type="module" src="/assets/' + asset + '"></script>';
    html = html.replace('</head>', tag + '</head>');
  }
  await fs.writeFile(target.source, html);
}
console.log('Shared homepage works synchronized: ' + targets.length + ' pages');
