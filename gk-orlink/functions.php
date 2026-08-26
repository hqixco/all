<?php
if (!defined('ABSPATH')) {
    exit;
}

function gk_orlink_landing_setup(): void
{
    load_theme_textdomain('gk-orlink', get_template_directory() . '/languages');

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);

    register_nav_menus([
        'primary' => __('Primary Menu', 'gk-orlink'),
    ]);
}
add_action('after_setup_theme', 'gk_orlink_landing_setup');

function gk_orlink_landing_assets(): void
{
    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();

    wp_enqueue_style(
        'gk-orlink-main',
        $theme_uri . '/assets/css/main.css',
        [],
        filemtime($theme_dir . '/assets/css/main.css')
    );

    wp_enqueue_script(
        'gk-orlink-main',
        $theme_uri . '/assets/js/main.js',
        [],
        filemtime($theme_dir . '/assets/js/main.js'),
        true
    );
}
add_action('wp_enqueue_scripts', 'gk_orlink_landing_assets');

function gk_orlink_register_application_post_type(): void
{
    register_post_type('gk_application', [
        'labels' => [
            'name' => __('Заявки', 'gk-orlink'),
            'singular_name' => __('Заявка', 'gk-orlink'),
            'add_new_item' => __('Добавить заявку', 'gk-orlink'),
            'edit_item' => __('Редактировать заявку', 'gk-orlink'),
            'new_item' => __('Новая заявка', 'gk-orlink'),
            'view_item' => __('Просмотреть заявку', 'gk-orlink'),
            'search_items' => __('Искать заявки', 'gk-orlink'),
            'not_found' => __('Заявки не найдены', 'gk-orlink'),
            'not_found_in_trash' => __('В корзине заявок нет', 'gk-orlink'),
            'menu_name' => __('Заявки', 'gk-orlink'),
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'show_in_nav_menus' => false,
        'exclude_from_search' => true,
        'publicly_queryable' => false,
        'query_var' => false,
        'rewrite' => false,
        'has_archive' => false,
        'menu_icon' => 'dashicons-clipboard',
        'supports' => ['title'],
        'capability_type' => 'post',
        'map_meta_cap' => true,
    ]);
}
add_action('init', 'gk_orlink_register_application_post_type');

function gk_orlink_register_application_assets(): void
{
    wp_localize_script('gk-orlink-main', 'gkOrlinkSubmission', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('gk_orlink_application'),
        'siteName' => get_bloginfo('name'),
    ]);
}
add_action('wp_enqueue_scripts', 'gk_orlink_register_application_assets', 20);

function gk_orlink_get_seo_settings(): array
{
    $defaults = [
        'title' => '',
        'description' => '',
        'keywords' => '',
        'og_title' => '',
        'og_description' => '',
        'og_image' => '',
        'robots' => 'index, follow',
        'yandex_verification' => '',
        'google_verification' => '',
    ];

    $stored = get_option('gk_orlink_seo_settings', []);
    if (!is_array($stored)) {
        $stored = [];
    }

    return array_merge($defaults, $stored);
}

function gk_orlink_sanitize_seo_settings(array $data): array
{
    $robots = (string) ($data['robots'] ?? 'index, follow');

    if (!in_array($robots, ['index, follow', 'noindex, nofollow', 'index, nofollow', 'noindex, follow'], true)) {
        $robots = 'index, follow';
    }

    return [
        'title' => sanitize_text_field((string) ($data['title'] ?? '')),
        'description' => sanitize_textarea_field((string) ($data['description'] ?? '')),
        'keywords' => sanitize_text_field((string) ($data['keywords'] ?? '')),
        'og_title' => sanitize_text_field((string) ($data['og_title'] ?? '')),
        'og_description' => sanitize_textarea_field((string) ($data['og_description'] ?? '')),
        'og_image' => esc_url_raw((string) ($data['og_image'] ?? '')),
        'robots' => $robots,
        'yandex_verification' => sanitize_text_field((string) ($data['yandex_verification'] ?? '')),
        'google_verification' => sanitize_text_field((string) ($data['google_verification'] ?? '')),
    ];
}

function gk_orlink_register_seo_admin_page(): void
{
    add_menu_page(
        __('SEO', 'gk-orlink'),
        __('SEO', 'gk-orlink'),
        'manage_options',
        'gk-orlink-seo',
        'gk_orlink_render_seo_admin_page',
        'dashicons-chart-line',
        58
    );
}
add_action('admin_menu', 'gk_orlink_register_seo_admin_page');

