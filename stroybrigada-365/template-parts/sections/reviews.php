<?php
/**
 * Reviews section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

$reviews = get_posts(
	[
		'post_type'      => 'review',
		'post_status'    => 'publish',
		'posts_per_page' => 6,
	]
);

if (! $reviews) {
	return;
}
?>
<section id="reviews" class="site-section site-section--content">
	<div class="container">
		<h2><?php esc_html_e('Отзывы', 'stroybrigada'); ?></h2>
		<div class="row">
			<?php foreach ($reviews as $review) : ?>
				<div class="col-lg-4 col-md-6 col-sm-12">
					<article class="review-card">
						<h3><?php echo esc_html(get_the_title($review)); ?></h3>
					</article>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

