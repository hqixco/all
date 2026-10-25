<?php
/**
 * Lead forms and REST handling.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_leads_table_name(): string {
	global $wpdb;
	return $wpdb->prefix . 'stroybrigada_leads';
}

function stroybrigada_install_leads_table(): void {
	global $wpdb;

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';

	$table_name      = stroybrigada_leads_table_name();
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE {$table_name} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		created_at datetime NOT NULL,
		form_id varchar(120) NOT NULL DEFAULT '',
		source_id varchar(191) NOT NULL DEFAULT '',
		service varchar(191) NOT NULL DEFAULT '',
		page_id bigint(20) unsigned NOT NULL DEFAULT 0,
		page_title varchar(255) NOT NULL DEFAULT '',
		page_url text NOT NULL,
		name varchar(191) NOT NULL DEFAULT '',
		phone varchar(80) NOT NULL DEFAULT '',
		email varchar(191) NOT NULL DEFAULT '',
		message longtext NULL,
		quiz_data longtext NULL,
		file_url text NULL,
		utm_data longtext NULL,
		yclid varchar(191) NOT NULL DEFAULT '',
		gclid varchar(191) NOT NULL DEFAULT '',
		consent tinyint(1) NOT NULL DEFAULT 0,
		status varchar(32) NOT NULL DEFAULT 'new',
		email_status varchar(32) NOT NULL DEFAULT 'pending',
		telegram_status varchar(32) NOT NULL DEFAULT 'pending',
		max_status varchar(32) NOT NULL DEFAULT 'pending',
		crm_status varchar(32) NOT NULL DEFAULT 'pending',
		error_log longtext NULL,
		ip_hash varchar(64) NOT NULL DEFAULT '',
		user_agent text NULL,
		PRIMARY KEY  (id),
		KEY status (status),
		KEY form_id (form_id),
		KEY source_id (source_id),
		KEY service (service)
	) {$charset_collate};";

	dbDelta($sql);
}
add_action('after_switch_theme', 'stroybrigada_install_leads_table');

function stroybrigada_maybe_upgrade_leads_table(): void {
	$version = '20260923_max_delivery';
	if ($version === get_option('stroybrigada_leads_table_version')) {
		return;
	}

	stroybrigada_install_leads_table();
	update_option('stroybrigada_leads_table_version', $version, false);
}
add_action('init', 'stroybrigada_maybe_upgrade_leads_table', 5);

function stroybrigada_register_rest_routes(): void {
	register_rest_route(
		'stroybrigada/v1',
		'/lead',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'permission_callback' => '__return_true',
			'callback'            => 'stroybrigada_handle_lead_request',
		]
	);
}
add_action('rest_api_init', 'stroybrigada_register_rest_routes');

function stroybrigada_get_lead_delivery_settings(): array {
	$defaults = [
		'emails'              => (string) stroybrigada_get_option_field('forms_email_to', get_option('admin_email')),
		'from_email'          => '',
		'from_name'           => '',
		'reply_to'            => '',
		'smtp_enabled'        => false,
		'smtp_host'           => '',
		'smtp_port'           => 587,
		'smtp_encryption'     => 'tls',
		'smtp_username'       => '',
		'smtp_password'       => '',
		'telegram_enabled'    => false,
		'telegram_bot_token'  => '',
		'telegram_chat_id'    => '',
		'telegram_parse_mode' => '',
		'max_enabled'         => true,
		'max_bot_token'       => '',
		'max_chat_id'         => '-79313277509822',
	];

	$stored = get_option('stroybrigada_lead_delivery_settings', []);
	if (! is_array($stored)) {
		$stored = [];
	}

	return array_replace_recursive($defaults, $stored);
}

function stroybrigada_sanitize_lead_delivery_settings(array $data): array {
	$defaults = stroybrigada_get_lead_delivery_settings();
	$smtp_port = (int) ($data['smtp_port'] ?? $defaults['smtp_port']);
	if ($smtp_port < 1 || $smtp_port > 65535) {
		$smtp_port = 587;
	}

	$smtp_encryption = (string) ($data['smtp_encryption'] ?? $defaults['smtp_encryption']);
	if (! in_array($smtp_encryption, ['', 'tls', 'ssl'], true)) {
		$smtp_encryption = 'tls';
	}

	$telegram_parse_mode = (string) ($data['telegram_parse_mode'] ?? $defaults['telegram_parse_mode']);
	if (! in_array($telegram_parse_mode, ['', 'HTML', 'MarkdownV2'], true)) {
		$telegram_parse_mode = '';
	}

	return [
		'emails'              => sanitize_textarea_field((string) ($data['emails'] ?? $defaults['emails'])),
		'from_email'          => sanitize_email((string) ($data['from_email'] ?? $defaults['from_email'])),
		'from_name'           => sanitize_text_field((string) ($data['from_name'] ?? $defaults['from_name'])),
		'reply_to'            => sanitize_email((string) ($data['reply_to'] ?? $defaults['reply_to'])),
		'smtp_enabled'        => ! empty($data['smtp_enabled']),
		'smtp_host'           => sanitize_text_field((string) ($data['smtp_host'] ?? $defaults['smtp_host'])),
		'smtp_port'           => $smtp_port,
		'smtp_encryption'     => $smtp_encryption,
		'smtp_username'       => sanitize_text_field((string) ($data['smtp_username'] ?? $defaults['smtp_username'])),
		'smtp_password'       => (string) ($data['smtp_password'] ?? $defaults['smtp_password']),
		'telegram_enabled'    => ! empty($data['telegram_enabled']),
		'telegram_bot_token'  => sanitize_text_field((string) ($data['telegram_bot_token'] ?? $defaults['telegram_bot_token'])),
		'telegram_chat_id'    => sanitize_text_field((string) ($data['telegram_chat_id'] ?? $defaults['telegram_chat_id'])),
		'telegram_parse_mode' => $telegram_parse_mode,
		'max_enabled'         => ! empty($data['max_enabled']),
		'max_bot_token'       => '' !== trim((string) ($data['max_bot_token'] ?? ''))
			? sanitize_text_field((string) $data['max_bot_token'])
			: (string) $defaults['max_bot_token'],
		'max_chat_id'         => preg_match('/^-?\d+$/', trim((string) ($data['max_chat_id'] ?? '')))
			? trim((string) $data['max_chat_id'])
			: '',
	];
}

function stroybrigada_get_lead_email_recipients(): array {
	$settings = stroybrigada_get_lead_delivery_settings();
	$raw = defined('STROYBRIGADA_LEADS_EMAIL') && STROYBRIGADA_LEADS_EMAIL
		? (string) STROYBRIGADA_LEADS_EMAIL
		: (string) ($settings['emails'] ?? '');
	$chunks = '' !== trim($raw) ? preg_split('/[\s,;]+/u', $raw) : [];
	$emails = [];

	if (is_array($chunks)) {
		foreach ($chunks as $chunk) {
			$email = sanitize_email(trim((string) $chunk));
			if ('' !== $email) {
				$emails[] = $email;
			}
		}
	}

	$emails = array_values(array_unique($emails));
	if ($emails) {
		return $emails;
	}

	$fallback_email = sanitize_email((string) stroybrigada_get_option_field('email', ''));
	if ('' !== $fallback_email) {
		return [$fallback_email];
	}

	$admin_email = sanitize_email((string) get_option('admin_email'));
	return '' !== $admin_email ? [$admin_email] : [];
}

function stroybrigada_get_lead_mail_sender_settings(): array {
	$settings = stroybrigada_get_lead_delivery_settings();
	$from_email = sanitize_email((string) ($settings['from_email'] ?? ''));
	$from_name = sanitize_text_field((string) ($settings['from_name'] ?? ''));
	$reply_to = sanitize_email((string) ($settings['reply_to'] ?? ''));

	if ('' === $from_email) {
		$from_email = sanitize_email((string) get_option('admin_email'));
	}

	if ('' === $from_name) {
		$from_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
	}

	return [
		'from_email' => $from_email,
		'from_name'  => $from_name,
		'reply_to'   => $reply_to,
	];
}

function stroybrigada_configure_lead_phpmailer($phpmailer): void {
	$settings = stroybrigada_get_lead_delivery_settings();
	if (empty($settings['smtp_enabled']) || '' === (string) ($settings['smtp_host'] ?? '')) {
		return;
	}

	$phpmailer->isSMTP();
	$phpmailer->Host = (string) $settings['smtp_host'];
	$phpmailer->Port = (int) $settings['smtp_port'];
	$phpmailer->SMTPAuth = '' !== (string) ($settings['smtp_username'] ?? '') || '' !== (string) ($settings['smtp_password'] ?? '');
	$phpmailer->Username = (string) ($settings['smtp_username'] ?? '');
	$phpmailer->Password = (string) ($settings['smtp_password'] ?? '');
	$phpmailer->SMTPSecure = (string) ($settings['smtp_encryption'] ?? 'tls');
}

function stroybrigada_lead_decode_json_field($value): array {
	if (is_array($value)) {
		return $value;
	}

	$decoded = json_decode((string) $value, true);
	return is_array($decoded) ? $decoded : [];
}

function stroybrigada_normalize_lead_json_param($value): array {
	if (is_array($value)) {
		return $value;
	}

	$value = trim((string) wp_unslash($value));
	if ('' === $value) {
		return [];
	}

	$decoded = json_decode($value, true);
	return is_array($decoded) ? $decoded : [];
}

function stroybrigada_format_lead_quiz_lines(array $quiz): array {
	$lines = [];

	foreach ($quiz as $index => $item) {
		if (! is_array($item)) {
			continue;
		}

		$question = trim(wp_strip_all_tags((string) ($item['question'] ?? $item['label'] ?? $item['title'] ?? sprintf('Вопрос %d', ((int) $index) + 1))));
		$answer = $item['answer'] ?? $item['value'] ?? '';
		if (is_array($answer)) {
			$answer = implode(', ', array_filter(array_map('strval', $answer), static fn($value): bool => '' !== trim($value)));
		}

		$answer = trim(wp_strip_all_tags((string) $answer));
		if ('' !== $question && '' !== $answer) {
			$lines[] = $question . ': ' . $answer;
		}
	}

	return $lines;
}

function stroybrigada_format_lead_extra_lines(array $payload): array {
	$lines = [];
	$utm = stroybrigada_lead_decode_json_field($payload['utm_data'] ?? []);
	$quiz = stroybrigada_lead_decode_json_field($payload['quiz_data'] ?? []);

	foreach ($utm as $key => $value) {
		if ('' !== trim((string) $value)) {
			$lines[] = strtoupper((string) $key) . ': ' . (string) $value;
		}
	}

	if ('' !== (string) ($payload['yclid'] ?? '')) {
		$lines[] = 'YCLID: ' . $payload['yclid'];
	}

	if ('' !== (string) ($payload['gclid'] ?? '')) {
		$lines[] = 'GCLID: ' . $payload['gclid'];
	}

	$quiz_lines = stroybrigada_format_lead_quiz_lines($quiz);
	if ($quiz_lines) {
		$lines[] = 'Квиз:';
		foreach ($quiz_lines as $quiz_line) {
			$lines[] = '- ' . $quiz_line;
		}
	} elseif ($quiz) {
		$lines[] = 'Квиз: ' . wp_json_encode($quiz, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	}

	return $lines;
}

function stroybrigada_normalize_uploaded_files(): array {
	$files = [];

	foreach ($_FILES as $file) {
		if (! is_array($file) || empty($file['name'])) {
			continue;
		}

		if (is_array($file['name'])) {
			foreach ($file['name'] as $index => $name) {
				if ('' === (string) $name) {
					continue;
				}

				$files[] = [
					'name'     => $name,
					'type'     => $file['type'][$index] ?? '',
					'tmp_name' => $file['tmp_name'][$index] ?? '',
					'error'    => $file['error'][$index] ?? UPLOAD_ERR_NO_FILE,
					'size'     => $file['size'][$index] ?? 0,
				];
			}
			continue;
		}

		$files[] = $file;
	}

	return $files;
}

function stroybrigada_lead_attachment_paths(array $payload): array {
	$paths = $payload['_attachment_paths'] ?? [];
	if (! is_array($paths)) {
		return [];
	}

	return array_values(
		array_filter(
			array_map('strval', $paths),
			static fn($path): bool => '' !== $path && is_readable($path)
		)
	);
}

function stroybrigada_lead_file_urls(array $payload): array {
	$file_url = (string) ($payload['file_url'] ?? '');
	if ('' === trim($file_url)) {
		return [];
	}

	$urls = preg_split('/\s*,\s*/', $file_url);
	return is_array($urls) ? array_values(array_filter(array_map('esc_url_raw', $urls))) : [];
}

