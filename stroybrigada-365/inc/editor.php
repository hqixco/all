<?php
/**
 * Editor restrictions.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_allowed_blocks_all($allowed_blocks, \WP_Block_Editor_Context $context) {
	$post = $context->post ?? null;
	if (! $post instanceof WP_Post) {
		return $allowed_blocks;
	}

	if ('service' === $post->post_type) {
		return [
			'core/paragraph',
			'core/heading',
			'core/list',
			'core/table',
			'core/image',
			'core/quote',
		];
	}

	if (in_array($post->post_type, ['page', 'post'], true)) {
		return [
			'core/paragraph',
			'core/heading',
			'core/list',
			'core/image',
			'core/gallery',
			'core/table',
			'core/quote',
			'core/buttons',
			'core/separator',
			'core/video',
		];
	}

	return $allowed_blocks;
}
add_filter('allowed_block_types_all', 'stroybrigada_allowed_blocks_all', 10, 2);

function stroybrigada_disable_code_editor(): void {
	if (! current_user_can('edit_theme_options')) {
		add_filter('gutenberg_can_edit_post_type', '__return_true');
	}
}
add_action('admin_init', 'stroybrigada_disable_code_editor');
