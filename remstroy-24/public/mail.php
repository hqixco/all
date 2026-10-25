<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const RECIPIENT_EMAILS = [
    'rostislav.prod@yandex.ru',
    'aleksandr.2345@bk.ru',
];
const SUBJECT_PREFIX = 'Заявка с сайта Ремстрой 24';
const TELEGRAM_ENABLED = true;
const TELEGRAM_BOT_TOKEN = '8633291387:AAGnqnUvB96inJHH7k9amrwrxGl_5LiBuIM';
const TELEGRAM_CHAT_ID = '-4957599616';
const TELEGRAM_API_TIMEOUT_SECONDS = 6;
const MAX_ENABLED = true;
const MAX_BOT_TOKEN = 'f9LHodD0cOI6itXLiSJFSZLW2Updn_hYGLeISjiEAh9hqAO-WpYMWOKisRvf1rsYMWVhhfIN9KjwZkD0L9pD';
const MAX_CHAT_ID = '-79977952338110';
const MAX_API_TIMEOUT_SECONDS = 6;
const LEAD_LOG_FILE = __DIR__ . '/lead-form.log';

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    writeLeadLog('Rejected request: wrong method', [
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        'uri' => $_SERVER['REQUEST_URI'] ?? '',
    ]);

    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanRecipients(array $values): array
{
    return array_values(array_filter(
        array_map(static fn($value) => trim((string)$value), $values),
        static fn($value) => $value !== '' && $value !== 'your-email@example.com'
    ));
}

function formatFieldLabel(string $key): string
{
    $fieldLabels = [
        'phone' => 'Телефон',
        'policy' => 'Согласие на обработку данных',
        'contact_method' => 'Способ связи',
        'request_title' => 'Тема заявки',
        'name' => 'Имя',
        'email' => 'Email',
        'message' => 'Сообщение',
        'place' => 'Адрес объекта',
        'task' => 'Что нужно пристроить',
        'photos' => 'Фотографии объекта',
        'quiz_format' => 'Формат вывески',
        'quiz_place' => 'Место размещения',
        'quiz_size' => 'Размер вывески',
        'quiz_design' => 'Нужен ли дизайн',
        'quiz_mounting' => 'Нужен ли монтаж',
        'quiz_deadline' => 'Срок изготовления',
        'quiz_budget' => 'Бюджет',
        'place_photo' => 'Фото места',
    ];

    if (isset($fieldLabels[$key])) {
        return $fieldLabels[$key];
    }

    $label = str_replace(['_', '-'], ' ', $key);
    return ucfirst($label);
}

function normalizeWhitespace(string $value): string
{
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
}

function hasCompletePhone(string $value): bool
{
    $digits = preg_replace('/\D+/', '', $value) ?? '';

    if (strlen($digits) === 11 && ($digits[0] === '7' || $digits[0] === '8')) {
        $digits = substr($digits, 1);
    }

    return strlen($digits) === 10 && $digits[0] === '9';
}

function escapeTelegramHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function collectSubmittedFields(array $post, array $skipFields): array
{
    $fields = [];

    foreach ($post as $key => $value) {
        if (in_array($key, $skipFields, true)) {
            continue;
        }

        if (is_array($value)) {
            $value = implode(', ', array_map(static fn($item) => trim((string)$item), $value));
        }

        $normalizedValue = trim((string)$value);
        if ($normalizedValue === '') {
            continue;
        }

        $fields[(string)$key] = $normalizedValue;
    }

    return $fields;
}

function buildMessageLines(string $formName, string $pageUrl, array $fields, array $attachments): array
{
    $lines = [
        'Форма: ' . $formName,
        'Дата: ' . date('d.m.Y H:i:s'),
    ];

    if ($pageUrl !== '') {
        $lines[] = 'Страница: ' . $pageUrl;
    }

    foreach ($fields as $key => $value) {
        $lines[] = formatFieldLabel($key) . ': ' . $value;
    }

    if ($attachments !== []) {
        foreach ($attachments as $attachment) {
            $lines[] = 'Файл: ' . $attachment['name'];
        }
    }

    return $lines;
}

