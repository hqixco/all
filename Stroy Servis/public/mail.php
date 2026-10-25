<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const RECIPIENT_EMAILS = [
    'rostislav.prod@yandex.ru',
    'Hrurbrhu74@yandex.ru'
];
const SUBJECT_PREFIX = 'Заявка с сайта stroy-servis-pro.ru';
// Имя, которое получатель видит в поле «От кого».
const MAIL_FROM_NAME = 'Строй Сервис';
// Адрес отправителя. Укажите здесь адрес на домене сайта, например info@example.ru.
// Пустое значение использует no-reply@текущий-домен сайта.
const MAIL_FROM_EMAIL = 'no-reply@stroy-servis-pro.ru';
const TELEGRAM_ENABLED = true;
const TELEGRAM_BOT_TOKEN = '8984326109:AAEksJkrc27NWDc7L0Ix3r3w770XsHuvyuA';
const TELEGRAM_CHAT_ID = '-5305970314';
const TELEGRAM_API_TIMEOUT_SECONDS = 6;
const MAX_ENABLED = true;
const MAX_BOT_TOKEN = 'f9LHodD0cOI6itXLiSJFSZLW2Updn_hYGLeISjiEAh9hqAO-WpYMWOKisRvf1rsYMWVhhfIN9KjwZkD0L9pD';
const MAX_CHAT_ID = '-79330183307454';
const MAX_API_TIMEOUT_SECONDS = 8;
const MAX_CA_FILE = __DIR__ . '/max-root-ca.crt';
const LEAD_LOG_FILE = __DIR__ . '/lead-form.log';
const LEAD_DEDUPE_FILE = __DIR__ . '/lead-form-dedupe.log';
const LEAD_DEDUPE_TTL_SECONDS = 45;

