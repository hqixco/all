<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const RECIPIENT_EMAILS = [
    'rostislav.prod@yandex.ru',
    'resurs_mi@mail.ru',
];
const SUBJECT_PREFIX = 'Заявка с сайта РПК Ресурс';
const TELEGRAM_ENABLED = true;
const TELEGRAM_BOT_TOKEN = '8907615185:AAE7XxnCV-mqRFma5QARD314M9GCLRi6-Cc';
const TELEGRAM_CHAT_ID = '-5238686418';
const TELEGRAM_API_TIMEOUT_SECONDS = 9;
const MAX_ENABLED = true;
const MAX_BOT_TOKEN = 'f9LHodD0cOLZT5FBBbhB7Ppgl-K1rfZdOWjAXoZq10h18l-kff0aLSLBu5kRiNAtk48c_RQZStoulHfCcFWM';
const MAX_CHAT_ID = '-78729269371070';
const MAX_API_TIMEOUT_SECONDS = 9;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
        'consent' => 'Согласие на обработку данных',
        'request_title' => 'Тема заявки',
        'offer' => 'Группа',
        'utm_campaign' => 'UTM campaign',
        'utm_content' => 'Кластер',
        'utm_term' => 'Ключ',
        'yclid' => 'Yandex click ID',
        'name' => 'Имя',
        'email' => 'Email',
        'message' => 'Сообщение',
        'delivery' => 'Способ связи',
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

        if ($key === 'delivery') {
            $deliveryLabels = [
                'max' => 'MAX',
                'sms' => 'SMS',
                'phone' => 'По телефону',
            ];
            $normalizedValue = $deliveryLabels[$normalizedValue] ?? $normalizedValue;
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

    $offerNames = [
        'sign' => 'Изготовление вывесок',
        'light' => 'Световая вывеска',
        'letters' => 'Объёмные буквы',
        'shop' => 'Вывеска для магазина',
        'facade' => 'Фасадная вывеска',
    ];
    $offer = (string)($fields['offer'] ?? '');
    if ($offer !== '') {
        $lines[] = 'Услуга: ' . ($offerNames[$offer] ?? $offer);
        $lines[] = 'Группа: ' . $offer;
    }
    if (!empty($fields['utm_term'])) {
        $lines[] = 'Ключ: ' . $fields['utm_term'];
    }
    if (!empty($fields['yclid'])) {
        $lines[] = 'Источник: Яндекс Поиск';
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
        'delivery',
        'email',
        'request_title',
        'offer',
        'utm_content',
        'utm_term',
        'utm_campaign',
        'yclid',
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

    $offerNames = [
        'sign' => 'Изготовление вывесок',
        'light' => 'Световая вывеска',
        'letters' => 'Объёмные буквы',
        'shop' => 'Вывеска для магазина',
        'facade' => 'Фасадная вывеска',
    ];
    $offer = (string)($fields['offer'] ?? '');
    if ($offer !== '') {
        $appendLine($lines, 'Услуга', $offerNames[$offer] ?? $offer);
        $appendLine($lines, 'Группа', $offer);
    }
    $appendLine($lines, 'Ключ', (string)($fields['utm_term'] ?? ''));
    if (!empty($fields['yclid'])) {
        $appendLine($lines, 'Источник', 'Яндекс Поиск');
    }
    unset($fields['offer'], $fields['utm_content'], $fields['utm_term'], $fields['utm_campaign'], $fields['yclid']);

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

function getMaxConfigValue(string $constantName, string $envName): string
{
    $envValue = getenv($envName);
    if ($envValue !== false && trim((string)$envValue) !== '') {
        return trim((string)$envValue);
    }

    return defined($constantName) ? trim((string)constant($constantName)) : '';
}

function uploadMaxAttachments(string $botToken, array $attachments): array
{
    if ($botToken === '' || $attachments === [] || !function_exists('curl_init') || !class_exists('CURLFile')) {
        return [];
    }

    $maxAttachments = [];

    foreach (array_slice($attachments, 0, 12) as $attachment) {
        $tmpName = (string)($attachment['tmp_name'] ?? '');
        $mimeType = strtolower((string)($attachment['type'] ?? 'application/octet-stream'));
        if ($tmpName === '' || !is_file($tmpName)) {
            continue;
        }

        $maxImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/heic', 'image/heif'];
        $uploadType = in_array($mimeType, $maxImageMimeTypes, true) ? 'image' : 'file';
        $ch = curl_init('https://platform-api2.max.ru/uploads?type=' . $uploadType);
        if ($ch === false) {
            continue;
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Authorization: ' . $botToken, 'Accept: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => MAX_API_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS,
        ]);
        $uploadUrlResponse = curl_exec($ch);
        $uploadUrlCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $uploadUrlData = is_string($uploadUrlResponse) ? json_decode($uploadUrlResponse, true) : null;
        $uploadUrl = is_array($uploadUrlData) ? (string)($uploadUrlData['url'] ?? '') : '';
        if ($uploadUrlCode < 200 || $uploadUrlCode >= 300 || $uploadUrl === '') {
            continue;
        }

        $curlFile = new CURLFile(
            $tmpName,
            $mimeType,
            (string)($attachment['name'] ?? 'attachment')
        );
        $ch = curl_init($uploadUrl);
        if ($ch === false) {
            continue;
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => ['data' => $curlFile],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => MAX_API_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => MAX_API_TIMEOUT_SECONDS * 3,
        ]);
        $fileResponse = curl_exec($ch);
        $fileCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $fileData = is_string($fileResponse) ? json_decode($fileResponse, true) : null;
        $token = is_array($fileData) ? (string)($fileData['token'] ?? '') : '';
        if ($fileCode >= 200 && $fileCode < 300 && $token !== '') {
            $maxAttachments[] = [
                'type' => $uploadType,
                'payload' => ['token' => $token],
            ];
        }
    }

    return $maxAttachments;
}

