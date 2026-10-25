<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const RECIPIENT_EMAIL = 'rostislav.prod@yandex.ru, mail@vertyar.ru';
const SUBJECT_PREFIX = 'Заявка с сайта Окна Вертикаль';
const SENDER_EMAIL = 'no-reply@okna-vertical.ru';
const BITRIX_WEBHOOK_URL = 'https://vertical24.bitrix24.ru/rest/1/rg1ianu8hluvx2cd/';
const BITRIX_ASSIGNED_BY_ID = 3220;
const TELEGRAM_BOT_TOKEN = '8837367146:AAFe2y7kVMnFHpQEuZlufy46t9alLkXeL_Y';
const TELEGRAM_CHAT_ID = '-5413802353';

function getConfigValue(string $name): string
{
    $value = getenv($name);
    if (is_string($value) && trim($value) !== '') {
        return trim($value);
    }

    if (defined($name)) {
        return trim((string) constant($name));
    }

    return '';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean(string $value): string
{
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
}

function label(string $key): string
{
    return [
        'name' => 'Имя',
        'phone' => 'Телефон',
        'email' => 'Email',
        'message' => 'Сообщение',
        'policy' => 'Согласие на обработку данных',
        'request_title' => 'Тема заявки',
        'quiz_answers' => 'Ответы квиза',
        'consent' => 'Согласие на обработку данных',
        'project-file' => 'Файл проекта',
        'estimate' => 'Расчёт',
        'house-photo' => 'Фото дома',
    ][$key] ?? ucfirst(str_replace(['_', '-'], ' ', $key));
}

function validPhone(string $phone): bool
{
    $digits = preg_replace('/\D+/', '', $phone) ?? '';
    if (strlen($digits) === 11 && ($digits[0] ?? '') === '8') {
        $digits = '7' . substr($digits, 1);
    }
    return strlen($digits) === 11 && ($digits[0] ?? '') === '7';
}

function sendBitrixLead(string $formName, string $pageUrl, array $fields, array $attachments): bool
{
    $title = clean((string) ($fields['request_title'] ?? ''));
    if ($title === '') {
        $title = 'Заявка с сайта — ' . $formName;
    }

    $comments = [
        'Форма: ' . $formName,
        'Страница: ' . $pageUrl,
    ];
    foreach ($fields as $key => $value) {
        if (in_array($key, ['name', 'phone', 'email', 'policy', 'consent', 'request_title'], true)) {
            continue;
        }
        $comments[] = label((string) $key) . ': ' . $value;
    }
    foreach ($attachments as $attachment) {
        $comments[] = 'Файл: ' . $attachment['name'];
    }

    $payload = [
        'fields' => [
            'TITLE' => $title,
            'NAME' => (string) ($fields['name'] ?? ''),
            'PHONE' => [[
                'VALUE' => (string) ($fields['phone'] ?? ''),
                'VALUE_TYPE' => 'WORK',
            ]],
            'COMMENTS' => implode("\n", $comments),
            'SOURCE_ID' => '19',
            'ASSIGNED_BY_ID' => BITRIX_ASSIGNED_BY_ID,
        ],
        'params' => [
            'REGISTER_SONET_EVENT' => 'Y',
        ],
    ];

    $endpoint = BITRIX_WEBHOOK_URL . 'crm.lead.add.json';
    $postData = http_build_query($payload);
    $response = false;
    $httpCode = 0;
    $errorMessage = '';

    if (function_exists('curl_init')) {
        $curl = curl_init($endpoint);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
        ]);
        $response = curl_exec($curl);
        $httpCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $errorMessage = curl_error($curl);
        curl_close($curl);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\nConnection: close\r\n",
                'content' => $postData,
                'timeout' => 12,
                'ignore_errors' => true,
            ],
        ]);
        $response = @file_get_contents($endpoint, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        if (preg_match('/\s(\d{3})\s/', $statusLine, $matches)) {
            $httpCode = (int) $matches[1];
        }
        $errorMessage = 'stream transport';
    }

    if ($response === false || $httpCode < 200 || $httpCode >= 300) {
        error_log('Bitrix24 lead error: ' . ($errorMessage !== '' ? $errorMessage : 'HTTP ' . $httpCode));
        return false;
    }

    $result = json_decode($response, true);
    if (!is_array($result) || !isset($result['result'])) {
        error_log('Bitrix24 lead error: invalid response.');
        return false;
    }

    return true;
}

