<?php

declare(strict_types=1);

define('LEAD_LIBRARY_ONLY', true);
require __DIR__ . '/mail.php';

function gudokReply(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => $status === 200, 'message' => $message]);
    exit;
}

// Private URL key; the hosting environment can override this default.
$expectedToken = trim((string)getenv('GUDOK_WEBHOOK_TOKEN')) ?: 'fe9adef743d3051d49cd7ce30e8452b5997b9537a2a98d53';
if ($expectedToken === '') {
    gudokReply(503, 'Webhook token is not configured');
}
$providedToken = $_GET['token'] ?? '';
if (!is_string($providedToken) || !hash_equals($expectedToken, $providedToken)) {
    gudokReply(403, 'Forbidden');
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    gudokReply(405, 'Method not allowed');
}
if ($method === 'GET') {
    $call = $_GET;
} elseif (stripos((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== false) {
    $raw = file_get_contents('php://input', false, null, 0, 32769);
    if ($raw === false || strlen($raw) > 32768) {
        gudokReply(413, 'Payload too large');
    }
    $call = json_decode($raw, true);
} else {
    $call = $_POST;
}
if (!is_array($call)) {
    gudokReply(400, 'Invalid payload');
}
foreach (['id', 'project_id', 'src', 'dst', 'callstatus', 'date'] as $field) {
    if (!isset($call[$field]) || !is_scalar($call[$field]) || trim((string)$call[$field]) === '') {
        gudokReply(422, 'Missing or invalid call field');
    }
}
$status = strtoupper(trim((string)$call['callstatus']));
if (!in_array($status, ['ANSWERED', 'NO ANSWER', 'BUSY'], true)) {
    gudokReply(422, 'Unknown call status');
}
foreach (['duration', 'billsec'] as $field) {
    if (!isset($call[$field]) || !is_scalar($call[$field]) || !preg_match('/^\d{1,8}$/', (string)$call[$field])) {
        gudokReply(422, 'Invalid duration');
    }
}
try {
    $date = new DateTimeImmutable((string)$call['date'], new DateTimeZone('UTC'));
} catch (Exception $error) {
    gudokReply(422, 'Invalid call date');
}

// Serialize deliveries for the same call and remember only successful sends.
$key = hash('sha256', __DIR__ . ':' . $call['project_id'] . ':' . $call['id']);
$state = @fopen(sys_get_temp_dir() . '/gudok-call-' . $key . '.state', 'c+');
if ($state === false || !flock($state, LOCK_EX)) {
    gudokReply(503, 'Delivery state unavailable');
}
if (trim((string)stream_get_contents($state)) === 'sent') {
    fclose($state);
    gudokReply(200, 'Already delivered');
}

$labels = ['ANSWERED' => 'Отвеченный звонок', 'NO ANSWER' => 'Пропущенный звонок', 'BUSY' => 'Пропущенный звонок — номер занят'];
$lines = [
    $labels[$status] . ' | Русский шкаф',
    'Клиент: +' . preg_replace('/\D/', '', (string)$call['src']),
    'Номер Гудка: +' . preg_replace('/\D/', '', (string)$call['dst']),
    'Время: ' . $date->setTimezone(new DateTimeZone('Europe/Moscow'))->format('d.m.Y H:i:s') . ' (МСК)',
    'Длительность звонка: ' . (int)$call['duration'] . ' сек.',
    'Разговор: ' . (int)$call['billsec'] . ' сек.',
];
foreach (['project_title' => 'Проект', 'adv_channel_name' => 'Источник', 'region' => 'Регион', 'call_number' => 'Звонок клиента по счёту'] as $field => $label) {
    if (isset($call[$field]) && is_scalar($call[$field])) {
        $value = trim(preg_replace('/[\r\n\x00-\x1f]+/', ' ', (string)$call[$field]) ?? '');
        if ($value !== '') {
            $lines[] = $label . ': ' . (function_exists('mb_substr') ? mb_substr($value, 0, 200, 'UTF-8') : substr($value, 0, 200));
        }
    }
}
if (isset($call['audio']) && is_string($call['audio']) && strlen($call['audio']) <= 1500
    && filter_var($call['audio'], FILTER_VALIDATE_URL) && parse_url($call['audio'], PHP_URL_SCHEME) === 'https') {
    $lines[] = 'Запись разговора: ' . $call['audio'];
}
$lines[] = 'ID звонка: ' . (string)$call['id'];
$chatId = getTelegramConfigValue('MAX_CHAT_ID', 'MAX_CHAT_ID');
$sent = MAX_ENABLED && sendMaxNotification(
    getTelegramConfigValue('MAX_BOT_TOKEN', 'MAX_BOT_TOKEN'),
    $chatId !== '' ? 'chat_id' : 'user_id',
    $chatId !== '' ? $chatId : getTelegramConfigValue('MAX_USER_ID', 'MAX_USER_ID'),
    implode("\n", $lines)
);
if ($sent) {
    rewind($state);
    $stored = fwrite($state, 'sent');
    $flushed = fflush($state);
    if ($stored !== 4 || !$flushed) {
        fclose($state);
        gudokReply(503, 'Delivery state could not be saved');
    }
}
fclose($state);
gudokReply($sent ? 200 : 502, $sent ? 'Delivered' : 'MAX delivery failed');
