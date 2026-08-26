<?php
if (!defined('ABSPATH')) {
  exit;
}
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('entry'); ?>>
  <header class="entry-header">
    <?php
    if (is_singular()) {
      the_title('<h1 class="entry-title">', '</h1>');
    } else {
      the_title('<h2 class="entry-title"><a href="' . esc_url(get_permalink()) . '" rel="bookmark">', '</a></h2>');
    }
    ?>
  </header>

  <div class="entry-content">
    <?php
    the_content();

    wp_link_pages(array(
      'before' => '<nav class="page-links">',
      'after' => '</nav>',
    ));
    ?>
  </div>

  <?php if (get_post_type() === 'post') : ?>
    <footer class="entry-footer">
      <?php the_category(', '); ?>
      <?php the_tags('<span class="entry-tags">', ', ', '</span>'); ?>
    </footer>
  <?php endif; ?>
</article>
