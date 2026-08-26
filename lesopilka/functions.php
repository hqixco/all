<?php

if (!defined('ABSPATH')) {
  exit;
}

function lesopilka_setup_theme() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  add_theme_support('automatic-feed-links');
  add_theme_support('responsive-embeds');
  add_theme_support('align-wide');
  add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
  register_nav_menus(array(
    'primary' => __('Primary Menu', 'lesopilka'),
  ));
}
add_action('after_setup_theme', 'lesopilka_setup_theme');

function lesopilka_enqueue_assets() {
  wp_enqueue_style('lesopilka-style', get_stylesheet_uri(), array(), wp_get_theme()->get('Version'));
  wp_enqueue_style(
    'lesopilka-main',
    get_template_directory_uri() . '/assets/css/main.css',
    array('lesopilka-style'),
    wp_get_theme()->get('Version')
  );

  wp_enqueue_script(
    'lesopilka-main',
    get_template_directory_uri() . '/assets/js/main.js',
    array(),
    wp_get_theme()->get('Version'),
    true
  );
}
add_action('wp_enqueue_scripts', 'lesopilka_enqueue_assets');
