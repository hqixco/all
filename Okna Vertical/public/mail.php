<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const RECIPIENT_EMAIL = 'rostislav.prod@yandex.ru, mail@vertyar.ru';
const SUBJECT_PREFIX = 'Заявка с сайта Окна Вертикаль';
const SENDER_EMAIL = 'no-reply@okna-vertical.ru';

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

$sent = sendMail(RECIPIENT_EMAIL, SUBJECT_PREFIX . ': ' . $formName, implode("\r\n", $lines), $attachments, $replyTo);
if (!$sent) {
    http_response_code(502);
    echo json_encode(['success' => false, 'message' => 'Заявка не отправлена. Попробуйте ещё раз'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
