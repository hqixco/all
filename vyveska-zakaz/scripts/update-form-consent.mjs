import fs from 'node:fs';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const pages = JSON.parse(fs.readFileSync('config/site-pages.json', 'utf8'));
let count = 0;
for (const page of pages) {
  let html = fs.readFileSync(page.source, 'utf8');
  const $ = load(html, { sourceCodeLocationInfo: true });
  const edits = [];
  $('form').each((_, form) => {
    const submit = $(form).find('input[type="submit"], button[type="submit"]').last()[0];
    if (!submit) return;
    $(form).find('input[type="checkbox"]').each((_, checkbox) => {
      let consent = $(checkbox).closest('label');
      const wrapper = $(checkbox).closest('.form__consent');
      if (wrapper.length) consent = wrapper;
      if (!consent.find('a[href*="privacy"], a[href*="politik"]').length) return;
      const loc = consent[0].sourceCodeLocation;
      const buttonLoc = submit.sourceCodeLocation;
      assert(loc && buttonLoc, page.source);
      let fragment = html.slice(loc.startOffset, loc.endOffset);
      fragment = fragment.replace(/^(<\w+\b[^>]*class=")([^"]*)"/, '$1$2 form-policy"');
      if (loc.startOffset < buttonLoc.endOffset) {
        edits.push({ start: loc.startOffset, end: loc.endOffset, text: '' });
        edits.push({ start: buttonLoc.endOffset, end: buttonLoc.endOffset, text: fragment });
      } else edits.push({ start: loc.startOffset, end: loc.endOffset, text: fragment });
      count++;
    });
  });
  for (const edit of edits.sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.text + html.slice(edit.end);
  fs.writeFileSync(page.source, html);
  const result = load(html, { sourceCodeLocationInfo: true });
  result('.form-policy').each((_, consent) => {
    const submit = result(consent).closest('form').find('input[type="submit"], button[type="submit"]').last()[0];
    assert(consent.sourceCodeLocation.startOffset >= submit.sourceCodeLocation.endOffset, page.source);
  });
}
console.log(`Moved and checked ${count} consent blocks across ${pages.length} pages`);
