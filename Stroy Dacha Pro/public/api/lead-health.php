<?php

header('Content-Type: application/json; charset=UTF-8');

$apiDir = dirname(__FILE__);
$logDir = $apiDir . DIRECTORY_SEPARATOR . 'logs';
$configFile = $apiDir . DIRECTORY_SEPARATOR . 'lead-config.php';

$result = array(
    'success' => true,
    'php_version' => PHP_VERSION,
    'php_sapi' => PHP_SAPI,
    'lead_php_exists' => is_file($apiDir . DIRECTORY_SEPARATOR . 'lead.php'),
    'config_exists' => is_file($configFile),
    'config_readable' => is_readable($configFile),
    'api_dir_writable' => is_writable($apiDir),
    'log_dir_exists' => is_dir($logDir),
    'log_dir_writable' => is_dir($logDir) ? is_writable($logDir) : null,
    'curl_available' => function_exists('curl_init'),
    'openssl_available' => extension_loaded('openssl'),
    'mbstring_available' => extension_loaded('mbstring'),
    'json_available' => function_exists('json_encode'),
    'allow_url_fopen' => (bool)ini_get('allow_url_fopen'),
    'required_php_version' => '7.1.0+',
);

if (version_compare(PHP_VERSION, '7.1.0', '<')) {
    $result['success'] = false;
    $result['problem'] = 'PHP is too old for api/lead.php. Select PHP 8.1 or newer in hosting settings.';
}

echo json_encode($result);

