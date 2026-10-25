<?php
/**
 * SEO content section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

$post_id = (int) ($args['post_id'] ?? get_the_ID());
$content = apply_filters('the_content', (string) get_post_field('post_content', $post_id));

if ('' === trim(wp_strip_all_tags($content))) {
	return;
}
?>
<section class="site-section site-section--content">
	<div class="container">
		<div class="content-section">
			<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
	</div>
</section>