function stroybrigada_is_lead_telegram_enabled(): bool {
	$settings = stroybrigada_get_lead_delivery_settings();

	if (defined('STROYBRIGADA_TELEGRAM_BOT_TOKEN') && STROYBRIGADA_TELEGRAM_BOT_TOKEN && defined('STROYBRIGADA_TELEGRAM_CHAT_ID') && STROYBRIGADA_TELEGRAM_CHAT_ID) {
		return true;
	}

	return ! empty($settings['telegram_enabled']) && '' !== (string) ($settings['telegram_bot_token'] ?? '') && '' !== (string) ($settings['telegram_chat_id'] ?? '');
}

function stroybrigada_normalize_phone(string $phone): string {
	$digits = preg_replace('/\D+/', '', $phone);
	$digits = is_string($digits) ? $digits : '';
	if ('' === $digits) {
		return '';
	}

	if (11 === strlen($digits) && '8' === $digits[0]) {
		$digits = '7' . substr($digits, 1);
	} elseif (10 === strlen($digits)) {
		$digits = '7' . $digits;
	}

	return '+' . $digits;
}

function stroybrigada_is_lead_max_enabled(): bool {
	$settings = stroybrigada_get_lead_delivery_settings();
	$token = defined('STROYBRIGADA_MAX_BOT_TOKEN') && STROYBRIGADA_MAX_BOT_TOKEN
		? (string) STROYBRIGADA_MAX_BOT_TOKEN
		: (string) ($settings['max_bot_token'] ?? '');
	$chat_id = defined('STROYBRIGADA_MAX_CHAT_ID') && STROYBRIGADA_MAX_CHAT_ID
		? (string) STROYBRIGADA_MAX_CHAT_ID
		: (string) ($settings['max_chat_id'] ?? '');

	return '' !== $token && 1 === preg_match('/^-?\d+$/', $chat_id)
		&& (! empty($settings['max_enabled']) || (defined('STROYBRIGADA_MAX_BOT_TOKEN') && defined('STROYBRIGADA_MAX_CHAT_ID')));
}