function gk_orlink_render_seo_admin_page(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Недостаточно прав для доступа к SEO-настройкам.', 'gk-orlink'));
    }

    $notice = '';

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gk_orlink_seo_nonce'])) {
        check_admin_referer('gk_orlink_seo_settings', 'gk_orlink_seo_nonce');
        $raw = isset($_POST['gk_orlink_seo']) && is_array($_POST['gk_orlink_seo']) ? (array) wp_unslash($_POST['gk_orlink_seo']) : [];
        update_option('gk_orlink_seo_settings', gk_orlink_sanitize_seo_settings($raw), false);
        $notice = __('SEO-настройки сохранены.', 'gk-orlink');
    }

    $settings = gk_orlink_get_seo_settings();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('SEO', 'gk-orlink'); ?></h1>
        <p><?php esc_html_e('Здесь можно быстро заменить основные SEO-параметры сайта: title, description, OG-теги и robots.', 'gk-orlink'); ?></p>

        <?php if ($notice !== '') : ?>
            <div class="notice notice-success is-dismissible"><p><?php echo esc_html($notice); ?></p></div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('gk_orlink_seo_settings', 'gk_orlink_seo_nonce'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_title"><?php esc_html_e('SEO title', 'gk-orlink'); ?></label></th>
                    <td>
                        <input class="regular-text" type="text" id="gk_orlink_seo_title" name="gk_orlink_seo[title]" value="<?php echo esc_attr((string) $settings['title']); ?>">
                        <p class="description"><?php esc_html_e('Используется для главной страницы и как базовый title для остальных страниц.', 'gk-orlink'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_description"><?php esc_html_e('Meta description', 'gk-orlink'); ?></label></th>
                    <td><textarea class="large-text" id="gk_orlink_seo_description" name="gk_orlink_seo[description]" rows="4"><?php echo esc_textarea((string) $settings['description']); ?></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_keywords"><?php esc_html_e('Keywords', 'gk-orlink'); ?></label></th>
                    <td><input class="large-text" type="text" id="gk_orlink_seo_keywords" name="gk_orlink_seo[keywords]" value="<?php echo esc_attr((string) $settings['keywords']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_og_title"><?php esc_html_e('OG title', 'gk-orlink'); ?></label></th>
                    <td><input class="large-text" type="text" id="gk_orlink_seo_og_title" name="gk_orlink_seo[og_title]" value="<?php echo esc_attr((string) $settings['og_title']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_og_description"><?php esc_html_e('OG description', 'gk-orlink'); ?></label></th>
                    <td><textarea class="large-text" id="gk_orlink_seo_og_description" name="gk_orlink_seo[og_description]" rows="4"><?php echo esc_textarea((string) $settings['og_description']); ?></textarea></td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_og_image"><?php esc_html_e('OG image URL', 'gk-orlink'); ?></label></th>
                    <td><input class="large-text" type="url" id="gk_orlink_seo_og_image" name="gk_orlink_seo[og_image]" value="<?php echo esc_attr((string) $settings['og_image']); ?>" placeholder="<?php echo esc_attr(home_url('/')); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_robots"><?php esc_html_e('Robots', 'gk-orlink'); ?></label></th>
                    <td>
                        <select id="gk_orlink_seo_robots" name="gk_orlink_seo[robots]">
                            <option value="index, follow" <?php selected((string) $settings['robots'], 'index, follow'); ?>>index, follow</option>
                            <option value="noindex, nofollow" <?php selected((string) $settings['robots'], 'noindex, nofollow'); ?>>noindex, nofollow</option>
                            <option value="index, nofollow" <?php selected((string) $settings['robots'], 'index, nofollow'); ?>>index, nofollow</option>
                            <option value="noindex, follow" <?php selected((string) $settings['robots'], 'noindex, follow'); ?>>noindex, follow</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_yandex_verification"><?php esc_html_e('Yandex verification', 'gk-orlink'); ?></label></th>
                    <td><input class="regular-text" type="text" id="gk_orlink_seo_yandex_verification" name="gk_orlink_seo[yandex_verification]" value="<?php echo esc_attr((string) $settings['yandex_verification']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="gk_orlink_seo_google_verification"><?php esc_html_e('Google verification', 'gk-orlink'); ?></label></th>
                    <td><input class="regular-text" type="text" id="gk_orlink_seo_google_verification" name="gk_orlink_seo[google_verification]" value="<?php echo esc_attr((string) $settings['google_verification']); ?>"></td>
                </tr>
            </table>
            <?php submit_button(__('Сохранить SEO', 'gk-orlink')); ?>
        </form>
    </div>
    <?php
}

function gk_orlink_get_canonical_url(): string
{
    if (is_front_page()) {
        return home_url('/');
    }

    if (is_singular()) {
        $permalink = get_permalink();
        if (!empty($permalink)) {
            return $permalink;
        }
    }

    $request_uri = isset($_SERVER['REQUEST_URI']) ? wp_unslash((string) $_SERVER['REQUEST_URI']) : '';
    return $request_uri !== '' ? esc_url_raw(home_url($request_uri)) : home_url('/');
}

function gk_orlink_filter_document_title(string $title): string
{
    if (is_admin()) {
        return $title;
    }

    $settings = gk_orlink_get_seo_settings();
    $site_title = trim((string) ($settings['title'] ?? ''));

    if (is_front_page() && $site_title !== '') {
        return $site_title;
    }

    if ($site_title !== '' && $title !== '') {
        return $title . ' — ' . $site_title;
    }

    return $title !== '' ? $title : ($site_title !== '' ? $site_title : get_bloginfo('name'));
}
add_filter('pre_get_document_title', 'gk_orlink_filter_document_title', 20);

function gk_orlink_output_seo_meta_tags(): void
{
    if (is_admin()) {
        return;
    }

    $settings = gk_orlink_get_seo_settings();
    $site_title = trim((string) ($settings['title'] ?? ''));
    $meta_description = trim((string) ($settings['description'] ?? ''));
    $og_title = trim((string) ($settings['og_title'] ?? ''));
    $og_description = trim((string) ($settings['og_description'] ?? ''));
    $keywords = trim((string) ($settings['keywords'] ?? ''));
    $og_image = trim((string) ($settings['og_image'] ?? ''));
    $robots = trim((string) ($settings['robots'] ?? 'index, follow'));
    $canonical = gk_orlink_get_canonical_url();
    $current_title = wp_get_document_title();

    if ($meta_description !== '') {
        echo '<meta name="description" content="' . esc_attr($meta_description) . '">' . "\n";
    }

    if ($keywords !== '') {
        echo '<meta name="keywords" content="' . esc_attr($keywords) . '">' . "\n";
    }

    echo '<meta name="robots" content="' . esc_attr($robots) . '">' . "\n";
    echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";
    echo '<meta property="og:type" content="' . esc_attr(is_front_page() ? 'website' : 'article') . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($og_title !== '' ? $og_title : $current_title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($og_description !== '' ? $og_description : $meta_description) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($og_title !== '' ? $og_title : $current_title) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($og_description !== '' ? $og_description : $meta_description) . '">' . "\n";

    if ($og_image !== '') {
        echo '<meta property="og:image" content="' . esc_url($og_image) . '">' . "\n";
        echo '<meta name="twitter:image" content="' . esc_url($og_image) . '">' . "\n";
    }

    if (!empty($settings['yandex_verification'])) {
        echo '<meta name="yandex-verification" content="' . esc_attr((string) $settings['yandex_verification']) . '">' . "\n";
    }

    if (!empty($settings['google_verification'])) {
        echo '<meta name="google-site-verification" content="' . esc_attr((string) $settings['google_verification']) . '">' . "\n";
    }
}
add_action('wp_head', 'gk_orlink_output_seo_meta_tags', 1);

function gk_orlink_get_editor_settings(): array
{
    $defaults = [
        'hero' => [
            'title_line_1' => 'СТРОИТЕЛЬСТВО',
            'title_line_2' => 'БЫСТРОВОЗВОДИМЫХ ЗДАНИЙ',
            'subtitle' => 'из металлоконструкций под ключ.',
            'accent' => 'ПОД КЛЮЧ ОТ 500 М²',
            'points' => [
                'Рассчитайте стоимость Вашего объекта.',
                'Посмотрите объекты, которые мы уже построили.',
            ],
            'cta_text' => 'РАССЧИТАТЬ СТОИМОСТЬ ОБЪЕКТА',
            'quiz_title' => 'Ответьте на 9 вопросов',
            'quiz_text' => 'и получите расчёт стоимости здания из металлоконструкций',
            'bg_image' => get_template_directory_uri() . '/assets/img/hero-building.jpg',
        ],
        'process' => [
            'title' => 'Как мы строим и исполняем обязательства?',
            'iframe' => 'https://rutube.ru/play/embed/da7e54976e3e284581ee4bf13e83b7c3/?r=wd',
            'heading' => 'Спортивные объекты ГК Орлинк.',
            'text' => 'В этом ролике мы покажем, как наша команда построила спортивную арену для керлинга «под ключ» от разработки проекта до сдачи в эксплуатацию, а так же другие, значимые, спортивные объекты.',
        ],
        'benefits' => [
            [
                'icon' => get_template_directory_uri() . '/assets/img/process-shield-icon.svg',
                'text' => 'Допуск СРО — все гарантии, смета и сроки закреплены в договоре',
            ],
            [
                'icon' => get_template_directory_uri() . '/assets/img/process-briefcase-icon.svg',
                'text' => 'Только квалифицированные мастера с опытом работы от 7 лет (граждане РФ)',
            ],
            [
                'icon' => get_template_directory_uri() . '/assets/img/process-time-icon.svg',
                'text' => 'Минимальные сроки изготовления металлоконструкций',
            ],
            [
                'icon' => get_template_directory_uri() . '/assets/img/process-factory2-icon.svg',
                'text' => 'Собственное производство металлоконструкций для объектов',
            ],
        ],
        'services' => [
            'title' => 'Предлагаем лучшую цену потому что работаем без посредников',
        ],
        'projects' => [
            'title' => 'С 2014 года построили более 210 зданий из металлоконструкций',
            'subtitle' => 'Посмотрите примеры некоторых из них',
        ],
        'quiz' => [
            'title' => 'Получите расчёт стоимости вашего объекта',
            'headline' => 'Ответьте на 9 вопросов и получите предварительный расчёт',
            'steps' => gk_orlink_get_default_quiz_steps(),
        ],
        'guarantees' => [
            'title' => 'Гарантии и обязательства',
            'image' => get_template_directory_uri() . '/assets/img/guarantee-contract-main.jpg',
            'cards' => [
                [
                    'icon' => get_template_directory_uri() . '/assets/img/process-calendar-icon.svg',
                    'title' => 'Сдаем работы точно в срок. За каждый день просрочки выплатим неустойку, зафиксированную в договоре',
                ],
                [
                    'icon' => get_template_directory_uri() . '/assets/img/guarantee-shield-check.svg',
                    'title' => 'Предоставляем 5 лет гарантии на все наши объекты из металлоконструкций',
                ],
                [
                    'icon' => get_template_directory_uri() . '/assets/img/guarantee-car-side.svg',
                    'title' => 'При гарантийном случае мы приедем к вам по первому звонку и в течение 7 дней устраним неисправность',
                ],
                [
                    'icon' => get_template_directory_uri() . '/assets/img/process-briefcase-icon.svg',
                    'title' => 'Работаем только с юр лицами',
                ],
            ],
        ],
        'contacts' => [
            'title' => 'Контакты',
            'subtitle' => 'Свяжитесь с нами любым удобным способом.',
            'address' => 'Рязань, ул. Станкозаводская, д. 7',
            'phone' => '+7 (499) 391 90 81',
            'email' => 'mt@orlilk.ru',
            'map_iframe' => 'https://yandex.ru/map-widget/v1/?text=%D0%A0%D1%8F%D0%B7%D0%B0%D0%BD%D1%8C%20%D1%83%D0%BB.%20%D0%A1%D1%82%D0%B0%D0%BD%D0%BA%D0%BE%D0%B7%D0%B0%D0%B2%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D1%8F%2C%20%D0%B4%207&z=16',
        ],
        'cases' => gk_orlink_get_editor_case_defaults(),
    ];

    $stored = get_option('gk_orlink_editor_settings', []);
    if (!is_array($stored)) {
        $stored = [];
    }

    return array_replace_recursive($defaults, $stored);
}

function gk_orlink_get_editor_case_defaults(): array
{
    $theme_uri = get_template_directory_uri();

    return [
        [
            'title' => 'Пункт взимания платы (ПВП) М4-Дон',
            'text' => 'Изготовление и монтаж металлоконструкций.',
            'volume' => '329 тонн',
            'year' => '2018 г.',
            'image_1' => $theme_uri . '/assets/img/cases/1/case-1-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/1/case-1-2.webp',
            'image_3' => '',
            'image_4' => '',
            'video' => '',
            'poster' => '',
        ],
        [
            'title' => 'Сокольническая линия метрополитена',
            'text' => 'Изготовление металлоконструкций.',
            'volume' => '285 тонн',
            'year' => '2018 г.',
            'image_1' => $theme_uri . '/assets/img/cases/2/case-2-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/2/case-2-2.webp',
            'image_3' => $theme_uri . '/assets/img/cases/2/case-2-3.webp',
            'image_4' => '',
            'video' => '',
            'poster' => '',
        ],
        [
            'title' => 'Коровники Нижегородская область',
            'text' => 'Изготовление и монтаж металлоконструкций.',
            'volume' => '627 тонн',
            'year' => '2020 г.',
            'image_1' => $theme_uri . '/assets/img/cases/3/case-3-1.jpg',
            'image_2' => $theme_uri . '/assets/img/cases/3/case-3-2.jpg',
            'image_3' => $theme_uri . '/assets/img/cases/3/case-3-3.jpg',
            'image_4' => '',
            'video' => '',
            'poster' => '',
        ],
        [
            'title' => 'Станция метро Филатов луг',
            'text' => 'Изготовление и поставка металлоконструкций основного каркаса здания станции метрополитена. Изготовление металлоконструкций пешеходных мостов и выходов из метро.',
            'volume' => 'Более 1200 тонн',
            'year' => '2020 год',
            'image_1' => $theme_uri . '/assets/img/cases/4/case-4-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/4/case-4-2.webp',
            'image_3' => $theme_uri . '/assets/img/cases/4/case-4-3.webp',
            'image_4' => $theme_uri . '/assets/img/cases/4/case-4-4.jpg',
            'video' => '',
            'poster' => '',
        ],
        [
            'title' => 'Южное («Братеево-2») Замоскворецкой линии',
            'text' => 'Монтаж металлоконструкций.',
            'volume' => 'Объём выполнения работ: более 1 000 тонн',
            'year' => '2021 г.',
            'image_1' => $theme_uri . '/assets/img/cases/5/case-5-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/5/case-5-2.webp',
            'image_3' => $theme_uri . '/assets/img/cases/5/case-5-3.webp',
            'image_4' => '',
            'video' => $theme_uri . '/assets/img/cases/5/case-5-video.mp4',
            'poster' => $theme_uri . '/assets/img/cases/5/case-5-poster.jpg',
        ],
        [
            'title' => 'Логистический склад Домодедово',
            'text' => 'Изготовление и монтаж металлоконструкций.',
            'volume' => '750 тонн',
            'year' => '2021 г.',
            'image_1' => $theme_uri . '/assets/img/cases/6/case-6-1.jpg',
            'image_2' => $theme_uri . '/assets/img/cases/6/case-6-2.jpg',
            'image_3' => $theme_uri . '/assets/img/cases/6/case-6-3.webp',
            'image_4' => '',
            'video' => $theme_uri . '/assets/img/cases/6/case-6-video.mp4',
            'poster' => $theme_uri . '/assets/img/cases/6/case-6-poster.webp',
        ],
        [
            'title' => 'Школа № 21 г. Коломна',
            'text' => 'Изготовление и монтаж металлоконструкций, работы по монтажу кровли и основных конструкций.',
            'volume' => '',
            'year' => '2022 г.',
            'image_1' => $theme_uri . '/assets/img/cases/7/case-7-1.png',
            'image_2' => $theme_uri . '/assets/img/cases/7/case-7-2.jpg',
            'image_3' => $theme_uri . '/assets/img/cases/7/case-7-3.png',
            'image_4' => $theme_uri . '/assets/img/cases/7/case-7-4.png',
            'video' => '',
            'poster' => '',
        ],
        [
            'title' => 'Автовокзал, автостанция Бронницы',
            'text' => 'Изготовление и монтаж основных металлоконструкций и металлоконструкций кровли.',
            'volume' => 'Объём работ: более 350 тонн',
            'year' => '2023 г.',
            'image_1' => $theme_uri . '/assets/img/cases/8/case-8-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/8/case-8-2.webp',
            'image_3' => $theme_uri . '/assets/img/cases/8/case-8-3.webp',
            'image_4' => $theme_uri . '/assets/img/cases/8/case-8-4.webp',
            'video' => $theme_uri . '/assets/img/cases/8/case-8-video.mp4',
            'poster' => $theme_uri . '/assets/img/cases/8/case-8-5.webp',
        ],
        [
            'title' => 'Складской комплекс. Чеховский район',
            'text' => 'Комплекс работ по изготовлению и выполнению работ по монтажу металлоконструкций для складского комплекса.',
            'volume' => 'Объём: более 450 тонн',
            'year' => '2024 г.',
            'image_1' => $theme_uri . '/assets/img/cases/9/case-9-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/9/case-9-2.webp',
            'image_3' => $theme_uri . '/assets/img/cases/9/case-9-3.webp',
            'image_4' => $theme_uri . '/assets/img/cases/9/case-9-4.webp',
            'video' => '',
            'poster' => '',
        ],
        [
            'title' => 'Складской комплекс Конаково Тверская область',
            'text' => 'Комплекс работ по изготовлению и выполнению работ по монтажу металлоконструкций для складского комплекса.',
            'volume' => 'Объём: более 1450 тонн',
            'year' => '2025 г.',
            'image_1' => $theme_uri . '/assets/img/cases/10/case-10-1.webp',
            'image_2' => $theme_uri . '/assets/img/cases/10/case-10-2.webp',
            'image_3' => '',
            'image_4' => '',
            'video' => '',
            'poster' => '',
        ],
    ];
}

function gk_orlink_get_case_media_items(array $case): array
{
    $title = trim((string) ($case['title'] ?? ''));
    $items = [];
    $image_index = 1;

    foreach (['image_1', 'image_2', 'image_3', 'image_4'] as $image_key) {
        $src = trim((string) ($case[$image_key] ?? ''));
        if ($src === '') {
            continue;
        }

        $items[] = [
            'type' => 'image',
            'src' => $src,
            'poster' => $src,
            'alt' => $title !== '' ? sprintf('%s, фото %d', $title, $image_index) : sprintf('Фото %d', $image_index),
        ];
        $image_index++;
    }

    $video = trim((string) ($case['video'] ?? ''));
    if ($video !== '') {
        $poster = trim((string) ($case['poster'] ?? ''));
        $items[] = [
            'type' => 'video',
            'src' => $video,
            'poster' => $poster !== '' ? $poster : (string) ($items[0]['src'] ?? ''),
            'alt' => $title !== '' ? sprintf('%s, видео', $title) : __('Видео', 'gk-orlink'),
        ];
    }

    return $items;
}

function gk_orlink_render_case_card(array $case, int $index = 0): void
{
    $title = trim((string) ($case['title'] ?? ''));
    $text = trim((string) ($case['text'] ?? ''));
    $volume = trim((string) ($case['volume'] ?? ''));
    $year = trim((string) ($case['year'] ?? ''));
    $items = gk_orlink_get_case_media_items($case);

    if ($title === '' && $text === '' && empty($items)) {
        return;
    }

    $main_item = $items[0] ?? null;
    $main_src = '';
    $main_alt = $title;

    if (is_array($main_item)) {
        $main_src = (string) ($main_item['type'] === 'video' ? ($main_item['poster'] ?: $main_item['src']) : $main_item['src']);
        $main_alt = (string) ($main_item['alt'] ?? $title);
    }

    $thumbs_class = count($items) > 3 ? ' projects-case-card__thumbs--wide' : '';
    $has_video = false;
    foreach ($items as $item) {
        if (($item['type'] ?? '') === 'video') {
            $has_video = true;
            break;
        }
    }
    ?>
    <article class="projects-case-card">
        <div class="projects-case-card__gallery" data-case-gallery>
            <div class="projects-case-card__stage">
                <button class="projects-case-card__nav projects-case-card__nav--prev" type="button" data-case-prev aria-label="<?php echo esc_attr__('Предыдущее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-left'); ?></span></button>
                <button class="projects-case-card__nav projects-case-card__nav--next" type="button" data-case-next aria-label="<?php echo esc_attr__('Следующее фото', 'gk-orlink'); ?>"><span aria-hidden="true"><?php echo gk_orlink_svg_icon('chevron-right'); ?></span></button>
                <button class="projects-case-card__zoom" type="button" data-case-zoom aria-label="<?php echo esc_attr__('Увеличить фото', 'gk-orlink'); ?>"><img data-case-main src="<?php echo esc_url($main_src); ?>" alt="<?php echo esc_attr($main_alt); ?>" loading="lazy" decoding="async"></button>
                <?php if ($has_video) : ?>
                    <button class="projects-case-card__play" type="button" data-case-play aria-label="<?php echo esc_attr__('Воспроизвести видео', 'gk-orlink'); ?>" hidden><span aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span></button>
                <?php endif; ?>
            </div>
            <div class="projects-case-card__thumbs<?php echo esc_attr($thumbs_class); ?>" data-case-thumbs>
                <?php foreach ($items as $item_index => $item) : ?>
                    <?php $is_video = ($item['type'] ?? 'image') === 'video'; ?>
                    <button class="projects-case-card__thumb<?php echo 0 === $item_index ? ' is-active' : ''; ?><?php echo $is_video ? ' projects-case-card__thumb--video' : ''; ?>" type="button" data-case-thumb data-case-type="<?php echo esc_attr($is_video ? 'video' : 'image'); ?>"<?php if ($is_video) : ?> data-case-video="<?php echo esc_url((string) ($item['src'] ?? '')); ?>" data-case-poster="<?php echo esc_url((string) ($item['poster'] ?? '')); ?>"<?php endif; ?>>
                        <img src="<?php echo esc_url((string) ($is_video ? ($item['poster'] ?? ($item['src'] ?? '')) : ($item['src'] ?? ''))); ?>" alt="<?php echo esc_attr((string) ($item['alt'] ?? '')); ?>" loading="lazy" decoding="async">
                        <?php if ($is_video) : ?>
                            <span class="projects-case-card__thumb-play" aria-hidden="true"><?php echo gk_orlink_svg_icon('play'); ?></span>
                        <?php endif; ?>
                    </button>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="projects-case-card__content">
            <h4 class="projects-case-card__title"><?php echo esc_html($title); ?></h4>
            <?php if ($text !== '') : ?>
                <p class="projects-case-card__text"><?php echo esc_html($text); ?></p>
            <?php endif; ?>
            <?php if ($volume !== '' || $year !== '') : ?>
                <ul class="projects-case-card__meta">
                    <?php if ($volume !== '') : ?>
                        <li>
                            <span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                            <span><?php echo esc_html($volume); ?></span>
                        </li>
                    <?php endif; ?>
                    <?php if ($year !== '') : ?>
                        <li>
                            <span class="projects-case-card__meta-icon" aria-hidden="true"><?php echo gk_orlink_svg_icon('check-circle'); ?></span>
                            <span><?php echo esc_html($year); ?></span>
                        </li>
                    <?php endif; ?>
                </ul>
            <?php endif; ?>
        </div>
    </article>
    <?php
}

function gk_orlink_get_default_quiz_steps(): array
{
    $theme_uri = get_template_directory_uri();

    return [
        [
            'question' => 'Что планируете построить?',
            'subtitle' => 'Выберите наиболее подходящий вариант. Это поможет нам предложить оптимальное решение и точный расчёт.',
            'type' => 'cards',
            'options' => [
                ['label' => 'Ангар', 'image_url' => $theme_uri . '/assets/img/angar.png', 'icon' => 'hangar'],
                ['label' => 'Склад', 'image_url' => $theme_uri . '/assets/img/sklad.png', 'icon' => 'warehouse-alt'],
                ['label' => 'Производственно-складской комплекс', 'image_url' => $theme_uri . '/assets/img/skladskoj-kompleks.png', 'icon' => 'factory'],
                ['label' => 'Торговый комплекс / ТЦ', 'image_url' => $theme_uri . '/assets/img/torgovyj-kompleks.png', 'icon' => 'cart'],
                ['label' => 'Здания и таунхаусы', 'image_url' => $theme_uri . '/assets/img/zdaniya.png', 'icon' => 'office'],
                ['label' => 'Автосервис / автомойка', 'image_url' => $theme_uri . '/assets/img/avtosevis.png', 'icon' => 'grid'],
            ],
        ],
        [
            'question' => 'Теплое или холодное здание?',
            'subtitle' => 'Выберите тип здания, чтобы мы сразу предложили подходящее решение.',
            'type' => 'chips',
            'options' => [
                ['label' => 'Теплое помещение'],
                ['label' => 'Холодное помещение'],
            ],
        ],
        [
            'question' => 'Укажите примерную площадь будущего здания (в м²).',
            'subtitle' => 'Выберите ориентировочную площадь с помощью ползунка.',
            'type' => 'range',
            'min' => 500,
            'max' => 10000,
            'step' => 10,
            'default_value' => 500,
            'unit' => 'м²',
        ],
        [
            'question' => 'Сколько этажей планируете?',
            'subtitle' => 'Выберите количество этажей или запросите консультацию специалиста.',
            'type' => 'chips',
            'options' => [
                ['label' => '1 этаж'],
                ['label' => '2 этажа'],
                ['label' => '3 этажа'],
                ['label' => 'Нужна консультация'],
            ],
        ],
        [
            'question' => 'У вас уже есть земельный участок?',
            'subtitle' => 'Это поможет понять, на каком этапе находится проект и какие решения предложить.',
            'type' => 'chips',
            'options' => [
                ['label' => 'Да'],
                ['label' => 'В процессе покупки'],
                ['label' => 'Нет'],
            ],
        ],
        [
            'question' => 'Есть ли проект строительства здания или эскиз?',
            'subtitle' => 'Это поможет оценить, на каком этапе подготовки вы находитесь.',
            'type' => 'chips',
            'options' => [
                ['label' => 'Есть готовый проект'],
                ['label' => 'Нет проекта'],
                ['label' => 'Есть эскиз'],
                ['label' => 'Есть картинка из интернета'],
                ['label' => 'Хочу заказать проект'],
                ['label' => 'Нет, нужна консультация'],
            ],
        ],
        [
            'question' => 'Когда планируете начать строительство?',
            'subtitle' => 'Сроки влияют на подбор решения, производство и монтаж.',
            'type' => 'chips',
            'options' => [
                ['label' => 'Как можно быстрее'],
                ['label' => 'В ближайшее время'],
                ['label' => 'В ближайшие 2-3 месяца'],
                ['label' => 'В ближайшие 6-12 месяцев'],
                ['label' => 'Точных сроков пока нет'],
            ],
        ],
        [
            'question' => 'Как с вами связаться?',
            'subtitle' => 'Выберите удобный способ связи для дальнейшего общения.',
            'type' => 'chips',
            'options' => [
                ['label' => 'В MAX'],
                ['label' => 'В Телеграм'],
                ['label' => 'Позвонить на телефон'],
            ],
        ],
        [
            'question' => 'Отлично, остался последний шаг!',
            'subtitle' => 'Напишите телефон для получения расчета стоимости.',
            'type' => 'form',
        ],
    ];
}

function gk_orlink_quiz_options_to_text(array $options, string $type): string
{
    $lines = [];

    foreach ($options as $option) {
        if (!is_array($option)) {
            continue;
        }

        $label = trim((string) ($option['label'] ?? ''));
        if ($label === '') {
            continue;
        }

        if ($type === 'cards') {
            $lines[] = implode('|', [
                $label,
                trim((string) ($option['image_url'] ?? '')),
                trim((string) ($option['icon'] ?? '')),
            ]);
            continue;
        }

        $lines[] = $label;
    }

    return implode("\n", $lines);
}

function gk_orlink_quiz_text_to_options(string $text, string $type): array
{
    $lines = preg_split('/\r\n|\r|\n/', trim($text));
    $options = [];

    foreach ((array) $lines as $line) {
        $line = trim((string) $line);
        if ($line === '') {
            continue;
        }

        if ($type === 'cards') {
            $parts = array_map('trim', explode('|', $line));
            $label = $parts[0] ?? '';
            if ($label === '') {
                continue;
            }

            $options[] = [
                'label' => $label,
                'image_url' => esc_url_raw((string) ($parts[1] ?? '')),
                'icon' => sanitize_text_field((string) ($parts[2] ?? '')),
            ];
            continue;
        }

        $options[] = [
            'label' => sanitize_text_field($line),
        ];
    }

    return $options;
}

function gk_orlink_quiz_cards_to_options(array $cards): array
{
    $options = [];

    foreach ($cards as $card) {
        if (!is_array($card)) {
            continue;
        }

        $label = sanitize_text_field((string) ($card['label'] ?? ''));
        if ($label === '') {
            continue;
        }

        $options[] = [
            'label' => $label,
            'image_url' => sanitize_text_field((string) ($card['image_url'] ?? '')),
            'icon' => sanitize_text_field((string) ($card['icon'] ?? '')),
        ];
    }

    return $options;
}

function gk_orlink_sanitize_quiz_step(array $step): array
{
    $type = in_array((string) ($step['type'] ?? 'chips'), ['cards', 'chips', 'range', 'form'], true) ? (string) ($step['type'] ?? 'chips') : 'chips';
    $options = $type === 'cards'
        ? gk_orlink_quiz_cards_to_options((array) ($step['cards'] ?? []))
        : gk_orlink_quiz_text_to_options((string) ($step['options_text'] ?? ''), $type);

    return [
        'question' => sanitize_text_field((string) ($step['question'] ?? '')),
        'subtitle' => sanitize_textarea_field((string) ($step['subtitle'] ?? '')),
        'type' => $type,
        'options' => $options,
        'min' => (int) ($step['min'] ?? 0),
        'max' => (int) ($step['max'] ?? 0),
        'step' => (int) ($step['step'] ?? 1),
        'default_value' => (int) ($step['default_value'] ?? 0),
        'unit' => sanitize_text_field((string) ($step['unit'] ?? '')),
    ];
}

function gk_orlink_render_editor_media_field(string $label, string $name, string $value, string $button_label = 'Выбрать файл'): void
{
    $value = trim($value);
    $preview_id = sanitize_key($name) . '-preview';
    ?>
    <tr>
        <th scope="row"><label for="<?php echo esc_attr($name); ?>"><?php echo esc_html($label); ?></label></th>
        <td>
            <div class="gk-orlink-media-field" data-gk-orlink-media-field data-gk-orlink-media-nonce="<?php echo esc_attr(wp_create_nonce('gk_orlink_editor_media_upload')); ?>">
                <input
                    type="file"
                    class="gk-orlink-media-field__file"
                    data-gk-orlink-media-file
                    accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg"
                    hidden
                >
                <div class="gk-orlink-media-field__preview" id="<?php echo esc_attr($preview_id); ?>">
                    <?php if ($value !== '') : ?>
                        <img src="<?php echo esc_url($value); ?>" alt="">
                    <?php else : ?>
                        <span><?php esc_html_e('Превью', 'gk-orlink'); ?></span>
                    <?php endif; ?>
                </div>
                <div class="gk-orlink-media-field__controls">
                    <input
                        class="large-text gk-orlink-media-field__input"
                        type="url"
                        id="<?php echo esc_attr($name); ?>"
                        name="<?php echo esc_attr($name); ?>"
                        value="<?php echo esc_attr($value); ?>"
                        data-gk-orlink-media-input
                    >
                    <div class="gk-orlink-media-field__actions">
                        <button type="button" class="button button-secondary gk-orlink-media-field__button" data-gk-orlink-media-button><?php echo esc_html($button_label); ?></button>
                        <button type="button" class="button-link-delete gk-orlink-media-field__clear" data-gk-orlink-media-clear><?php esc_html_e('Очистить', 'gk-orlink'); ?></button>
                    </div>
                </div>
            </div>
        </td>
    </tr>
    <?php
}

function gk_orlink_render_editor_media_block(string $label, string $name, string $value, string $button_label = 'Выбрать файл'): void
{
    $value = trim($value);
    $preview_id = sanitize_key($name) . '-preview';
    ?>
    <div class="gk-orlink-media-field gk-orlink-media-field--stacked" data-gk-orlink-media-field data-gk-orlink-media-nonce="<?php echo esc_attr(wp_create_nonce('gk_orlink_editor_media_upload')); ?>">
        <input
            type="file"
            class="gk-orlink-media-field__file"
            data-gk-orlink-media-file
            accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg"
            hidden
        >
        <div class="gk-orlink-media-field__preview" id="<?php echo esc_attr($preview_id); ?>">
            <?php if ($value !== '') : ?>
                <img src="<?php echo esc_url($value); ?>" alt="">
            <?php else : ?>
                <span><?php esc_html_e('Превью', 'gk-orlink'); ?></span>
            <?php endif; ?>
        </div>
        <div class="gk-orlink-media-field__controls">
            <label class="gk-orlink-media-field__label" for="<?php echo esc_attr($name); ?>"><?php echo esc_html($label); ?></label>
            <input
                class="large-text gk-orlink-media-field__input"
                type="url"
                id="<?php echo esc_attr($name); ?>"
                name="<?php echo esc_attr($name); ?>"
                value="<?php echo esc_attr($value); ?>"
                data-gk-orlink-media-input
            >
            <div class="gk-orlink-media-field__actions">
                <button type="button" class="button button-secondary gk-orlink-media-field__button" data-gk-orlink-media-button><?php echo esc_html($button_label); ?></button>
                <button type="button" class="button-link-delete gk-orlink-media-field__clear" data-gk-orlink-media-clear><?php esc_html_e('Очистить', 'gk-orlink'); ?></button>
            </div>
        </div>
    </div>
    <?php
}

function gk_orlink_render_editor_case_details($case_index, array $case = [], bool $open = false): void
{
    $case_title = trim((string) ($case['title'] ?? ''));
    $case_summary = $case_title !== '' ? $case_title : __('Новый кейс', 'gk-orlink');
    ?>
    <details class="gk-orlink-case-item" data-gk-orlink-case-item data-gk-orlink-case-index="<?php echo esc_attr((string) $case_index); ?>" style="margin: 12px 0; padding: 12px; border: 1px solid #dcdcde; background: #fff;" <?php echo $open ? 'open' : ''; ?>>
        <summary style="cursor:pointer; font-weight:600;"><?php echo esc_html($case_summary); ?></summary>
        <table class="form-table" role="presentation">
            <tr><th><label><?php esc_html_e('Заголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" name="gk_orlink_editor[cases][<?php echo esc_attr((string) $case_index); ?>][title]" value="<?php echo esc_attr((string) ($case['title'] ?? '')); ?>"></td></tr>
            <tr><th><label><?php esc_html_e('Контент', 'gk-orlink'); ?></label></th><td><textarea class="large-text" name="gk_orlink_editor[cases][<?php echo esc_attr((string) $case_index); ?>][text]" rows="3"><?php echo esc_textarea((string) ($case['text'] ?? '')); ?></textarea></td></tr>
            <tr><th><label><?php esc_html_e('Объем', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[cases][<?php echo esc_attr((string) $case_index); ?>][volume]" value="<?php echo esc_attr((string) ($case['volume'] ?? '')); ?>"></td></tr>
            <tr><th><label><?php esc_html_e('Год', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[cases][<?php echo esc_attr((string) $case_index); ?>][year]" value="<?php echo esc_attr((string) ($case['year'] ?? '')); ?>"></td></tr>
            <?php gk_orlink_render_editor_media_field(__('Фото 1', 'gk-orlink'), 'gk_orlink_editor[cases][' . $case_index . '][image_1]', (string) ($case['image_1'] ?? '')); ?>
            <?php gk_orlink_render_editor_media_field(__('Фото 2', 'gk-orlink'), 'gk_orlink_editor[cases][' . $case_index . '][image_2]', (string) ($case['image_2'] ?? '')); ?>
            <?php gk_orlink_render_editor_media_field(__('Фото 3', 'gk-orlink'), 'gk_orlink_editor[cases][' . $case_index . '][image_3]', (string) ($case['image_3'] ?? '')); ?>
            <?php gk_orlink_render_editor_media_field(__('Фото 4', 'gk-orlink'), 'gk_orlink_editor[cases][' . $case_index . '][image_4]', (string) ($case['image_4'] ?? '')); ?>
            <tr><th><label><?php esc_html_e('Видео', 'gk-orlink'); ?></label></th><td><input class="large-text" type="url" name="gk_orlink_editor[cases][<?php echo esc_attr((string) $case_index); ?>][video]" value="<?php echo esc_attr((string) ($case['video'] ?? '')); ?>"></td></tr>
            <?php gk_orlink_render_editor_media_field(__('Постер', 'gk-orlink'), 'gk_orlink_editor[cases][' . $case_index . '][poster]', (string) ($case['poster'] ?? ''), __('Выбрать постер', 'gk-orlink')); ?>
        </table>
        <div class="gk-orlink-case-actions" style="display:flex; gap:12px; justify-content:flex-end; margin-top:12px;">
            <button type="button" class="button-link-delete" data-gk-orlink-case-delete><?php esc_html_e('Удалить кейс', 'gk-orlink'); ?></button>
            <button type="button" class="button button-secondary" data-gk-orlink-case-duplicate><?php esc_html_e('Дублировать кейс', 'gk-orlink'); ?></button>
        </div>
    </details>
    <?php
}

function gk_orlink_render_editor_media_admin_styles(): void
{
    ?>
    <style>
        .gk-orlink-media-field {
            display: grid;
            grid-template-columns: 140px minmax(0, 1fr);
            gap: 16px;
            align-items: start;
        }

        .gk-orlink-media-field--stacked {
            grid-template-columns: 140px minmax(0, 1fr);
        }

        .gk-orlink-media-field__preview {
            width: 140px;
            min-height: 104px;
            border: 1px solid #dcdcde;
            border-radius: 10px;
            background: #f6f7f7;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            color: #646970;
            font-size: 12px;
            line-height: 1.4;
        }

        .gk-orlink-media-field__preview img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .gk-orlink-media-field__controls {
            min-width: 0;
        }

        .gk-orlink-media-field__label {
            display: inline-block;
            margin-bottom: 6px;
            font-weight: 600;
        }

        .gk-orlink-media-field__input {
            width: 100%;
        }

        .gk-orlink-media-field__actions {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
        }

        .gk-orlink-quiz-cards-grid {
            display: grid;
            gap: 14px;
        }

        .gk-orlink-quiz-card-item {
            padding: 14px;
            border: 1px solid #dcdcde;
            border-radius: 12px;
            background: #fff;
        }

        .gk-orlink-quiz-card-item__title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .gk-orlink-quiz-card-item__fields {
            display: grid;
            gap: 14px;
        }

        @media (max-width: 782px) {
            .gk-orlink-media-field {
                grid-template-columns: 1fr;
            }

            .gk-orlink-media-field__preview {
                width: 100%;
            }

            .gk-orlink-quiz-card-item {
                padding: 12px;
            }
        }
    </style>
    <?php
}

function gk_orlink_render_editor_media_admin_script(): void
{
    ?>
    <script>
    (function () {
        const refreshPreview = (field, url) => {
            const preview = field.querySelector('.gk-orlink-media-field__preview');
            if (!(preview instanceof HTMLElement)) {
                return;
            }

            preview.innerHTML = '';

            if (!url) {
                const empty = document.createElement('span');
                empty.textContent = '<?php echo esc_js(__('Превью', 'gk-orlink')); ?>';
                preview.appendChild(empty);
                return;
            }

            const image = document.createElement('img');
            image.src = url;
            image.alt = '';
            preview.appendChild(image);
        };

        const uploadFile = async (field, file) => {
            const input = field.querySelector('[data-gk-orlink-media-input]');
            if (!(input instanceof HTMLInputElement) || !(file instanceof File)) {
                return;
            }

            const nonce = field.getAttribute('data-gk-orlink-media-nonce') || '';
            const formData = new FormData();
            formData.append('action', 'gk_orlink_upload_editor_media');
            formData.append('nonce', nonce);
            formData.append('file', file);

            const response = await fetch(window.ajaxurl, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData,
            });

            const json = await response.json();
            if (!json || !json.success || !json.data || !json.data.url) {
                throw new Error((json && json.data && json.data.message) ? json.data.message : 'Upload failed');
            }

            input.value = json.data.url;
            refreshPreview(field, json.data.url);
        };

        window.gkOrlinkPickMedia = function (buttonElement) {
            if (!(buttonElement instanceof HTMLElement)) {
                return false;
            }

            const field = buttonElement.closest('[data-gk-orlink-media-field]');
            if (!(field instanceof HTMLElement)) {
                return false;
            }

            const fileInput = field.querySelector('[data-gk-orlink-media-file]');
            if (!(fileInput instanceof HTMLInputElement)) {
                return false;
            }

            fileInput.click();
            return false;
        };

        document.addEventListener('change', async (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !target.matches('[data-gk-orlink-media-file]')) {
                return;
            }

            const field = target.closest('[data-gk-orlink-media-field]');
            if (!(field instanceof HTMLElement)) {
                return;
            }

            const file = target.files && target.files[0] ? target.files[0] : null;
            if (!file) {
                return;
            }

            try {
                await uploadFile(field, file);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                alert('<?php echo esc_js(__('Не удалось загрузить файл. Проверьте формат и попробуйте ещё раз.', 'gk-orlink')); ?>');
            } finally {
                target.value = '';
            }
        });

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const clearButton = target.closest('[data-gk-orlink-media-clear]');
            const button = target.closest('[data-gk-orlink-media-button]');
            if (!clearButton && !button) {
                return;
            }

            const field = (clearButton || button).closest('[data-gk-orlink-media-field]');
            if (!(field instanceof HTMLElement)) {
                return;
            }

            const input = field.querySelector('[data-gk-orlink-media-input]');
            if (!(input instanceof HTMLInputElement)) {
                return;
            }

            if (button) {
                event.preventDefault();
                const fileInput = field.querySelector('[data-gk-orlink-media-file]');
                if (fileInput instanceof HTMLInputElement) {
                    fileInput.click();
                }
                return;
            }

            event.preventDefault();
            input.value = '';
            refreshPreview(field, '');
        });

        document.addEventListener('input', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !target.matches('[data-gk-orlink-media-input]')) {
                return;
            }

            const field = target.closest('[data-gk-orlink-media-field]');
            if (!(field instanceof HTMLElement)) {
                return;
            }

            refreshPreview(field, target.value.trim());
        });
    }());
    </script>
    <?php
}