function buildTelegramMessage(string $formName, string $pageUrl, array $fields, array $attachments): string
{
    $lines = ['<b>Новая заявка с сайта</b>', ''];
    $leadFieldOrder = [
        'name',
        'phone',
        'email',
        'request_title',
        'message',
        'consent',
        'quiz_format',
        'quiz_place',
        'quiz_size',
        'quiz_design',
        'quiz_mounting',
        'quiz_deadline',
        'quiz_budget',
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

    foreach ($leadFieldOrder as $fieldKey) {
        if (!isset($fields[$fieldKey])) {
            continue;
        }

        $appendLine($lines, formatFieldLabel($fieldKey), (string)$fields[$fieldKey]);
        unset($fields[$fieldKey]);
    }

    foreach ($fields as $key => $value) {
        $appendLine($lines, formatFieldLabel((string)$key), (string)$value);
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
        } else {
            writeLeadLog('Telegram message failed: curl_init returned false');
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

    $result = @file_get_contents(
        $endpoint,
        false,
        $context
    );

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
        writeLeadLog('Telegram attachments failed: curl/CURLFile unavailable', [
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

function sendMaxNotification(string $botToken, string $recipientType, string $recipientId, string $messageText): bool
{
    if ($botToken === '' || $recipientId === '' || !in_array($recipientType, ['chat_id', 'user_id'], true)) {
        writeLeadLog('MAX message skipped: empty or invalid config', [
            'has_bot_token' => $botToken !== '',
            'recipient_type' => $recipientType,
            'has_recipient_id' => $recipientId !== '',
        ]);
        return false;
    }

    $messageText = function_exists('mb_substr')
        ? mb_substr($messageText, 0, 4000, 'UTF-8')
        : substr($messageText, 0, 4000);
    $payload = json_encode([
        'text' => $messageText,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        writeLeadLog('MAX message failed: json encode error', [
            'json_error' => json_last_error_msg(),
        ]);
        return false;
    }

    $endpoint = 'https://platform-api2.max.ru/messages?' . http_build_query([
        $recipientType => $recipientId,
        'disable_link_preview' => 'true',
    ]);
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
            ]);

            $response = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300 && is_string($response) && $response !== '') {
                writeLeadLog('MAX message sent via curl', ['http_code' => $httpCode]);
                return true;
            }

            writeLeadLog('MAX message curl response is not ok', [
                'http_code' => $httpCode,
                'curl_error' => $curlError,
                'response' => is_string($response) ? substr($response, 0, 500) : '',
            ]);
        }
    } else {
        writeLeadLog('MAX message fallback: curl extension is unavailable');
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $payload,
            'timeout' => MAX_API_TIMEOUT_SECONDS,
            'ignore_errors' => true,
        ],
    ]);
    $result = @file_get_contents($endpoint, false, $context);
    $httpStatus = $http_response_header[0] ?? '';
    $sent = is_string($result) && preg_match('/\s2\d{2}\s/', $httpStatus) === 1;

    writeLeadLog($sent ? 'MAX message sent via file_get_contents' : 'MAX message file_get_contents response is not ok', [
        'http_status' => $httpStatus,
        'response' => is_string($result) ? substr($result, 0, 500) : '',
    ]);

    return $sent;
}

function sendMaxAttachments(string $botToken, string $recipientType, string $recipientId, array $attachments): bool
{
    if ($botToken === '' || $recipientId === '' || $attachments === []) {
        return true;
    }

    if (!function_exists('curl_init') || !class_exists('CURLFile')) {
        writeLeadLog('MAX attachments skipped: curl/CURLFile unavailable', [
            'curl_init' => function_exists('curl_init'),
            'CURLFile' => class_exists('CURLFile'),
        ]);
        return false;
    }

    $messageEndpoint = 'https://platform-api2.max.ru/messages?' . http_build_query([
        $recipientType => $recipientId,
        'disable_link_preview' => 'true',
    ]);

    foreach ($attachments as $attachment) {
        $tmpName = (string)($attachment['tmp_name'] ?? '');
        $fileName = (string)($attachment['name'] ?? 'attachment');
        $mimeType = (string)($attachment['type'] ?? 'application/octet-stream');
        if ($tmpName === '' || !is_file($tmpName)) {
            writeLeadLog('MAX attachment failed: temp file is missing', ['file' => $fileName]);
            return false;
        }

        $maxImageMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/tiff',
            'image/bmp',
            'image/heic',
            'image/heif',
        ];
        $uploadType = in_array(strtolower($mimeType), $maxImageMimeTypes, true) ? 'image' : 'file';
        $ch = curl_init('https://platform-api2.max.ru/uploads?type=' . rawurlencode($uploadType));
        if ($ch === false) {
            writeLeadLog('MAX attachment failed: upload curl_init returned false', ['file' => $fileName]);
            return false;
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Authorization: ' . $botToken, 'Accept: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => MAX_API_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS,
        ]);
        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        $uploadInfo = is_string($response) ? json_decode($response, true) : null;
        $uploadUrl = is_array($uploadInfo) ? (string)($uploadInfo['url'] ?? '') : '';

        if ($httpCode < 200 || $httpCode >= 300 || $uploadUrl === '') {
            writeLeadLog('MAX attachment failed: upload URL response is not ok', [
                'file' => $fileName,
                'http_code' => $httpCode,
                'curl_error' => $curlError,
                'response' => is_string($response) ? substr($response, 0, 500) : '',
            ]);
            return false;
        }

        $ch = curl_init($uploadUrl);
        if ($ch === false) {
            writeLeadLog('MAX attachment failed: file curl_init returned false', ['file' => $fileName]);
            return false;
        }
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                'data' => new CURLFile($tmpName, $mimeType, $fileName),
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => MAX_API_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS,
        ]);
        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        $uploadedPayload = is_string($response) ? json_decode($response, true) : null;
        $token = is_array($uploadedPayload) ? (string)($uploadedPayload['token'] ?? '') : '';

        if ($httpCode < 200 || $httpCode >= 300 || $token === '') {
            writeLeadLog('MAX attachment failed: file upload response is not ok', [
                'file' => $fileName,
                'http_code' => $httpCode,
                'curl_error' => $curlError,
                'response' => is_string($response) ? substr($response, 0, 500) : '',
            ]);
            return false;
        }

        $payload = json_encode([
            'attachments' => [[
                'type' => $uploadType,
                'payload' => ['token' => $token],
            ]],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $sent = false;
        foreach ([250000, 750000, 1500000] as $retryDelay) {
            usleep($retryDelay);
            $ch = curl_init($messageEndpoint);
            if ($ch === false) {
                break;
            }
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_HTTPHEADER => [
                    'Authorization: ' . $botToken,
                    'Content-Type: application/json',
                    'Accept: application/json',
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => MAX_API_TIMEOUT_SECONDS,
                CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS,
            ]);
            $response = curl_exec($ch);
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            if ($httpCode >= 200 && $httpCode < 300) {
                $sent = true;
                break;
            }
            $decoded = is_string($response) ? json_decode($response, true) : null;
            if (!is_array($decoded) || ($decoded['code'] ?? '') !== 'attachment.not.ready') {
                break;
            }
        }

        if (!$sent) {
            writeLeadLog('MAX attachment message response is not ok', [
                'file' => $fileName,
                'http_code' => $httpCode,
                'curl_error' => $curlError,
                'response' => is_string($response) ? substr($response, 0, 500) : '',
            ]);
            return false;
        }
    }

    writeLeadLog('MAX attachments sent', ['count' => count($attachments)]);
    return true;
}

