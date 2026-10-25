<?php
/**
 * Site header partial.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

$partial_html = function_exists('stroybrigada_get_global_partial_html') ? stroybrigada_get_global_partial_html('header') : '';

if ('' !== $partial_html) {
	echo stroybrigada_prepare_imported_html($partial_html); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}
?>
<header class="site-header">
	<div class="site-header__shell">
		<div class="container">
			<a class="site-header__logo" href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
		</div>
	</div>
</header>