function sendMaxNotification(string $botToken, string $chatId, string $messageText, array $attachments = []): bool
{
    if ($botToken === '' || $chatId === '') {
        return false;
    }

    $payload = json_encode([
        'text' => $messageText,
        'notify' => true,
        'attachments' => $attachments,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        return false;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", [
                'Authorization: ' . $botToken,
                'Content-Type: application/json',
                'Accept: application/json',
            ]),
            'content' => $payload,
            'timeout' => MAX_API_TIMEOUT_SECONDS,
            'ignore_errors' => true,
        ],
    ]);

    $endpoint = 'https://platform-api2.max.ru/messages?chat_id=' . rawurlencode($chatId);
    $result = @file_get_contents($endpoint, false, $context);

    if ($result === false) {
        return false;
    }

    $decoded = json_decode($result, true);
    return is_array($decoded) && isset($decoded['message']) && is_array($decoded['message']);
}

function sendTelegramNotification(string $botToken, string $chatId, string $messageText): bool
{
    if ($botToken === '' || $chatId === '') {
        return false;
    }

    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $messageText,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        return false;
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
        'https://api.telegram.org/bot' . rawurlencode($botToken) . '/sendMessage',
        false,
        $context
    );

    if ($result === false) {
        return false;
    }

    $decoded = json_decode($result, true);
    return is_array($decoded) && ($decoded['ok'] ?? false) === true;
}

