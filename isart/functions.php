<?php
if (!defined('ABSPATH')) {
    exit;
}

function isart_theme_setup(): void
{
    load_theme_textdomain('isart', get_template_directory() . '/languages');

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);

    register_nav_menus([
        'primary' => __('Primary Menu', 'isart'),
    ]);
}
add_action('after_setup_theme', 'isart_theme_setup');

function isart_theme_asset_uri(string $path = ''): string
{
    return trailingslashit(get_template_directory_uri()) . ltrim($path, '/');
}

require_once get_theme_file_path('admin-editor.php');

function isart_default_editor_settings(): array
{
    return [
        'site' => [
            'title' => 'Исарт — разработка сайтов',
            'favicon' => '',
        ],
        'header' => [
            'phone' => '+7 (968) 756-66-65',
            'email' => 'studio@is-art.ru',
            'address' => '142601, Россия, Московская обл., Орехово-Зуево, ул. Ленина, 86',
            'max_url' => 'https://max.ru/',
            'logo' => isart_theme_asset_uri('img/logo.png'),
        ],
        'hero' => [
            'title_line_1' => 'Разрабатываем',
            'title_line_2' => 'самописные сайты',
            'title_line_3' => 'под задачи бизнеса',
            'lead' => 'Без шаблонов, конструкторов и лишнего кода — проектируем структуру, дизайн и функционал под вашу нишу, продукт и воронку продаж.',
            'list_1' => 'Пишем чистый код под конкретный проект',
            'list_2' => 'Подключаем аналитику, CRM, формы и интеграции',
            'list_3' => 'Передаём готовый сайт с понятной админкой и документацией',
            'list_4' => 'Сайты, которые масштабируются и развиваются',
            'primary_cta' => 'Рассчитать стоимость сайта',
            'secondary_cta' => 'Посмотреть кейсы',
        ],
        'sections' => [
            'quiz' => 'Получите предварительную оценку стоимости сайта',
            'projects' => 'Разрабатываем сайты под разные бизнес-модели и задачи',
            'guarantees' => 'Гарантии и обязательства',
            'process' => 'Как проходит разработка сайта в Исарт',
            'pricing' => 'Стоимость зависит от задачи, логики и объёма разработки',
            'faq' => 'Частые вопросы',
            'contact' => 'Обсудите разработку сайта с Исарт',
            'contact_text' => 'Расскажите о проекте, а мы предложим оптимальную структуру, формат разработки и ориентир по срокам.',
            'footer_cta' => 'Обсудить проект →',
        ],
        'assets' => [
            'guarantees_image' => isart_theme_asset_uri('img/guarantees-left.jpg'),
            'faq_image' => isart_theme_asset_uri('img/faq-right.png'),
            'contact_map_iframe' => 'https://yandex.ru/map-widget/v1/?text=142601%2C%20%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F%2C%20%D0%9C%D0%BE%D1%81%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB.%2C%20%D0%9E%D1%80%D0%B5%D1%85%D0%BE%D0%B2%D0%BE-%D0%97%D1%83%D0%B5%D0%B2%D0%BE%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%2C%2086&z=17&l=map',
        ],
    ];
}

function isart_get_editor_settings(): array
{
    $stored = get_option('isart_editor_settings', []);
    if (!is_array($stored)) {
        $stored = [];
    }

    return array_replace_recursive(isart_default_editor_settings(), $stored);
}

