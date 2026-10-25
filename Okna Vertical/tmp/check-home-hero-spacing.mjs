import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
for (const width of [1440, 900, 767, 480, 390]) {
 await page.setViewportSize({ width, height: 900 });
 await page.goto('http://127.0.0.1:4173/');
 await page.evaluate(() => document.fonts.ready);
 const spacing = await page.evaluate(() => {
  const header = document.querySelector('.global-header').getBoundingClientRect();
  const content = document.querySelector('.home-hero__grid').getBoundingClientRect();
  return { width: innerWidth, gap: Math.round(content.top - header.bottom), overflow: document.documentElement.scrollWidth > innerWidth };
 });
 console.log(spacing);
 if (spacing.gap < 0 || spacing.gap > 60 || spacing.overflow) throw Error('Invalid hero spacing');
}
await page.setViewportSize({ width: 390, height: 900 });
await page.goto('http://127.0.0.1:4173/');
await page.screenshot({ path: 'tmp/home-hero-spacing.png' });
await browser.close();
