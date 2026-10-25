import fs from 'node:fs';
import {componentPages} from '../seo-pages/components/index.js';
const slugs=['okna-v-chastnyj-dom','osteklenie-kottedzhey'];
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
for(const slug of slugs){
 const cfg=componentPages[slug];const html=fs.readFileSync(`dist/${slug}/index.html`,'utf8');
 console.log(JSON.stringify({slug,prefix:cfg.prefix,image:cfg.heroImage,title:html.match(/<title>(.*?)<\/title>/)?.[1],description:html.match(/name="description" content="([^"]*)"/)?.[1],order:cfg.order,sections:cfg.order.map(key=>({key,component:cfg.sections[key].component,title:cfg.sections[key].data.titleHtml||cfg.sections[key].data.title,lead:cfg.sections[key].data.leadHtml||cfg.sections[key].data.lead,products:cfg.sections[key].data.products?.map(x=>({title:x.titleHtml,image:x.imageSrc})),items:cfg.sections[key].data.items?.map(x=>({title:x.titleHtml||x.title,description:x.descriptionHtml||x.textHtml}))}))},null,2));
}
const a=componentPages[slugs[0]],b=componentPages[slugs[1]];
for(const key of a.order){if(!b.sections[key])continue;const x=structuredClone(a.sections[key]),y=structuredClone(b.sections[key]);
 const norm=v=>JSON.stringify(v).replaceAll(a.prefix,b.prefix);
 console.log(key+': '+(norm(x)===JSON.stringify(y)?'IDENTICAL':'DIFFERENT'));
}
