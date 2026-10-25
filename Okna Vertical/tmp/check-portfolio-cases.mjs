import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
for (const width of [1440, 390]) {
 await page.setViewportSize({ width, height: 1000 });
 await page.goto('http://127.0.0.1:4173/portfolio/');
 const section = page.locator('.portfolio-cases');
 const buttons = section.locator('.cases-menu__button');
 if (await buttons.count() !== 3) throw Error('Missing category menu');
 for (const button of await buttons.all()) {
  await button.click();
  const category = await button.getAttribute('data-case-category');
  const visibleCards = await section.locator('.case-card:visible').evaluateAll(cards => cards.map(card => card.dataset.caseCategories));
  if (!visibleCards.length || visibleCards.some(value => !value.split(' ').includes(category))) throw Error('Invalid category filter: ' + category);
 }
 if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Horizontal overflow');
 console.log('Portfolio category menu works at ' + width);
}
await browser.close();