function isart_sanitize_editor_settings(array $data): array
{
    $defaults = isart_default_editor_settings();

    $sanitize_block = static function (array $source, array $reference): array {
        $result = [];
        foreach ($reference as $key => $defaultValue) {
            $value = $source[$key] ?? $defaultValue;
            $result[$key] = is_array($defaultValue)
                ? (is_array($value) ? $value : $defaultValue)
                : sanitize_text_field((string) $value);
        }
        return $result;
    };

    $settings = [
        'site' => [
            'title' => sanitize_text_field((string) ($data['site']['title'] ?? $defaults['site']['title'])),
            'favicon' => esc_url_raw((string) ($data['site']['favicon'] ?? $defaults['site']['favicon'])),
        ],
        'header' => [
            'phone' => sanitize_text_field((string) ($data['header']['phone'] ?? $defaults['header']['phone'])),
            'email' => sanitize_email((string) ($data['header']['email'] ?? $defaults['header']['email'])),
            'address' => sanitize_text_field((string) ($data['header']['address'] ?? $defaults['header']['address'])),
            'max_url' => esc_url_raw((string) ($data['header']['max_url'] ?? $defaults['header']['max_url'])),
            'logo' => esc_url_raw((string) ($data['header']['logo'] ?? $defaults['header']['logo'])),
        ],
        'hero' => $sanitize_block((array) ($data['hero'] ?? []), $defaults['hero']),
        'sections' => $sanitize_block((array) ($data['sections'] ?? []), $defaults['sections']),
        'assets' => [
            'guarantees_image' => esc_url_raw((string) ($data['assets']['guarantees_image'] ?? $defaults['assets']['guarantees_image'])),
            'faq_image' => esc_url_raw((string) ($data['assets']['faq_image'] ?? $defaults['assets']['faq_image'])),
            'contact_map_iframe' => esc_url_raw((string) ($data['assets']['contact_map_iframe'] ?? $defaults['assets']['contact_map_iframe'])),
        ],
    ];

    return $settings;
}

function isart_render_media_field(string $label, string $name, string $value, string $button_label = 'Выбрать файл'): void
{
    ?>
    <div class="isart-media-field">
        <label class="isart-media-field__label"><?php echo esc_html($label); ?></label>
        <div class="isart-media-field__row">
            <input class="regular-text isart-media-field__input" type="url" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>" placeholder="https://...">
            <button class="button isart-media-field__button" type="button"><?php echo esc_html($button_label); ?></button>
        </div>
        <?php if ($value !== '') : ?>
            <div class="isart-media-field__preview">
                <img src="<?php echo esc_url($value); ?>" alt="" />
            </div>
        <?php endif; ?>
    </div>
    <?php
}

function isart_register_assets(): void
{
    $theme_uri = trailingslashit(get_template_directory_uri());
    $theme_dir = get_template_directory();

    wp_enqueue_style(
        'isart-main',
        $theme_uri . 'styles.css',
        [],
        file_exists($theme_dir . '/styles.css') ? (string) filemtime($theme_dir . '/styles.css') : null
    );

    wp_enqueue_script(
        'isart-main',
        $theme_uri . 'script.js',
        [],
        file_exists($theme_dir . '/script.js') ? (string) filemtime($theme_dir . '/script.js') : null,
        true
    );

    wp_add_inline_script('isart-main', 'window.ISART_ASSET_BASE = ' . wp_json_encode($theme_uri) . ';', 'before');
}
add_action('wp_enqueue_scripts', 'isart_register_assets');

function isart_filter_document_title(string $title): string
{
    if (is_admin()) {
        return $title;
    }

    $settings = isart_get_editor_settings();
    $site_title = trim((string) ($settings['site']['title'] ?? ''));
    if ($site_title === '') {
        $site_title = get_bloginfo('name');
    }

    if (is_front_page()) {
        return $site_title;
    }

    return $title !== '' ? $title . ' — ' . $site_title : $site_title;
}
add_filter('pre_get_document_title', 'isart_filter_document_title', 20);

function isart_output_head_meta(): void
{
    if (is_admin()) {
        return;
    }

    $settings = isart_get_editor_settings();
    $favicon = trim((string) ($settings['site']['favicon'] ?? ''));

    if ($favicon !== '') {
        echo '<link rel="icon" href="' . esc_url($favicon) . '">' . "\n";
        echo '<link rel="shortcut icon" href="' . esc_url($favicon) . '">' . "\n";
    }
}
add_action('wp_head', 'isart_output_head_meta', 1);

function isart_register_editor_page(): void
{
    add_menu_page(
        __('Редактор', 'isart'),
        __('Редактор', 'isart'),
        'manage_options',
        'isart-editor',
        'isart_render_editor_page',
        'dashicons-edit-page',
        58
    );
}
add_action('admin_menu', 'isart_register_editor_page');

