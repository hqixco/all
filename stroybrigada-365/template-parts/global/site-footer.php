<?php
/**
 * Site footer partial.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

$partial_html = function_exists('stroybrigada_get_global_partial_html') ? stroybrigada_get_global_partial_html('footer') : '';

if ('' !== $partial_html) {
	echo stroybrigada_prepare_imported_html($partial_html); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}
?>
<footer>
	<div id="contacts" class="footer">
		<div class="container">
			<div class="footer__inner">
				<?php bloginfo('name'); ?>
			</div>
		</div>
	</div>
</footer>