function sendTelegramMessage(string $botToken, string $chatId, string $message): bool
{
    if ($botToken === '' || $chatId === '') {
        error_log('Telegram error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.');
        return false;
    }

    $endpoint = 'https://api.telegram.org/bot' . $botToken . '/sendMessage';
    $postData = http_build_query([
        'chat_id' => $chatId,
        'text' => $message,
        'disable_web_page_preview' => 'true',
    ]);
    $response = false;
    $httpCode = 0;

    if (function_exists('curl_init')) {
        $curl = curl_init($endpoint);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
        ]);
        $response = curl_exec($curl);
        $httpCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $errorMessage = curl_error($curl);
        curl_close($curl);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\nConnection: close\r\n",
                'content' => $postData,
                'timeout' => 12,
                'ignore_errors' => true,
            ],
        ]);
        $response = @file_get_contents($endpoint, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        if (preg_match('/\s(\d{3})\s/', $statusLine, $matches)) {
            $httpCode = (int) $matches[1];
        }
        $errorMessage = 'stream transport';
    }

    if ($response === false || $httpCode < 200 || $httpCode >= 300) {
        error_log('Telegram error: ' . ($errorMessage ?? ('HTTP ' . $httpCode)));
        return false;
    }

    $result = json_decode($response, true);
    return is_array($result) && ($result['ok'] ?? false) === true;
}

function sendMail(string $to, string $subject, string $body, array $attachments, string $replyTo = ''): bool
{
    $headers = [
        'MIME-Version: 1.0',
        'From: =?UTF-8?B?' . base64_encode('Окна Вертикаль') . '?= <' . SENDER_EMAIL . '>',
    ];
    if (filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    if ($attachments === []) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        return mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
    }

    $boundary = '=_Vertical_' . md5((string) microtime(true));
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

    return mail(
        $to,
        '=?UTF-8?B?' . base64_encode($subject) . '?=',
        implode("\r\n", $parts),
        implode("\r\n", $headers),
    );
}

$phone = clean((string) ($_POST['phone'] ?? ''));
if (!validPhone($phone)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Укажите полный номер телефона'], JSON_UNESCAPED_UNICODE);
    exit;
}

$formName = clean((string) ($_POST['form_name'] ?? 'form'));
$pageUrl = clean((string) ($_POST['page_url'] ?? $_SERVER['HTTP_REFERER'] ?? ''));
$replyTo = clean((string) ($_POST['email'] ?? ''));
$fields = [];
foreach ($_POST as $key => $value) {
    if (in_array($key, ['form_name', 'page_url'], true) || is_array($value)) {
        continue;
    }
    $value = clean((string) $value);
    if ($value !== '') {
        $fields[$key] = $value;
    }
}

$attachments = [];
foreach ($_FILES as $file) {
    if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        continue;
    }
    $tmpName = (string) ($file['tmp_name'] ?? '');
    $fileSize = (int) ($file['size'] ?? 0);
    if ($tmpName === '' || !is_uploaded_file($tmpName) || $fileSize <= 0 || $fileSize > 15 * 1024 * 1024) {
        continue;
    }
    $attachments[] = [
        'name' => basename((string) ($file['name'] ?? 'attachment')),
        'type' => (string) ($file['type'] ?? 'application/octet-stream'),
        'content' => chunk_split(base64_encode((string) file_get_contents($tmpName))),
    ];
}

$lines = [
    'Форма: ' . $formName,
    'Дата: ' . date('d.m.Y H:i:s'),
];
if ($pageUrl !== '') {
    $lines[] = 'Страница: ' . $pageUrl;
    $query = parse_url($pageUrl, PHP_URL_QUERY);
    if (is_string($query) && $query !== '') {
        parse_str($query, $queryParams);
        foreach ($queryParams as $key => $value) {
            if (strpos((string) $key, 'utm_') === 0 && is_scalar($value) && (string) $value !== '') {
                $lines[] = (string) $key . ': ' . clean((string) $value);
            }
        }
    }
}
foreach ($fields as $key => $value) {
    $lines[] = label((string) $key) . ': ' . $value;
}
foreach ($attachments as $attachment) {
    $lines[] = 'Файл: ' . $attachment['name'];
}

$bitrixSent = sendBitrixLead($formName, $pageUrl, $fields, $attachments);
$sent = sendMail(RECIPIENT_EMAIL, SUBJECT_PREFIX . ': ' . $formName, implode("\r\n", $lines), $attachments, $replyTo);
$telegramSent = sendTelegramMessage(
    getConfigValue('TELEGRAM_BOT_TOKEN'),
    getConfigValue('TELEGRAM_CHAT_ID'),
    implode("\n", $lines),
);
if (!$bitrixSent || !$sent || !$telegramSent) {
    http_response_code(502);
    $failedChannels = [];
    if (!$bitrixSent) {
        $failedChannels[] = 'Bitrix24';
    }
    if (!$sent) {
        $failedChannels[] = 'электронную почту';
    }
    if (!$telegramSent) {
        $failedChannels[] = 'Telegram';
    }
    echo json_encode([
        'success' => false,
        'message' => 'Не удалось отправить заявку в ' . implode(' и ', $failedChannels) . '.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
