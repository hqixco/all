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
 const block=page.locator('.comparison-checklist');
 assert(await block.evaluate(e=>e.classList.contains('content-section--illustrated')));
 assert.equal(await block.locator('.content-card__icon').count(),4);
 await block.screenshot({path:'tmp/comparison-checklist-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await block.locator('.content-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2);
 await block.screenshot({path:'tmp/comparison-checklist-mobile.png'});
 console.log('Checklist: shared design, four icons, two mobile columns passed');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}