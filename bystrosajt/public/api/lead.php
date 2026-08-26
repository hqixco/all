<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

const TELEGRAM_TIMEOUT_SECONDS = 12;
const LEAD_ERROR_MESSAGE = 'Не удалось отправить заявку. Повторите попытку позже.';

function lead_json_response(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function lead_normalize_value($value): string
{
    if (is_array($value)) {
        $value = implode(', ', array_map('lead_normalize_value', $value));
    }

    $value = (string)($value ?? '');
    $value = preg_replace('/\s+/u', ' ', $value);

    return trim((string)$value);
}

function lead_limit(string $value, int $maxLength): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function lead_escape_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function lead_load_dotenv(string $filePath): void
{
    if (!is_file($filePath) || !is_readable($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $rawLine) {
        $line = trim((string)$rawLine);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }

        $separatorIndex = strpos($line, '=');
        if ($separatorIndex === false || $separatorIndex <= 0) {
            continue;
        }

        $key = trim(substr($line, 0, $separatorIndex));
        if ($key === '') {
            continue;
        }

        $value = trim(substr($line, $separatorIndex + 1));
        $valueLength = strlen($value);

        if ($valueLength >= 2) {
            $firstChar = $value[0];
            $lastChar = $value[$valueLength - 1];
            if (($firstChar === '"' && $lastChar === '"') || ($firstChar === "'" && $lastChar === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

function lead_load_config(): array
{
    $projectRoot = dirname(dirname(__DIR__));
    $configFile = __DIR__ . DIRECTORY_SEPARATOR . 'lead-config.php';

    lead_load_dotenv($projectRoot . DIRECTORY_SEPARATOR . '.env');
    lead_load_dotenv($projectRoot . DIRECTORY_SEPARATOR . '.env.local');

    $config = [];
    if (is_file($configFile)) {
        $loaded = require $configFile;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }

    return [
        'bot_token' => lead_normalize_value($config['BOT_TOKEN'] ?? getenv('BOT_TOKEN') ?: ''),
        'chat_id' => lead_normalize_value($config['CHAT_ID'] ?? getenv('CHAT_ID') ?: ''),
    ];
}

function lead_build_payload(array $source): array
{
    return [
        'contact' => lead_limit(lead_normalize_value($source['contact'] ?? $source['phone'] ?? ''), 120),
        'name' => lead_limit(lead_normalize_value($source['name'] ?? ''), 120),
        'direction' => lead_limit(lead_normalize_value($source['direction'] ?? ''), 200),
        'region' => lead_limit(lead_normalize_value($source['region'] ?? ''), 200),
        'ticket' => lead_limit(lead_normalize_value($source['ticket'] ?? ''), 120),
        'ad_budget' => lead_limit(lead_normalize_value($source['ad_budget'] ?? ''), 120),
        'sales' => lead_limit(lead_normalize_value($source['sales'] ?? ''), 200),
        'form_name' => lead_limit(lead_normalize_value($source['form_name'] ?? 'Форма со страницы строительства'), 200),
        'page' => lead_limit(lead_normalize_value($source['page'] ?? ''), 500),
        'ref' => lead_limit(lead_normalize_value($source['ref'] ?? ''), 120),
    ];
}

function lead_build_message(array $payload): string
{
    $lines = [
        '<b>Новая заявка</b>',
        'Форма: ' . lead_escape_html($payload['form_name']),
    ];

    if ($payload['ref'] !== '') {
        $lines[] = 'Ref: ' . lead_escape_html($payload['ref']);
    }

    $lines[] = 'Контакт: ' . lead_escape_html($payload['contact']);

    $optionalFields = [
        'Имя' => $payload['name'],
        'Направление' => $payload['direction'],
        'Регион' => $payload['region'],
        'Средний чек' => $payload['ticket'],
        'Рекламный бюджет' => $payload['ad_budget'],
        'Кто обрабатывает заявки' => $payload['sales'],
        'Страница' => $payload['page'],
    ];

    foreach ($optionalFields as $label => $value) {
        if ($value === '') {
            continue;
        }

        $lines[] = $label . ': ' . lead_escape_html($value);
    }

    return implode("\n", $lines);
}

function lead_telegram_request(string $botToken, array $fields): void
{
    $url = 'https://api.telegram.org/bot' . rawurlencode($botToken) . '/sendMessage';

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        if ($curl === false) {
            throw new RuntimeException('Не удалось инициализировать cURL');
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $fields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => TELEGRAM_TIMEOUT_SECONDS,
            CURLOPT_CONNECTTIMEOUT => TELEGRAM_TIMEOUT_SECONDS,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $responseBody = curl_exec($curl);
        $statusCode = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException($curlError !== '' ? $curlError : 'Ошибка отправки');
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($fields),
                'timeout' => TELEGRAM_TIMEOUT_SECONDS,
                'ignore_errors' => true,
            ],
        ]);

        $responseBody = file_get_contents($url, false, $context);
        $statusCode = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', (string)$http_response_header[0], $matches)) {
            $statusCode = (int)$matches[1];
        }

        if ($responseBody === false) {
            throw new RuntimeException('Ошибка отправки');
        }
    }

    $decoded = json_decode($responseBody, true);
    if (!is_array($decoded) || ($decoded['ok'] ?? false) !== true || $statusCode < 200 || $statusCode >= 300) {
        $description = lead_normalize_value($decoded['description'] ?? ('HTTP ' . $statusCode));
        throw new RuntimeException($description !== '' ? $description : 'Telegram API error');
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    lead_json_response(405, ['success' => false, 'message' => LEAD_ERROR_MESSAGE]);
}

$config = lead_load_config();
if ($config['bot_token'] === '' || $config['chat_id'] === '') {
    lead_json_response(500, ['success' => false, 'message' => 'Не заданы BOT_TOKEN или CHAT_ID']);
}

$payload = lead_build_payload($_POST);

if ($payload['contact'] === '') {
    lead_json_response(422, ['success' => false, 'message' => 'Укажите телефон или Telegram']);
}

try {
    lead_telegram_request($config['bot_token'], [
        'chat_id' => $config['chat_id'],
        'text' => lead_build_message($payload),
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => 'true',
    ]);

    lead_json_response(200, ['success' => true, 'message' => 'Заявка отправлена']);
} catch (Throwable $error) {
    lead_json_response(502, ['success' => false, 'message' => LEAD_ERROR_MESSAGE]);
}