function writeLeadLog(string $message, array $context = []): void
{
    $safeContext = [];

    foreach ($context as $key => $value) {
        if (stripos((string)$key, 'token') !== false) {
            $safeContext[$key] = '[hidden]';
            continue;
        }

        $safeContext[$key] = is_scalar($value) || $value === null
            ? $value
            : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    $line = sprintf(
        "[%s] %s%s\n",
        date('Y-m-d H:i:s'),
        $message,
        $safeContext !== [] ? ' ' . json_encode($safeContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : ''
    );

    $written = @file_put_contents(LEAD_LOG_FILE, $line, FILE_APPEND | LOCK_EX);
    if ($written === false) {
        error_log('[mail.php lead log] ' . trim($line));
    }
}

function hasCompletePhone(string $value): bool
{
    $digits = preg_replace('/\D+/', '', $value) ?? '';

    if (strlen($digits) === 11 && ($digits[0] === '7' || $digits[0] === '8')) {
        $digits = substr($digits, 1);
    }

    return strlen($digits) === 10 && $digits[0] === '9';
}

function collectFields(array $post): array
{
    $skip = ['form_name', 'page_url'];
    $fields = [];

    foreach ($post as $key => $value) {
        if (in_array($key, $skip, true)) {
            continue;
        }

        if (is_array($value)) {
            $value = implode(', ', $value);
        }

        $value = trim((string)$value);
        if ($value === '') {
          continue;
        }

        $fields[$key] = $value;
    }

    return $fields;
}

function fieldLabel(string $key): string
{
    $map = [
        'name' => 'Имя',
        'phone' => 'Телефон',
        'contact_method' => 'Способ связи',
        'place' => 'Населённый пункт',
        'task' => 'Что требуется сделать',
        'message' => 'Комментарий',
        'roof_size' => 'Площадь кровли',
        'new_roof' => 'Материал',
        'roof_material' => 'Материал',
        'replacement_scope' => 'Что необходимо сделать',
        'roof_area' => 'Площадь кровли',
        'start_time' => 'Когда начать работы',
        'policy' => 'Согласие',
        'request_title' => 'Тема заявки',
        'quiz_step_1' => 'Что требуется сделать',
        'quiz_step_2' => 'Тип объекта',
        'quiz_step_3' => 'Площадь кровли',
    ];

    return $map[$key] ?? ucfirst(str_replace('_', ' ', $key));
}

function normalizeFiles(array $files): array
{
    $normalized = [];

    foreach ($files as $file) {
        if (!is_array($file)) {
            continue;
        }

        if (is_array($file['name'] ?? null)) {
            $count = count($file['name']);
            for ($index = 0; $index < $count; $index += 1) {
                $normalized[] = [
                    'name' => $file['name'][$index] ?? '',
                    'type' => $file['type'][$index] ?? 'application/octet-stream',
                    'tmp_name' => $file['tmp_name'][$index] ?? '',
                    'size' => $file['size'][$index] ?? 0,
                    'error' => $file['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                ];
            }
        } else {
            $normalized[] = $file;
        }
    }

    return $normalized;
}

function buildLeadFingerprint(string $formName, string $pageUrl, array $fields, array $attachments): string
{
    ksort($fields);
    $attachmentKeys = [];

    foreach ($attachments as $attachment) {
        $attachmentKeys[] = [
            'name' => (string)($attachment['name'] ?? ''),
            'size' => (int)($attachment['size'] ?? 0),
        ];
    }

    return hash('sha256', json_encode([
        'form_name' => normalizeWhitespace($formName),
        'page_url' => normalizeWhitespace($pageUrl),
        'fields' => array_map('normalizeWhitespace', $fields),
        'attachments' => $attachmentKeys,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function getServiceLabel(string $formName, string $pageUrl): string
{
    $source = mb_strtolower($formName . ' ' . $pageUrl, 'UTF-8');

    if (str_contains($source, 'пристрой') || str_contains($source, 'pristroy')) {
        return 'Пристройки';
    }

    if (
        str_contains($source, 'восстанов')
        || str_contains($source, 'домов')
        || str_contains($source, 'vosstanovlen')
        || str_contains($source, 'recovery')
    ) {
        return 'Восстановление домов';
    }

    return 'Замена кровли';
}

function registerLeadFingerprint(string $fingerprint): bool
{
    $handle = @fopen(LEAD_DEDUPE_FILE, 'c+');
    if ($handle === false) {
        writeLeadLog('Lead dedupe skipped: cannot open file');
        return true;
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        writeLeadLog('Lead dedupe skipped: cannot lock file');
        return true;
    }

    $now = time();
    $content = stream_get_contents($handle);
    $entries = [];
    $isDuplicate = false;

    foreach (explode("\n", (string)$content) as $line) {
        $entry = json_decode(trim($line), true);
        if (!is_array($entry)) {
            continue;
        }

        $timestamp = (int)($entry['timestamp'] ?? 0);
        $hash = (string)($entry['fingerprint'] ?? '');
        if ($hash === '' || $timestamp < $now - LEAD_DEDUPE_TTL_SECONDS) {
            continue;
        }

        if (hash_equals($hash, $fingerprint)) {
            $isDuplicate = true;
        }

        $entries[] = [
            'timestamp' => $timestamp,
            'fingerprint' => $hash,
        ];
    }

    if (!$isDuplicate) {
        $entries[] = [
            'timestamp' => $now,
            'fingerprint' => $fingerprint,
        ];
    }

    rewind($handle);
    ftruncate($handle, 0);
    foreach ($entries as $entry) {
        fwrite($handle, json_encode($entry, JSON_UNESCAPED_SLASHES) . "\n");
    }

    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    return !$isDuplicate;
}

function buildMessage(string $formName, string $pageUrl, array $fields, array $attachments): string
{
    $lines = [
        'Форма: ' . $formName,
        'Дата: ' . date('d.m.Y H:i:s'),
        'Страница: ' . $pageUrl,
    ];

    foreach ($fields as $key => $value) {
        $lines[] = fieldLabel((string)$key) . ': ' . $value;
    }

    foreach ($attachments as $attachment) {
        $lines[] = 'Файл: ' . ($attachment['name'] ?? 'attachment');
    }

    return implode("\r\n", $lines);
}

function normalizeWhitespace(string $value): string
{
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
}

function escapeTelegramHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function buildTelegramMessage(string $formName, string $pageUrl, array $fields, array $attachments): string
{
    $lines = ['<b>Новая заявка с сайта Строй Сервис</b>', ''];
    $fieldOrder = [
        'name',
        'phone',
        'request_title',
        'place',
        'task',
        'message',
        'roof_size',
        'new_roof',
        'replacement_scope',
        'roof_material',
        'roof_area',
        'start_time',
        'contact_method',
        'quiz_step_1',
        'quiz_step_2',
        'quiz_step_3',
        'policy',
    ];

    $appendLine = static function (array &$target, string $label, string $value): void {
        $normalizedValue = normalizeWhitespace($value);
        if ($normalizedValue === '') {
            return;
        }

        $target[] = sprintf(
            '<b>%s:</b> %s',
            escapeTelegramHtml($label),
            escapeTelegramHtml($normalizedValue)
        );
    };

    $appendLine($lines, 'Форма', $formName);

    foreach ($fieldOrder as $fieldKey) {
        if (!isset($fields[$fieldKey])) {
            continue;
        }

        $appendLine($lines, fieldLabel($fieldKey), (string)$fields[$fieldKey]);
        unset($fields[$fieldKey]);
    }

    foreach ($fields as $key => $value) {
        $appendLine($lines, fieldLabel((string)$key), (string)$value);
    }

    foreach ($attachments as $attachment) {
        $appendLine($lines, 'Файл', (string)($attachment['name'] ?? 'attachment'));
    }

    if ($pageUrl !== '') {
        $lines[] = '';
        $appendLine($lines, 'Страница', $pageUrl);
    }

    $appendLine($lines, 'Дата', date('d.m.Y H:i:s'));

    return implode("\n", $lines);
}

function getTelegramConfigValue(string $constantName, string $envName): string
{
    $constantValue = defined($constantName) ? trim((string)constant($constantName)) : '';
    if ($constantValue !== '') {
        return $constantValue;
    }

    $envValue = getenv($envName);
    return $envValue === false ? '' : trim((string)$envValue);
}

function sendTelegramNotification(string $botToken, string $chatId, string $messageText): bool
{
    if ($botToken === '' || $chatId === '') {
        writeLeadLog('Telegram message skipped: empty config', [
            'has_bot_token' => $botToken !== '',
            'has_chat_id' => $chatId !== '',
        ]);
        return false;
    }

    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $messageText,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        writeLeadLog('Telegram message failed: json encode error', [
            'json_error' => json_last_error_msg(),
        ]);
        return false;
    }

    $endpoint = 'https://api.telegram.org/bot' . $botToken . '/sendMessage';

    if (function_exists('curl_init')) {
        $ch = curl_init($endpoint);
        if ($ch !== false) {
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json',
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => TELEGRAM_API_TIMEOUT_SECONDS,
                CURLOPT_TIMEOUT => TELEGRAM_API_TIMEOUT_SECONDS,
            ]);

            $response = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if (is_string($response) && $response !== '') {
                $decoded = json_decode($response, true);
                if ($httpCode >= 200 && $httpCode < 300 && is_array($decoded) && ($decoded['ok'] ?? false) === true) {
                    writeLeadLog('Telegram message sent via curl', [
                        'http_code' => $httpCode,
                    ]);
                    return true;
                }

                writeLeadLog('Telegram message curl response is not ok', [
                    'http_code' => $httpCode,
                    'curl_error' => $curlError,
                    'response' => substr($response, 0, 500),
                ]);
            } else {
                writeLeadLog('Telegram message curl returned empty response', [
                    'http_code' => $httpCode,
                    'curl_error' => $curlError,
                ]);
            }
        }
    } else {
        writeLeadLog('Telegram message fallback: curl extension is unavailable');
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", [
                'Content-Type: application/json',
                'Accept: application/json',
            ]),
            'content' => $payload,
            'timeout' => TELEGRAM_API_TIMEOUT_SECONDS,
            'ignore_errors' => true,
        ],
    ]);

    $result = @file_get_contents($endpoint, false, $context);

    if ($result === false) {
        $error = error_get_last();
        writeLeadLog('Telegram message file_get_contents failed', [
            'error' => $error['message'] ?? '',
        ]);
        return false;
    }

    $decoded = json_decode($result, true);
    $sent = is_array($decoded) && ($decoded['ok'] ?? false) === true;
    writeLeadLog($sent ? 'Telegram message sent via file_get_contents' : 'Telegram message file_get_contents response is not ok', [
        'response' => substr($result, 0, 500),
    ]);

    return $sent;
}

function sendTelegramAttachments(string $botToken, string $chatId, array $attachments): bool
{
    if ($botToken === '' || $chatId === '' || $attachments === []) {
        return true;
    }

    if (!function_exists('curl_init') || !class_exists('CURLFile')) {
        writeLeadLog('Telegram attachments skipped: curl/CURLFile unavailable', [
            'curl_init' => function_exists('curl_init'),
            'CURLFile' => class_exists('CURLFile'),
        ]);
        return false;
    }

    $endpoint = 'https://api.telegram.org/bot' . $botToken . '/sendDocument';

    foreach ($attachments as $attachment) {
        $tmpName = (string)($attachment['tmp_name'] ?? '');
        if ($tmpName === '' || !is_file($tmpName)) {
            writeLeadLog('Telegram attachment failed: temp file is missing', [
                'file' => $attachment['name'] ?? '',
            ]);
            return false;
        }

        $curlFile = new CURLFile(
            $tmpName,
            (string)($attachment['type'] ?? 'application/octet-stream'),
            (string)($attachment['name'] ?? 'attachment')
        );

        $ch = curl_init($endpoint);
        if ($ch === false) {
            writeLeadLog('Telegram attachment failed: curl_init returned false', [
                'file' => $attachment['name'] ?? '',
            ]);
            return false;
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                'chat_id' => $chatId,
                'document' => $curlFile,
                'disable_content_type_detection' => false,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => TELEGRAM_API_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => TELEGRAM_API_TIMEOUT_SECONDS,
        ]);

        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!is_string($response) || $response === '') {
            writeLeadLog('Telegram attachment failed: empty response', [
                'file' => $attachment['name'] ?? '',
                'http_code' => $httpCode,
                'curl_error' => $curlError,
            ]);
            return false;
        }

        $decoded = json_decode($response, true);
        if ($httpCode < 200 || $httpCode >= 300 || !is_array($decoded) || ($decoded['ok'] ?? false) !== true) {
            writeLeadLog('Telegram attachment response is not ok', [
                'file' => $attachment['name'] ?? '',
                'http_code' => $httpCode,
                'curl_error' => $curlError,
                'response' => substr($response, 0, 500),
            ]);
            return false;
        }
    }

    writeLeadLog('Telegram attachments sent', [
        'count' => count($attachments),
    ]);

    return true;
}

