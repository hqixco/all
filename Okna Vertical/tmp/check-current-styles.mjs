import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('dist');
const server=http.createServer((req,res)=>{
 let file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
try { const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.route(/https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
 await page.goto(origin+'/proverka-smety/',{waitUntil:'networkidle'});
 await page.screenshot({path:'tmp/styles-desktop.png'}); const styles=await page.locator('.global-header__photo').evaluate(e=>getComputedStyle(e).borderTopWidth); assert.equal(styles,'0px'); await page.locator('.home-hero__actions button').first().click(); assert.equal(await page.locator('.package-modal').getAttribute('aria-hidden'),'false'); assert.equal(await page.evaluate(()=>location.hash),''); await page.keyboard.press('Escape');
 console.log(await page.locator('.home-hero__actions').evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),buttons:[...e.children].map(x=>({tag:x.tagName,rect:x.getBoundingClientRect().toJSON(),color:getComputedStyle(x).color,background:getComputedStyle(x).backgroundColor}))})));
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'tmp/styles-mobile.png'});
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}