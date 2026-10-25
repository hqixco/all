import fs from 'node:fs';
const webhook=fs.readFileSync('public/mail.php','utf8').match(/const BITRIX_WEBHOOK_URL = '([^']+)'/)[1];
async function call(method,params={}){
 const response=await fetch(webhook+method+'.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(params),signal:AbortSignal.timeout(30000)});
 const data=await response.json();if(data.error)throw Error(data.error+': '+data.error_description);return data;
}
const sources=(await call('crm.status.list',{filter:{ENTITY_ID:'SOURCE'}})).result;
const labels=new Map(sources.map(x=>[x.STATUS_ID,x.NAME]));
const records=new Map();let start=0,total;
do{
 const data=await call('crm.lead.list',{order:{ID:'ASC'},filter:{'>=DATE_CREATE':'2026-09-01T00:00:00+03:00','<DATE_CREATE':'2026-10-01T00:00:00+03:00'},select:['ID','DATE_CREATE','SOURCE_ID','STATUS_ID','STATUS_SEMANTIC_ID'],start});
 total=data.total;for(const lead of data.result)records.set(lead.ID,lead);
 console.log('Read '+records.size+' / '+total+' leads');
 start=data.next;if(start!==undefined)await new Promise(resolve=>setTimeout(resolve,550));
}while(start!==undefined);
if(records.size!==total)throw Error('Pagination total mismatch');
const counts={};for(const lead of records.values()){
 const key=lead.SOURCE_ID||'(empty)';const count=counts[key]||={sourceId:key,source:labels.get(key)||key,leads:0,statuses:{},days:{}};
 count.leads++;count.statuses[lead.STATUS_ID]=(count.statuses[lead.STATUS_ID]||0)+1;
 const day=lead.DATE_CREATE.slice(0,10);count.days[day]=(count.days[day]||0)+1;
}
const result={period:'2026-09-01 — 2026-09-30',timezone:'Europe/Moscow (+03:00)',basis:'DATE_CREATE; all statuses; SOURCE_ID; distinct lead IDs',total,comparison:['6','19'].map(id=>counts[id]||{sourceId:id,source:labels.get(id),leads:0}),sources:Object.values(counts).sort((a,b)=>b.leads-a.leads)};
fs.writeFileSync('tmp/september-leads-summary.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
