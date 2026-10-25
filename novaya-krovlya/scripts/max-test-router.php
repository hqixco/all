<?php
declare(strict_types=1);

if (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) !== '/mail.php') {
    http_response_code(404);
    exit;
}

$path = realpath(__DIR__ . '/../public/mail.php');
$source = file_get_contents($path);
// Exercise the actual handler, while preventing test notifications to email.
$source = preg_replace('/const RECIPIENT_EMAILS = \[[\s\S]*?\];/', 'const RECIPIENT_EMAILS = [];', $source, 1);
$source = str_replace('__DIR__', var_export(dirname($path), true), $source);
$source = preg_replace('/const LEAD_LOG_FILE = [^;]+;/', "const LEAD_LOG_FILE = " . var_export(sys_get_temp_dir() . '/novaya-krovlya-max-test.log', true) . ';', $source, 1);
$source = preg_replace('/const LEAD_DEDUPE_FILE = [^;]+;/', "const LEAD_DEDUPE_FILE = " . var_export(sys_get_temp_dir() . '/novaya-krovlya-max-test-dedupe.log', true) . ';', $source, 1);
eval(substr($source, 5));