function sendEmailNotification(string $recipientList, string $subject, string $fromName, string $fromEmail, string $messageText, array $attachments): bool
{
    if ($recipientList === '') {
        writeLeadLog('Email skipped: empty recipient list');
        return false;
    }

    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $fromEmail;

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    if ($attachments === []) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $mailBody = $messageText;
    } else {
        $boundary = '==Multipart_Boundary_x' . md5((string)microtime(true)) . 'x';
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

        $parts = [];
        $parts[] = '--' . $boundary;
        $parts[] = 'Content-Type: text/plain; charset=UTF-8';
        $parts[] = 'Content-Transfer-Encoding: 8bit';
        $parts[] = '';
        $parts[] = $messageText;
        $parts[] = '';

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
        $mailBody = implode("\r\n", $parts);
    }

    $sent = mail($recipientList, $encodedSubject, $mailBody, implode("\r\n", $headers));
    writeLeadLog($sent ? 'Email sent' : 'Email failed', [
        'recipients' => $recipientList,
        'from' => $fromEmail,
        'subject' => $subject,
        'attachments' => count($attachments),
    ]);

    return $sent;
}

function normalizeUploadedFiles(array $files): array
{
    $normalizedFiles = [];

    foreach ($files as $file) {
        if (!is_array($file)) {
            continue;
        }

        if (is_array($file['name'] ?? null)) {
            $fileCount = count($file['name']);

            for ($index = 0; $index < $fileCount; $index += 1) {
                $normalizedFiles[] = [
                    'name' => $file['name'][$index] ?? '',
                    'type' => $file['type'][$index] ?? 'application/octet-stream',
                    'tmp_name' => $file['tmp_name'][$index] ?? '',
                    'error' => $file['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                ];
            }

            continue;
        }

        $normalizedFiles[] = $file;
    }

    return $normalizedFiles;
}

$emailRecipients = cleanRecipients(RECIPIENT_EMAILS);

if ($emailRecipients === []) {
    writeLeadLog('Rejected request: recipient email is not configured');

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Recipient email is not configured',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$formName = trim((string)($_POST['form_name'] ?? 'form'));
$pageUrl = trim((string)($_POST['page_url'] ?? ''));
$phoneValue = $_POST['phone'] ?? '';
$phone = is_scalar($phoneValue) ? trim((string)$phoneValue) : '';

writeLeadLog('Lead request received', [
    'form_name' => $formName,
    'page_url' => $pageUrl,
    'host' => $_SERVER['HTTP_HOST'] ?? '',
    'post_keys' => array_keys($_POST),
    'file_keys' => array_keys($_FILES),
    'phone_digits' => strlen(preg_replace('/\D+/', '', $phone) ?? ''),
]);

if (!hasCompletePhone($phone)) {
    writeLeadLog('Rejected request: incomplete phone', [
        'phone' => $phone,
    ]);

    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Укажите полный номер телефона',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$host = preg_replace('/^www\./', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
$safeHost = preg_replace('/[^a-z0-9.-]/i', '', $host) ?: 'localhost';
$fromEmail = 'no-reply@' . $safeHost;
$fromName = 'Remstroy 24';
$recipientList = implode(', ', $emailRecipients);
$subject = sprintf('%s: %s', SUBJECT_PREFIX, $formName);
$skipFields = ['form_name', 'page_url'];

$attachments = [];

foreach (normalizeUploadedFiles($_FILES) as $file) {
    $error = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
    $tmpName = (string)($file['tmp_name'] ?? '');
    $originalName = basename((string)($file['name'] ?? 'attachment'));

    if ($error !== UPLOAD_ERR_OK || $tmpName === '' || !is_uploaded_file($tmpName)) {
        continue;
    }

    $attachments[] = [
        'name' => $originalName,
        'type' => (string)($file['type'] ?? 'application/octet-stream'),
        'tmp_name' => $tmpName,
        'content' => chunk_split(base64_encode((string)file_get_contents($tmpName))),
    ];
}

$submittedFields = collectSubmittedFields($_POST, $skipFields);
$messageLines = buildMessageLines($formName, $pageUrl, $submittedFields, $attachments);
$messageText = implode("\r\n", $messageLines);
$mailSent = sendEmailNotification($recipientList, $subject, $fromName, $fromEmail, $messageText, $attachments);

$telegramSent = false;
$maxSent = false;

$telegramBotToken = TELEGRAM_ENABLED ? getTelegramConfigValue('TELEGRAM_BOT_TOKEN', 'BOT_TOKEN') : '';
$telegramChatId = TELEGRAM_ENABLED ? getTelegramConfigValue('TELEGRAM_CHAT_ID', 'CHAT_ID') : '';

if (TELEGRAM_ENABLED && $telegramBotToken !== '' && $telegramChatId !== '') {
    $telegramMessage = buildTelegramMessage($formName, $pageUrl, $submittedFields, $attachments);
    $telegramSent = sendTelegramNotification($telegramBotToken, $telegramChatId, $telegramMessage);
    $telegramAttachmentsSent = $telegramSent ? sendTelegramAttachments($telegramBotToken, $telegramChatId, $attachments) : false;

    if (!$telegramSent || !$telegramAttachmentsSent) {
        writeLeadLog('Telegram delivery failed', [
            'telegram_sent' => $telegramSent,

            'telegram_attachments_sent' => $telegramAttachmentsSent,
            'form_name' => $formName,
            'page_url' => $pageUrl,
        ]);

        error_log(sprintf(
            '[mail.php] Telegram sending failed for form "%s" on %s',
            $formName,
            $pageUrl !== '' ? $pageUrl : 'unknown page'
        ));
    }
}

// Deliver the same lead and uploaded files to the Remstroy MAX chat.
$maxSent = false;
$maxAttachmentsSent = true;
if (MAX_ENABLED) {
    $maxBotToken = getTelegramConfigValue('MAX_BOT_TOKEN', 'MAX_BOT_TOKEN');
    $maxChatId = getTelegramConfigValue('MAX_CHAT_ID', 'MAX_CHAT_ID');
    $maxSent = sendMaxNotification($maxBotToken, 'chat_id', $maxChatId, SUBJECT_PREFIX . "\n\n" . $messageText);
    $maxAttachmentsSent = $maxSent ? sendMaxAttachments($maxBotToken, 'chat_id', $maxChatId, $attachments) : false;
    writeLeadLog('MAX delivery result', [
        'max_sent' => $maxSent,
        'max_attachments_sent' => $maxAttachmentsSent,
        'form_name' => $formName,
        'page_url' => $pageUrl,
    ]);
}

if (!$mailSent && !$telegramSent && !$maxSent) {
    writeLeadLog('Lead delivery failed: all channels failed', [
        'mail_sent' => $mailSent,
        'telegram_sent' => $telegramSent,
        'max_sent' => $maxSent,
        'form_name' => $formName,
        'page_url' => $pageUrl,
    ]);

    error_log(sprintf(
        '[mail.php] All delivery channels failed for form "%s" on %s',
        $formName,
        $pageUrl !== '' ? $pageUrl : 'unknown page'
    ));

    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Заявка не отправлена. Попробуйте ещё раз',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

writeLeadLog('Lead delivery succeeded', [
    'mail_sent' => $mailSent,
    'telegram_sent' => $telegramSent,
        'max_sent' => $maxSent,
    'form_name' => $formName,
    'page_url' => $pageUrl,
]);

echo json_encode([
    'success' => true,
], JSON_UNESCAPED_UNICODE);
