<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function reply(int $status, string $message, string $code = ''): void
{
    http_response_code($status);
    echo json_encode(['success' => $status >= 200 && $status < 300, 'message' => $message, 'code' => $code], JSON_UNESCAPED_UNICODE);
    exit;
}

const RECIPIENT_EMAILS = [
    'rostislav.prod@yandex.ru',
    'resurs_mi@mail.ru',
];
const SUBJECT_PREFIX = 'Заявка с сайта вывеска-заказ.рф';
const LEAD_SOURCE = 'вывеска-заказ.рф';
const LEAD_CONSENT_VERSION = '2026-10-21';
const TELEGRAM_ENABLED = true;
const TELEGRAM_BOT_TOKEN = '8907615185:AAE7XxnCV-mqRFma5QARD314M9GCLRi6-Cc';
const TELEGRAM_CHAT_ID = '-5238686418';
const TELEGRAM_API_TIMEOUT_SECONDS = 9;
const MAX_ENABLED = true;
const MAX_BOT_TOKEN = 'f9LHodD0cOLZT5FBBbhB7Ppgl-K1rfZdOWjAXoZq10h18l-kff0aLSLBu5kRiNAtk48c_RQZStoulHfCcFWM';
const MAX_CHAT_ID = '-78729269371070';
const MAX_API_TIMEOUT_SECONDS = 9;


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
                'caption' => 'Фото к заявке — ' . LEAD_SOURCE,
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


if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, 'Разрешён только POST-запрос.', 'method_not_allowed');
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 6291456) {
    reply(413, 'Запрос слишком большой.', 'request_too_large');
}
$photo = null;
foreach ($_FILES as $key => $file) {
    if ($key !== 'facade-photo' || !is_array($file) || !isset($file['error']) || is_array($file['error'])) {
        reply(422, 'Некорректный файл фотографии.', 'invalid_file');
    }
    if ($file['error'] === UPLOAD_ERR_NO_FILE) continue;
    if ($file['error'] !== UPLOAD_ERR_OK) reply(422, 'Не удалось загрузить фото. Выберите файл до 5 МБ.', 'upload_failed');
    if (!is_uploaded_file($file['tmp_name']) || $file['size'] <= 0 || $file['size'] > 5242880) {
        reply(422, 'Выберите фотографию размером до 5 МБ.', 'invalid_file_size');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $formats = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $dimensions = @getimagesize($file['tmp_name']);
    if (!isset($formats[$mime]) || $dimensions === false || ($dimensions['mime'] ?? '') !== $mime) {
        reply(422, 'Прикрепите фотографию в формате JPG, PNG или WebP.', 'invalid_file_type');
    }
    $contents = file_get_contents($file['tmp_name']);
    if ($contents === false) reply(422, 'Не удалось прочитать фотографию.', 'file_read_failed');
    $photo = ['mime' => $mime, 'name' => 'facade-photo.' . $formats[$mime], 'contents' => $contents];
}
$contentType = strtolower(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]);
if (!in_array($contentType, ['multipart/form-data', 'application/x-www-form-urlencoded'], true)) {
    reply(415, 'Неподдерживаемый формат данных формы.', 'unsupported_media_type');
}

function field(array $names, int $limit = 200): string
{
    foreach ($names as $name) {
        if (!array_key_exists($name, $_POST)) continue;
        if (!is_string($_POST[$name])) reply(422, 'Некорректное значение поля формы.', 'invalid_field');
        $value = trim($_POST[$name]);
        if (strlen($value) > $limit || preg_match('//u', $value) !== 1 || strpos($value, "\0") !== false) {
            reply(422, 'Некорректное или слишком длинное значение поля формы.', 'invalid_field');
        }
        return $value;
    }
    return '';
}

if (field(['website']) !== '') reply(422, 'Не удалось принять заявку.', 'spam_rejected');

$formType = field(['form-type'], 30) ?: 'order';
if (!in_array($formType, ['order', 'callback', 'review', 'calculation'], true)) {
    reply(422, 'Неизвестный тип формы.', 'invalid_form_type');
}

$name = field(['your-name', 'name']);
$phone = field(['your-phone', 'phone'], 50);
$email = field(['your-email', 'email'], 254);
$consent = field(['acceptance-962', 'consent'], 10);
$consentVersion = field(['consent-version'], 30);
if ($consentVersion !== LEAD_CONSENT_VERSION) reply(422, 'Обновите страницу и подтвердите актуальное согласие.', 'consent_version_required');
$company = field(['your-company'], 500);
$message = field(['message'], 10000);
$requestContext = field(['request-context'], 1000);
$page = field(['page-url'], 500);
if ($page === '') {
    // Referer is untrusted context: keep only a bounded local path, never headers.
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    if (is_string($referer) && strlen($referer) <= 2000 && !preg_match('/[\x00-\x20\x7f]/', $referer)) {
        $parts = parse_url($referer);
        if (is_array($parts) && in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)) {
            $path = $parts['path'] ?? '/';
            if (strlen($path) <= 500 && substr($path, 0, 1) === '/' && preg_match('//u', $path) === 1) $page = $path;
        }
    }
}

