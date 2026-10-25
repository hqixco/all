import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/okna-v-kvartiru/','/balkony/','/cookie/']){
await page.goto('http://127.0.0.1:4173'+route);await page.locator('.global-header__photo').click();await page.locator('.package-modal.is-open').waitFor();if(!await page.locator('.package-modal__upload').isVisible())throw Error('No upload '+route);if(await page.locator('#package-modal-title').textContent()!=='Расчёт остекления по фото')throw Error('Wrong title');await page.locator('.package-modal__close').click();if(await page.locator('.package-modal').getAttribute('aria-hidden')!=='true')throw Error('Close failed');console.log('Photo popup opened and closed: '+route)
}await browser.close();if(errors.length)throw Error(errors.join('\n'));