function gk_orlink_render_editor_cases_admin_script(): void
{
    ?>
    <script>
    (function () {
        const list = document.querySelector('[data-gk-orlink-cases-list]');
        const button = document.querySelector('[data-gk-orlink-add-case]');
        const template = document.querySelector('[data-gk-orlink-case-template]');

        if (!(list instanceof HTMLElement) || !(button instanceof HTMLButtonElement) || !(template instanceof HTMLTemplateElement)) {
            return;
        }

        const syncSummaries = () => {
            list.querySelectorAll('[data-gk-orlink-case-item]').forEach((item) => {
                const titleInput = item.querySelector('input[name*="[title]"]');
                const summary = item.querySelector('summary');

                if (!(titleInput instanceof HTMLInputElement) || !(summary instanceof HTMLElement)) {
                    return;
                }

                const value = titleInput.value.trim();
                summary.textContent = value !== '' ? value : '<?php echo esc_js(__('Новый кейс', 'gk-orlink')); ?>';
            });
        };

        const getMaxIndex = () => {
            const indexes = Array.from(list.querySelectorAll('[data-gk-orlink-case-item]'))
                .map((item) => Number.parseInt(item.getAttribute('data-gk-orlink-case-index') || '', 10))
                .filter((index) => Number.isFinite(index) && index >= 0);

            return indexes.length ? Math.max(...indexes) : -1;
        };

        const addCase = () => {
            const nextIndex = getMaxIndex() + 1;
            const html = template.innerHTML.split('__INDEX__').join(String(nextIndex));
            list.insertAdjacentHTML('beforeend', html);

            const newItem = list.querySelector('[data-gk-orlink-case-item]:last-child');
            if (newItem instanceof HTMLElement) {
                const summary = newItem.querySelector('summary');
                if (summary instanceof HTMLElement) {
                    summary.textContent = '<?php echo esc_js(__('Новый кейс', 'gk-orlink')); ?>';
                }
                newItem.open = true;
                newItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            syncSummaries();
        };

        const duplicateCase = (item) => {
            if (!(item instanceof HTMLElement)) {
                return;
            }

            const currentIndex = item.getAttribute('data-gk-orlink-case-index');
            if (currentIndex === null) {
                return;
            }

            const nextIndex = getMaxIndex() + 1;
            const oldPrefix = 'gk_orlink_editor[cases][' + currentIndex + ']';
            const newPrefix = 'gk_orlink_editor[cases][' + nextIndex + ']';
            let html = item.outerHTML.split(oldPrefix).join(newPrefix);
            html = html.replace(
                'data-gk-orlink-case-index="' + currentIndex + '"',
                'data-gk-orlink-case-index="' + nextIndex + '"'
            );

            list.insertAdjacentHTML('beforeend', html);

            const newItem = list.querySelector('[data-gk-orlink-case-item]:last-child');
            if (newItem instanceof HTMLElement) {
                newItem.querySelectorAll('.gk-orlink-media-field__preview').forEach((preview) => {
                    if (preview instanceof HTMLElement) {
                        preview.removeAttribute('id');
                    }
                });
                newItem.open = true;
                newItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            syncSummaries();
        };

        const removeCase = (item) => {
            if (!(item instanceof HTMLElement)) {
                return;
            }

            item.remove();
            syncSummaries();
        };

        button.addEventListener('click', (event) => {
            event.preventDefault();
            addCase();
        });

        list.addEventListener('input', (event) => {
            if (event.target instanceof HTMLInputElement && event.target.name.includes('[title]')) {
                const item = event.target.closest('[data-gk-orlink-case-item]');
                const summary = item ? item.querySelector('summary') : null;
                if (summary instanceof HTMLElement) {
                    const value = event.target.value.trim();
                    summary.textContent = value !== '' ? value : '<?php echo esc_js(__('Новый кейс', 'gk-orlink')); ?>';
                }
            }
        });

        list.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const deleteButton = target.closest('[data-gk-orlink-case-delete]');
            if (deleteButton) {
                event.preventDefault();
                removeCase(deleteButton.closest('[data-gk-orlink-case-item]'));
                return;
            }

            const duplicateButton = target.closest('[data-gk-orlink-case-duplicate]');
            if (duplicateButton) {
                event.preventDefault();
                duplicateCase(duplicateButton.closest('[data-gk-orlink-case-item]'));
            }
        });
    }());
    </script>
    <?php
}

