import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

const runtime=path.join(process.env.TEMP,'novaya-krovlya-php');
const php=path.join(runtime,'php.exe');
const logFile=path.join(process.env.TEMP,'novaya-krovlya-max-test.log');
const offset=fs.existsSync(logFile)?fs.statSync(logFile).size:0;
const server=spawn(php,['-d',`extension_dir=${path.join(runtime,'ext')}`,'-d','extension=curl','-d','extension=mbstring','-d','extension=openssl','-d','display_errors=0','-S','127.0.0.1:5193','scripts/max-test-router.php'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let serverOutput='';server.stderr.on('data',chunk=>serverOutput+=chunk);
try {
 for(let i=0;i<50;i++) {
  try{await fetch('http://127.0.0.1:5193/');break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}
 }
 const invalid=new FormData();invalid.set('phone','123');
 const invalidResponse=await fetch('http://127.0.0.1:5193/mail.php',{method:'POST',body:invalid});
 if(invalidResponse.status!==422)throw new Error('Invalid phone must be rejected before sending.');
 const form=new FormData();
 form.set('form_name','ТЕСТ подключения MAX — не заявка клиента');
 form.set('name','Тест интеграции «Новая Кровля»');
 form.set('phone','+7 (919) 254-97-57');
 form.set('message','Проверка отправки с сайта: текст, фотография и файл. Это технический тест, связываться с клиентом не нужно.');
 form.set('page_url','http://localhost/zamena-krovli/#integration-test-'+Date.now());
 form.set('policy','Технический тест');
 form.append('photos[]',new Blob([fs.readFileSync('public/assets/novaya-krovlya-logo.png')],{type:'image/png'}),'test-logo.png');
 form.append('photos[]',new Blob(['Технический тест отправки файла с сайта Новая Кровля.'],{type:'text/plain'}),'test-attachment.txt');
 const response=await fetch('http://127.0.0.1:5193/mail.php',{method:'POST',body:form,signal:AbortSignal.timeout(90000)});
 const data=await response.json();
 const logs=fs.readFileSync(logFile,'utf8').slice(offset);
 const sent=logs.split(/\r?\n/).filter(line=>line.includes('Lead sent')).at(-1)||'';
 const textSent=/"max_sent":true/.test(sent);
 const attachmentsSent=/"max_attachments_sent":true/.test(sent);
 console.log(JSON.stringify({http_status:response.status,success:data.success,max_text_sent:textSent,max_attachments_sent:attachmentsSent,invalid_phone_rejected:invalidResponse.status===422},null,2));
 if(!response.ok||!data.success||!textSent||!attachmentsSent) {
  console.log('MAX log events:',logs.split(/\r?\n/).filter(line=>line.includes('MAX')).map(line=>line.split('{')[0]).join('\n'));
  throw new Error('MAX integration test did not fully pass.');
 }
}finally{server.kill();await new Promise(resolve=>server.once('close',resolve));}