function isart_render_editor_page(): void
{
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('Недостаточно прав.', 'isart'));
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['isart_editor_nonce'])) {
        check_admin_referer('isart_editor_settings', 'isart_editor_nonce');
        $raw = isset($_POST['isart_editor']) && is_array($_POST['isart_editor']) ? (array) wp_unslash($_POST['isart_editor']) : [];
        update_option('isart_editor_settings', isart_sanitize_editor_settings($raw), false);
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Настройки сохранены.', 'isart') . '</p></div>';
    }

    $settings = isart_get_editor_settings();
    ?>
    <div class="wrap isart-editor-wrap">
        <h1>Редактор сайта</h1>
        <p>Базовые настройки для шапки, главного экрана и основных секций.</p>

        <form method="post">
            <?php wp_nonce_field('isart_editor_settings', 'isart_editor_nonce'); ?>

            <h2>Сайт</h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="isart-site-title">Title</label></th>
                    <td><input class="large-text" id="isart-site-title" name="isart_editor[site][title]" value="<?php echo esc_attr((string) $settings['site']['title']); ?>"></td>
                </tr>
            </table>
            <?php isart_render_media_field('Favicon', 'isart_editor[site][favicon]', (string) $settings['site']['favicon'], 'Выбрать favicon'); ?>

            <h2>Шапка</h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="isart-header-phone">Телефон</label></th>
                    <td><input class="regular-text" id="isart-header-phone" name="isart_editor[header][phone]" value="<?php echo esc_attr((string) $settings['header']['phone']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="isart-header-email">Email</label></th>
                    <td><input class="regular-text" type="email" id="isart-header-email" name="isart_editor[header][email]" value="<?php echo esc_attr((string) $settings['header']['email']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="isart-header-address">Адрес</label></th>
                    <td><input class="large-text" id="isart-header-address" name="isart_editor[header][address]" value="<?php echo esc_attr((string) $settings['header']['address']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="isart-header-max">MAX URL</label></th>
                    <td><input class="large-text" type="url" id="isart-header-max" name="isart_editor[header][max_url]" value="<?php echo esc_attr((string) $settings['header']['max_url']); ?>"></td>
                </tr>
            </table>
            <?php isart_render_media_field('Логотип', 'isart_editor[header][logo]', (string) $settings['header']['logo'], 'Выбрать логотип'); ?>

            <h2>Hero</h2>
            <table class="form-table" role="presentation">
                <tr><th scope="row"><label for="isart-hero-title-1">Заголовок 1</label></th><td><input class="regular-text" id="isart-hero-title-1" name="isart_editor[hero][title_line_1]" value="<?php echo esc_attr((string) $settings['hero']['title_line_1']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-title-2">Заголовок 2</label></th><td><input class="regular-text" id="isart-hero-title-2" name="isart_editor[hero][title_line_2]" value="<?php echo esc_attr((string) $settings['hero']['title_line_2']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-title-3">Заголовок 3</label></th><td><input class="large-text" id="isart-hero-title-3" name="isart_editor[hero][title_line_3]" value="<?php echo esc_attr((string) $settings['hero']['title_line_3']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-lead">Подзаголовок</label></th><td><textarea class="large-text" id="isart-hero-lead" name="isart_editor[hero][lead]" rows="3"><?php echo esc_textarea((string) $settings['hero']['lead']); ?></textarea></td></tr>
                <tr><th scope="row"><label for="isart-hero-list-1">Пункт 1</label></th><td><input class="large-text" id="isart-hero-list-1" name="isart_editor[hero][list_1]" value="<?php echo esc_attr((string) $settings['hero']['list_1']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-list-2">Пункт 2</label></th><td><input class="large-text" id="isart-hero-list-2" name="isart_editor[hero][list_2]" value="<?php echo esc_attr((string) $settings['hero']['list_2']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-list-3">Пункт 3</label></th><td><input class="large-text" id="isart-hero-list-3" name="isart_editor[hero][list_3]" value="<?php echo esc_attr((string) $settings['hero']['list_3']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-list-4">Пункт 4</label></th><td><input class="large-text" id="isart-hero-list-4" name="isart_editor[hero][list_4]" value="<?php echo esc_attr((string) $settings['hero']['list_4']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-primary">Основная кнопка</label></th><td><input class="large-text" id="isart-hero-primary" name="isart_editor[hero][primary_cta]" value="<?php echo esc_attr((string) $settings['hero']['primary_cta']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-hero-secondary">Вторичная кнопка</label></th><td><input class="large-text" id="isart-hero-secondary" name="isart_editor[hero][secondary_cta]" value="<?php echo esc_attr((string) $settings['hero']['secondary_cta']); ?>"></td></tr>
            </table>

            <h2>Секции</h2>
            <table class="form-table" role="presentation">
                <tr><th scope="row"><label for="isart-section-quiz">Квиз</label></th><td><input class="large-text" id="isart-section-quiz" name="isart_editor[sections][quiz]" value="<?php echo esc_attr((string) $settings['sections']['quiz']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-projects">Проекты</label></th><td><input class="large-text" id="isart-section-projects" name="isart_editor[sections][projects]" value="<?php echo esc_attr((string) $settings['sections']['projects']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-guarantees">Гарантии</label></th><td><input class="large-text" id="isart-section-guarantees" name="isart_editor[sections][guarantees]" value="<?php echo esc_attr((string) $settings['sections']['guarantees']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-process">Процесс</label></th><td><input class="large-text" id="isart-section-process" name="isart_editor[sections][process]" value="<?php echo esc_attr((string) $settings['sections']['process']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-pricing">Стоимость</label></th><td><input class="large-text" id="isart-section-pricing" name="isart_editor[sections][pricing]" value="<?php echo esc_attr((string) $settings['sections']['pricing']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-faq">FAQ</label></th><td><input class="large-text" id="isart-section-faq" name="isart_editor[sections][faq]" value="<?php echo esc_attr((string) $settings['sections']['faq']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-contact">Контакты</label></th><td><input class="large-text" id="isart-section-contact" name="isart_editor[sections][contact]" value="<?php echo esc_attr((string) $settings['sections']['contact']); ?>"></td></tr>
                <tr><th scope="row"><label for="isart-section-contact-text">Контактный текст</label></th><td><textarea class="large-text" id="isart-section-contact-text" name="isart_editor[sections][contact_text]" rows="3"><?php echo esc_textarea((string) $settings['sections']['contact_text']); ?></textarea></td></tr>
                <tr><th scope="row"><label for="isart-section-footer-cta">Кнопка в футере</label></th><td><input class="large-text" id="isart-section-footer-cta" name="isart_editor[sections][footer_cta]" value="<?php echo esc_attr((string) $settings['sections']['footer_cta']); ?>"></td></tr>
            </table>

            <h2>Изображения</h2>
            <?php isart_render_media_field('Фон гарантий', 'isart_editor[assets][guarantees_image]', (string) $settings['assets']['guarantees_image'], 'Выбрать фон'); ?>
            <?php isart_render_media_field('Фон FAQ', 'isart_editor[assets][faq_image]', (string) $settings['assets']['faq_image'], 'Выбрать картинку'); ?>
            <?php isart_render_media_field('Карта iframe', 'isart_editor[assets][contact_map_iframe]', (string) $settings['assets']['contact_map_iframe'], 'Вставить URL карты'); ?>

            <?php submit_button(__('Сохранить настройки', 'isart')); ?>
        </form>
    </div>

    <style>
        .isart-media-field { margin: 16px 0 24px; }
        .isart-media-field__label { display: block; font-weight: 600; margin: 0 0 8px; }
        .isart-media-field__row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .isart-media-field__input { width: min(100%, 560px); }
        .isart-media-field__preview { margin-top: 10px; max-width: 240px; }
        .isart-media-field__preview img { display: block; width: 100%; height: auto; border-radius: 10px; }
    </style>

    <script>
    (function() {
        const buttons = document.querySelectorAll('.isart-media-field__button');
        if (!buttons.length || !window.wp || !wp.media) {
            return;
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const field = button.closest('.isart-media-field');
                const input = field?.querySelector('.isart-media-field__input');
                if (!field || !input) {
                    return;
                }

                const frame = wp.media({
                    title: button.textContent || 'Выбрать файл',
                    button: { text: 'Использовать файл' },
                    multiple: false,
                });

                frame.on('select', () => {
                    const attachment = frame.state().get('selection').first().toJSON();
                    if (attachment?.url) {
                        input.value = attachment.url;
                        const preview = field.querySelector('.isart-media-field__preview');
                        if (preview) {
                            preview.innerHTML = '<img src="' + attachment.url + '" alt="">';
                        }
                    }
                });

                frame.open();
            });
        });
    })();
    </script>
    <?php
}

