import {preview} from 'vite';
import {chromium} from 'playwright';
const server=await preview({preview:{host:'127.0.0.1',port:5181}});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 await page.route('https://**/*',route=>route.abort());
 await page.goto('http://127.0.0.1:5181/zamena-krovli/');
 for(const [name,width] of [['desktop',1440],['mobile',390]]) {
  await page.setViewportSize({width,height:1000});
  const card=page.locator('.quiz-manager');
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({path:`quiz-${name}.png`});
  console.log(name,await card.evaluate(el=>getComputedStyle(el,'::before').backgroundImage));
  const status=page.locator('.quiz-form .form-status');
  if(await status.evaluate(el=>getComputedStyle(el).display)!=='none')throw new Error('Empty status must be hidden');
  await status.evaluate(el=>el.textContent='Проверка сообщения');
  if(await status.evaluate(el=>getComputedStyle(el).display)==='none')throw new Error('Status message must be visible');
  await status.evaluate(el=>el.textContent='');
  console.log(name,'empty status hidden; populated status visible');
 }
}finally {await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
