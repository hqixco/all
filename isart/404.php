<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main id="content" class="site-content">
    <div class="page__container" style="padding: 80px 20px;">
        <h1>Страница не найдена</h1>
        <p>Проверьте адрес или вернитесь на главную.</p>
        <p><a href="<?php echo esc_url(home_url('/')); ?>">На главную</a></p>
    </div>
</main>
<?php
get_footer();