function sendMaxNotification(string $botToken, string $chatId, string $messageText): bool
{
    if ($botToken === '' || $chatId === '') {
        writeLeadLog('MAX message skipped: empty config', [
            'has_bot_token' => $botToken !== '',
            'has_chat_id' => $chatId !== '',
        ]);
        return false;
    }

    $payload = json_encode([
        'text' => mb_substr($messageText, 0, 4000, 'UTF-8'),
        'format' => 'html',
        'disable_link_preview' => true,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payload === false) {
        writeLeadLog('MAX message failed: json encode error');
        return false;
    }

    $endpoint = 'https://platform-api2.max.ru/messages?chat_id=' . rawurlencode($chatId);
    $headers = [
        'Authorization: ' . $botToken,
        'Content-Type: application/json',
        'Accept: application/json',
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($endpoint);
        if ($ch !== false) {
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => MAX_API_TIMEOUT_SECONDS,
                CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS,
                CURLOPT_CAINFO => MAX_CA_FILE,
            ]);
            $response = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            $decoded = is_string($response) ? json_decode($response, true) : null;
            if ($httpCode === 200 && is_array($decoded) && isset($decoded['message'])) {
                writeLeadLog('MAX message sent', ['http_code' => $httpCode]);
                return true;
            }

            writeLeadLog('MAX message failed', [
                'http_code' => $httpCode,
                'api_code' => is_array($decoded) ? ($decoded['code'] ?? '') : '',
                'curl_error' => $curlError,
            ]);
        }
    } else {
        writeLeadLog('MAX message failed: curl extension is unavailable');
    }

    return false;
}

