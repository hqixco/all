import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
function check(directory) {
 for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
  const file = directory + '/' + entry.name;
  if (entry.isDirectory()) { check(file); continue; }
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1\s*>/g)) {
   const label = match[3].replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
   if (label !== 'Смотреть примеры работ') continue;
   assert.equal(match[1], 'a', file);
   assert(!match[2].includes('data-package-'), file);
   const href = match[2].match(/href="([^"]+)"/)?.[1];
   assert(href?.startsWith('#') || href === '/portfolio/#works', file);
   if (href.startsWith('#')) assert(html.includes('id="' + href.slice(1) + '"'), file);
  }
 }
}
check('dist');
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
for (const route of ['/', '/portfolio/', '/okna-v-kvartiru/', '/o-kompanii/']) {
 await page.goto('http://127.0.0.1:4173' + route);
 const link = page.getByRole('link', { name: 'Смотреть примеры работ', exact: true }).first();
 await link.click();
 await page.waitForURL(url => Boolean(url.hash));
 assert.equal(await page.locator('.package-modal.is-open').count(), 0, route);
 console.log(route + ' → ' + new URL(page.url()).pathname + new URL(page.url()).hash);
}
await browser.close();