function isart_enqueue_editor_assets(string $hook_suffix): void
{
    if ($hook_suffix !== 'toplevel_page_isart-editor') {
        return;
    }

    wp_enqueue_media();
}
add_action('admin_enqueue_scripts', 'isart_enqueue_editor_assets');

function isart_get_static_body_template(): string
{
    $template_path = get_theme_file_path('index.html');
    if (!file_exists($template_path)) {
        return '';
    }

    $html = (string) file_get_contents($template_path);
    if ($html === '') {
        return '';
    }

    if (preg_match('~<body[^>]*>(.*)</body>~is', $html, $matches) !== 1) {
        return '';
    }

    return trim((string) $matches[1]);
}

function isart_render_theme_body(): void
{
    $html = isart_get_static_body_template();
    if ($html === '') {
        echo '<p>Template not found.</p>';
        return;
    }

    $settings = isart_get_editor_settings();
    $layout = function_exists('isart_get_layout_settings') ? isart_get_layout_settings() : [];
    $asset_base = trailingslashit(get_template_directory_uri());

    $html = str_replace('./img/', $asset_base . 'img/', $html);
    $html = preg_replace('~\s*<script src="script\.js"></script>\s*~', '', $html);
    $html = preg_replace(
        '~<span class="brand__mark brand__mark--logo" aria-hidden="true">.*?</span>~s',
        '<span class="brand__mark brand__mark--logo" aria-hidden="true"><img src="' . esc_url((string) $settings['header']['logo']) . '" alt="" aria-hidden="true"></span>',
        $html
    );
    if (!empty($layout)) {
        $html = preg_replace(
            '~<span class="brand__text">.*?</span>~s',
            '<span class="brand__text">' . esc_html((string) ($layout['header']['descriptor'] ?? '')) . '</span>',
            $html,
            1
        );

        $html = str_replace(
            '<a class="nav__link" href="#services">Битрикс разработка</a>',
            '<a class="nav__link" href="' . esc_url((string) ($layout['header']['menu_1_link'] ?? '#services')) . '">' . esc_html((string) ($layout['header']['menu_1_label'] ?? 'Битрикс разработка')) . '</a>',
            $html
        );
        $html = str_replace(
            '<a class="nav__link" href="#projects">Создание приложений</a>',
            '<a class="nav__link" href="' . esc_url((string) ($layout['header']['menu_2_link'] ?? '#projects')) . '">' . esc_html((string) ($layout['header']['menu_2_label'] ?? 'Создание приложений')) . '</a>',
            $html
        );
        $html = str_replace(
            '<a class="nav__link nav__link--active" href="#process" aria-current="location">Самописные сайты</a>',
            '<a class="nav__link nav__link--active" href="' . esc_url((string) ($layout['header']['menu_3_link'] ?? '#process')) . '" aria-current="location">' . esc_html((string) ($layout['header']['menu_3_label'] ?? 'Самописные сайты')) . '</a>',
            $html
        );

        $html = str_replace('Написать в MAX', (string) ($layout['header']['button_text'] ?? 'Написать в MAX'), $html);
        $html = str_replace('https://max.ru/', esc_url((string) ($layout['header']['button_url'] ?? 'https://max.ru/')), $html);
    }

    $replacements = [
        '+7 (968) 756-66-65' => (string) $settings['header']['phone'],
        'studio@is-art.ru' => (string) $settings['header']['email'],
        '142601, Россия, Московская обл., Орехово-Зуево, ул. Ленина, 86' => (string) $settings['header']['address'],
        'https://max.ru/' => (string) $settings['header']['max_url'],
        'Разрабатываем' => (string) $settings['hero']['title_line_1'],
        'самописные сайты' => (string) $settings['hero']['title_line_2'],
        'под задачи бизнеса' => (string) $settings['hero']['title_line_3'],
        'Без шаблонов, конструкторов и лишнего кода — проектируем структуру, дизайн и функционал под вашу нишу, продукт и воронку продаж.' => (string) $settings['hero']['lead'],
        'Пишем чистый код под конкретный проект' => (string) $settings['hero']['list_1'],
        'Подключаем аналитику, CRM, формы и интеграции' => (string) $settings['hero']['list_2'],
        'Передаём готовый сайт с понятной админкой и документацией' => (string) $settings['hero']['list_3'],
        'Сайты, которые масштабируются и развиваются' => (string) $settings['hero']['list_4'],
        'Рассчитать стоимость сайта' => (string) $settings['hero']['primary_cta'],
        'Посмотреть кейсы' => (string) $settings['hero']['secondary_cta'],
        'Получите предварительную оценку стоимости сайта' => (string) $settings['sections']['quiz'],
        'Разрабатываем сайты под разные бизнес-модели и задачи' => (string) $settings['sections']['projects'],
        'Гарантии и обязательства' => (string) $settings['sections']['guarantees'],
        'Как проходит разработка сайта в Исарт' => (string) $settings['sections']['process'],
        'Стоимость зависит от задачи, логики и объёма разработки' => (string) $settings['sections']['pricing'],
        'Частые вопросы' => (string) $settings['sections']['faq'],
        'Обсудите разработку сайта с Исарт' => (string) $settings['sections']['contact'],
        'Расскажите о проекте, а мы предложим оптимальную структуру, формат разработки и ориентир по срокам.' => (string) $settings['sections']['contact_text'],
        'Обсудить проект →' => (string) $settings['sections']['footer_cta'],
        $asset_base . 'img/logo.png' => (string) $settings['header']['logo'],
        './img/guarantees-left.jpg' => (string) $settings['assets']['guarantees_image'],
        './img/faq-right.png' => (string) $settings['assets']['faq_image'],
        'https://yandex.ru/map-widget/v1/?text=142601%2C%20%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F%2C%20%D0%9C%D0%BE%D1%81%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB.%2C%20%D0%9E%D1%80%D0%B5%D1%85%D0%BE%D0%B2%D0%BE-%D0%97%D1%83%D0%B5%D0%B2%D0%BE%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%2C%2086&z=17&l=map' => (string) $settings['assets']['contact_map_iframe'],
    ];

    $html = strtr($html, $replacements);

    if (!empty($layout)) {
        $brand_index = 0;
        $html = preg_replace_callback(
            '~<span class="brand__text">.*?</span>~s',
            static function () use (&$brand_index, $layout): string {
                $brand_index++;
                $text = $brand_index === 1
                    ? (string) ($layout['header']['descriptor'] ?? '')
                    : (string) ($layout['footer']['descriptor'] ?? '');

                return '<span class="brand__text">' . esc_html($text) . '</span>';
            },
            $html,
            2
        );

        $html = str_replace(
            '<a href="#">Политика конфиденциальности</a>',
            '<a href="' . esc_url((string) ($layout['footer']['privacy_url'] ?? '#')) . '">' . esc_html((string) ($layout['footer']['privacy_text'] ?? 'Политика конфиденциальности')) . '</a>',
            $html
        );
        $html = str_replace(
            '<a href="#">Пользовательское соглашение</a>',
            '<a href="' . esc_url((string) ($layout['footer']['agreement_url'] ?? '#')) . '">' . esc_html((string) ($layout['footer']['agreement_text'] ?? 'Пользовательское соглашение')) . '</a>',
            $html
        );
        $html = str_replace(
            '<a href="#">Реквизиты</a>',
            '<a href="' . esc_url((string) ($layout['footer']['requisites_url'] ?? '#')) . '">' . esc_html((string) ($layout['footer']['requisites_text'] ?? 'Реквизиты')) . '</a>',
            $html
        );
        $mail_index = 0;
        $html = preg_replace_callback(
            '~<a href="mailto:[^"]+">[^<]+</a>~',
            static function (array $matches) use (&$mail_index, $layout): string {
                $mail_index++;
                if ($mail_index !== 2) {
                    return $matches[0];
                }

                $email = (string) ($layout['footer']['email'] ?? 'studio@is-art.ru');

                return '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>';
            },
            $html
        );
        $html = preg_replace(
            '~<a class="button footer__cta-button button--small button--gradient" href="[^"]+">.*?</a>~s',
            '<a class="button footer__cta-button button--small button--gradient" href="' . esc_url((string) ($layout['footer']['cta_url'] ?? '#contact')) . '">' . esc_html((string) ($layout['footer']['cta_text'] ?? 'Обсудить проект →')) . '</a>',
            $html,
            1
        );
    }

    echo $html;
}

function isart_output_body_class(string $class): string
{
    return trim($class . ' isart-theme');
}
add_filter('body_class', static function (array $classes): array {
    $classes[] = 'isart-theme';
    return $classes;
});

function isart_register_fallback_templates(): void
{
    // Placeholder for future custom post types or templates.
}
add_action('init', 'isart_register_fallback_templates');
