import fs from 'node:fs';
const source=fs.readFileSync('public/mail.php','utf8');
const webhook=source.match(/const BITRIX_WEBHOOK_URL = '([^']+)'/)[1];
async function call(method,params={}){
 const response=await fetch(webhook+method+'.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(params),signal:AbortSignal.timeout(30000)});
 const data=await response.json();if(data.error)throw Error(data.error+': '+data.error_description);return data;
}
const fields=(await call('crm.lead.fields')).result;
fs.writeFileSync('tmp/bitrix-lead-fields.json',JSON.stringify(fields,null,2));
console.log(JSON.stringify(Object.entries(fields).filter(([name,meta])=>name.startsWith('UF_')||/SOURCE|UTM|WEB|COMMENTS|DATE/.test(name)).map(([name,meta])=>({name,type:meta.type,title:meta.formLabel||meta.title,items:meta.items})),null,2));
console.log(JSON.stringify({sources:(await call('crm.status.list',{filter:{ENTITY_ID:'SOURCE'}})).result.map(x=>({id:x.STATUS_ID,name:x.NAME}))},null,2));