function sendEmail(string $subject, string $body, array $attachments): bool
{
    $recipients = implode(', ', array_filter(array_map('trim', RECIPIENT_EMAILS)));
    if ($recipients === '') {
        return false;
    }

    $hostHeader = strtolower((string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $host = preg_replace('/:\d+$/', '', $hostHeader);
    $host = preg_replace('/[^a-z0-9.-]/i', '', preg_replace('/^www\./', '', $host)) ?: 'localhost';
    $fromEmail = MAIL_FROM_EMAIL !== '' ? MAIL_FROM_EMAIL : 'no-reply@' . $host;
    $encodedFromName = '=?UTF-8?B?' . base64_encode(MAIL_FROM_NAME) . '?=';
    $from = $encodedFromName . ' <' . $fromEmail . '>';
    $headers = [
        'MIME-Version: 1.0',
        'From: ' . $from,
        'Sender: ' . $fromEmail,
        'Return-Path: ' . $fromEmail,
        'Reply-To: ' . $fromEmail,
    ];

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $mailParams = '-f ' . escapeshellarg($fromEmail);

    if ($attachments === []) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        return mail($recipients, $encodedSubject, $body, implode("\r\n", $headers), $mailParams);
    }

    $boundary = '==Multipart_Boundary_x' . md5((string)microtime(true)) . 'x';
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $parts = [
        '--' . $boundary,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        $body,
        '',
    ];

    foreach ($attachments as $attachment) {
        $parts[] = '--' . $boundary;
        $parts[] = 'Content-Type: ' . $attachment['type'] . '; name="' . $attachment['name'] . '"';
        $parts[] = 'Content-Disposition: attachment; filename="' . $attachment['name'] . '"';
        $parts[] = 'Content-Transfer-Encoding: base64';
        $parts[] = '';
        $parts[] = $attachment['content'];
        $parts[] = '';
    }

    $parts[] = '--' . $boundary . '--';

    return mail($recipients, $encodedSubject, implode("\r\n", $parts), implode("\r\n", $headers), $mailParams);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$phone = trim((string)($_POST['phone'] ?? ''));
if (!hasCompletePhone($phone)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Укажите полный номер телефона'], JSON_UNESCAPED_UNICODE);
    exit;
}

$attachments = [];
foreach (normalizeFiles($_FILES) as $file) {
    $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
    $tmpName = (string)($file['tmp_name'] ?? '');
    if ($error !== UPLOAD_ERR_OK || $tmpName === '' || !is_uploaded_file($tmpName)) {
        continue;
    }

    $attachments[] = [
        'name' => basename((string)($file['name'] ?? 'attachment')),
        'type' => (string)($file['type'] ?? 'application/octet-stream'),
        'tmp_name' => $tmpName,
        'size' => (int)($file['size'] ?? 0),
        'content' => chunk_split(base64_encode((string)file_get_contents($tmpName))),
    ];
}

$formName = trim((string)($_POST['form_name'] ?? 'Форма'));
$pageUrl = trim((string)($_POST['page_url'] ?? ''));
$fields = collectFields($_POST);
$body = buildMessage($formName, $pageUrl, $fields, $attachments);
$subject = SUBJECT_PREFIX . ' — ' . getServiceLabel($formName, $pageUrl) . ': ' . $formName;

if (!registerLeadFingerprint(buildLeadFingerprint($formName, $pageUrl, $fields, $attachments))) {
    writeLeadLog('Duplicate lead skipped', [
        'form' => $formName,
    ]);
    echo json_encode(['success' => true, 'duplicate' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$mailSent = sendEmail($subject, $body, $attachments);
$telegramSent = false;
$telegramAttachmentsSent = true;
$maxSent = false;

if (TELEGRAM_ENABLED) {
    $telegramBotToken = getTelegramConfigValue('TELEGRAM_BOT_TOKEN', 'BOT_TOKEN');
    $telegramChatId = getTelegramConfigValue('TELEGRAM_CHAT_ID', 'CHAT_ID');

    if ($telegramBotToken !== '' && $telegramChatId !== '') {
        $telegramMessage = buildTelegramMessage($formName, $pageUrl, $fields, $attachments);
        $telegramSent = sendTelegramNotification($telegramBotToken, $telegramChatId, $telegramMessage);
        $telegramAttachmentsSent = $telegramSent ? sendTelegramAttachments($telegramBotToken, $telegramChatId, $attachments) : false;
    }
}

if (MAX_ENABLED) {
    $maxBotToken = getTelegramConfigValue('MAX_BOT_TOKEN', 'MAX_BOT_TOKEN');
    $maxChatId = getTelegramConfigValue('MAX_CHAT_ID', 'MAX_CHAT_ID');
    if ($maxBotToken !== '' && $maxChatId !== '') {
        $maxSent = sendMaxNotification(
            $maxBotToken,
            $maxChatId,
            buildTelegramMessage($formName, $pageUrl, $fields, $attachments)
        );
    } else {
        writeLeadLog('MAX message skipped: empty config');
    }
}

writeLeadLog(($mailSent || $telegramSent || $maxSent) ? 'Lead sent' : 'Lead failed', [
    'form' => $formName,
    'mail_sent' => $mailSent,
    'telegram_sent' => $telegramSent,
    'telegram_attachments_sent' => $telegramAttachmentsSent,
    'max_sent' => $maxSent,
]);

if (!$mailSent && !$telegramSent && !$maxSent) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Заявка не отправлена. Попробуйте ещё раз'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
