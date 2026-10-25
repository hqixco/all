<?php
/**
 * Loads theme modules.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

define('STROYBRIGADA_THEME_VERSION', '1.0.44');
define('STROYBRIGADA_THEME_DIR', get_template_directory());
define('STROYBRIGADA_THEME_URI', get_template_directory_uri());
define('STROYBRIGADA_THEME_PATH', trailingslashit(STROYBRIGADA_THEME_DIR));
define('STROYBRIGADA_THEME_URL', trailingslashit(STROYBRIGADA_THEME_URI));
define('STROYBRIGADA_ASSETS_PATH', STROYBRIGADA_THEME_PATH . 'assets/');
define('STROYBRIGADA_ASSETS_URL', STROYBRIGADA_THEME_URL . 'assets/');

$stroybrigada_modules = [
	'helpers',
	'setup',
	'assets',
	'post-types',
	'not-found',
	'acf',
	'editor',
	'page-editor',
	'rewrite',
	'importer',
	'admin',
	'forms',
];

foreach ($stroybrigada_modules as $stroybrigada_module) {
	require_once STROYBRIGADA_THEME_PATH . 'inc/' . $stroybrigada_module . '.php';
}

$stroybrigada_image_optimizer = STROYBRIGADA_THEME_PATH . 'stroybrigada-image-optimizer/stroybrigada-image-optimizer.php';
if (is_readable($stroybrigada_image_optimizer)) {
	require_once $stroybrigada_image_optimizer;
}
