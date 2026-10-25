import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pages } from '../seo-pages/data.js';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
const failures = [];
page.on('pageerror',e=>failures.push(e.message));
const routes = ['/', '/balkony/', '/cookie/', '/politika-konfidentsialnosti/', '/404.html', ...pages.map(p=>`/${p.slug}/`)];
for (const route of routes) {
 await page.goto('http://127.0.0.1:4173'+route);
 if (await page.locator('.global-header').count() !== 1) failures.push('Header count: '+route);
 if (!await page.locator('.global-header__top').isVisible()) failures.push('Header hidden: '+route);
 const broken = await page.evaluate(()=>[...document.querySelectorAll('.global-header img')].filter(img=>!img.complete || !img.naturalWidth).map(img=>img.src));
 failures.push(...broken);
}
await page.goto('http://127.0.0.1:4173/okna-v-kvartiru/');
for (const width of [1536,1440,1200,1024,768,390,320]) {
 await page.setViewportSize({width,height:1024});
 if (await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) failures.push('Overflow: '+width);
 if (width > 1300) {
  const summary = page.locator('.global-header__group summary').first();
  await summary.hover();
  if (!await page.locator('.global-header__dropdown').first().isVisible()) failures.push('Desktop dropdown');
  await page.locator('.global-header__dropdown').first().hover();
  if (!await page.locator('.global-header__dropdown').first().isVisible()) failures.push('Dropdown closes over links');
  await page.locator('.apartment-hero h1').hover();
  if (await page.locator('.global-header__dropdown').first().isVisible()) failures.push('Dropdown stays open after mouse leaves');
  await page.keyboard.press('Escape');
 } else {
  await page.locator('.global-header__toggle').click();
  if (!await page.locator('.global-header__nav').isVisible()) failures.push('Mobile navigation: '+width);
  await page.locator('.global-header__group summary').first().click();
  if (!await page.locator('.global-header__dropdown').first().isVisible()) failures.push('Mobile dropdown: '+width);
  await page.keyboard.press('Escape');
  if (await page.locator('.global-header__nav').isVisible()) failures.push('Escape: '+width);
 }
 if ([1536,390].includes(width)) await page.screenshot({path:`tmp/header-${width}.png`});
}
const css = fs.readFileSync('dist/assets/header.css','utf8');
if (/@media\s*\(\s*width\s*[<>=]/.test(css)) failures.push('Safari media syntax');
await browser.close();
console.log(JSON.stringify({routes:routes.length, widths:7, failures},null,2));
if (failures.length) process.exitCode=1;