function gk_orlink_handle_editor_media_upload(): void
{
    check_ajax_referer('gk_orlink_editor_media_upload', 'nonce');

    if (!current_user_can('upload_files')) {
        wp_send_json_error(['message' => __('Недостаточно прав для загрузки файлов.', 'gk-orlink')], 403);
    }

    if (empty($_FILES['file']) || !isset($_FILES['file']['tmp_name']) || $_FILES['file']['tmp_name'] === '') {
        wp_send_json_error(['message' => __('Файл не был передан.', 'gk-orlink')], 400);
    }

    if (!function_exists('media_handle_upload')) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
    }

    $attachment_id = media_handle_upload('file', 0);

    if (is_wp_error($attachment_id)) {
        wp_send_json_error(['message' => $attachment_id->get_error_message()], 500);
    }

    $url = wp_get_attachment_url((int) $attachment_id);
    if ($url === false || $url === '') {
        wp_send_json_error(['message' => __('Не удалось получить ссылку на файл.', 'gk-orlink')], 500);
    }

    wp_send_json_success([
        'url' => $url,
        'id' => (int) $attachment_id,
    ]);
}
add_action('wp_ajax_gk_orlink_upload_editor_media', 'gk_orlink_handle_editor_media_upload');

function gk_orlink_enqueue_editor_media_assets(string $hook_suffix): void
{
    $current_page = isset($_GET['page']) ? sanitize_key((string) $_GET['page']) : '';
    if ($hook_suffix !== 'toplevel_page_gk-orlink-editor' && $current_page !== 'gk-orlink-editor') {
        return;
    }

    wp_enqueue_media();
    add_action('admin_head', 'gk_orlink_render_editor_media_admin_styles');
    add_action('admin_footer', 'gk_orlink_render_editor_media_admin_script');
    add_action('admin_footer', 'gk_orlink_render_editor_cases_admin_script');
}
add_action('admin_enqueue_scripts', 'gk_orlink_enqueue_editor_media_assets');