function stroybrigada_get_client_ip(): string {
	$ip = $_SERVER['REMOTE_ADDR'] ?? '';
	return is_string($ip) ? sanitize_text_field($ip) : '';
}

function stroybrigada_check_rate_limit(string $ip_hash): bool {
	if ('' === $ip_hash) {
		return true;
	}

	$key   = 'stroybrigada_rate_' . $ip_hash;
	$count = (int) get_transient($key);
	if ($count >= 5) {
		return false;
	}

	set_transient($key, $count + 1, 10 * MINUTE_IN_SECONDS);
	return true;
}

function stroybrigada_handle_lead_request(WP_REST_Request $request): WP_REST_Response {
	$nonce = (string) $request->get_header('x_wp_nonce');
	if (! wp_verify_nonce($nonce, 'wp_rest')) {
		return new WP_REST_Response(['success' => false, 'message' => __('Неверный nonce.', 'stroybrigada')], 403);
	}

	$origin  = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
	$referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');
	$home    = home_url();
	if ($origin && 0 !== strpos($origin, $home)) {
		return new WP_REST_Response(['success' => false, 'message' => __('Недопустимый источник запроса.', 'stroybrigada')], 403);
	}
	if (! $origin && $referer && 0 !== strpos($referer, $home)) {
		return new WP_REST_Response(['success' => false, 'message' => __('Недопустимый источник запроса.', 'stroybrigada')], 403);
	}

	$params = $request->get_params();
	if (! empty($params['website'])) {
		return new WP_REST_Response(['success' => false, 'message' => __('Запрос отклонён.', 'stroybrigada')], 400);
	}

	$ip_hash = hash('sha256', stroybrigada_get_client_ip());
	if (! stroybrigada_check_rate_limit($ip_hash)) {
		return new WP_REST_Response(['success' => false, 'message' => __('Слишком много попыток. Повторите позже.', 'stroybrigada')], 429);
	}

	$name    = sanitize_text_field((string) ($params['name'] ?? ''));
	$phone   = stroybrigada_normalize_phone((string) ($params['phone'] ?? ''));
	$email   = sanitize_email((string) ($params['email'] ?? ''));
	$message = wp_kses_post((string) ($params['comment'] ?? $params['message'] ?? ''));

	if ('' === $phone && '' === $email) {
		return new WP_REST_Response(['success' => false, 'message' => __('Укажите телефон или email.', 'stroybrigada')], 422);
	}

	$upload_urls  = [];
	$upload_paths = [];
	if (! empty($_FILES)) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$allowed_mimes = [
			'jpg|jpeg|jpe' => 'image/jpeg',
			'png'          => 'image/png',
			'webp'         => 'image/webp',
			'heic'         => 'image/heic',
			'pdf'          => 'application/pdf',
			'doc'          => 'application/msword',
			'docx'         => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'xls'          => 'application/vnd.ms-excel',
			'xlsx'         => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'zip'          => 'application/zip',
			'rar'          => 'application/vnd.rar|application/x-rar-compressed',
			'txt'          => 'text/plain',
			'dwg'          => 'image/vnd.dwg|application/acad|application/x-acad|application/autocad_dwg|application/dwg|application/x-dwg',
			'dxf'          => 'image/vnd.dxf|application/dxf|application/x-dxf',
		];

		foreach (stroybrigada_normalize_uploaded_files() as $file) {
			if (empty($file['name'])) {
				continue;
			}

			if (! empty($file['error']) && UPLOAD_ERR_OK !== (int) $file['error']) {
				continue;
			}

			if (! empty($file['size']) && (int) $file['size'] > 15 * 1024 * 1024) {
				return new WP_REST_Response(['success' => false, 'message' => __('Файл слишком большой.', 'stroybrigada')], 422);
			}

			$uploaded = wp_handle_upload(
				$file,
				[
					'test_form' => false,
					'mimes'     => $allowed_mimes,
				]
			);

			if (! empty($uploaded['url'])) {
				$upload_urls[] = esc_url_raw((string) $uploaded['url']);
			}

			if (! empty($uploaded['file'])) {
				$upload_paths[] = (string) $uploaded['file'];
			}
		}
	}

	$quiz_data = stroybrigada_normalize_lead_json_param($params['quiz_answers'] ?? []);
	if (! $quiz_data) {
		$quiz_payload = stroybrigada_normalize_lead_json_param($params['quiz_payload'] ?? []);
		$quiz_data = isset($quiz_payload['readable_answers']) && is_array($quiz_payload['readable_answers'])
			? $quiz_payload['readable_answers']
			: $quiz_payload;
	}

	$payload = [
		'created_at'      => current_time('mysql'),
		'form_id'         => sanitize_text_field((string) ($params['form_name'] ?? 'Заявка с сайта')),
		'source_id'       => sanitize_text_field((string) ($params['source_id'] ?? '')),
		'service'         => sanitize_text_field((string) ($params['service'] ?? $params['source_id'] ?? '')),
		'page_id'         => absint($params['page_id'] ?? 0),
		'page_title'      => sanitize_text_field((string) ($params['page_title'] ?? '')),
		'page_url'        => esc_url_raw((string) ($params['page'] ?? $params['page_url'] ?? '')),
		'name'            => $name,
		'phone'           => $phone,
		'email'           => $email,
		'message'         => $message,
		'quiz_data'       => wp_json_encode($quiz_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
		'file_url'        => implode(', ', $upload_urls),
		'utm_data'        => wp_json_encode(
			[
				'utm_source'   => sanitize_text_field((string) ($params['utm_source'] ?? '')),
				'utm_medium'   => sanitize_text_field((string) ($params['utm_medium'] ?? '')),
				'utm_campaign' => sanitize_text_field((string) ($params['utm_campaign'] ?? '')),
				'utm_content'  => sanitize_text_field((string) ($params['utm_content'] ?? '')),
				'utm_term'     => sanitize_text_field((string) ($params['utm_term'] ?? '')),
				'referrer'     => esc_url_raw((string) ($params['referrer'] ?? '')),
			]
		),
		'yclid'           => sanitize_text_field((string) ($params['yclid'] ?? '')),
		'gclid'           => sanitize_text_field((string) ($params['gclid'] ?? '')),
		'consent'         => empty($params['privacy_agreement']) ? 0 : 1,
		'status'          => 'new',
		'email_status'    => 'pending',
		'telegram_status' => 'pending',
		'max_status'      => 'pending',
		'crm_status'      => 'pending',
		'error_log'       => '',
		'ip_hash'         => $ip_hash,
		'user_agent'      => sanitize_text_field((string) ($_SERVER['HTTP_USER_AGENT'] ?? '')),
	];
	$payload['_attachment_paths'] = $upload_paths;

	global $wpdb;
	$insert_payload = $payload;
	unset($insert_payload['_attachment_paths']);

	$wpdb->insert(stroybrigada_leads_table_name(), $insert_payload);
	$lead_id = (int) $wpdb->insert_id;

	$email_sent       = stroybrigada_send_lead_email($payload);
	$telegram_enabled = stroybrigada_is_lead_telegram_enabled();
	$telegram_sent    = $telegram_enabled ? stroybrigada_send_lead_telegram($payload) : false;
	$max_enabled      = stroybrigada_is_lead_max_enabled();
	$max_sent         = $max_enabled ? stroybrigada_send_lead_max($payload) : false;
	$errors           = [];

	if (! $email_sent) {
		$errors[] = 'email';
	}

	if ($telegram_enabled && ! $telegram_sent) {
		$errors[] = 'telegram';
	}
	if ($max_enabled && ! $max_sent) {
		$errors[] = 'max';
	}

	$wpdb->update(
		stroybrigada_leads_table_name(),
		[
			'email_status'    => $email_sent ? 'sent' : 'failed',
			'telegram_status' => $telegram_enabled ? ($telegram_sent ? 'sent' : 'failed') : 'skipped',
			'max_status'      => $max_enabled ? ($max_sent ? 'sent' : 'failed') : 'skipped',
			'status'          => empty($errors) ? 'processed' : 'partial',
			'error_log'       => empty($errors) ? '' : wp_json_encode($errors),
		],
		['id' => $lead_id],
		['%s', '%s', '%s', '%s', '%s'],
		['%d']
	);

	return new WP_REST_Response(
		[
			'success' => true,
			'message' => __('Заявка успешно отправлена.', 'stroybrigada'),
			'leadId'  => $lead_id,
		]
	);
}

