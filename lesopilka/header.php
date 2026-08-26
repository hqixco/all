<?php
if (!defined('ABSPATH')) {
  exit;
}

$home_url = home_url('/');
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
  <div class="site-container site-header__inner">
    <a class="site-header__brand" href="<?php echo esc_url($home_url); ?>" aria-label="<?php esc_attr_e('Lesopilka home', 'lesopilka'); ?>">
      lesopilka
    </a>

    <nav class="site-header__nav" aria-label="<?php esc_attr_e('Primary navigation', 'lesopilka'); ?>">
      <a href="<?php echo esc_url($home_url); ?>">Главная</a>
      <a href="<?php echo esc_url($home_url . '#philosophy'); ?>">О нас</a>
      <a href="<?php echo esc_url($home_url . '#products'); ?>">Наш подкаст</a>
      <a href="<?php echo esc_url($home_url . '#products'); ?>">Продукты</a>
      <a href="<?php echo esc_url($home_url . '#cases'); ?>">Кейсы</a>
      <a href="<?php echo esc_url($home_url . '#publications'); ?>">Публикации</a>
      <a href="<?php echo esc_url($home_url . '#contact-project'); ?>">Контакты</a>
    </nav>

    <a class="site-header__cta" href="<?php echo esc_url($home_url . '#contact-project'); ?>">Связаться</a>

    <button class="site-header__burger" type="button" aria-expanded="false" aria-controls="site-mobile-menu">
      <span></span>
      <span></span>
      <span></span>
      <span class="screen-reader-text"><?php esc_html_e('Open menu', 'lesopilka'); ?></span>
    </button>
  </div>

  <div class="site-mobile-menu" id="site-mobile-menu" hidden>
    <div class="site-container site-mobile-menu__inner">
      <a href="<?php echo esc_url($home_url); ?>">Главная</a>
      <a href="<?php echo esc_url($home_url . '#philosophy'); ?>">О нас</a>
      <a href="<?php echo esc_url($home_url . '#products'); ?>">Наш подкаст</a>
      <a href="<?php echo esc_url($home_url . '#products'); ?>">Продукты</a>
      <a href="<?php echo esc_url($home_url . '#cases'); ?>">Кейсы</a>
      <a href="<?php echo esc_url($home_url . '#publications'); ?>">Публикации</a>
      <a href="<?php echo esc_url($home_url . '#contact-project'); ?>">Контакты</a>
      <a class="site-mobile-menu__cta" href="<?php echo esc_url($home_url . '#contact-project'); ?>">Связаться</a>
    </div>
  </div>
</header>
<div class="site">