function sendTelegramAttachments(string $botToken, string $chatId, array $attachments): bool
{
    if ($botToken === '' || $chatId === '' || $attachments === []) {
        return true;
    }

    if (!function_exists('curl_init') || !class_exists('CURLFile')) {
        return false;
    }

    $endpoint = 'https://api.telegram.org/bot' . $botToken . '/sendDocument';

    foreach ($attachments as $attachment) {
        $tmpName = (string)($attachment['tmp_name'] ?? '');
        if ($tmpName === '' || !is_file($tmpName)) {
            return false;
        }

        $curlFile = new CURLFile(
            $tmpName,
            (string)($attachment['type'] ?? 'application/octet-stream'),
            (string)($attachment['name'] ?? 'attachment')
        );

        $ch = curl_init($endpoint);
        if ($ch === false) {
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
        curl_close($ch);

        if (!is_string($response) || $response === '') {
            return false;
        }

        $decoded = json_decode($response, true);
        if ($httpCode < 200 || $httpCode >= 300 || !is_array($decoded) || ($decoded['ok'] ?? false) !== true) {
            return false;
        }
    }

    return true;
}

function sendEmailNotification(string $recipientList, string $subject, string $fromName, string $fromEmail, string $messageText, array $attachments): bool
{
    if ($recipientList === '') {
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

    return mail($recipientList, $encodedSubject, $mailBody, implode("\r\n", $headers));
}

$emailRecipients = cleanRecipients(RECIPIENT_EMAILS);

if ($emailRecipients === []) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Recipient email is not configured',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$consent = $_POST['consent'] ?? '';
if (!is_string($consent) || !in_array($consent, ['yes', 'on', '1'], true)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Подтвердите согласие с политикой конфиденциальности и обработкой персональных данных',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$formName = trim((string)($_POST['form_name'] ?? 'form'));
$pageUrl = trim((string)($_POST['page_url'] ?? ''));
$phoneValue = $_POST['phone'] ?? '';
$phone = is_scalar($phoneValue) ? trim((string)$phoneValue) : '';

if (!hasCompletePhone($phone)) {
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
$fromName = 'RPK Resurs';
$recipientList = implode(', ', $emailRecipients);
$subject = sprintf('%s: %s', SUBJECT_PREFIX, $formName);
$skipFields = ['form_name', 'page_url'];

$attachments = [];

foreach ($_FILES as $file) {
    if (!is_array($file)) {
        continue;
    }

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

$telegramBotToken = TELEGRAM_ENABLED ? getTelegramConfigValue('TELEGRAM_BOT_TOKEN', 'BOT_TOKEN') : '';
$telegramChatId = TELEGRAM_ENABLED ? getTelegramConfigValue('TELEGRAM_CHAT_ID', 'CHAT_ID') : '';

if (TELEGRAM_ENABLED && $telegramBotToken !== '' && $telegramChatId !== '') {
    $telegramMessage = buildTelegramMessage($formName, $pageUrl, $submittedFields, $attachments);
    $telegramSent = sendTelegramNotification($telegramBotToken, $telegramChatId, $telegramMessage);
    $telegramAttachmentsSent = $telegramSent ? sendTelegramAttachments($telegramBotToken, $telegramChatId, $attachments) : false;

    if (!$telegramSent || !$telegramAttachmentsSent) {
        error_log(sprintf(
            '[mail.php] Telegram sending failed for form "%s" on %s',
            $formName,
            $pageUrl !== '' ? $pageUrl : 'unknown page'
        ));
    }
}

$maxSent = false;
$maxBotToken = MAX_ENABLED ? getMaxConfigValue('MAX_BOT_TOKEN', 'MAX_BOT_TOKEN') : '';
$maxChatId = MAX_ENABLED ? getMaxConfigValue('MAX_CHAT_ID', 'MAX_CHAT_ID') : '';

if (MAX_ENABLED && $maxBotToken !== '' && $maxChatId !== '') {
    $maxMessage = implode("\n", array_merge(['Новая заявка с сайта', ''], $messageLines));
    $maxAttachments = uploadMaxAttachments($maxBotToken, $attachments);
    if ($maxAttachments !== []) {
        sleep(1);
    }
    $maxSent = sendMaxNotification($maxBotToken, $maxChatId, $maxMessage, $maxAttachments);

    if (!$maxSent || count($maxAttachments) !== count($attachments)) {
        error_log(sprintf(
            '[mail.php] MAX sending failed or omitted attachments for form "%s" on %s',
            $formName,
            $pageUrl !== '' ? $pageUrl : 'unknown page'
        ));
    }
}

if (!$mailSent && !$telegramSent && !$maxSent) {
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

echo json_encode([
    'success' => true,
], JSON_UNESCAPED_UNICODE);