function stroybrigada_send_lead_email(array $payload): bool {
	$recipients = stroybrigada_get_lead_email_recipients();
	if (! $recipients) {
		return false;
	}

	$sender = stroybrigada_get_lead_mail_sender_settings();
	$subject = sprintf('[%s] %s', wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES), $payload['form_id']);
	$body_lines = [
		'Новая заявка с сайта',
		'',
		'Форма: ' . $payload['form_id'],
		'Имя: ' . $payload['name'],
		'Телефон: ' . $payload['phone'],
		'Email: ' . $payload['email'],
		'Сообщение: ' . wp_strip_all_tags((string) $payload['message']),
		'Страница: ' . $payload['page_url'],
		'Файл: ' . $payload['file_url'],
		'Согласие: ' . (! empty($payload['consent']) ? 'да' : 'нет'),
		'',
		'Дополнительно:',
	];
	$body_lines = array_merge($body_lines, stroybrigada_format_lead_extra_lines($payload));
	$body_lines[] = '';
	$body_lines[] = 'User-Agent: ' . (string) ($payload['user_agent'] ?? '');
	$body = implode(PHP_EOL, $body_lines);

	$headers = [];
	if ('' !== $sender['from_email']) {
		$headers[] = sprintf('From: %s <%s>', $sender['from_name'], $sender['from_email']);
	}
	if ('' !== $sender['reply_to']) {
		$headers[] = 'Reply-To: ' . $sender['reply_to'];
	}

	$attachments = stroybrigada_lead_attachment_paths($payload);

	add_action('phpmailer_init', 'stroybrigada_configure_lead_phpmailer');
	$sent = wp_mail($recipients, $subject, $body, $headers, $attachments);
	remove_action('phpmailer_init', 'stroybrigada_configure_lead_phpmailer');

	return $sent;
}

