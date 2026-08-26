<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main id="content" class="site-content">
    <div class="page__container" style="padding: 40px 20px;">
        <?php if (have_posts()) : ?>
            <?php while (have_posts()) : the_post(); ?>
                <article <?php post_class(); ?>>
                    <h1><?php the_title(); ?></h1>
                    <div class="entry-content">
                        <?php the_content(); ?>
                    </div>
                </article>
            <?php endwhile; ?>
        <?php else : ?>
            <p>Контент не найден.</p>
        <?php endif; ?>
    </div>
</main>
<?php
get_footer();