if ($name === '' || $consent !== '1') {
    reply(422, 'Укажите имя и согласитесь на обработку данных.', 'required_fields');
}
if ($formType !== 'review' && $phone === '') {
    reply(422, 'Укажите телефон для связи.', 'phone_required');
}
if ($formType === 'review' && preg_match('/[^\s\p{Z}]/u', $message) !== 1) {
    reply(422, 'Напишите текст отзыва.', 'review_required');
}
if ($phone !== '') {
    $digits = preg_replace('/\D/', '', $phone);
    if (preg_match('/^[+0-9(). -]+$/', $phone) !== 1 || strlen($digits) < 7 || strlen($digits) > 15) {
        reply(422, 'Проверьте номер телефона.', 'invalid_phone');
    }
}
if ($email !== '' && (preg_match('/[\r\n]/', $email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false)) {
    reply(422, 'Проверьте адрес электронной почты.', 'invalid_email');
}

$values = ['Источник' => LEAD_SOURCE, 'Дата' => date('d.m.Y H:i:s'), 'Согласие' => 'Отдельный флажок подтверждён', 'Редакция согласия' => LEAD_CONSENT_VERSION, 'Текст согласия' => 'https://вывеска-заказ.рф/personal-data-consent/', 'Имя' => $name, 'Телефон' => $phone, 'Электронная почта' => $email, 'Организация' => $company, 'Тема запроса' => $requestContext, 'Сообщение' => $message, 'Тип формы' => $formType, 'Страница' => $page];
$lines = [];
foreach ($values as $label => $value) {
    $value = trim(str_replace(["\r", "\n"], ' ', $value));
    if ($value !== '') $lines[] = $label . ': ' . $value;
}
$subject = '=?UTF-8?B?' . base64_encode(SUBJECT_PREFIX) . '?=';
$headers = [
    'From: noreply@xn----7sbbagavscye2ftg.xn--p1ai',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];
if ($email !== '') $headers[] = 'Reply-To: ' . $email;
$mailBody = implode("\n", $lines);
if ($photo !== null) {
    $boundary = 'resurs-' . bin2hex(random_bytes(16));
    $headers[2] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';
    $mailBody = '--' . $boundary . "\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
    $mailBody .= chunk_split(base64_encode(implode("\n", $lines))) . "\r\n--" . $boundary . "\r\n";
    $mailBody .= 'Content-Type: ' . $photo['mime'] . '; name="' . $photo['name'] . '"' . "\r\n";
    $mailBody .= 'Content-Disposition: attachment; filename="' . $photo['name'] . '"' . "\r\nContent-Transfer-Encoding: base64\r\n\r\n";
    $mailBody .= chunk_split(base64_encode($photo['contents'])) . "\r\n--" . $boundary . "--\r\n";
}


try {
    $sent = @mail(implode(', ', RECIPIENT_EMAILS), $subject, $mailBody, implode("\r\n", $headers));
} catch (Throwable $error) {
    $sent = false;
}

$attachments = $photo === null ? [] : [[
    'tmp_name' => $_FILES['facade-photo']['tmp_name'],
    'type' => $photo['mime'],
    'name' => $photo['name'],
]];
$notificationText = SUBJECT_PREFIX . "\n\n" . implode("\n", $lines);
// Keep the source and main contact fields within both messenger limits.
$characters = preg_split('//u', $notificationText, -1, PREG_SPLIT_NO_EMPTY);
if (is_array($characters) && count($characters) > 3500) {
    $notificationText = implode('', array_slice($characters, 0, 3460)) . "\nПолный текст — в письме.";
}
$telegramSent = false;
$maxSent = false;
try {
    $telegramBotToken = TELEGRAM_ENABLED ? getTelegramConfigValue('TELEGRAM_BOT_TOKEN', 'BOT_TOKEN') : '';
    $telegramChatId = TELEGRAM_ENABLED ? getTelegramConfigValue('TELEGRAM_CHAT_ID', 'CHAT_ID') : '';
    if ($telegramBotToken !== '' && $telegramChatId !== '') {
        $telegramSent = sendTelegramNotification($telegramBotToken, $telegramChatId, htmlspecialchars($notificationText, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
        $telegramFilesSent = $telegramSent && sendTelegramAttachments($telegramBotToken, $telegramChatId, $attachments);
        if (!$telegramFilesSent) error_log('[vyveska-zakaz] Telegram delivery or attachment failed');
    }
} catch (Throwable $error) {
    error_log('[vyveska-zakaz] Telegram delivery failed');
}
try {
    $maxBotToken = MAX_ENABLED ? getMaxConfigValue('MAX_BOT_TOKEN', 'MAX_BOT_TOKEN') : '';
    $maxChatId = MAX_ENABLED ? getMaxConfigValue('MAX_CHAT_ID', 'MAX_CHAT_ID') : '';
    if ($maxBotToken !== '' && $maxChatId !== '') {
        $maxAttachments = uploadMaxAttachments($maxBotToken, $attachments);
        if ($maxAttachments !== []) sleep(1);
        $maxSent = sendMaxNotification($maxBotToken, $maxChatId, $notificationText, $maxAttachments);
        if (!$maxSent || count($maxAttachments) !== count($attachments)) error_log('[vyveska-zakaz] MAX delivery or attachment failed');
    }
} catch (Throwable $error) {
    error_log('[vyveska-zakaz] MAX delivery failed');
}
if (!$sent) error_log('[vyveska-zakaz] Email delivery failed');
if (!$sent && !$telegramSent && !$maxSent) reply(503, 'Не удалось отправить заявку. Повторите попытку или позвоните нам.', 'delivery_failed');
reply(200, 'Заявка отправлена. Мы скоро свяжемся с вами.', 'delivery_accepted');