function stroybrigada_send_lead_telegram(array $payload): bool {
	$settings = stroybrigada_get_lead_delivery_settings();
	$token = defined('STROYBRIGADA_TELEGRAM_BOT_TOKEN') && STROYBRIGADA_TELEGRAM_BOT_TOKEN
		? (string) STROYBRIGADA_TELEGRAM_BOT_TOKEN
		: (string) ($settings['telegram_bot_token'] ?? '');
	$chat_id = defined('STROYBRIGADA_TELEGRAM_CHAT_ID') && STROYBRIGADA_TELEGRAM_CHAT_ID
		? (string) STROYBRIGADA_TELEGRAM_CHAT_ID
		: (string) ($settings['telegram_chat_id'] ?? '');

	if (! stroybrigada_is_lead_telegram_enabled()) {
		return false;
	}

	if ('' === $token || '' === $chat_id) {
		return false;
	}

	$message_lines = [
		'Новая заявка',
		'Форма: ' . $payload['form_id'],
		'Имя: ' . $payload['name'],
		'Телефон: ' . $payload['phone'],
		'Email: ' . $payload['email'],
		'Сообщение: ' . wp_strip_all_tags((string) $payload['message']),
		'Страница: ' . $payload['page_url'],
		'Файл: ' . $payload['file_url'],
	];
	$message_lines = array_merge($message_lines, stroybrigada_format_lead_extra_lines($payload));
	$message = implode(PHP_EOL, array_filter($message_lines, static fn($line): bool => '' !== trim((string) $line)));

	$body = [
		'chat_id' => $chat_id,
		'text'    => $message,
	];
	if ('' !== (string) ($settings['telegram_parse_mode'] ?? '')) {
		$body['parse_mode'] = (string) $settings['telegram_parse_mode'];
	}

	$response = wp_remote_post(
		'https://api.telegram.org/bot' . rawurlencode($token) . '/sendMessage',
		[
			'timeout' => 15,
			'body'    => $body,
		]
	);

	if (is_wp_error($response) || 200 !== (int) wp_remote_retrieve_response_code($response)) {
		return false;
	}

	foreach (stroybrigada_lead_file_urls($payload) as $file_url) {
		$document_response = wp_remote_post(
			'https://api.telegram.org/bot' . rawurlencode($token) . '/sendDocument',
			[
				'timeout' => 20,
				'body'    => [
					'chat_id'  => $chat_id,
					'document' => $file_url,
					'caption'  => 'Файл к заявке: ' . (string) ($payload['form_id'] ?? ''),
				],
			]
		);

		if (is_wp_error($document_response) || 200 !== (int) wp_remote_retrieve_response_code($document_response)) {
			return false;
		}
	}

	return true;
}