function gk_orlink_sanitize_editor_case(array $case): array
{
    $images = [];
    foreach (['image_1', 'image_2', 'image_3', 'image_4'] as $image_key) {
        $images[$image_key] = sanitize_text_field((string) ($case[$image_key] ?? ''));
    }

    return [
        'title' => sanitize_text_field((string) ($case['title'] ?? '')),
        'text' => sanitize_textarea_field((string) ($case['text'] ?? '')),
        'volume' => sanitize_text_field((string) ($case['volume'] ?? '')),
        'year' => sanitize_text_field((string) ($case['year'] ?? '')),
        'image_1' => $images['image_1'],
        'image_2' => $images['image_2'],
        'image_3' => $images['image_3'],
        'image_4' => $images['image_4'],
        'video' => sanitize_text_field((string) ($case['video'] ?? '')),
        'poster' => sanitize_text_field((string) ($case['poster'] ?? '')),
    ];
}

function gk_orlink_sanitize_editor_settings(array $data): array
{
    $hero_points = array_values(array_filter(array_map('sanitize_text_field', (array) ($data['hero']['points'] ?? []))));
    while (count($hero_points) < 2) {
        $hero_points[] = '';
    }

    $guarantee_cards = [];
    foreach ((array) ($data['guarantees']['cards'] ?? []) as $card) {
        if (is_array($card)) {
            $guarantee_cards[] = [
                'icon' => esc_url_raw((string) ($card['icon'] ?? '')),
                'title' => sanitize_text_field((string) ($card['title'] ?? '')),
            ];
        }
    }

    $benefit_cards = [];
    foreach ((array) ($data['benefits'] ?? []) as $card) {
        if (is_array($card)) {
            $benefit_cards[] = [
                'icon' => esc_url_raw((string) ($card['icon'] ?? '')),
                'text' => sanitize_text_field((string) ($card['text'] ?? '')),
            ];
        }
    }

    $cases = [];
    foreach ((array) ($data['cases'] ?? []) as $case) {
        if (is_array($case)) {
            $cases[] = gk_orlink_sanitize_editor_case($case);
        }
    }

    return [
        'hero' => [
            'title_line_1' => sanitize_text_field((string) ($data['hero']['title_line_1'] ?? '')),
            'title_line_2' => sanitize_text_field((string) ($data['hero']['title_line_2'] ?? '')),
            'subtitle' => sanitize_text_field((string) ($data['hero']['subtitle'] ?? '')),
            'accent' => sanitize_text_field((string) ($data['hero']['accent'] ?? '')),
            'points' => $hero_points,
            'cta_text' => sanitize_text_field((string) ($data['hero']['cta_text'] ?? '')),
            'quiz_title' => sanitize_text_field((string) ($data['hero']['quiz_title'] ?? '')),
            'quiz_text' => sanitize_text_field((string) ($data['hero']['quiz_text'] ?? '')),
            'bg_image' => esc_url_raw((string) ($data['hero']['bg_image'] ?? '')),
        ],
        'process' => [
            'title' => sanitize_text_field((string) ($data['process']['title'] ?? '')),
            'iframe' => esc_url_raw((string) ($data['process']['iframe'] ?? '')),
            'heading' => sanitize_text_field((string) ($data['process']['heading'] ?? '')),
            'text' => sanitize_textarea_field((string) ($data['process']['text'] ?? '')),
        ],
        'benefits' => array_slice($benefit_cards, 0, 4),
        'services' => [
            'title' => sanitize_text_field((string) ($data['services']['title'] ?? '')),
        ],
        'projects' => [
            'title' => sanitize_text_field((string) ($data['projects']['title'] ?? '')),
            'subtitle' => sanitize_text_field((string) ($data['projects']['subtitle'] ?? '')),
        ],
        'quiz' => [
            'title' => sanitize_text_field((string) ($data['quiz']['title'] ?? '')),
            'headline' => sanitize_text_field((string) ($data['quiz']['headline'] ?? '')),
            'steps' => array_slice(array_map('gk_orlink_sanitize_quiz_step', (array) ($data['quiz']['steps'] ?? [])), 0, 9),
        ],
        'guarantees' => [
            'title' => sanitize_text_field((string) ($data['guarantees']['title'] ?? '')),
            'image' => esc_url_raw((string) ($data['guarantees']['image'] ?? '')),
            'cards' => array_slice($guarantee_cards, 0, 4),
        ],
        'contacts' => [
            'title' => sanitize_text_field((string) ($data['contacts']['title'] ?? '')),
            'subtitle' => sanitize_text_field((string) ($data['contacts']['subtitle'] ?? '')),
            'address' => sanitize_text_field((string) ($data['contacts']['address'] ?? '')),
            'phone' => sanitize_text_field((string) ($data['contacts']['phone'] ?? '')),
            'email' => sanitize_email((string) ($data['contacts']['email'] ?? '')),
            'map_iframe' => esc_url_raw((string) ($data['contacts']['map_iframe'] ?? '')),
        ],
        'cases' => $cases,
    ];
}

function gk_orlink_register_editor_admin_page(): void
{
    add_menu_page(
        __('Редактор', 'gk-orlink'),
        __('Редактор', 'gk-orlink'),
        'manage_options',
        'gk-orlink-editor',
        'gk_orlink_render_editor_admin_page',
        'dashicons-edit',
        57
    );
}
add_action('admin_menu', 'gk_orlink_register_editor_admin_page');

