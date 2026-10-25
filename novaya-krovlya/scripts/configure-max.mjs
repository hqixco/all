import fs from 'node:fs';

const reference=fs.readFileSync('../remstroy-24/public/mail.php','utf8');
const {chat_id,title}=JSON.parse(fs.readFileSync('docs/max-chat.json','utf8'));
let handler=fs.readFileSync('public/mail.php','utf8');
const start=reference.indexOf('function sendMaxNotification(');
const end=reference.indexOf('function sendEmailNotification(',start);
if(start<0||end<0)throw new Error('Reference MAX functions not found.');
let functions=reference.slice(start,end);
functions=functions.replace(/(CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS,)/g,'$1\n                CURLOPT_CAINFO => MAX_CA_FILE,');
functions=functions.replace("$context = stream_context_create([","$context = stream_context_create([\n        'ssl' => ['cafile' => MAX_CA_FILE, 'verify_peer' => true, 'verify_peer_name' => true],");
const currentStart=handler.indexOf('function sendMaxNotification(');
const currentEnd=handler.indexOf('function sendEmail(',currentStart);
if(currentStart<0||currentEnd<0)throw new Error('Current MAX block not found.');
handler=handler.slice(0,currentStart)+functions+handler.slice(currentEnd);
handler=handler.replace(/const MAX_CHAT_ID = '[^']*';/,`const MAX_CHAT_ID = '${chat_id}';`);
handler=handler.replace(/const TELEGRAM_ENABLED = true;/,'const TELEGRAM_ENABLED = false;');
handler=handler.replace(/\$maxSent = false;/,'$maxSent = false;\n$maxAttachmentsSent = true;');
const dispatchStart=handler.indexOf('if (MAX_ENABLED) {');
const dispatchEnd=handler.indexOf('\nwriteLeadLog(($mailSent',dispatchStart);
if(dispatchStart<0||dispatchEnd<0)throw new Error('MAX dispatch block not found.');
handler=handler.slice(0,dispatchStart)+`if (MAX_ENABLED) {
    $maxBotToken = getTelegramConfigValue('MAX_BOT_TOKEN', 'MAX_BOT_TOKEN');
    $maxChatId = getTelegramConfigValue('MAX_CHAT_ID', 'MAX_CHAT_ID');
    if ($maxBotToken !== '' && $maxChatId !== '') {
        $maxSent = sendMaxNotification(
            $maxBotToken,
            'chat_id',
            $maxChatId,
            buildMessage($formName, $pageUrl, $fields, $attachments)
        );
        $maxAttachmentsSent = $maxSent
            ? sendMaxAttachments($maxBotToken, 'chat_id', $maxChatId, $attachments)
            : false;
    } else {
        writeLeadLog('MAX message skipped: empty config');
    }
}
`+handler.slice(dispatchEnd);
handler=handler.replace("    'max_sent' => $maxSent,","    'max_sent' => $maxSent,\n    'max_attachments_sent' => $maxAttachmentsSent,");
fs.writeFileSync('public/mail.php',handler);
console.log('Configured MAX chat:',title,chat_id,'; attachments enabled; Telegram disabled.');
