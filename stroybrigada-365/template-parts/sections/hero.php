<?php
/**
 * Hero section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

$args    = $args ?? [];
$post_id = (int) ($args['post_id'] ?? get_the_ID());
$title   = 'front_page' === ($args['context'] ?? '') ? get_bloginfo('name') : get_the_title($post_id);
$text    = 'service' === ($args['context'] ?? '') ? get_the_excerpt($post_id) : (string) get_bloginfo('description');
?>
<section class="site-section site-section--hero">
	<div class="container">
		<div class="hero-section">
			<div class="hero-section__content">
				<h1><?php echo esc_html($title); ?></h1>
				<?php if ($text) : ?>
					<p><?php echo esc_html($text); ?></p>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>

