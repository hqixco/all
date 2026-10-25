<?php
/**
 * Header template.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class('site-page site-header--offcanvas-ready'); ?>>
<?php wp_body_open(); ?>
<?php stroybrigada_render_global('site-header'); ?>
<main class="site-main">
