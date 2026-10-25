export function adjacentHeading($){
 const tokens=[];
 function visit(e){if(e.type==='text'){if(e.data.trim())tokens.push({type:'text',e});return;}if(e.type!=='tag')return;const n=$(e);if(n.is('script,style,noscript,template,[hidden],[aria-hidden="true"]'))return;if(n.is('h1,h2')){tokens.push({type:e.name,e});return;}if(n.is('img,video,iframe,table,form')){tokens.push({type:'media',e});return;}for(const child of e.children||[])visit(child);}
 for(const e of $('main').first().toArray())visit(e);const i=tokens.findIndex(t=>t.type==='h1');return i>=0&&tokens[i+1]?.type==='h2'?tokens[i+1].e:null;
}
