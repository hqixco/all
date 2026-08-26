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

    wp_mail($recipients, $subject, implode("\n", $message_lines), [
        'Content-Type: text/plain; charset=UTF-8',
    ]);
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
