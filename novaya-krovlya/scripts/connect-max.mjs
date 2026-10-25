import fs from 'node:fs';
import https from 'node:https';
import tls from 'node:tls';

const php=fs.readFileSync('public/mail.php','utf8');
const token=php.match(/const MAX_BOT_TOKEN = '([^']+)'/)?.[1];
if(!token)throw new Error('MAX token is missing.');
const ca=[...tls.rootCertificates,fs.readFileSync('public/max-root-ca.crt','utf8')];
async function api(route,body) {
 return new Promise((resolve,reject)=>{
  const req=https.request('https://platform-api2.max.ru'+route,{method:body?'POST':'GET',ca,headers:{Authorization:token,'Content-Type':'application/json'}},res=>{
   let data='';res.on('data',chunk=>data+=chunk);res.on('end',()=>{
    let decoded;try{decoded=JSON.parse(data);}catch{reject(new Error('Non-JSON API response '+res.statusCode));return;}
    if(res.statusCode<200||res.statusCode>=300){reject(new Error('MAX HTTP '+res.statusCode+' '+(decoded.code||'')));return;}
    resolve(decoded);
   });
  });req.setTimeout(20000,()=>req.destroy(new Error('MAX request timed out')));req.on('error',reject);if(body)req.write(JSON.stringify(body));req.end();
 });
}
const targetTitle='Заявки Новая Кровля Мск';
if(process.argv.includes('--test')) {
 const {chat_id}=JSON.parse(fs.readFileSync('docs/max-chat.json','utf8'));
 const chat=await api('/chats/'+chat_id);
 if(chat.title!==targetTitle)throw new Error('Target chat title mismatch.');
 const result=await api('/messages?chat_id='+chat_id+'&disable_link_preview=true',{text:'Тест подключения сайта «Новая Кровля». Это проверка, не заявка клиента. Отправка заявок в этот чат настроена.'});
 console.log(JSON.stringify({test_sent:!!result.message,chat_title:chat.title,message_id:result.message?.body?.mid}));
}else {
 const ids=new Set();const candidates=[];
 const results=await Promise.allSettled([api('/updates?timeout=0&limit=100'),api('/chats?count=100')]);
 for(let i=0;i<results.length;i++) {
  const result=results[i];
  if(result.status==='rejected'){console.log(i===0?'Updates unavailable:':'Chat list unavailable:',result.reason.message);continue;}
  const data=result.value;
  for(const chat of data.chats||[])ids.add(String(chat.chat_id));
  for(const update of data.updates||[]) {
   const id=update.chat_id??update.message?.recipient?.chat_id??update.chat?.chat_id;
   if(id)ids.add(String(id));
  }
  console.log(i===0?'Update events:':'Listed chats:',(data.updates||data.chats||[]).length);
 }
 for(const id of ids) {
  try {
   const chat=await api('/chats/'+id);
   if(chat.title===targetTitle)candidates.push({chat_id:String(chat.chat_id),title:chat.title});
  }catch(error){console.log('Chat lookup unavailable:',id,error.message);}
 }
 console.log('Matching chats:',JSON.stringify(candidates));
 if(candidates.length!==1)throw new Error('Expected exactly one matching target chat.');
 fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/max-chat.json',JSON.stringify(candidates[0],null,2)+'\n');
}
