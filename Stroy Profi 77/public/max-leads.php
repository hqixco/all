<?php
declare(strict_types=1);

function maxRequest(string $url, $payload, string $token = ''): ?array
{
    if (!function_exists('curl_init')) {
        writeLeadLog('MAX failed: PHP curl extension is unavailable');
        return null;
    }
    $ch = curl_init($url);
    if ($ch === false) return null;
    $headers = ['Accept: application/json'];
    if ($token !== '') $headers[] = 'Authorization: ' . $token;
    if (is_string($payload)) $headers[] = 'Content-Type: application/json';
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_CAINFO => __DIR__ . '/assets/max-root.crt',
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_errno($ch);
    curl_close($ch);
    $decoded = is_string($response) ? json_decode($response, true) : null;
    if ($status < 200 || $status >= 300 || !is_array($decoded)) {
        writeLeadLog('MAX request failed', ['http_code' => $status, 'curl_errno' => $error, 'code' => $decoded['code'] ?? '']);
        return null;
    }
    return $decoded;
}

function sendMaxLead(string $formName, string $pageUrl, array $fields, array $attachments): array
{
    $config = require __DIR__ . '/max-config.php';
    $token = trim((string)$config['token']);
    $chatId = trim((string)$config['chat_id']);
    if ($token === '' || !preg_match('/^-?\d+$/', $chatId)) {
        writeLeadLog('MAX skipped: bot token or chat ID is missing');
        return [false, false];
    }
    $endpoint = 'https://platform-api2.max.ru/messages?chat_id=' . rawurlencode($chatId);
    $text = SUBJECT_PREFIX . "\n\n" . buildMessage($formName, $pageUrl, $fields, $attachments);
    // MAX limits message text to 4000 characters. Split without cutting UTF-8.
    $characters = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
    if ($characters === false) return [false, false];
    foreach (array_chunk($characters, 3900) as $index => $chunk) {
        if ($index > 0) usleep(600000);
        $result = maxRequest($endpoint, json_encode(['text' => implode('', $chunk)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $token);
        if (empty($result['message']['body']['mid'])) return [false, false];
    }
    $filesSent = true;
    foreach ($attachments as $attachment) {
        $upload = maxRequest('https://platform-api2.max.ru/uploads?type=file', '{}', $token);
        $url = (string)($upload['url'] ?? '');
        $tmpName = (string)($attachment['tmp_name'] ?? '');
        if (strpos($url, 'https://') !== 0 || !is_file($tmpName)) {
            $filesSent = false;
            continue;
        }
        $uploaded = maxRequest($url, ['data' => new CURLFile($tmpName, $attachment['type'], $attachment['name'])]);
        $fileToken = $uploaded['token'] ?? $upload['token'] ?? '';
        if ($uploaded === null || $fileToken === '') {
            $filesSent = false;
            continue;
        }
        $sent = false;
        foreach ([1, 2, 3] as $delay) {
            sleep($delay);
            $result = maxRequest($endpoint, json_encode(['text' => 'Файл к заявке: ' . $attachment['name'], 'attachments' => [['type' => 'file', 'payload' => ['token' => $fileToken]]]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $token);
            if (!empty($result['message']['body']['mid'])) { $sent = true; break; }
        }
        $filesSent = $filesSent && $sent;
    }
    writeLeadLog('MAX lead sent', ['attachments_sent' => $filesSent]);
    return [true, $filesSent];
}