function stroybrigada_send_lead_max(array $payload): bool {
	if (! stroybrigada_is_lead_max_enabled()) {
		return false;
	}

	$settings = stroybrigada_get_lead_delivery_settings();
	$token = defined('STROYBRIGADA_MAX_BOT_TOKEN') && STROYBRIGADA_MAX_BOT_TOKEN
		? (string) STROYBRIGADA_MAX_BOT_TOKEN
		: (string) $settings['max_bot_token'];
	$chat_id = defined('STROYBRIGADA_MAX_CHAT_ID') && STROYBRIGADA_MAX_CHAT_ID
		? (string) STROYBRIGADA_MAX_CHAT_ID
		: (string) $settings['max_chat_id'];

	$message_lines = [
		'Новая заявка с сайта',
		'Форма: ' . (string) ($payload['form_id'] ?? ''),
		'Имя: ' . (string) ($payload['name'] ?? ''),
		'Телефон: ' . (string) ($payload['phone'] ?? ''),
		'Email: ' . (string) ($payload['email'] ?? ''),
		'Сообщение: ' . wp_strip_all_tags((string) ($payload['message'] ?? '')),
		'Страница: ' . (string) ($payload['page_url'] ?? ''),
		'Файл: ' . (string) ($payload['file_url'] ?? ''),
	];
	$message_lines = array_merge($message_lines, stroybrigada_format_lead_extra_lines($payload));
	$message = implode("\n", array_filter($message_lines, static fn($line): bool => '' !== trim((string) $line)));
	$message = wp_html_excerpt($message, 4000, '…');

	$response = wp_remote_post(
		add_query_arg('chat_id', $chat_id, 'https://platform-api2.max.ru/messages'),
		[
			'timeout' => 15,
			'sslcertificates' => __DIR__ . '/certs/russian-trusted-root-ca.crt',
			'headers' => [
				'Authorization' => $token,
				'Content-Type'  => 'application/json',
			],
			'body' => wp_json_encode(['text' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
		]
	);

	if (is_wp_error($response) || 200 !== (int) wp_remote_retrieve_response_code($response)) {
		return false;
	}

	$result = json_decode((string) wp_remote_retrieve_body($response), true);
	return is_array($result) && ! empty($result['message']);
}
