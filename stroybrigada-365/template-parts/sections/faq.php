<?php
/**
 * FAQ section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

$faq_posts = get_posts(
	[
		'post_type'      => 'faq',
		'post_status'    => 'publish',
		'posts_per_page' => 8,
		'orderby'        => 'menu_order title',
		'order'          => 'ASC',
	]
);

if (! $faq_posts) {
	return;
}
?>
<section class="site-section site-section--content">
	<div id="faq" class="faq_block pb_lg bg_grey">
		<div class="container">
			<div class="faq-inner">
				<h2><?php esc_html_e('Частые вопросы', 'stroybrigada'); ?></h2>
				<div class="accordion" id="stroybrigada-faq">
					<?php foreach ($faq_posts as $index => $faq_item) : ?>
						<div class="accordion-item">
							<h3 class="accordion-header">
								<button class="accordion-button<?php echo 0 === $index ? '' : ' collapsed'; ?>" type="button" data-bs-toggle="collapse" data-bs-target="#stroybrigada-faq-<?php echo esc_attr((string) $faq_item->ID); ?>">
									<?php echo esc_html(get_the_title($faq_item)); ?>
								</button>
							</h3>
							<div id="stroybrigada-faq-<?php echo esc_attr((string) $faq_item->ID); ?>" class="accordion-collapse collapse<?php echo 0 === $index ? ' show' : ''; ?>">
								<div class="accordion-body">
									<?php echo wp_kses_post(apply_filters('the_content', (string) $faq_item->post_content)); ?>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>
</section>

