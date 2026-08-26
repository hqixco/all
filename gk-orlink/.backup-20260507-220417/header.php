<?php
if (!defined('ABSPATH')) {
    exit;
}

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
<a class="skip-link" href="#content"><?php esc_html_e('Skip to content', 'gk-orlink'); ?></a>
<header class="site-header">
    <div class="site-header__inner">
        <a class="site-header__brand" href="<?php echo esc_url(home_url('/')); ?>">
            <img class="site-header__logo" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/logo.svg'); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?>" width="70" height="70">
            <span class="site-header__brand-text">Строительство из<br>металлоконструкций<br>в Москве и МО</span>
        </a>
        <div class="site-header__contacts" aria-label="<?php echo esc_attr__('Office contacts', 'gk-orlink'); ?>">
            <div class="site-header__contact-item">
                <span class="site-header__contact-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('location'); ?></span>
                <span class="site-header__contact-text">г. Москва, улица Вавилова, 2/1</span>
            </div>
            <div class="site-header__contact-item">
                <span class="site-header__contact-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('mail'); ?></span>
                <a class="site-header__contact-link" href="mailto:mt@orlilk.ru">mt@orlilk.ru</a>
            </div>
        </div>
        <div class="site-header__actions">
            <div class="site-header__phone-row">
                <div class="site-header__phone-stack">
                    <a class="site-header__phone-primary" href="tel:+79770009136">
                        <img class="site-header__phone-icon" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/phone-icon.svg'); ?>" alt="" aria-hidden="true" width="20" height="20">
                        <span>+7 (977) 000-91-36</span>
                    </a>
                    <span class="site-header__phone-note">Ежедневно с 9:00 до 19:00</span>
                </div>
                <div class="site-header__buttons">
                    <div class="site-header__messengers">
                        <a class="site-header__messenger-link site-header__messenger-link--telegram" href="#contacts">
                            <img class="header-button__icon header-button__icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/telegram-logo-svgrepo-com.svg'); ?>" alt="" aria-hidden="true" width="20" height="20">
                            <span>Написать в Telegram</span>
                        </a>
                        <a class="site-header__messenger-link site-header__messenger-link--max" href="#contacts">
                            <img class="header-button__icon header-button__icon--image" src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/max-icon.svg'); ?>" alt="" aria-hidden="true" width="20" height="20">
                            <span>Написать в MAX</span>
                        </a>
                    </div>
                    <button class="header-button header-button--callback" type="button" data-callback-open>
                        Заказать обратный звонок
                    </button>
                </div>
            </div>
        </div>
    </div>
</header>
<main id="content">
