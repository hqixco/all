import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage();
await page.goto('http://127.0.0.1:4173/');
const before=await page.evaluate(()=>scrollY);
await page.locator('.home-hero-card--cta').click();
await page.locator('.package-modal.is-open').waitFor();
const title=await page.locator('#package-modal-title').textContent();
if(title!=='Рассчитать стоимость моего объекта')throw Error('Wrong modal title: '+title);
if(await page.evaluate(()=>location.hash==='#calculator'))throw Error('Calculator anchor activated');
console.log('CTA opens estimate modal; calculator anchor is not activated');
} finally { await browser.close(); }