function gk_orlink_render_editor_admin_page(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Недостаточно прав для доступа к редактору.', 'gk-orlink'));
    }

    if (function_exists('wp_enqueue_media')) {
        wp_enqueue_media();
    }

    $notice = '';

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['gk_orlink_editor_nonce'])) {
        check_admin_referer('gk_orlink_editor_settings', 'gk_orlink_editor_nonce');
        $raw = isset($_POST['gk_orlink_editor']) && is_array($_POST['gk_orlink_editor']) ? (array) wp_unslash($_POST['gk_orlink_editor']) : [];
        update_option('gk_orlink_editor_settings', gk_orlink_sanitize_editor_settings($raw), false);
        $notice = __('Настройки редактора сохранены.', 'gk-orlink');
    }

    $settings = gk_orlink_get_editor_settings();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Редактор', 'gk-orlink'); ?></h1>
        <p><?php esc_html_e('Здесь можно редактировать основные блоки главной страницы. Для кейсов предусмотрены отдельные группы полей.', 'gk-orlink'); ?></p>

        <?php if ($notice !== '') : ?>
            <div class="notice notice-success is-dismissible"><p><?php echo esc_html($notice); ?></p></div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('gk_orlink_editor_settings', 'gk_orlink_editor_nonce'); ?>

            <h2><?php esc_html_e('Главный экран', 'gk-orlink'); ?></h2>
            <table class="form-table" role="presentation">
                <tr><th><label for="editor-hero-title-1"><?php esc_html_e('Заголовок 1', 'gk-orlink'); ?></label></th><td><input class="regular-text" id="editor-hero-title-1" name="gk_orlink_editor[hero][title_line_1]" value="<?php echo esc_attr((string) $settings['hero']['title_line_1']); ?>"></td></tr>
                <tr><th><label for="editor-hero-title-2"><?php esc_html_e('Заголовок 2', 'gk-orlink'); ?></label></th><td><input class="regular-text" id="editor-hero-title-2" name="gk_orlink_editor[hero][title_line_2]" value="<?php echo esc_attr((string) $settings['hero']['title_line_2']); ?>"></td></tr>
                <tr><th><label for="editor-hero-subtitle"><?php esc_html_e('Подзаголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-hero-subtitle" name="gk_orlink_editor[hero][subtitle]" value="<?php echo esc_attr((string) $settings['hero']['subtitle']); ?>"></td></tr>
                <tr><th><label for="editor-hero-accent"><?php esc_html_e('Акцент', 'gk-orlink'); ?></label></th><td><input class="regular-text" id="editor-hero-accent" name="gk_orlink_editor[hero][accent]" value="<?php echo esc_attr((string) $settings['hero']['accent']); ?>"></td></tr>
                <tr><th><label for="editor-hero-point-1"><?php esc_html_e('Пункт 1', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-hero-point-1" name="gk_orlink_editor[hero][points][]" value="<?php echo esc_attr((string) ($settings['hero']['points'][0] ?? '')); ?>"></td></tr>
                <tr><th><label for="editor-hero-point-2"><?php esc_html_e('Пункт 2', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-hero-point-2" name="gk_orlink_editor[hero][points][]" value="<?php echo esc_attr((string) ($settings['hero']['points'][1] ?? '')); ?>"></td></tr>
                <tr><th><label for="editor-hero-cta"><?php esc_html_e('Кнопка', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-hero-cta" name="gk_orlink_editor[hero][cta_text]" value="<?php echo esc_attr((string) $settings['hero']['cta_text']); ?>"></td></tr>
                <tr><th><label for="editor-hero-quiz-title"><?php esc_html_e('Текст квиза 1', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-hero-quiz-title" name="gk_orlink_editor[hero][quiz_title]" value="<?php echo esc_attr((string) $settings['hero']['quiz_title']); ?>"></td></tr>
                <tr><th><label for="editor-hero-quiz-text"><?php esc_html_e('Текст квиза 2', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-hero-quiz-text" name="gk_orlink_editor[hero][quiz_text]" value="<?php echo esc_attr((string) $settings['hero']['quiz_text']); ?>"></td></tr>
                <tr><th><label for="editor-hero-bg"><?php esc_html_e('Фон', 'gk-orlink'); ?></label></th><td><input class="large-text" type="url" id="editor-hero-bg" name="gk_orlink_editor[hero][bg_image]" value="<?php echo esc_attr((string) $settings['hero']['bg_image']); ?>"></td></tr>
            </table>

            <h2><?php esc_html_e('Преимущества', 'gk-orlink'); ?></h2>
            <p class="description"><?php esc_html_e('Здесь можно менять тексты и иконки карточек преимуществ.', 'gk-orlink'); ?></p>
            <table class="form-table" role="presentation">
                <?php for ($benefit_index = 0; $benefit_index < 4; $benefit_index++) :
                    $benefit = $settings['benefits'][$benefit_index] ?? [];
                    $benefit_summary = trim((string) ($benefit['text'] ?? ''));
                    if ($benefit_summary === '') {
                        $benefit_summary = sprintf(__('Преимущество %d', 'gk-orlink'), $benefit_index + 1);
                    }
                ?>
                    <tr>
                        <td colspan="2">
                            <details style="margin: 12px 0; padding: 12px; border: 1px solid #dcdcde; background: #fff;" <?php echo 0 === $benefit_index ? 'open' : ''; ?>>
                                <summary style="cursor:pointer; font-weight:600;"><?php echo esc_html($benefit_summary); ?></summary>
                                <table class="form-table" role="presentation">
                                    <?php gk_orlink_render_editor_media_field(__('Иконка', 'gk-orlink'), 'gk_orlink_editor[benefits][' . $benefit_index . '][icon]', (string) ($benefit['icon'] ?? ''), __('Выбрать иконку', 'gk-orlink')); ?>
                                    <tr><th><label><?php esc_html_e('Текст', 'gk-orlink'); ?></label></th><td><textarea class="large-text" name="gk_orlink_editor[benefits][<?php echo esc_attr((string) $benefit_index); ?>][text]" rows="3"><?php echo esc_textarea((string) ($benefit['text'] ?? '')); ?></textarea></td></tr>
                                </table>
                            </details>
                        </td>
                    </tr>
                <?php endfor; ?>
            </table>

            <h2><?php esc_html_e('Как мы строим и исполняем обязательства?', 'gk-orlink'); ?></h2>
            <table class="form-table" role="presentation">
                <tr><th><label for="editor-process-title"><?php esc_html_e('Заголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-process-title" name="gk_orlink_editor[process][title]" value="<?php echo esc_attr((string) $settings['process']['title']); ?>"></td></tr>
                <tr><th><label for="editor-process-iframe"><?php esc_html_e('Ифрейм видео', 'gk-orlink'); ?></label></th><td><input class="large-text" type="url" id="editor-process-iframe" name="gk_orlink_editor[process][iframe]" value="<?php echo esc_attr((string) $settings['process']['iframe']); ?>"></td></tr>
                <tr><th><label for="editor-process-heading"><?php esc_html_e('Заголовок блока', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-process-heading" name="gk_orlink_editor[process][heading]" value="<?php echo esc_attr((string) $settings['process']['heading']); ?>"></td></tr>
                <tr><th><label for="editor-process-text"><?php esc_html_e('Контент блока', 'gk-orlink'); ?></label></th><td><textarea class="large-text" id="editor-process-text" name="gk_orlink_editor[process][text]" rows="4"><?php echo esc_textarea((string) $settings['process']['text']); ?></textarea></td></tr>
            </table>

            <h2><?php esc_html_e('Предлагаем лучшую цену потому что работаем без посредников', 'gk-orlink'); ?></h2>
            <table class="form-table" role="presentation">
                <tr><th><label for="editor-services-title"><?php esc_html_e('Заголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-services-title" name="gk_orlink_editor[services][title]" value="<?php echo esc_attr((string) $settings['services']['title']); ?>"></td></tr>
            </table>

            <h2><?php esc_html_e('Кейсы', 'gk-orlink'); ?></h2>
            <p class="description"><?php esc_html_e('У каждого кейса можно менять заголовок, описание, фото, видео, объем и год. Добавлять кейсы можно кнопкой ниже.', 'gk-orlink'); ?></p>
            <div data-gk-orlink-cases-list>
                <?php foreach ((array) $settings['cases'] as $case_index => $case) : ?>
                    <?php gk_orlink_render_editor_case_details($case_index, (array) $case, 0 === (int) $case_index); ?>
                <?php endforeach; ?>
            </div>
            <p>
                <button type="button" class="button button-secondary" data-gk-orlink-add-case><?php esc_html_e('Добавить еще кейс', 'gk-orlink'); ?></button>
            </p>
            <template data-gk-orlink-case-template>
                <?php gk_orlink_render_editor_case_details('__INDEX__', [], false); ?>
            </template>

            <h2><?php esc_html_e('Квиз', 'gk-orlink'); ?></h2>
            <table class="form-table" role="presentation">
                <tr><th><label for="editor-quiz-title"><?php esc_html_e('Заголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-quiz-title" name="gk_orlink_editor[quiz][title]" value="<?php echo esc_attr((string) $settings['quiz']['title']); ?>"></td></tr>
                <tr><th><label for="editor-quiz-headline"><?php esc_html_e('Текст над формой', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-quiz-headline" name="gk_orlink_editor[quiz][headline]" value="<?php echo esc_attr((string) $settings['quiz']['headline']); ?>"></td></tr>
            </table>
            <p class="description"><?php esc_html_e('Каждый вопрос можно раскрыть и отредактировать отдельно. Для вариантов ответов используй строки: для карточек формат label|image_url|icon, для остальных достаточно текста в каждой строке.', 'gk-orlink'); ?></p>
            <?php
            $quiz_steps = (array) ($settings['quiz']['steps'] ?? gk_orlink_get_default_quiz_steps());
            for ($quiz_step_index = 0; $quiz_step_index < 9; $quiz_step_index++) :
                $quiz_step = $quiz_steps[$quiz_step_index] ?? [];
                $quiz_step_question = trim((string) ($quiz_step['question'] ?? ''));
                $quiz_step_summary = $quiz_step_question !== '' ? $quiz_step_question : sprintf(__('Вопрос %d', 'gk-orlink'), $quiz_step_index + 1);
                $quiz_step_type = (string) ($quiz_step['type'] ?? 'chips');
                $quiz_step_options_text = gk_orlink_quiz_options_to_text((array) ($quiz_step['options'] ?? []), $quiz_step_type);
                $quiz_step_cards = (array) ($quiz_step['options'] ?? []);
            ?>
                <details style="margin: 12px 0; padding: 12px; border: 1px solid #dcdcde; background: #fff;" <?php echo 0 === $quiz_step_index ? 'open' : ''; ?>>
                    <summary style="cursor:pointer; font-weight:600;"><?php echo esc_html($quiz_step_summary); ?></summary>
                    <table class="form-table" role="presentation">
                        <tr>
                            <th><label><?php esc_html_e('Тип шага', 'gk-orlink'); ?></label></th>
                            <td>
                                <select name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][type]">
                                    <option value="cards" <?php selected($quiz_step_type, 'cards'); ?>>cards</option>
                                    <option value="chips" <?php selected($quiz_step_type, 'chips'); ?>>chips</option>
                                    <option value="range" <?php selected($quiz_step_type, 'range'); ?>>range</option>
                                    <option value="form" <?php selected($quiz_step_type, 'form'); ?>>form</option>
                                </select>
                            </td>
                        </tr>
                        <tr><th><label><?php esc_html_e('Вопрос', 'gk-orlink'); ?></label></th><td><input class="large-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][question]" value="<?php echo esc_attr((string) ($quiz_step['question'] ?? '')); ?>"></td></tr>
                        <tr><th><label><?php esc_html_e('Подсказка', 'gk-orlink'); ?></label></th><td><textarea class="large-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][subtitle]" rows="3"><?php echo esc_textarea((string) ($quiz_step['subtitle'] ?? '')); ?></textarea></td></tr>
                        <?php if ($quiz_step_type === 'cards') : ?>
                            <tr>
                                <th><label><?php esc_html_e('Карточки', 'gk-orlink'); ?></label></th>
                                <td>
                                    <p class="description"><?php esc_html_e('Для первого вопроса карточки редактируются по одной: название, картинка и иконка. Изображение выбирается через медиабиблиотеку.', 'gk-orlink'); ?></p>
                                    <div class="gk-orlink-quiz-cards-grid">
                                        <?php for ($quiz_card_index = 0; $quiz_card_index < 6; $quiz_card_index++) :
                                            $quiz_card = $quiz_step_cards[$quiz_card_index] ?? [];
                                            $quiz_card_label = trim((string) ($quiz_card['label'] ?? ''));
                                            $quiz_card_summary = $quiz_card_label !== '' ? $quiz_card_label : sprintf(__('Карточка %d', 'gk-orlink'), $quiz_card_index + 1);
                                            ?>
                                            <div class="gk-orlink-quiz-card-item">
                                                <div class="gk-orlink-quiz-card-item__title">
                                                    <span><?php echo esc_html($quiz_card_summary); ?></span>
                                                </div>
                                                <div class="gk-orlink-quiz-card-item__fields">
                                                    <div>
                                                        <label class="screen-reader-text" for="<?php echo esc_attr('gk-orlink-quiz-card-label-' . $quiz_step_index . '-' . $quiz_card_index); ?>"><?php esc_html_e('Название карточки', 'gk-orlink'); ?></label>
                                                        <input
                                                            class="large-text"
                                                            id="<?php echo esc_attr('gk-orlink-quiz-card-label-' . $quiz_step_index . '-' . $quiz_card_index); ?>"
                                                            name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][cards][<?php echo esc_attr((string) $quiz_card_index); ?>][label]"
                                                            value="<?php echo esc_attr($quiz_card_label); ?>"
                                                            placeholder="<?php esc_attr_e('Название карточки', 'gk-orlink'); ?>"
                                                        >
                                                    </div>
                                                    <?php gk_orlink_render_editor_media_block(__('Картинка карточки', 'gk-orlink'), 'gk_orlink_editor[quiz][steps][' . $quiz_step_index . '][cards][' . $quiz_card_index . '][image_url]', (string) ($quiz_card['image_url'] ?? ''), __('Выбрать картинку', 'gk-orlink')); ?>
                                                    <div>
                                                        <label class="screen-reader-text" for="<?php echo esc_attr('gk-orlink-quiz-card-icon-' . $quiz_step_index . '-' . $quiz_card_index); ?>"><?php esc_html_e('Иконка', 'gk-orlink'); ?></label>
                                                        <input
                                                            class="large-text"
                                                            id="<?php echo esc_attr('gk-orlink-quiz-card-icon-' . $quiz_step_index . '-' . $quiz_card_index); ?>"
                                                            name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][cards][<?php echo esc_attr((string) $quiz_card_index); ?>][icon]"
                                                            value="<?php echo esc_attr((string) ($quiz_card['icon'] ?? '')); ?>"
                                                            placeholder="<?php esc_attr_e('Иконка (необязательно)', 'gk-orlink'); ?>"
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                        <?php endfor; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php elseif ($quiz_step_type === 'range') : ?>
                            <tr><th><label><?php esc_html_e('Мин.', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][min]" value="<?php echo esc_attr((string) ($quiz_step['min'] ?? '')); ?>"></td></tr>
                            <tr><th><label><?php esc_html_e('Макс.', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][max]" value="<?php echo esc_attr((string) ($quiz_step['max'] ?? '')); ?>"></td></tr>
                            <tr><th><label><?php esc_html_e('Шаг', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][step]" value="<?php echo esc_attr((string) ($quiz_step['step'] ?? '')); ?>"></td></tr>
                            <tr><th><label><?php esc_html_e('Значение по умолчанию', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][default_value]" value="<?php echo esc_attr((string) ($quiz_step['default_value'] ?? '')); ?>"></td></tr>
                            <tr><th><label><?php esc_html_e('Единица', 'gk-orlink'); ?></label></th><td><input class="regular-text" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][unit]" value="<?php echo esc_attr((string) ($quiz_step['unit'] ?? '')); ?>"></td></tr>
                        <?php else : ?>
                            <tr><th><label><?php esc_html_e('Варианты', 'gk-orlink'); ?></label></th><td><textarea class="large-text code" name="gk_orlink_editor[quiz][steps][<?php echo esc_attr((string) $quiz_step_index); ?>][options_text]" rows="6"><?php echo esc_textarea($quiz_step_options_text); ?></textarea><p class="description"><?php esc_html_e('Для cards: label|image_url|icon. Для chips достаточно label в каждой строке.', 'gk-orlink'); ?></p></td></tr>
                        <?php endif; ?>
                    </table>
                </details>
            <?php endfor; ?>

            <h2><?php esc_html_e('Все гарантии и обязательства фиксируем в договоре', 'gk-orlink'); ?></h2>
            <table class="form-table" role="presentation">
                <tr><th><label for="editor-guarantees-title"><?php esc_html_e('Заголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-guarantees-title" name="gk_orlink_editor[guarantees][title]" value="<?php echo esc_attr((string) $settings['guarantees']['title']); ?>"></td></tr>
                <?php gk_orlink_render_editor_media_field(__('Картинка', 'gk-orlink'), 'gk_orlink_editor[guarantees][image]', (string) $settings['guarantees']['image'], __('Выбрать картинку', 'gk-orlink')); ?>
            </table>

            <h2><?php esc_html_e('Контакты', 'gk-orlink'); ?></h2>
            <table class="form-table" role="presentation">
                <tr><th><label for="editor-contacts-title"><?php esc_html_e('Заголовок', 'gk-orlink'); ?></label></th><td><input class="regular-text" id="editor-contacts-title" name="gk_orlink_editor[contacts][title]" value="<?php echo esc_attr((string) $settings['contacts']['title']); ?>"></td></tr>
                <tr><th><label for="editor-contacts-subtitle"><?php esc_html_e('Подзаголовок', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-contacts-subtitle" name="gk_orlink_editor[contacts][subtitle]" value="<?php echo esc_attr((string) $settings['contacts']['subtitle']); ?>"></td></tr>
                <tr><th><label for="editor-contacts-address"><?php esc_html_e('Адрес производства', 'gk-orlink'); ?></label></th><td><input class="large-text" id="editor-contacts-address" name="gk_orlink_editor[contacts][address]" value="<?php echo esc_attr((string) $settings['contacts']['address']); ?>"></td></tr>
                <tr><th><label for="editor-contacts-phone"><?php esc_html_e('Телефон', 'gk-orlink'); ?></label></th><td><input class="regular-text" id="editor-contacts-phone" name="gk_orlink_editor[contacts][phone]" value="<?php echo esc_attr((string) $settings['contacts']['phone']); ?>"></td></tr>
                <tr><th><label for="editor-contacts-email"><?php esc_html_e('Почта', 'gk-orlink'); ?></label></th><td><input class="regular-text" type="email" id="editor-contacts-email" name="gk_orlink_editor[contacts][email]" value="<?php echo esc_attr((string) $settings['contacts']['email']); ?>"></td></tr>
                <tr><th><label for="editor-contacts-map"><?php esc_html_e('Ифрейм карты', 'gk-orlink'); ?></label></th><td><input class="large-text" type="url" id="editor-contacts-map" name="gk_orlink_editor[contacts][map_iframe]" value="<?php echo esc_attr((string) $settings['contacts']['map_iframe']); ?>"></td></tr>
            </table>

            <?php submit_button(__('Сохранить редактор', 'gk-orlink')); ?>
        </form>
    </div>
    <?php
}

function gk_orlink_application_format_answers(string $raw_answers): string
{
    $raw_answers = trim(wp_unslash($raw_answers));

    if ($raw_answers === '') {
        return '';
    }

    $decoded = json_decode($raw_answers, true);

    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return wp_json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    return sanitize_textarea_field($raw_answers);
}

function gk_orlink_get_application_mail_recipient(): array
{
    if (function_exists('gk_orlink_application_get_recipient_emails')) {
        $recipient_emails = gk_orlink_application_get_recipient_emails();
        if (!empty($recipient_emails)) {
            return $recipient_emails;
        }
    }

    $admin_email = sanitize_email((string) get_option('admin_email'));
    return $admin_email !== '' ? [$admin_email] : [];
}

function gk_orlink_save_application_record(array $data): int
{
    $type = in_array($data['application_form'] ?? '', ['callback', 'quiz'], true) ? $data['application_form'] : 'callback';
    $name = sanitize_text_field($data['name'] ?? '');
    $phone = sanitize_text_field($data['phone'] ?? '');
    $title = sanitize_text_field($data['title'] ?? '');
    $source = sanitize_text_field($data['source'] ?? '');

    if ($title === '') {
        $title = $type === 'quiz' ? __('Заявка с квиза', 'gk-orlink') : __('Заказ обратного звонка', 'gk-orlink');
    }

    $post_id = wp_insert_post([
        'post_type' => 'gk_application',
        'post_status' => 'publish',
        'post_title' => $title . ' — ' . current_time('Y-m-d H:i'),
    ], true);

    if (is_wp_error($post_id)) {
        return 0;
    }

    $meta = [
        '_gk_orlink_application_type' => $type,
        '_gk_orlink_application_name' => $name,
        '_gk_orlink_application_phone' => $phone,
        '_gk_orlink_application_channel' => sanitize_text_field($data['channel'] ?? ''),
        '_gk_orlink_application_source' => $source,
        '_gk_orlink_application_context_image' => esc_url_raw((string) ($data['context_image'] ?? '')),
        '_gk_orlink_application_page_url' => esc_url_raw((string) ($data['page_url'] ?? '')),
        '_gk_orlink_application_page_title' => sanitize_text_field($data['page_title'] ?? ''),
        '_gk_orlink_application_comment' => sanitize_textarea_field((string) ($data['comment'] ?? '')),
        '_gk_orlink_application_answers' => gk_orlink_application_format_answers((string) ($data['quiz_answers'] ?? '')),
        '_gk_orlink_application_payload' => wp_json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ];

    foreach ($meta as $key => $value) {
        update_post_meta($post_id, $key, $value);
    }

    return (int) $post_id;
}

function gk_orlink_send_application_mail(array $data): void
{
    $recipients = gk_orlink_get_application_mail_recipient();
    if (empty($recipients)) {
        return;
    }

    $type = ($data['application_form'] ?? '') === 'quiz' ? __('Квиз', 'gk-orlink') : __('Обратный звонок', 'gk-orlink');
    $name = trim((string) ($data['name'] ?? ''));
    $phone = trim((string) ($data['phone'] ?? ''));
    $channel = trim((string) ($data['channel'] ?? ''));
    $source = trim((string) ($data['source'] ?? ''));
    $contextImage = trim((string) ($data['context_image'] ?? ''));
    $pageUrl = trim((string) ($data['page_url'] ?? ''));
    $pageTitle = trim((string) ($data['page_title'] ?? ''));
    $answers = trim((string) ($data['quiz_answers'] ?? ''));
    $comment = trim((string) ($data['comment'] ?? ''));

    $subject = sprintf(
        '%s: %s',
        __('Новая заявка', 'gk-orlink'),
        $type
    );

    $message_lines = [
        sprintf('%s: %s', __('Тип', 'gk-orlink'), $type),
        sprintf('%s: %s', __('Имя', 'gk-orlink'), $name),
        sprintf('%s: %s', __('Телефон', 'gk-orlink'), $phone),
    ];

    if ($channel !== '') {
        $message_lines[] = sprintf('%s: %s', __('Канал связи', 'gk-orlink'), $channel);
    }

    if ($source !== '') {
        $message_lines[] = sprintf('%s: %s', __('Источник', 'gk-orlink'), $source);
    }

    if ($contextImage !== '') {
        $message_lines[] = sprintf('%s: %s', __('Картинка', 'gk-orlink'), $contextImage);
    }

    if ($pageTitle !== '') {
        $message_lines[] = sprintf('%s: %s', __('Страница', 'gk-orlink'), $pageTitle);
    }

    if ($pageUrl !== '') {
        $message_lines[] = sprintf('%s: %s', __('URL', 'gk-orlink'), $pageUrl);
    }

    if ($comment !== '') {
        $message_lines[] = sprintf('%s: %s', __('Комментарий', 'gk-orlink'), $comment);
    }

    if ($answers !== '') {
        $message_lines[] = '';
        $message_lines[] = __('Ответы квиза:', 'gk-orlink');
        $message_lines[] = $answers;
    }

    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
    ];

    if (function_exists('gk_orlink_application_get_mail_headers')) {
        $plugin_headers = gk_orlink_application_get_mail_headers();
        if (is_array($plugin_headers) && !empty($plugin_headers)) {
            $headers = $plugin_headers;
        }
    }

    wp_mail($recipients, $subject, implode("\n", $message_lines), $headers);
}

function gk_orlink_handle_application_submission(): void
{
    check_ajax_referer('gk_orlink_application', 'nonce');

    $application_form = sanitize_key((string) ($_POST['application_form'] ?? 'callback'));
    $name = sanitize_text_field((string) ($_POST['callback_name'] ?? $_POST['quiz_name'] ?? ''));
    $phone = sanitize_text_field((string) ($_POST['callback_phone'] ?? $_POST['quiz_phone'] ?? ''));
    $channel = sanitize_text_field((string) ($_POST['callback_channel'] ?? ''));
    $comment = sanitize_textarea_field((string) ($_POST['quiz_comment'] ?? ''));
    $quiz_answers = (string) ($_POST['quiz_answers'] ?? '');
    $source = sanitize_text_field((string) ($_POST['application_source'] ?? ''));
    $page_url = esc_url_raw((string) ($_POST['application_page_url'] ?? ''));
    $page_title = sanitize_text_field((string) ($_POST['application_page_title'] ?? ''));
    $title = sanitize_text_field((string) ($_POST['application_title'] ?? ''));
    $context_image = esc_url_raw((string) ($_POST['application_context_image'] ?? ''));

    if ($name === '' || $phone === '') {
        wp_send_json_error([
            'message' => __('Заполните имя и телефон.', 'gk-orlink'),
        ], 400);
    }

    if ($application_form !== 'quiz' && $channel === '') {
        wp_send_json_error([
            'message' => __('Выберите способ связи.', 'gk-orlink'),
        ], 400);
    }

    $record_id = gk_orlink_save_application_record([
        'application_form' => $application_form,
        'name' => $name,
        'phone' => $phone,
        'channel' => $channel,
        'comment' => $comment,
        'quiz_answers' => $quiz_answers,
        'source' => $source,
        'page_url' => $page_url,
        'page_title' => $page_title,
        'title' => $title,
        'context_image' => $context_image,
        'raw' => wp_unslash($_POST),
    ]);

    if (!$record_id) {
        wp_send_json_error([
            'message' => __('Не удалось сохранить заявку.', 'gk-orlink'),
        ], 500);
    }

    gk_orlink_send_application_mail([
        'application_form' => $application_form,
        'name' => $name,
        'phone' => $phone,
        'channel' => $channel,
        'comment' => $comment,
        'quiz_answers' => $quiz_answers,
        'source' => $source,
        'context_image' => $context_image,
        'page_url' => $page_url,
        'page_title' => $page_title,
    ]);

    wp_send_json_success([
        'message' => __('Заявка сохранена.', 'gk-orlink'),
        'postId' => $record_id,
    ]);
}
if (!defined('GK_ORLINK_APPLICATION_PLUGIN_ACTIVE')) {
    add_action('wp_ajax_nopriv_gk_orlink_submit_application', 'gk_orlink_handle_application_submission');
    add_action('wp_ajax_gk_orlink_submit_application', 'gk_orlink_handle_application_submission');
}

function gk_orlink_register_application_admin_columns(array $columns): array
{
    return [
        'cb' => $columns['cb'] ?? '',
        'title' => __('Заявка', 'gk-orlink'),
        'application_form' => __('Тип', 'gk-orlink'),
        'application_name' => __('Имя', 'gk-orlink'),
        'application_phone' => __('Телефон', 'gk-orlink'),
        'application_channel' => __('Канал', 'gk-orlink'),
        'date' => $columns['date'] ?? __('Дата', 'gk-orlink'),
    ];
}
add_filter('manage_gk_application_posts_columns', 'gk_orlink_register_application_admin_columns');

function gk_orlink_render_application_admin_columns(string $column, int $post_id): void
{
    switch ($column) {
        case 'application_form':
            echo esc_html(get_post_meta($post_id, '_gk_orlink_application_type', true) ?: 'callback');
            break;
        case 'application_name':
            echo esc_html(get_post_meta($post_id, '_gk_orlink_application_name', true));
            break;
        case 'application_phone':
            echo esc_html(get_post_meta($post_id, '_gk_orlink_application_phone', true));
            break;
        case 'application_channel':
            echo esc_html(get_post_meta($post_id, '_gk_orlink_application_channel', true));
            break;
    }
}
add_action('manage_gk_application_posts_custom_column', 'gk_orlink_render_application_admin_columns', 10, 2);

function gk_orlink_register_application_metaboxes(): void
{
    add_meta_box(
        'gk_orlink_application_details',
        __('Данные заявки', 'gk-orlink'),
        'gk_orlink_render_application_metabox',
        'gk_application',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes_gk_application', 'gk_orlink_register_application_metaboxes');

function gk_orlink_application_render_meta_value(string $value): string
{
    $value = trim($value);

    if ($value === '') {
        return '—';
    }

    return esc_html($value);
}

function gk_orlink_render_application_metabox(WP_Post $post): void
{
    $fields = [
        __('Тип заявки', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_type', true),
        __('Имя', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_name', true),
        __('Телефон', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_phone', true),
        __('Канал связи', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_channel', true),
        __('Источник', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_source', true),
        __('Страница', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_page_title', true),
        __('URL', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_page_url', true),
        __('Комментарий', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_comment', true),
        __('Картинка карточки', 'gk-orlink') => get_post_meta($post->ID, '_gk_orlink_application_context_image', true),
    ];

    $answers = (string) get_post_meta($post->ID, '_gk_orlink_application_answers', true);
    $payload = (string) get_post_meta($post->ID, '_gk_orlink_application_payload', true);
    ?>
    <style>
        .gk-orlink-application-details {
            border-collapse: collapse;
            width: 100%;
            max-width: 100%;
        }

        .gk-orlink-application-details th,
        .gk-orlink-application-details td {
            border: 1px solid #dcdcde;
            padding: 12px 14px;
            vertical-align: top;
            text-align: left;
        }

        .gk-orlink-application-details th {
            width: 220px;
            background: #f6f7f7;
        }

        .gk-orlink-application-list {
            margin: 0;
            padding-left: 18px;
        }

        .gk-orlink-application-pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
        }
    </style>
    <table class="gk-orlink-application-details">
        <tbody>
            <?php foreach ($fields as $label => $value) : ?>
                <tr>
                    <th scope="row"><?php echo esc_html($label); ?></th>
                    <td>
                        <?php
                        $string_value = is_string($value) ? $value : '';
                        echo $string_value !== '' ? wp_kses_post(nl2br(esc_html($string_value))) : '—';
                        ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            <tr>
                <th scope="row"><?php esc_html_e('Ответы квиза', 'gk-orlink'); ?></th>
                <td>
                    <?php
                    if ($answers === '') {
                        echo '—';
                    } else {
                        $decoded_answers = json_decode($answers, true);

                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded_answers)) {
                            echo '<ul class="gk-orlink-application-list">';

                            foreach ($decoded_answers as $answer) {
                                if (is_array($answer)) {
                                    $question = trim((string) ($answer['question'] ?? ''));
                                    $response = trim((string) ($answer['answer'] ?? $answer['value'] ?? ''));
                                    $label = trim($question . ($response !== '' ? ': ' . $response : ''));
                                    if ($label !== '') {
                                        echo '<li>' . esc_html($label) . '</li>';
                                    }
                                    continue;
                                }

                                $text = trim((string) $answer);
                                if ($text !== '') {
                                    echo '<li>' . esc_html($text) . '</li>';
                                }
                            }

                            echo '</ul>';
                        } else {
                            echo '<pre class="gk-orlink-application-pre">' . esc_html($answers) . '</pre>';
                        }
                    }
                    ?>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php esc_html_e('Полный payload', 'gk-orlink'); ?></th>
                <td>
                    <?php echo $payload !== '' ? '<pre class="gk-orlink-application-pre">' . esc_html($payload) . '</pre>' : '—'; ?>
                </td>
            </tr>
        </tbody>
    </table>
    <?php
}

function gk_orlink_get_privacy_policy_url(): string
{
    if (function_exists('get_privacy_policy_url')) {
        $privacy_policy_url = get_privacy_policy_url();

        if (!empty($privacy_policy_url)) {
            return $privacy_policy_url;
        }
    }

    return home_url('/privacy-policy/');
}

function gk_orlink_is_privacy_policy_request(): bool
{
    if (get_query_var('privacy_policy')) {
        return true;
    }

    $request_uri = isset($_SERVER['REQUEST_URI']) ? wp_unslash((string) $_SERVER['REQUEST_URI']) : '';
    if ($request_uri === '') {
        return false;
    }

    $request_path = wp_parse_url($request_uri, PHP_URL_PATH);

    return is_string($request_path) && rtrim($request_path, '/') === '/privacy-policy';
}

function gk_orlink_register_privacy_policy_query_var(array $vars): array
{
    $vars[] = 'privacy_policy';

    return $vars;
}
add_filter('query_vars', 'gk_orlink_register_privacy_policy_query_var');

function gk_orlink_load_privacy_policy_template(string $template): string
{
    if (gk_orlink_is_privacy_policy_request()) {
        $privacy_template = get_stylesheet_directory() . '/page-privacy-policy.php';

        if (file_exists($privacy_template)) {
            return $privacy_template;
        }
    }

    return $template;
}
add_filter('template_include', 'gk_orlink_load_privacy_policy_template');

function gk_orlink_privacy_policy_document_title(string $title): string
{
    if (!gk_orlink_is_privacy_policy_request()) {
        return $title;
    }

    return __('Политика конфиденциальности', 'gk-orlink') . ' — ' . get_bloginfo('name');
}
add_filter('pre_get_document_title', 'gk_orlink_privacy_policy_document_title');

function gk_orlink_privacy_policy_document_title_fallback(string $title): string
{
    if (!gk_orlink_is_privacy_policy_request()) {
        return $title;
    }

    return __('Политика конфиденциальности', 'gk-orlink') . ' — ' . get_bloginfo('name');
}
add_filter('pre_get_document_title', 'gk_orlink_privacy_policy_document_title_fallback', 20);

function gk_orlink_privacy_policy_body_class(array $classes): array
{
    if (gk_orlink_is_privacy_policy_request()) {
        $classes[] = 'privacy-policy-page-template';
    }

    return $classes;
}
add_filter('body_class', 'gk_orlink_privacy_policy_body_class');

function gk_orlink_svg_icon(string $name): string
{
    $icons = [
        'location' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11Z"></path><circle cx="12" cy="10" r="2.2"></circle></svg>',
        'mail' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m4.5 7.5 7.5 6 7.5-6"></path></svg>',
        'phone' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5h3l1 5-2 1.5c1 2.1 2.9 4 5 5l1.5-2 5 1v3c0 .9-.7 1.5-1.6 1.5C11.3 19.5 4.5 12.7 4.5 5.1c0-.9.7-1.6 1.5-1.6Z"></path></svg>',
        'clock' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
        'marker' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11Z"></path><circle cx="12" cy="10" r="2.2"></circle></svg>',
        'whatsapp' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 1 1-14.2-5 7.8 7.8 0 0 1 10.8-2.3A8 8 0 0 1 20 12Z"></path><path d="M8.8 8.9c.3-.7.6-.8 1-.8h.7c.2 0 .5.1.7.5l1 1.9c.1.2.1.4 0 .6l-.5.6c-.1.1-.2.3-.1.5.2.5.7 1.2 1.6 2 .9.8 1.6 1.2 2.1 1.3.2.1.4 0 .5-.1l.7-.6c.2-.2.4-.2.6-.1l1.9.9c.4.2.5.5.4.8-.2.7-.8 1.4-1.5 1.7-.8.4-1.9.3-3.5-.3-1.6-.6-3.1-1.7-4.6-3.3-1.5-1.6-2.5-3.1-3.1-4.6-.6-1.6-.7-2.7-.3-3.5.3-.7 1-1.3 1.7-1.5.3-.1.6 0 .8.4l.9 1.9c.1.2.1.4-.1.6l-.6.7c-.1.1-.2.3-.1.5.1.5.5 1.2 1.3 2.1.8.9 1.5 1.4 2 1.6.2.1.4 0 .5-.1l.6-.5c.2-.1.4-.1.6 0l1.9 1c.4.2.5.5.5.7v.7c0 .4-.1.7-.8 1"></path></svg>',
        'calculator' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="3.5" width="14" height="17" rx="3"></rect><path d="M8 7.5h8"></path><path d="M8 11.5h2"></path><path d="M12 11.5h2"></path><path d="M16 11.5h0"></path><path d="M8 15.5h2"></path><path d="M12 15.5h2"></path><path d="M16 15.5h0"></path></svg>',
        'check' => '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="#FF5F06"></path></svg>',
        'checklist' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="4" width="14" height="16" rx="3"></rect><path d="M8 8h8"></path><path d="M8 12h8"></path><path d="M8 16h5"></path><path d="m7 8.2.9.9L9.8 7"></path><path d="m7 12.2.9.9L9.8 11"></path></svg>',
        'search' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16.2 16.2 4 4"></path></svg>',
        'calendar' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="5" width="16" height="14" rx="3"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 9h16"></path><path d="m8 13 2 2 4-4"></path></svg>',
        'shield' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 19 6v6c0 4.7-3.1 7.9-7 10-3.9-2.1-7-5.3-7-10V6l7-3Z"></path><path d="m8.5 12 2.1 2.1L15.8 9"></path></svg>',
        'shield-5' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 19 6v6c0 4.7-3.1 7.9-7 10-3.9-2.1-7-5.3-7-10V6l7-3Z"></path><path d="M10.3 9.5h4.1l-.4 2.4h-2.8l-.2 1.8a2.4 2.4 0 0 1 1-.2 2.5 2.5 0 1 1-1.8.7"></path></svg>',
        'headset' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 13a7.5 7.5 0 0 1 15 0"></path><path d="M5.5 13v4a2 2 0 0 0 2 2h1"></path><path d="M18.5 13v4a2 2 0 0 1-2 2h-1"></path><path d="M7.8 18v-4"></path><path d="M16.2 18v-4"></path></svg>',
        'briefcase' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="7" width="16" height="12" rx="2"></rect><path d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"></path><path d="M4 12h16"></path></svg>',
        'helmet' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 14a6 6 0 0 1 12 0"></path><path d="M4 15h16"></path><path d="M7 15v-2a5 5 0 0 1 10 0v2"></path><path d="M10 15v3"></path><path d="M14 15v3"></path></svg>',
        'stopwatch' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="13" r="7"></circle><path d="M9 3h6"></path><path d="M12 6v2"></path><path d="M12 13l3-2"></path></svg>',
        'factory' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20V9l6 3V9l6 3V7l4 2v11H4Z"></path><path d="M7 20v-5h4v5"></path><path d="M16 20v-4h2v4"></path></svg>',
        'play' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5-11-6.5Z"></path></svg>',
        'arrow-left' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 6 9 12l6 6"></path></svg>',
        'arrow-right' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6 15 12l-6 6"></path></svg>',
        'people-building' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20v-2a4 4 0 0 1 4-4h2"></path><circle cx="10" cy="9" r="3"></circle><path d="M14 20v-6a3 3 0 0 1 3-3h3"></path><path d="M16 8.5h5"></path><path d="M18.5 6v5"></path></svg>',
        'warehouse' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 10.5 12 5l9 5.5"></path><path d="M5 9.5V20h14V9.5"></path><path d="M9 20v-6h6v6"></path><path d="M12 5v4"></path></svg>',
        'calculator-outline' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="3.5" width="14" height="17" rx="3"></rect><path d="M8 7.5h8"></path><path d="M8 11.5h2"></path><path d="M12 11.5h2"></path><path d="M8 15.5h2"></path><path d="M12 15.5h2"></path></svg>',
        'check-circle' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12.2 2.5 2.6 4.9-5.3"></path></svg>',
        'stadium' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 16h16"></path><path d="M6 16V9l6-3 6 3v7"></path><path d="M9 16V11h6v5"></path><path d="M6 9h12"></path><path d="M8 8h8"></path></svg>',
        'warehouse-alt' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 10.5 12 5l9 5.5"></path><path d="M5 9.5V20h14V9.5"></path><path d="M8 20v-5h8v5"></path><path d="M12 5v4"></path></svg>',
        'complex' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="8" width="6" height="10" rx="1"></rect><rect x="10" y="5" width="5" height="13" rx="1"></rect><rect x="15" y="10" width="5" height="8" rx="1"></rect><path d="M4 18h16"></path></svg>',
        'cart' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6h2l1.2 8.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 2-1.5L20 9H7"></path><circle cx="10" cy="19" r="1.5"></circle><circle cx="17" cy="19" r="1.5"></circle></svg>',
        'office' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="4" width="14" height="16" rx="2"></rect><path d="M9 20v-5h6v5"></path><path d="M8 8h2"></path><path d="M8 11h2"></path><path d="M8 14h2"></path><path d="M14 8h2"></path><path d="M14 11h2"></path><path d="M14 14h2"></path></svg>',
        'hangar' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 11 12 6l9 5"></path><path d="M5 10v10h14V10"></path><path d="M8 20v-4h8v4"></path><path d="M12 6v4"></path></svg>',
        'grid' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="5" width="5" height="5" rx="1"></rect><rect x="14" y="5" width="5" height="5" rx="1"></rect><rect x="5" y="14" width="5" height="5" rx="1"></rect><rect x="14" y="14" width="5" height="5" rx="1"></rect></svg>',
        'chevron-left' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.5 6 8.5 12l6 6"></path></svg>',
        'chevron-right' => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 6 15.5 12l-6 6"></path></svg>',
    ];

    return $icons[$name] ?? '';
}

function gk_orlink_typograph_text(string $text): string
{
    if ($text === '' || !preg_match('/[А-Яа-яЁё]/u', $text)) {
        return $text;
    }

    $nbsp = "\u{00A0}";
    $pattern = '/(?<!\p{L})(а|в|и|к|с|у|о|но|да|на|по|из|за|от|до|об|под|над|при|про|без|для)\h+(?=\p{L}|\d)/iu';

    return preg_replace_callback(
        $pattern,
        static function (array $matches) use ($nbsp): string {
            return $matches[1] . $nbsp;
        },
        $text
    ) ?? $text;
}

function gk_orlink_typograph_gettext(string $translated, string $text, string $domain): string
{
    if ($domain !== 'gk-orlink' || is_admin()) {
        return $translated;
    }

    return gk_orlink_typograph_text($translated);
}

add_filter('gettext', 'gk_orlink_typograph_gettext', 20, 3);
add_filter('gettext_with_context', static function (string $translated, string $text, string $context, string $domain): string {
    if ($domain !== 'gk-orlink' || is_admin()) {
        return $translated;
    }

    return gk_orlink_typograph_text($translated);
}, 20, 4);




