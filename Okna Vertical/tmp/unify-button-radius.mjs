import fs from 'node:fs';
import postcss from 'postcss';
const html=fs.readFileSync('index.html','utf8')+fs.readFileSync('balkony/index.html','utf8')+fs.readFileSync('okna-v-kvartiru/index.html','utf8');
const classes=new Set(['button','home-button','home-hero__measure','home-hero__works-button','apartment-hero__measure','global-header__photo','reviews-platform-button','service-link','case-slider__nav','case-slider__thumb']);
for(const [tag] of html.matchAll(/<button\b[^>]*>/g)) for(const name of (tag.match(/class="([^"]+)"/)?.[1]||'').split(/\s+/)) if(name)classes.add(name);
const target=selector=>{
 let clean=selector;
 while(/\([^()]*\)/.test(clean))clean=clean.replace(/\([^()]*\)/g,'');
 const last=clean.trim().split(/[\s>+~]+/).pop();
 return /(^|[^\w-])button(?=[:.#\[]|$)/.test(last)||[...last.matchAll(/\.([\w-]+)/g)].some(([,name])=>classes.has(name));
};
for(const file of ['src/style.css','src/seo.css','public/assets/header.css']){
 const root=postcss.parse(fs.readFileSync(file,'utf8'));
 let count=0;
 root.walkRules(rule=>{
  const selectors=rule.selectors;
  if(!selectors.some(target))return;
  const radius=rule.nodes.filter(node=>node.type==='decl'&&node.prop==='border-radius');
  if(!radius.length)return;
  if(selectors.every(target))radius.forEach(decl=>{decl.value='var(--button-radius)';decl.important=false;count++;});
  else {
   const matching=selectors.filter(target);
   const remaining=selectors.filter(selector=>!target(selector));
   const clone=rule.cloneAfter({selector:matching.join(', ')});
   clone.walkDecls('border-radius',decl=>{decl.value='var(--button-radius)';decl.important=false;count++;});
   rule.selector=remaining.join(', ');
  }
 });
 fs.writeFileSync(file,root.toString());
 console.log({file,updated:count});
}
