<?php
/**
 * 404 template.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

get_header();

$stroybrigada_404_page_id = function_exists('stroybrigada_get_404_page_id') ? stroybrigada_get_404_page_id() : 0;
if ($stroybrigada_404_page_id && stroybrigada_get_page_sections($stroybrigada_404_page_id)) {
	stroybrigada_render_imported_sections($stroybrigada_404_page_id);
	get_footer();
	return;
}
?>
<section class="site-section site-section--content">
	<div class="container">
		<h1><?php esc_html_e('Страница не найдена', 'stroybrigada'); ?></h1>
		<p><?php esc_html_e('Запрошенная страница отсутствует или была перемещена.', 'stroybrigada'); ?></p>
		<p><a href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Вернуться на главную', 'stroybrigada'); ?></a></p>
	</div>
</section>
<?php
get_footer();
