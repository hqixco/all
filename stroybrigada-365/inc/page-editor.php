<?php
/**
 * Imported page content editor.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
	exit;
}

function stroybrigada_page_editor_has_imported_sections(int $post_id): bool {
	$sections = stroybrigada_get_page_sections($post_id);
	return is_array($sections) && ! empty($sections);
}

function stroybrigada_page_editor_use_block_editor(bool $use_block_editor, WP_Post $post): bool {
	if ('page' === $post->post_type && stroybrigada_page_editor_has_imported_sections((int) $post->ID)) {
		return false;
	}

	return $use_block_editor;
}
add_filter('use_block_editor_for_post', 'stroybrigada_page_editor_use_block_editor', 10, 2);

function stroybrigada_page_editor_admin_head(): void {
	$post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if (! $post_id || ! stroybrigada_page_editor_has_imported_sections($post_id)) {
		return;
	}

	?>
	<style>
		#postdivrich,
		#acf-group_stroybrigada_front_page,
		#acf-group_stroybrigada_imported_page {
			display: none !important;
		}
	</style>
	<?php
}
add_action('admin_head-post.php', 'stroybrigada_page_editor_admin_head');

function stroybrigada_page_editor_extract_attr(string $tag, string $attr): string {
	if (preg_match('/\s' . preg_quote($attr, '/') . '\s*=\s*(["\'])(.*?)\1/i', $tag, $match)) {
		return html_entity_decode((string) $match[2], ENT_QUOTES, get_bloginfo('charset'));
	}

	return '';
}

function stroybrigada_page_editor_text_label(string $tag, string $attrs, string $text): string {
	if (preg_match('/\sclass\s*=\s*(["\'])(.*?)\1/i', $attrs, $match)) {
		$class = trim((string) $match[2]);
		if ('' !== $class) {
			return $tag . ' .' . strtok($class, ' ');
		}
	}

	return $tag . ': ' . wp_trim_words($text, 5, '');
}

function stroybrigada_page_editor_text_length(string $text): int {
	return function_exists('mb_strlen') ? mb_strlen($text) : strlen($text);
}

function stroybrigada_page_editor_is_technical_text(string $tag, string $attrs, string $text): bool {
	$technical_patterns = [
		'/\b(hidden|placeholder|soglasie|consent|utm_|modal-form|form-input|form-button|quiz__online|svgicon|icon-)\b/i',
		'/\b(source_id|formData|formDataLink|callback|remodal|tab-control)\b/i',
	];

	foreach ($technical_patterns as $pattern) {
		if (preg_match($pattern, $attrs)) {
			return true;
		}
	}

	$normalized = trim(preg_replace('/\s+/u', ' ', $text) ?? '');
	if ('' === $normalized || preg_match('/^[\W_]+$/u', $normalized)) {
		return true;
	}

	if ('a' === $tag && preg_match('/^(#|Телефон|Whatsapp|MAX)$/u', $normalized)) {
		return true;
	}

	return false;
}

function stroybrigada_page_editor_is_relevant_text(string $tag, string $attrs): bool {
	if (preg_match('/^(h[1-6]|p|button)$/', $tag)) {
		return true;
	}

	if ('a' === $tag) {
		return preg_match('/(btn|button|site-btn)/i', $attrs) === 1;
	}

	return preg_match('/(title|subtitle|text|descr|description|feature__text|card-title|card-text|calc_text|button|pick-item__label|label_img|label_checkbox|section-title)/i', $attrs) === 1;
}

function stroybrigada_page_editor_use_sequential_tokens(string $kind): bool {
	return in_array($kind, ['hero', 'content', 'price', 'faq'], true);
}

function stroybrigada_page_editor_is_editable_sequential_text(string $tag, string $attrs, string $inner, string $text, bool $is_cities_section = false): bool {
	if (stroybrigada_page_editor_is_technical_text($tag, $attrs . ' ' . $inner, $text)) {
		return false;
	}

	if (preg_match('/\b(form|input|select|textarea|hidden|consent|soglasie|wpcf7|utm_|source_id|formData|remodal|modal)\b/i', $attrs . ' ' . $inner)) {
		return false;
	}

	if (! preg_match('/^(h[1-6]|p|button|a|div|span|li|td|th)$/', $tag)) {
		return false;
	}

	if ($is_cities_section && 'a' === $tag) {
		$text_length = stroybrigada_page_editor_text_length($text);
		return $text_length >= 2 && $text_length <= 120;
	}

	if (! preg_match('/^(h[1-6]|p|button|li|td|th)$/', $tag) && ! stroybrigada_page_editor_is_relevant_text($tag, $attrs)) {
		return false;
	}

	if (preg_match('/<(div|section|article|form|ul|ol|li|table|tr|td|th|img|picture|video|iframe|input|textarea|select|script|style|svg|button)\b/i', $inner)) {
		return false;
	}

	$text_length = stroybrigada_page_editor_text_length($text);
	return $text_length >= 2 && $text_length <= 1000;
}

function stroybrigada_page_editor_find_element_html(string $html, string $tag, int $open_offset, string $open_tag): string {
	$open_end = $open_offset + strlen($open_tag);
	$pattern  = '/<\/?' . preg_quote($tag, '/') . '\b[^>]*>/i';
	$depth    = 1;
	$offset   = $open_end;

	while (preg_match($pattern, $html, $match, PREG_OFFSET_CAPTURE, $offset)) {
		$tag_html   = (string) $match[0][0];
		$tag_offset = (int) $match[0][1];
		$offset     = $tag_offset + strlen($tag_html);

		if (str_starts_with($tag_html, '</')) {
			$depth--;
			if (0 === $depth) {
				return substr($html, $open_offset, $offset - $open_offset);
			}
			continue;
		}

		if (! str_ends_with(rtrim($tag_html), '/>')) {
			$depth++;
		}
	}

	return '';
}

function stroybrigada_page_editor_offset_inside_ranges(int $offset, array $ranges): bool {
	foreach ($ranges as $range) {
		if ($offset > (int) $range[0] && $offset < (int) $range[1]) {
			return true;
		}
	}

	return false;
}

function stroybrigada_page_editor_extract_image_token(string $image_tag): array {
	$src_attr = '' !== stroybrigada_page_editor_extract_attr($image_tag, 'data-src') ? 'data-src' : 'src';
	$src      = stroybrigada_page_editor_extract_attr($image_tag, $src_attr);
	if ('' === $src || str_starts_with($src, 'data:image/')) {
		return [];
	}

	if (preg_match('#/(icons|img)/(check|spoiler|controls|double-arrow|loading|ok|next-row|play-icon|quiz-click|quiz-check|file|hand|wat)[^/]*\.(svg|png)$#i', $src)) {
		return [];
	}

	$alt = stroybrigada_page_editor_extract_attr($image_tag, 'alt');
	return [
		'type'     => 'image',
		'label'    => '' !== $alt ? __('Изображение', 'stroybrigada') . ': ' . $alt : __('Изображение', 'stroybrigada'),
		'original' => $image_tag,
		'attr'     => $src_attr,
		'value'    => $src,
	];
}

function stroybrigada_page_editor_is_hero_subtitle_html(string $attrs): bool {
	return preg_match('/\bhero-section__subtitle\b/i', $attrs) === 1;
}

function stroybrigada_page_editor_prepare_inline_html_value(string $inner): string {
	$inner = trim($inner);
	$inner = stroybrigada_page_editor_restore_hero_subtitle_chips($inner);
	$inner = preg_replace('/>\s*</', ">\n<", $inner) ?? $inner;
	$inner = preg_replace('/\n{3,}/', "\n\n", $inner) ?? $inner;

	return trim($inner);
}

function stroybrigada_page_editor_restore_hero_subtitle_chips(string $inner): string {
	if (preg_match('/<span\b/i', $inner)) {
		return $inner;
	}

	$text = trim(wp_strip_all_tags(str_ireplace(['<br>', '<br/>', '<br />'], ' ', $inner)));
	$text = preg_replace('/\s+/u', ' ', $text) ?? $text;
	$chip_sets = [
		['Бетонная', 'Утеплённая', 'Из брусчатки', 'Из щебня'],
	];

	foreach ($chip_sets as $chips) {
		$remaining = $text;
		$matched = [];
		foreach ($chips as $chip) {
			if (! str_starts_with($remaining, $chip)) {
				$matched = [];
				break;
			}

			$matched[] = $chip;
			$remaining = ltrim(substr($remaining, strlen($chip)));
		}

		if (! $matched) {
			continue;
		}

		$html = array_map(
			static fn(string $chip): string => '<span class="hero-section__subtitle-chip">' . esc_html($chip) . '</span>',
			$matched
		);
		$tail = trim($remaining);
		if ('' !== $tail) {
			$html[] = esc_html($tail);
		}

		return implode("\n", $html);
	}

	return $inner;
}

function stroybrigada_page_editor_extract_faq_tokens(string $html): array {
	$tokens = [];
	if (preg_match('/<h2\b[^>]*class=(["\'])(?=[^"\']*\bsection-title\b)[^"\']*\1[^>]*>.*?<\/h2>/is', $html, $title_match)) {
		$title = (string) $title_match[0];
		$tokens[] = [
			'type' => 'text',
			'label' => __('Заголовок FAQ', 'stroybrigada'),
			'original' => $title,
			'tag' => 'h2',
			'value' => trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($title)) ?? ''),
		];
	}

	preg_match_all('/<button\b[^>]*class=(["\'])(?=[^"\']*\baccordion-button\b)[^"\']*\1[^>]*>.*?<\/button>/is', $html, $question_matches);
	preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\baccordion-body\b)[^"\']*\1[^>]*>\s*(<p\b[^>]*>.*?<\/p>)/is', $html, $answer_matches, PREG_SET_ORDER);
	$count = max(count($question_matches[0] ?? []), count($answer_matches));
	for ($index = 0; $index < $count; $index++) {
		if (isset($question_matches[0][$index])) {
			$original = (string) $question_matches[0][$index];
			$tokens[] = [
				'type' => 'faq_question',
				'label' => sprintf(__('Вопрос %d', 'stroybrigada'), $index + 1),
				'original' => $original,
				'tag' => 'button',
				'value' => trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($original)) ?? ''),
			];
		}
		if (isset($answer_matches[$index][2])) {
			$original = (string) $answer_matches[$index][2];
			$tokens[] = [
				'type' => 'text',
				'label' => sprintf(__('Ответ %d', 'stroybrigada'), $index + 1),
				'original' => $original,
				'tag' => 'p',
				'value' => trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($original)) ?? ''),
			];
		}
	}

	return $tokens;
}

function stroybrigada_page_editor_extract_sequential_tokens(string $html, string $kind = ''): array {
	if ('faq' === $kind) {
		return stroybrigada_page_editor_extract_faq_tokens($html);
	}
	$tokens = [];
	$ranges = [];
	$is_cities_section = preg_match('/\bid\s*=\s*(["\'])cities\1/i', $html) === 1 || preg_match('/\bclass\s*=\s*(["\'])(?=[^"\']*\bcity_item\b)[^"\']*\1/i', $html) === 1;

	if (preg_match_all('/<(img|h[1-6]|p|button|a|div|span|li|td|th)\b[^>]*>/i', $html, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
		foreach ($matches as $match) {
			$tag         = strtolower((string) $match[1][0]);
			$open_tag    = (string) $match[0][0];
			$open_offset = (int) $match[0][1];

			if (stroybrigada_page_editor_offset_inside_ranges($open_offset, $ranges)) {
				continue;
			}

			if ('img' === $tag) {
				$token = stroybrigada_page_editor_extract_image_token($open_tag);
				if ($token) {
					$token['offset'] = $open_offset;
					$token['occurrence'] = substr_count(substr($html, 0, $open_offset), $open_tag) + 1;
					$tokens[] = $token;
					$ranges[] = [$open_offset, $open_offset + strlen($open_tag)];
				}
				continue;
			}

			$original = stroybrigada_page_editor_find_element_html($html, $tag, $open_offset, $open_tag);
			if ('' === $original) {
				continue;
			}

			if (! preg_match('/^<' . preg_quote($tag, '/') . '\b([^>]*)>(.*)<\/' . preg_quote($tag, '/') . '>$/is', $original, $parts)) {
				continue;
			}

			$attrs = (string) $parts[1];
			$inner = (string) $parts[2];
			$text  = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags(str_ireplace(['<br>', '<br/>', '<br />'], ' ', $inner))) ?? '');

			if (! stroybrigada_page_editor_is_editable_sequential_text($tag, $attrs, $inner, $text, $is_cities_section)) {
				continue;
			}

			$is_html_text = stroybrigada_page_editor_is_hero_subtitle_html($attrs);
			$label = stroybrigada_page_editor_text_label($tag, $attrs, $text);
			if ($is_cities_section && 'a' === $tag) {
				$label = __('Город', 'stroybrigada') . ': ' . $text;
			} elseif ('faq' === $kind && 'p' === $tag) {
				$label = __('Ответ', 'stroybrigada');
			}

			$tokens[] = [
				'type'     => $is_html_text ? 'html_text' : 'text',
				'label'    => $label . ($is_html_text ? ' (HTML)' : ''),
				'original' => $original,
				'tag'      => $tag,
				'value'    => $is_html_text ? stroybrigada_page_editor_prepare_inline_html_value($inner) : $text,
				'offset'   => $open_offset,
				'occurrence' => substr_count(substr($html, 0, $open_offset), $original) + 1,
				'editor_class' => $is_cities_section && 'a' === $tag ? 'stroybrigada-page-editor__field--city' : '',
			];
			$ranges[] = [$open_offset, $open_offset + strlen($original)];
		}
	}

	// Nested accordion wrappers make the generic matcher skip FAQ answers.
	// Extract each answer paragraph directly from its accordion body.
	if ('faq' === $kind && preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\baccordion-body\b)[^"\']*\1[^>]*>\s*(<p\b[^>]*>.*?<\/p>)/is', $html, $faq_answers, PREG_SET_ORDER)) {
		$known_originals = array_column($tokens, 'original');
		foreach ($faq_answers as $answer_match) {
			$original = (string) $answer_match[2];
			if (in_array($original, $known_originals, true)) {
				continue;
			}

			$value = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($original)) ?? '');
			if ('' === $value) {
				continue;
			}

			$tokens[] = [
				'type'     => 'text',
				'label'    => __('Ответ', 'stroybrigada'),
				'original' => $original,
				'tag'      => 'p',
				'value'    => $value,
			];
			$known_originals[] = $original;
		}
	}
	if ('faq' === $kind && preg_match_all('/<button\b[^>]*class=(["\'])(?=[^"\']*\baccordion-button\b)[^"\']*\1[^>]*>.*?<\/button>/is', $html, $faq_questions)) {
		$known_originals = array_column($tokens, 'original');
		foreach ($faq_questions[0] as $original) {
			$original = (string) $original;
			if (in_array($original, $known_originals, true)) {
				continue;
			}
			$value = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags($original)) ?? '');
			$tokens[] = ['type' => 'faq_question', 'label' => __('Вопрос', 'stroybrigada'), 'original' => $original, 'tag' => 'button', 'value' => $value];
			$known_originals[] = $original;
		}
	}

	if (str_contains(strtolower($html), 'site-section--hero') || str_contains(strtolower($html), 'hero-section')) {
		$hero_background = stroybrigada_page_editor_extract_hero_background_token($html);
		if ($hero_background) {
			$tokens[] = $hero_background;
		}
	}

	return $tokens;
}

function stroybrigada_page_editor_normalize_background_url(string $url): string {
	$url = trim($url, " \t\n\r\0\x0B\"'");
	if (str_starts_with($url, '../uploads/')) {
		return '/assets/uploads/' . ltrim(substr($url, 11), '/');
	}

	if (str_starts_with($url, 'uploads/')) {
		return '/assets/' . ltrim($url, '/');
	}

	return $url;
}

function stroybrigada_page_editor_extract_background_url(string $style): string {
	if (preg_match_all('/url\(\s*(["\']?)(.*?)\1\s*\)/i', $style, $matches) && ! empty($matches[2])) {
		$urls = array_values(array_filter(array_map('strval', $matches[2])));
		if ($urls) {
			return stroybrigada_page_editor_normalize_background_url((string) end($urls));
		}
	}

	return '';
}

function stroybrigada_page_editor_css_hero_background_url(string $class_attr): string {
	$classes = preg_split('/\s+/', trim($class_attr));
	if (! is_array($classes)) {
		return '';
	}

	$css_path = STROYBRIGADA_ASSETS_PATH . 'dist/css/main.css';
	if (! is_readable($css_path)) {
		return '';
	}

	$css = (string) file_get_contents($css_path);
	$hero_classes = array_values(array_filter($classes, static fn($class): bool => str_starts_with((string) $class, 'hero-section--') && 'hero-section--banner' !== (string) $class));
	foreach ($hero_classes as $class) {
		$pattern = '/\.' . preg_quote((string) $class, '/') . '\.(?:banner|hero-section--banner)[^{]*\{[^}]*background-image\s*:\s*(.*?);/is';
		if (preg_match($pattern, $css, $match)) {
			return stroybrigada_page_editor_extract_background_url((string) $match[1]);
		}
	}

	if (preg_match('/\.hero-section\.banner\s*,\s*\.hero-section\.hero-section--banner\s*\{[^}]*background-image\s*:\s*(.*?);/is', $css, $match)) {
		return stroybrigada_page_editor_extract_background_url((string) $match[1]);
	}

	return '';
}

function stroybrigada_page_editor_extract_hero_background_token(string $html): array {
	if (! preg_match('/<div\b(?=[^>]*class=(["\'])(?=[^"\']*\bhero-section\b)[^"\']*\1)[^>]*>/i', $html, $match)) {
		return [];
	}

	$tag = (string) $match[0];
	$style = stroybrigada_page_editor_extract_attr($tag, 'style');
	$value = stroybrigada_page_editor_extract_background_url($style);
	if ('' === $value) {
		$value = stroybrigada_page_editor_css_hero_background_url(stroybrigada_page_editor_extract_attr($tag, 'class'));
	}

	return [
		'type'     => 'background_image',
		'label'    => __('Background hero', 'stroybrigada'),
		'original' => $tag,
		'value'    => $value,
	];
}

function stroybrigada_page_editor_extract_tokens(string $html, string $kind = ''): array {
	$tokens = stroybrigada_page_editor_extract_base_tokens($html, $kind);
	if (! preg_match('/\bservices3\b/', $html)) {
		return $tokens;
	}

	preg_match_all('/<div\b[^>]*>/i', $html, $forms, PREG_OFFSET_CAPTURE);
	foreach ($forms[0] as [$open_tag, $offset]) {
		$classes = preg_split('/\s+/', stroybrigada_page_editor_extract_attr($open_tag, 'class'));
		if (! in_array('small_form', $classes ?: [], true)) {
			continue;
		}
		$form = stroybrigada_page_editor_find_element_html($html, 'div', $offset, $open_tag);
		preg_match_all('/<(a|button)\b([^>]*)>(.*?)<\/\1>/is', $form, $buttons, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);
		foreach ($buttons as $button) {
			$original = (string) $button[0][0];
			$classes = preg_split('/\s+/', stroybrigada_page_editor_extract_attr($original, 'class'));
			if (! in_array('btn', $classes ?: [], true) || ! in_array('btn-st0', $classes ?: [], true)) {
				continue;
			}
			$button_offset = $offset + (int) $button[0][1];
			$tokens = array_values(array_filter($tokens, static function (array $token) use ($original): bool {
				return ! in_array($token['type'] ?? '', ['text', 'html_text'], true) || ! str_contains($original, (string) $token['original']);
			}));
			$tokens[] = [
				'type' => 'service_button',
				'label' => __('Текст кнопки', 'stroybrigada'),
				'original' => $original,
				'value' => trim(html_entity_decode(wp_strip_all_tags((string) $button[3][0]), ENT_QUOTES, get_bloginfo('charset'))),
				'url' => stroybrigada_page_editor_extract_attr($original, 'href'),
				'offset' => $button_offset,
				'occurrence' => substr_count(substr($html, 0, $button_offset), $original) + 1,
			];
		}
	}
	foreach ($tokens as &$token) {
		if (! isset($token['offset'])) {
			$position = strpos($html, (string) $token['original']);
			$token['offset'] = false !== $position ? $position : PHP_INT_MAX;
		}
	}
	unset($token);
	usort($tokens, static fn(array $left, array $right): int => (int) $left['offset'] <=> (int) $right['offset']);
	return $tokens;
}

function stroybrigada_page_editor_replace_service_button(string $original, string $text, string $url): string {
	$replacement = preg_replace_callback('/>(.*?)<\/([a-z0-9]+)>$/is', static fn(array $match): string => '>' . esc_html($text) . '</' . $match[2] . '>', $original, 1) ?? $original;
	if (! preg_match('/^<a\b[^>]*>/i', $replacement, $match)) {
		return $replacement;
	}
	$open_tag = $match[0];
	$href = ' href="' . esc_attr(esc_url_raw($url)) . '"';
	$updated_tag = preg_match('/\shref\s*=\s*(["\']).*?\1/is', $open_tag)
		? preg_replace_callback('/\shref\s*=\s*(["\']).*?\1/is', static fn(): string => $href, $open_tag, 1)
		: substr($open_tag, 0, -1) . $href . '>';
	return (string) $updated_tag . substr($replacement, strlen($open_tag));
}

function stroybrigada_page_editor_extract_base_tokens(string $html, string $kind = ''): array {
	if (stroybrigada_page_editor_use_sequential_tokens($kind)) {
		return stroybrigada_page_editor_extract_sequential_tokens($html, $kind);
	}

	$tokens = [];

	if (preg_match('/data-video-items\s*=\s*(["\'])(.*?)\1/is', $html, $video_match)) {
		$video_json  = html_entity_decode((string) $video_match[2], ENT_QUOTES | ENT_HTML5, 'UTF-8');
		$video_items = json_decode($video_json, true);
		if (is_array($video_items)) {
			$tokens[] = [
				'type'     => 'video_items',
				'label'    => __('Ролики', 'stroybrigada'),
				'original' => (string) $video_match[0],
				'value'    => array_values($video_items),
			];
		}
	}

	if (preg_match_all('/<img\b[^>]*>/i', $html, $image_matches)) {
		foreach ($image_matches[0] as $image_tag) {
			$image_tag = (string) $image_tag;
			$src_attr  = '' !== stroybrigada_page_editor_extract_attr($image_tag, 'data-src') ? 'data-src' : 'src';
			$src       = stroybrigada_page_editor_extract_attr($image_tag, $src_attr);
			if ('' === $src || str_starts_with($src, 'data:image/')) {
				continue;
			}

			if (preg_match('#/(icons|img)/(check|spoiler|controls|double-arrow|loading|ok|next-row|play-icon|quiz-click|quiz-check|file|hand|wat)[^/]*\.(svg|png)$#i', $src)) {
				continue;
			}

			$alt = stroybrigada_page_editor_extract_attr($image_tag, 'alt');
			$tokens[] = [
				'type'     => 'image',
				'label'    => '' !== $alt ? __('Изображение', 'stroybrigada') . ': ' . $alt : __('Изображение', 'stroybrigada'),
				'original' => $image_tag,
				'attr'     => $src_attr,
				'value'    => $src,
			];
		}
	}

	if (preg_match_all('/<(h[1-6])\b([^>]*)>(.*?)<\/\1>/is', $html, $heading_matches, PREG_SET_ORDER)) {
		foreach ($heading_matches as $match) {
			$tag      = strtolower((string) $match[1]);
			$attrs    = (string) $match[2];
			$inner    = (string) $match[3];
			$original = (string) $match[0];
			$text     = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags(str_ireplace(['<br>', '<br/>', '<br />'], ' ', $inner))) ?? '');

			if (stroybrigada_page_editor_is_technical_text($tag, $attrs, $text)) {
				continue;
			}

			$text_length = stroybrigada_page_editor_text_length($text);
			if ($text_length < 2 || $text_length > 700) {
				continue;
			}

			$tokens[] = [
				'type'     => 'text',
				'label'    => stroybrigada_page_editor_text_label($tag, $attrs, $text),
				'original' => $original,
				'tag'      => $tag,
				'value'    => $text,
			];
		}
	}

	if (preg_match_all('/<(p|button|a|div|span)\b([^>]*)>(.*?)<\/\1>/is', $html, $text_matches, PREG_SET_ORDER)) {
		foreach ($text_matches as $match) {
			$tag      = strtolower((string) $match[1]);
			$attrs    = (string) $match[2];
			$inner    = (string) $match[3];
			$original = (string) $match[0];

			if ('h' !== $tag[0] && preg_match('/<(div|section|form|ul|ol|li|script|style|svg|table|img|input|textarea|select)\b/i', $inner)) {
				continue;
			}

			if (! stroybrigada_page_editor_is_relevant_text($tag, $attrs)) {
				continue;
			}

			$text = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags(str_ireplace(['<br>', '<br/>', '<br />'], ' ', $inner))) ?? '');
			if (stroybrigada_page_editor_is_technical_text($tag, $attrs, $text)) {
				continue;
			}

			$text_length = stroybrigada_page_editor_text_length($text);
			if ($text_length < 2 || $text_length > 700) {
				continue;
			}

			if ('a' === $tag && preg_match('#href\s*=\s*(["\'])/[a-z0-9-]+/#i', $attrs)) {
				continue;
			}

			$tokens[] = [
				'type'     => 'text',
				'label'    => stroybrigada_page_editor_text_label($tag, $attrs, $text),
				'original' => $original,
				'tag'      => $tag,
				'value'    => $text,
			];
		}
	}

	if (str_contains(strtolower($html), 'site-section--hero') || str_contains(strtolower($html), 'hero-section')) {
		$hero_background = stroybrigada_page_editor_extract_hero_background_token($html);
		if ($hero_background) {
			$tokens[] = $hero_background;
		}
	}

	return $tokens;
}

function stroybrigada_page_editor_image_preview_url(string $src): string {
	if (str_starts_with($src, '/assets/')) {
		return STROYBRIGADA_ASSETS_URL . 'dist/' . ltrim(substr($src, 8), '/');
	}

	return $src;
}

function stroybrigada_page_editor_section_kind(array $section): string {
	$key   = strtolower((string) ($section['key'] ?? ''));
	$label = strtolower((string) ($section['label'] ?? ''));
	$html  = strtolower((string) ($section['html'] ?? ''));
	$name  = trim($key . ' ' . $label);
	$probe = $name . ' ' . substr($html, 0, 3000);

	if (preg_match('/\b(hero|form__bottom|form_bottom|form-callback__form_h)\b/i', $name) || str_contains($html, 'site-section--hero') || str_contains($html, 'hero-section')) {
		return 'hero';
	}

	if (preg_match('/\b(video|video-section)\b/i', $name) || str_contains($html, 'data-video-grid') || str_contains($html, 'video-section') || str_contains($html, '<video')) {
		return 'video';
	}

	if (preg_match('/\b(quiz|quiz-section|testform)\b/i', $name) || str_contains($html, 'step-slide') || str_contains($html, 'data-quiz')) {
		return 'quiz';
	}

	if (preg_match('/\b(faq|accordion)\b/i', $name) || str_contains($html, 'faq-section') || str_contains($html, 'accordion')) {
		return 'faq';
	}

	if (preg_match('/\b(prices?|price-list|cost)\b/i', $name) || str_contains($html, 'id="price"') || str_contains($html, "id='price'") || str_contains($html, 'prices__') || str_contains($html, 'price-section')) {
		return 'price';
	}

	if (preg_match('/\b(reviews?|testimonials?)\b/i', $name) || preg_match('/\b(class|id)\s*=\s*(["\'])(?=[^"\']*\b(testimonials-section|review-card|reviews-slider)\b)[^"\']*\2/i', $html)) {
		return 'reviews';
	}

	if (preg_match('/\b(cases?|gallery|works|projects?|portfolio)\b/i', $name) || str_contains($html, 'works-section') || str_contains($html, 'data-cases') || str_contains($html, 'data-gallery')) {
		return 'cases';
	}

	return 'content';
}

function stroybrigada_page_editor_kind_title(string $kind): string {
	$titles = [
		'hero'    => __('Hero', 'stroybrigada'),
		'content' => __('Контент', 'stroybrigada'),
		'quiz'    => __('Квиз', 'stroybrigada'),
		'video'   => __('Видео', 'stroybrigada'),
		'cases'   => __('Кейсы и галерея', 'stroybrigada'),
		'reviews' => __('Отзывы', 'stroybrigada'),
		'price'   => __('Цены', 'stroybrigada'),
		'faq'     => __('FAQ', 'stroybrigada'),
	];

	return (string) ($titles[$kind] ?? $kind);
}

function stroybrigada_page_editor_group_sections(array $sections): array {
	$groups = [
		'hero'    => [],
		'content' => [],
		'quiz'    => [],
		'video'   => [],
		'cases'   => [],
		'reviews' => [],
		'faq'     => [],
	];

	foreach ($sections as $section_index => $section) {
		if (! is_array($section)) {
			continue;
		}

		$kind = stroybrigada_page_editor_section_kind($section);
		$groups[$kind][(int) $section_index] = $section;
	}

	return array_filter($groups);
}

function stroybrigada_page_editor_render_token_field(int $section_index, int $token_index, array $token, string $kind, string $field_class = 'stroybrigada-page-editor__field'): void {
	$field_id = 'stroybrigada_page_editor_' . $section_index . '_' . $token_index;
	$label = (string) $token['label'];
	if ('quiz' === $kind && 'text' === ($token['type'] ?? '') && 'h3' === ($token['tag'] ?? '')) {
		$label = __('Вопрос', 'stroybrigada');
	} elseif ('faq' !== $kind && stroybrigada_page_editor_use_sequential_tokens($kind)) {
		$label = sprintf('%02d. %s', $token_index + 1, $label);
	}
	$field_classes = trim($field_class . ' ' . (string) ($token['editor_class'] ?? ''));
	?>
	<div class="<?php echo esc_attr($field_classes); ?>">
		<label for="<?php echo esc_attr($field_id); ?>">
			<?php echo esc_html($label); ?>
		</label>
		<input type="hidden" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][type]" value="<?php echo esc_attr((string) $token['type']); ?>">
		<input type="hidden" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][kind]" value="<?php echo esc_attr($kind); ?>">
		<input type="hidden" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][original]" value="<?php echo esc_attr(base64_encode((string) $token['original'])); ?>">
		<?php if (isset($token['offset'])) : ?>
			<input type="hidden" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][offset]" value="<?php echo esc_attr((string) (int) $token['offset']); ?>">
		<?php endif; ?>
		<?php if (isset($token['occurrence'])) : ?>
			<input type="hidden" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][occurrence]" value="<?php echo esc_attr((string) (int) $token['occurrence']); ?>">
		<?php endif; ?>
		<?php if ('service_button' === $token['type']) : ?>
			<input id="<?php echo esc_attr($field_id); ?>" type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value]" value="<?php echo esc_attr((string) $token['value']); ?>">
			<?php if (preg_match('/^<a\b/i', (string) $token['original'])) : ?>
				<label for="<?php echo esc_attr($field_id . '_url'); ?>"><?php esc_html_e('Ссылка кнопки', 'stroybrigada'); ?></label>
				<input id="<?php echo esc_attr($field_id . '_url'); ?>" type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][url]" value="<?php echo esc_attr((string) $token['url']); ?>" placeholder="#callback">
			<?php endif; ?>
		<?php elseif ('background_image' === $token['type']) : ?>
			<div class="stroybrigada-page-editor__image-row stroybrigada-page-editor__image-row--background">
				<img src="<?php echo esc_url(stroybrigada_page_editor_image_preview_url((string) $token['value'])); ?>" alt="">
				<div>
					<input id="<?php echo esc_attr($field_id); ?>" type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value]" value="<?php echo esc_attr((string) $token['value']); ?>">
					<button type="button" class="button stroybrigada-page-editor__media-button"><?php esc_html_e('Выбрать изображение', 'stroybrigada'); ?></button>
				</div>
			</div>
		<?php elseif ('image' === $token['type']) : ?>
			<input type="hidden" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][attr]" value="<?php echo esc_attr((string) $token['attr']); ?>">
			<div class="stroybrigada-page-editor__image-row<?php echo 'quiz' === $kind ? ' stroybrigada-page-editor__image-row--removable' : ''; ?>">
				<img src="<?php echo esc_url(stroybrigada_page_editor_image_preview_url((string) $token['value'])); ?>" alt="">
				<?php if ('quiz' === $kind) : ?>
					<button type="button" class="stroybrigada-page-editor__image-remove" data-quiz-remove-image aria-label="<?php echo esc_attr__('Удалить изображение', 'stroybrigada'); ?>">×</button>
				<?php endif; ?>
				<div>
					<input id="<?php echo esc_attr($field_id); ?>" type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value]" value="<?php echo esc_attr((string) $token['value']); ?>">
					<button type="button" class="button stroybrigada-page-editor__media-button"><?php esc_html_e('Выбрать изображение', 'stroybrigada'); ?></button>
				</div>
			</div>
		<?php elseif ('video_items' === $token['type']) : ?>
			<?php foreach ((array) $token['value'] as $video_index => $video_item) : ?>
				<div class="stroybrigada-page-editor__video-item">
					<label><?php esc_html_e('Название', 'stroybrigada'); ?><input type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value][<?php echo esc_attr((string) $video_index); ?>][title]" value="<?php echo esc_attr((string) ($video_item['title'] ?? '')); ?>"></label>
					<div class="stroybrigada-page-editor__media-upload stroybrigada-page-editor__media-upload--video">
						<label><?php esc_html_e('Файл видео', 'stroybrigada'); ?><input type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value][<?php echo esc_attr((string) $video_index); ?>][src]" value="<?php echo esc_attr((string) ($video_item['src'] ?? '')); ?>"></label>
						<button type="button" class="button stroybrigada-page-editor__media-upload-button" data-media-kind="video"><?php esc_html_e('Выбрать видео', 'stroybrigada'); ?></button>
					</div>
					<div class="stroybrigada-page-editor__media-upload stroybrigada-page-editor__media-upload--image">
						<img src="<?php echo esc_url(stroybrigada_page_editor_image_preview_url((string) ($video_item['preview'] ?? ''))); ?>" alt="">
						<label><?php esc_html_e('Превью', 'stroybrigada'); ?><input type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value][<?php echo esc_attr((string) $video_index); ?>][preview]" value="<?php echo esc_attr((string) ($video_item['preview'] ?? '')); ?>"></label>
						<button type="button" class="button stroybrigada-page-editor__media-upload-button" data-media-kind="image"><?php esc_html_e('Выбрать изображение', 'stroybrigada'); ?></button>
					</div>
				</div>
			<?php endforeach; ?>
		<?php elseif ('quiz' === $kind && 'text' === ($token['type'] ?? '') && 'h3' === ($token['tag'] ?? '')) : ?>
			<input class="stroybrigada-quiz-editor__question-input" id="<?php echo esc_attr($field_id); ?>" type="text" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value]" value="<?php echo esc_attr((string) $token['value']); ?>">
		<?php else : ?>
			<textarea id="<?php echo esc_attr($field_id); ?>" rows="3" name="stroybrigada_page_editor[<?php echo esc_attr((string) $section_index); ?>][<?php echo esc_attr((string) $token_index); ?>][value]"><?php echo esc_textarea((string) $token['value']); ?></textarea>
		<?php endif; ?>
	</div>
	<?php
}

function stroybrigada_page_editor_extract_quiz_step_blocks(string $html): array {
	if (! preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\bstep-slide\b)[^"\']*\1[^>]*>/i', $html, $matches, PREG_OFFSET_CAPTURE)) {
		return [];
	}

	$starts = array_map(static fn(array $match): int => (int) $match[1], $matches[0]);
	$blocks = [];
	foreach ($starts as $start) {
		if (! preg_match_all('/<\/?div\b[^>]*>/i', substr($html, $start), $div_matches, PREG_OFFSET_CAPTURE)) {
			continue;
		}

		$depth = 0;
		foreach ($div_matches[0] as $div_match) {
			$tag = (string) $div_match[0];
			$offset = $start + (int) $div_match[1];
			if (str_starts_with(strtolower($tag), '</div')) {
				$depth--;
			} else {
				$depth++;
			}

			if (0 === $depth) {
				$blocks[] = substr($html, $start, ($offset + strlen($tag)) - $start);
				break;
			}
		}
	}

	return $blocks;
}

function stroybrigada_page_editor_extract_quiz_option_blocks(string $html): array {
	if (! preg_match_all('/<label\b[^>]*class=(["\'])(?=[^"\']*\bpick-item\b)(?=[^"\']*\bquiz-option\b)[^"\']*\1[^>]*>.*?<\/label>/is', $html, $matches)) {
		return [];
	}

	return array_map('strval', $matches[0]);
}

function stroybrigada_page_editor_quiz_first_option_text(string $html): string {
	if (preg_match('/<div\b[^>]*class=(["\'])(?=[^"\']*\bpick-item__label(?:_img|_checkbox)?\b)[^"\']*\1[^>]*>(.*?)<\/div>/is', $html, $match)) {
		return trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) $match[2])) ?? '');
	}

	$value = stroybrigada_page_editor_extract_attr($html, 'value');
	return '' !== $value ? $value : __('Новый вариант', 'stroybrigada');
}

function stroybrigada_page_editor_quiz_first_option_image(string $html): string {
	if (preg_match('/<img\b[^>]*>/i', $html, $match)) {
		$tag = (string) $match[0];
		$src = stroybrigada_page_editor_extract_attr($tag, 'data-src');
		return '' !== $src ? $src : stroybrigada_page_editor_extract_attr($tag, 'src');
	}

	return '';
}

function stroybrigada_page_editor_quiz_cards(string $html, array $tokens): array {
	$cards = [];
	foreach (stroybrigada_page_editor_extract_quiz_step_blocks($html) as $step_index => $block) {
		$title_token = null;
		$used_tokens = [];
		$block_tokens = [];
		foreach ($tokens as $token_index => $token) {
			$original = (string) ($token['original'] ?? '');
			if ('' === $original || ! str_contains($block, $original)) {
				continue;
			}

			$block_tokens[] = (int) $token_index;
			if ('text' === ($token['type'] ?? '') && 'h3' === ($token['tag'] ?? '') && null === $title_token) {
				$title_token = (int) $token_index;
				$used_tokens[] = (int) $token_index;
			}
		}

		$options = [];
		foreach (stroybrigada_page_editor_extract_quiz_option_blocks($block) as $option_html) {
				$option = ['text' => null, 'image' => null];
				foreach ($tokens as $token_index => $token) {
					$original = (string) ($token['original'] ?? '');
					if ('' === $original || ! str_contains((string) $option_html, $original)) {
						continue;
					}

					if ('image' === ($token['type'] ?? '') && null === $option['image']) {
						$option['image'] = (int) $token_index;
						$used_tokens[] = (int) $token_index;
					}

					if ('text' === ($token['type'] ?? '') && null === $option['text']) {
						$option['text'] = (int) $token_index;
						$used_tokens[] = (int) $token_index;
					}
				}

				$options[] = [
					'text' => $option['text'],
					'image' => $option['image'],
					'original' => (string) $option_html,
					'value' => null !== $option['text'] ? (string) ($tokens[(int) $option['text']]['value'] ?? '') : stroybrigada_page_editor_quiz_first_option_text((string) $option_html),
					'image_value' => null !== $option['image'] ? (string) ($tokens[(int) $option['image']]['value'] ?? '') : stroybrigada_page_editor_quiz_first_option_image((string) $option_html),
				];
		}

		if (null !== $title_token || $options) {
			$cards[] = [
				'index' => (int) $step_index,
				'title_token' => $title_token,
				'options' => $options,
				'original' => (string) $block,
				'title' => null !== $title_token ? (string) ($tokens[(int) $title_token]['value'] ?? '') : __('Новый вопрос', 'stroybrigada'),
				'extra_tokens' => array_values(array_diff(array_unique($block_tokens), array_unique($used_tokens))),
				'used_tokens' => array_values(array_unique(array_merge($used_tokens, $block_tokens))),
			];
		}
	}

	return $cards;
}

function stroybrigada_page_editor_render_quiz_section(int $section_index, array $tokens, string $html): void {
	$cards = stroybrigada_page_editor_quiz_cards($html, $tokens);
	if (! $cards) {
		foreach ($tokens as $token_index => $token) {
			stroybrigada_page_editor_render_token_field($section_index, (int) $token_index, $token, 'quiz');
		}
		return;
	}

	$used = [];
	foreach ($cards as $card) {
		foreach ((array) $card['used_tokens'] as $token_index) {
			$used[(int) $token_index] = true;
		}
	}
	?>
	<div class="stroybrigada-quiz-editor">
		<textarea class="stroybrigada-quiz-editor__payload" name="stroybrigada_quiz_editor[<?php echo esc_attr((string) $section_index); ?>]" hidden></textarea>
		<div class="stroybrigada-quiz-editor__toolbar">
			<div>
				<h3><?php esc_html_e('Квиз на этой странице', 'stroybrigada'); ?></h3>
				<p><?php esc_html_e('Редактируйте вопросы, варианты и картинки. Можно добавлять и удалять шаги и ответы.', 'stroybrigada'); ?></p>
			</div>
			<button type="button" class="button button-primary stroybrigada-quiz-editor__add-step" data-quiz-add-step><?php esc_html_e('Добавить вопрос', 'stroybrigada'); ?></button>
			<div class="stroybrigada-quiz-editor__nav">
				<?php foreach ($cards as $card) : ?>
					<a href="#stroybrigada-quiz-step-<?php echo esc_attr((string) $section_index . '-' . (string) (((int) $card['index']) + 1)); ?>"><?php echo esc_html(sprintf(__('Шаг %d', 'stroybrigada'), ((int) $card['index']) + 1)); ?></a>
				<?php endforeach; ?>
			</div>
		</div>
		<?php foreach ($tokens as $token_index => $token) : ?>
			<?php if (isset($used[(int) $token_index]) || ! in_array((string) ($token['type'] ?? ''), ['text', 'image'], true)) : ?>
				<?php continue; ?>
			<?php endif; ?>
			<?php stroybrigada_page_editor_render_token_field($section_index, (int) $token_index, $token, 'quiz', 'stroybrigada-quiz-editor__global-field'); ?>
		<?php endforeach; ?>
		<div class="stroybrigada-quiz-editor__steps" data-quiz-steps>
			<?php foreach ($cards as $card) : ?>
				<section class="stroybrigada-quiz-editor__step" id="stroybrigada-quiz-step-<?php echo esc_attr((string) $section_index . '-' . (string) (((int) $card['index']) + 1)); ?>" data-quiz-step data-original-step="<?php echo esc_attr(base64_encode((string) $card['original'])); ?>">
					<header class="stroybrigada-quiz-editor__step-header">
						<div>
							<span class="stroybrigada-quiz-editor__badge"><?php echo esc_html(sprintf(__('Шаг %d', 'stroybrigada'), ((int) $card['index']) + 1)); ?></span>
							<h3 data-quiz-step-heading><?php echo esc_html((string) ($card['title'] ?? __('Вопрос', 'stroybrigada'))); ?></h3>
						</div>
						<div class="stroybrigada-quiz-editor__step-actions">
							<div class="stroybrigada-quiz-editor__move-actions" aria-label="<?php echo esc_attr__('Порядок вопроса', 'stroybrigada'); ?>">
								<button type="button" class="button stroybrigada-quiz-editor__move-button" data-quiz-move-step="up"><?php esc_html_e('Вверх', 'stroybrigada'); ?></button>
								<button type="button" class="button stroybrigada-quiz-editor__move-button" data-quiz-move-step="down"><?php esc_html_e('Вниз', 'stroybrigada'); ?></button>
							</div>
							<span class="stroybrigada-quiz-editor__flag" data-quiz-option-count><?php echo esc_html(sprintf(_n('%d вариант', '%d вариантов', count((array) $card['options']), 'stroybrigada'), count((array) $card['options']))); ?></span>
							<button type="button" class="button stroybrigada-quiz-editor__remove-step" data-quiz-remove-step><?php esc_html_e('Удалить вопрос', 'stroybrigada'); ?></button>
						</div>
					</header>
					<div class="stroybrigada-quiz-editor__step-body">
						<div class="stroybrigada-quiz-editor__question">
							<?php if (null !== $card['title_token']) : ?>
								<?php stroybrigada_page_editor_render_token_field($section_index, (int) $card['title_token'], $tokens[(int) $card['title_token']], 'quiz', 'stroybrigada-quiz-editor__field'); ?>
							<?php endif; ?>
							<?php foreach ((array) ($card['extra_tokens'] ?? []) as $extra_token_index) : ?>
								<?php stroybrigada_page_editor_render_token_field($section_index, (int) $extra_token_index, $tokens[(int) $extra_token_index], 'quiz', 'stroybrigada-quiz-editor__field'); ?>
							<?php endforeach; ?>
						</div>
						<div class="stroybrigada-quiz-editor__options" data-quiz-options>
							<?php foreach ((array) $card['options'] as $option_index => $option) : ?>
								<div class="stroybrigada-quiz-editor__option" data-quiz-option data-original-option="<?php echo esc_attr(base64_encode((string) ($option['original'] ?? ''))); ?>">
									<div class="stroybrigada-quiz-editor__option-header">
										<span class="stroybrigada-quiz-editor__option-badge"><?php echo esc_html(sprintf(__('Вариант %d', 'stroybrigada'), ((int) $option_index) + 1)); ?></span>
										<div class="stroybrigada-quiz-editor__move-actions">
											<button type="button" class="button button-small stroybrigada-quiz-editor__move-button" data-quiz-move-option="up"><?php esc_html_e('Вверх', 'stroybrigada'); ?></button>
											<button type="button" class="button button-small stroybrigada-quiz-editor__move-button" data-quiz-move-option="down"><?php esc_html_e('Вниз', 'stroybrigada'); ?></button>
										</div>
									</div>
									<button type="button" class="stroybrigada-quiz-editor__remove-option" data-quiz-remove-option aria-label="<?php echo esc_attr__('Удалить вариант', 'stroybrigada'); ?>">×</button>
									<?php if (null !== $option['text']) : ?>
										<?php stroybrigada_page_editor_render_token_field($section_index, (int) $option['text'], $tokens[(int) $option['text']], 'quiz', 'stroybrigada-quiz-editor__field'); ?>
									<?php else : ?>
										<label class="stroybrigada-quiz-editor__field">
											<span><?php esc_html_e('Вариант ответа', 'stroybrigada'); ?></span>
											<textarea data-quiz-option-text rows="3"><?php echo esc_textarea((string) ($option['value'] ?? '')); ?></textarea>
										</label>
									<?php endif; ?>
									<?php if (null !== $option['image']) : ?>
										<?php stroybrigada_page_editor_render_token_field($section_index, (int) $option['image'], $tokens[(int) $option['image']], 'quiz', 'stroybrigada-quiz-editor__field'); ?>
									<?php else : ?>
										<?php $option_image_value = (string) ($option['image_value'] ?? ''); ?>
										<div class="stroybrigada-quiz-editor__field stroybrigada-page-editor__image-row stroybrigada-page-editor__image-row--removable<?php echo '' === $option_image_value ? ' stroybrigada-page-editor__image-row--empty' : ''; ?>">
											<img src="<?php echo esc_url('' !== $option_image_value ? stroybrigada_page_editor_image_preview_url($option_image_value) : 'data:image/gif;base64,R0lGODlhAQABAID/AP///wAAACwAAAAAAQABAAACAkQBADs='); ?>" alt="">
											<button type="button" class="stroybrigada-page-editor__image-remove" data-quiz-remove-image aria-label="<?php echo esc_attr__('Удалить изображение', 'stroybrigada'); ?>">×</button>
											<div>
												<label><?php esc_html_e('Изображение', 'stroybrigada'); ?></label>
												<input type="text" data-quiz-option-image value="<?php echo esc_attr($option_image_value); ?>">
												<button type="button" class="button stroybrigada-page-editor__media-button"><?php echo esc_html('' === $option_image_value ? __('Добавить изображение', 'stroybrigada') : __('Выбрать изображение', 'stroybrigada')); ?></button>
											</div>
										</div>
									<?php endif; ?>
								</div>
							<?php endforeach; ?>
							<button type="button" class="stroybrigada-quiz-editor__option stroybrigada-quiz-editor__option--add" data-quiz-add-option>
								<span class="stroybrigada-quiz-editor__add-plus">+</span>
								<span><?php esc_html_e('Добавить вариант', 'stroybrigada'); ?></span>
							</button>
						</div>
					</div>
				</section>
			<?php endforeach; ?>
		</div>
	</div>
	<?php
}

function stroybrigada_page_editor_extract_city_blocks(string $html): array {
	if (! preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\bcity_item\b)[^"\']*\1[^>]*>.*?<\/div>/is', $html, $matches)) {
		return [];
	}

	return array_values(array_map('strval', $matches[0]));
}

function stroybrigada_page_editor_city_cards(string $html): array {
	$cards = [];
	foreach (stroybrigada_page_editor_extract_city_blocks($html) as $block) {
		if (! preg_match('/<(a|span)\b([^>]*)>(.*?)<\/\1>/is', $block, $match)) {
			continue;
		}

		$text = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) $match[3])) ?? '');
		if ('' === $text) {
			continue;
		}

		$cards[] = [
			'original' => $block,
			'href'     => 'a' === strtolower((string) $match[1]) ? stroybrigada_page_editor_extract_attr((string) $match[0], 'href') : '',
			'text'     => $text,
		];
	}

	return $cards;
}

function stroybrigada_page_editor_city_suffix(array $cards): string {
	$href = (string) ($cards[0]['href'] ?? '');
	if (! preg_match('#^/[^/]+(/.+)$#', $href, $match)) {
		return '/';
	}

	return (string) $match[1];
}

function stroybrigada_page_editor_render_cities_section(int $section_index, array $tokens, string $html): void {
	$cards = stroybrigada_page_editor_city_cards($html);
	foreach ($tokens as $token_index => $token) {
		if ('stroybrigada-page-editor__field--city' === (string) ($token['editor_class'] ?? '')) {
			continue;
		}

		stroybrigada_page_editor_render_token_field($section_index, (int) $token_index, $token, 'content');
	}

	if (! $cards) {
		return;
	}
	?>
	<textarea class="stroybrigada-page-editor__cities-payload" name="stroybrigada_cities_editor[<?php echo esc_attr((string) $section_index); ?>]" hidden></textarea>
	<div class="stroybrigada-page-editor__cities-grid" data-cities-editor data-city-suffix="<?php echo esc_attr(stroybrigada_page_editor_city_suffix($cards)); ?>">
		<?php foreach ($cards as $card) : ?>
			<div class="stroybrigada-page-editor__city-card" data-city-card data-original-city="<?php echo esc_attr(base64_encode((string) $card['original'])); ?>" data-city-href="<?php echo esc_attr((string) $card['href']); ?>">
				<button type="button" class="stroybrigada-page-editor__city-remove" data-city-remove aria-label="<?php echo esc_attr__('Удалить город', 'stroybrigada'); ?>">×</button>
				<label>
					<span><?php esc_html_e('Город', 'stroybrigada'); ?></span>
					<textarea rows="2" data-city-name><?php echo esc_textarea((string) $card['text']); ?></textarea>
				</label>
			</div>
		<?php endforeach; ?>
		<button type="button" class="stroybrigada-page-editor__city-card stroybrigada-page-editor__city-card--add" data-city-add>
			<span class="stroybrigada-quiz-editor__add-plus">+</span>
			<span><?php esc_html_e('Добавить город', 'stroybrigada'); ?></span>
		</button>
	</div>
	<?php
}

function stroybrigada_page_editor_extract_service_blocks(string $html): array {
	$blocks = [];
	if (! preg_match_all('/<div\b[^>]*class=(["\'])(?=[^"\']*\bcol-(?:sm|md|lg|xl)-)[^"\']*\1[^>]*>/i', $html, $matches, PREG_OFFSET_CAPTURE)) {
		return [];
	}

	foreach ($matches[0] as $match) {
		$block = stroybrigada_page_editor_find_element_html($html, 'div', (int) $match[1], (string) $match[0]);
		if ('' !== $block && str_contains($block, 'services__item_link')) {
			$blocks[] = $block;
		}
	}

	return array_values(array_unique($blocks));
}

function stroybrigada_page_editor_service_cards(string $html): array {
	$cards = [];
	foreach (stroybrigada_page_editor_extract_service_blocks($html) as $block) {
		if (! preg_match('/<a\b[^>]*class=(["\'])(?=[^"\']*\bservices__item_link\b)[^"\']*\1[^>]*>/i', $block, $link_match)) {
			continue;
		}

		preg_match('/<img\b[^>]*>/i', $block, $image_match);
		preg_match('/<[^>]+class=(["\'])(?=[^"\']*\bservices__title\b)[^"\']*\1[^>]*>(.*?)<\/[^>]+>/is', $block, $title_match);
		preg_match('/<[^>]+class=(["\'])(?=[^"\']*\bservices__desc\b)[^"\']*\1[^>]*>(.*?)<\/[^>]+>/is', $block, $description_match);

		$image_tag = (string) ($image_match[0] ?? '');
		$image = stroybrigada_page_editor_extract_attr($image_tag, 'data-src');
		if ('' === $image) {
			$image = stroybrigada_page_editor_extract_attr($image_tag, 'src');
		}

		$cards[] = [
			'original'    => $block,
			'url'         => stroybrigada_page_editor_extract_attr((string) $link_match[0], 'href'),
			'image'       => $image,
			'title'       => trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) ($title_match[2] ?? ''))) ?? ''),
			'description' => trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) ($description_match[2] ?? ''))) ?? ''),
		];
	}

	return $cards;
}

function stroybrigada_page_editor_render_services_section(int $section_index, array $tokens, string $html): void {
	$cards = stroybrigada_get_menu_service_cards();
	$stored_cards = stroybrigada_page_editor_service_cards($html);
	foreach ($tokens as $token_index => $token) {
		$original = (string) ($token['original'] ?? '');
		$is_card_token = false;
		foreach ($stored_cards as $card) {
			if ('' !== $original && str_contains((string) $card['original'], $original)) {
				$is_card_token = true;
				break;
			}
		}
		if ($is_card_token) {
			continue;
		}
		stroybrigada_page_editor_render_token_field($section_index, (int) $token_index, $token, 'services');
	}
	?>
	<div class="stroybrigada-page-editor__readonly">
		<p class="stroybrigada-page-editor__readonly-note">
			<?php esc_html_e('Карточки формируются автоматически из подменю «Услуги». Название и ссылка берутся из меню, описание и изображение — из первого экрана соответствующей страницы услуги.', 'stroybrigada'); ?>
			<a href="<?php echo esc_url(admin_url('admin.php?page=stroybrigada-header-footer')); ?>"><?php esc_html_e('Изменить список услуг', 'stroybrigada'); ?></a>
		</p>
		<div class="stroybrigada-page-editor__services-grid">
		<?php foreach ($cards as $card) : ?>
			<div class="stroybrigada-page-editor__service-card">
				<div class="stroybrigada-page-editor__service-image">
					<img src="<?php echo esc_url(stroybrigada_page_editor_image_preview_url((string) $card['image'])); ?>" alt="">
					<div><strong><?php echo esc_html((string) $card['title']); ?></strong><p><?php echo esc_html((string) $card['description']); ?></p></div>
				</div>
				<a href="<?php echo esc_url((string) $card['url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html((string) $card['url']); ?></a>
			</div>
		<?php endforeach; ?>
		<?php if (! $cards) : ?><p><?php esc_html_e('В подменю «Услуги» пока нет пунктов.', 'stroybrigada'); ?></p><?php endif; ?>
		</div>
	</div>
	<?php
}

function stroybrigada_page_editor_content_article_data(string $html): array {
	if (! preg_match('/<div\b[^>]*class=(["\'])(?=[^"\']*\bcontent-block-text\b)[^"\']*\1[^>]*>/i', $html, $match, PREG_OFFSET_CAPTURE)) {
		return [];
	}

	$wrapper = stroybrigada_page_editor_find_element_html($html, 'div', (int) $match[0][1], (string) $match[0][0]);
	if ('' === $wrapper || ! preg_match('/<h2\b[^>]*>(.*?)<\/h2>/is', $wrapper, $heading_match)) {
		return [];
	}

	$body = preg_replace('/^<div\b[^>]*>|<\/div>$/is', '', $wrapper) ?? $wrapper;
	$body = trim(str_replace((string) $heading_match[0], '', $body));

	return [
		'heading' => trim(wp_strip_all_tags((string) $heading_match[1])),
		'body'    => $body,
	];
}

function stroybrigada_page_editor_render_content_article(int $section_index, string $html): void {
	$data = stroybrigada_page_editor_content_article_data($html);
	if (! $data) {
		foreach (stroybrigada_page_editor_extract_tokens($html, 'content') as $token_index => $token) {
			stroybrigada_page_editor_render_token_field($section_index, (int) $token_index, $token, 'content');
		}
		return;
	}
	?>
	<div class="stroybrigada-page-editor__field">
		<label><?php esc_html_e('H2', 'stroybrigada'); ?></label>
		<input type="text" name="stroybrigada_content_editor[<?php echo esc_attr((string) $section_index); ?>][heading]" value="<?php echo esc_attr((string) $data['heading']); ?>">
	</div>
	<div class="stroybrigada-page-editor__field">
		<label><?php esc_html_e('Статья', 'stroybrigada'); ?></label>
		<?php
		wp_editor(
			(string) $data['body'],
			'stroybrigada_content_article_' . $section_index,
			[
				'textarea_name' => 'stroybrigada_content_editor[' . $section_index . '][body]',
				'textarea_rows' => 18,
				'media_buttons' => false,
				'tinymce'       => [
					'toolbar1' => 'formatselect,bold,italic,bullist,numlist,blockquote,alignleft,aligncenter,alignright,link,unlink,undo,redo',
					'block_formats' => 'Абзац=p;Заголовок 2=h2;Заголовок 3=h3;Заголовок 4=h4',
				],
				'quicktags'      => true,
			]
		);
		?>
		<p class="description"><?php esc_html_e('Доступны заголовки, абзацы, ссылки и маркированные или нумерованные списки.', 'stroybrigada'); ?></p>
	</div>
	<?php
}

function stroybrigada_page_editor_render_cases_section(int $post_id): void {
	$cases = function_exists('stroybrigada_case_posts_for_page') ? stroybrigada_case_posts_for_page($post_id) : [];
	$cases_url = function_exists('stroybrigada_cases_admin_url') ? stroybrigada_cases_admin_url(0, $post_id) : admin_url('admin.php?page=stroybrigada-cases&case_page=' . $post_id);
	?>
	<div class="stroybrigada-page-editor__readonly stroybrigada-page-editor__readonly--cases">
		<p class="stroybrigada-page-editor__readonly-note">
			<?php esc_html_e('Кейсы для этой страницы редактируются в отдельном разделе админки. Здесь показан только список карточек, которые подтягиваются в блок кейсов.', 'stroybrigada'); ?>
		</p>
		<p>
			<a class="button button-primary" href="<?php echo esc_url($cases_url); ?>"><?php esc_html_e('Открыть раздел Кейсы', 'stroybrigada'); ?></a>
		</p>
		<?php if ($cases) : ?>
			<ul class="stroybrigada-page-editor__managed-list">
				<?php foreach ($cases as $case) : ?>
					<?php if (! $case instanceof WP_Post) : ?>
						<?php continue; ?>
					<?php endif; ?>
					<li>
						<strong><?php echo esc_html(get_the_title($case)); ?></strong>
						<a href="<?php echo esc_url(function_exists('stroybrigada_cases_admin_url') ? stroybrigada_cases_admin_url((int) $case->ID) : admin_url('admin.php?page=stroybrigada-cases#case-' . (int) $case->ID)); ?>"><?php esc_html_e('Редактировать', 'stroybrigada'); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<p class="description"><?php esc_html_e('Для этой страницы пока не назначено ни одного кейса. Добавьте кейс или отметьте эту страницу в существующей карточке кейса.', 'stroybrigada'); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

function stroybrigada_page_editor_render_videos_section(int $post_id, int $section_index, string $html): void {
	$videos = function_exists('stroybrigada_video_posts_for_page') ? stroybrigada_video_posts_for_page($post_id) : [];
	$videos_url = function_exists('stroybrigada_videos_admin_url') ? stroybrigada_videos_admin_url(0, $post_id) : admin_url('admin.php?page=stroybrigada-videos&video_page=' . $post_id);
	$tokens = [];
	$has_description = false;
	foreach (stroybrigada_page_editor_extract_tokens($html, 'video') as $token) {
		if ('text' !== ($token['type'] ?? '')) {
			continue;
		}

		if (preg_match('/^h[1-6]$/', (string) ($token['tag'] ?? ''))) {
			$token['label'] = __('Заголовок блока', 'stroybrigada');
			$tokens[] = $token;
			continue;
		}

		if (! $has_description && preg_match('/\b(title|subtitle|descr|description)\b/i', (string) ($token['original'] ?? ''))) {
			$token['label'] = __('Описание под заголовком', 'stroybrigada');
			$tokens[] = $token;
			$has_description = true;
		}
	}
	if (
		! $has_description
		&& preg_match(
			'/<div\b([^>]*class=(["\'])(?=[^"\']*\btitle\b)[^"\']*\2[^>]*)>(?!\s*<(?:div|section|form|ul|ol|table)\b)(.*?)<\/div>/is',
			$html,
			$description_match
		)
	) {
		$description = trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) $description_match[3])) ?? '');
		if ('' !== $description) {
			$tokens[] = [
				'type'     => 'text',
				'label'    => __('Описание под заголовком', 'stroybrigada'),
				'original' => (string) $description_match[0],
				'tag'      => 'div',
				'value'    => $description,
			];
		}
	}
	?>
	<div class="stroybrigada-page-editor__readonly stroybrigada-page-editor__readonly--videos">
		<?php foreach ($tokens as $token_index => $token) : ?>
			<?php stroybrigada_page_editor_render_token_field($section_index, (int) $token_index, $token, 'video'); ?>
		<?php endforeach; ?>
		<p class="stroybrigada-page-editor__readonly-note">
			<?php esc_html_e('Видео для этой страницы редактируются в отдельном разделе админки. Здесь показан только список роликов, которые подтягиваются в блок видео.', 'stroybrigada'); ?>
		</p>
		<p>
			<a class="button button-primary" href="<?php echo esc_url($videos_url); ?>"><?php esc_html_e('Открыть раздел Видео', 'stroybrigada'); ?></a>
		</p>
		<?php if ($videos) : ?>
			<ul class="stroybrigada-page-editor__managed-list">
				<?php foreach ($videos as $video) : ?>
					<?php if (! $video instanceof WP_Post) : ?>
						<?php continue; ?>
					<?php endif; ?>
					<li>
						<strong><?php echo esc_html(get_the_title($video)); ?></strong>
						<a href="<?php echo esc_url(function_exists('stroybrigada_videos_admin_url') ? stroybrigada_videos_admin_url((int) $video->ID, $post_id) : admin_url('admin.php?page=stroybrigada-videos&video_page=' . $post_id . '#video-' . (int) $video->ID)); ?>"><?php esc_html_e('Редактировать', 'stroybrigada'); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<p class="description"><?php esc_html_e('Для этой страницы пока не назначено ни одного видео. Добавьте видео или отметьте эту страницу в существующей карточке видео.', 'stroybrigada'); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

function stroybrigada_page_editor_render_reviews_section(int $post_id): void {
	$reviews = function_exists('stroybrigada_review_posts_for_page') ? stroybrigada_review_posts_for_page($post_id) : [];
	$reviews_url = function_exists('stroybrigada_reviews_admin_url') ? stroybrigada_reviews_admin_url(0, $post_id) : admin_url('admin.php?page=stroybrigada-reviews&review_page=' . $post_id);
	?>
	<div class="stroybrigada-page-editor__readonly stroybrigada-page-editor__readonly--reviews">
		<p class="stroybrigada-page-editor__readonly-note">
			<?php esc_html_e('Отзывы для этой страницы редактируются в отдельном разделе админки. Здесь показан только список отзывов, которые подтягиваются в блок отзывов.', 'stroybrigada'); ?>
		</p>
		<p>
			<a class="button button-primary" href="<?php echo esc_url($reviews_url); ?>"><?php esc_html_e('Открыть раздел Отзывы', 'stroybrigada'); ?></a>
		</p>
		<?php if ($reviews) : ?>
			<ul class="stroybrigada-page-editor__managed-list">
				<?php foreach ($reviews as $review) : ?>
					<?php if (! $review instanceof WP_Post) : ?>
						<?php continue; ?>
					<?php endif; ?>
					<li>
						<strong><?php echo esc_html(get_the_title($review)); ?></strong>
						<a href="<?php echo esc_url(function_exists('stroybrigada_reviews_admin_url') ? stroybrigada_reviews_admin_url((int) $review->ID, $post_id) : admin_url('admin.php?page=stroybrigada-reviews&review_page=' . $post_id . '#review-' . (int) $review->ID)); ?>"><?php esc_html_e('Редактировать', 'stroybrigada'); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<p class="description"><?php esc_html_e('Для этой страницы пока не назначено ни одного отзыва. Добавьте отзыв или отметьте эту страницу в существующей карточке отзыва.', 'stroybrigada'); ?></p>
		<?php endif; ?>
	</div>
	<?php
}

function stroybrigada_page_editor_add_meta_box(): void {
	$screen = get_current_screen();
	$post_type = $screen instanceof WP_Screen && in_array($screen->post_type, ['page', 'service'], true) ? $screen->post_type : 'page';
	add_meta_box(
		'stroybrigada-page-content-editor',
		__('Редактор контента страницы', 'stroybrigada'),
		'stroybrigada_page_editor_render_meta_box',
		$post_type,
		'normal',
		'high'
	);
}
add_action('add_meta_boxes_page', 'stroybrigada_page_editor_add_meta_box');
add_action('add_meta_boxes_service', 'stroybrigada_page_editor_add_meta_box');

function stroybrigada_page_editor_render_meta_box(WP_Post $post): void {
	$sections = stroybrigada_get_page_sections((int) $post->ID);
	if (! is_array($sections) || empty($sections)) {
		echo '<p>' . esc_html__('У этой страницы нет импортированных секций.', 'stroybrigada') . '</p>';
		return;
	}

	wp_nonce_field('stroybrigada_page_editor_save', 'stroybrigada_page_editor_nonce');
	?>
	<style>
		.stroybrigada-page-editor__section { border: 1px solid #dcdcde; margin: 0 0 16px; background: #fff; }
		.stroybrigada-page-editor__section > summary { cursor: pointer; padding: 12px 14px; font-weight: 600; background: #f6f7f7; }
		.stroybrigada-page-editor__summary-title { display: inline-flex; flex-wrap: wrap; gap: 8px; align-items: center; }
		.stroybrigada-page-editor__summary-index,
		.stroybrigada-page-editor__summary-kind { display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px; border-radius: 999px; font-size: 12px; line-height: 1; font-weight: 700; }
		.stroybrigada-page-editor__summary-index { background: #1d2327; color: #fff; }
		.stroybrigada-page-editor__summary-kind { background: #e2e8f0; color: #0f172a; }
		.stroybrigada-page-editor__body { padding: 14px; }
		.stroybrigada-page-editor__field { margin: 0 0 14px; }
		.stroybrigada-page-editor__field label { display: block; margin: 0 0 5px; font-weight: 600; }
		.stroybrigada-page-editor__field textarea,
		.stroybrigada-page-editor__field input[type="text"] { width: 100%; }
		.stroybrigada-page-editor__cities-grid { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 12px; align-items: start; }
		.stroybrigada-page-editor__cities-grid .stroybrigada-page-editor__field { margin: 0; }
		.stroybrigada-page-editor__cities-grid .stroybrigada-page-editor__field label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.stroybrigada-page-editor__city-card { position: relative; display: grid; min-height: 108px; padding: 12px; border: 1px solid #dcdcde; border-radius: 12px; background: #fff; box-sizing: border-box; }
		.stroybrigada-page-editor__city-card label { display: grid; gap: 6px; margin: 0; font-weight: 600; }
		.stroybrigada-page-editor__city-card textarea { width: 100%; min-height: 58px; padding: 8px 30px 8px 8px; resize: vertical; box-sizing: border-box; }
		.stroybrigada-page-editor__city-remove { position: absolute; top: 8px; right: 8px; z-index: 2; width: 24px; height: 24px; border: 0; border-radius: 999px; background: #ef4444; color: #fff; font-size: 16px; line-height: 1; font-weight: 700; cursor: pointer; }
		.stroybrigada-page-editor__city-remove:hover { background: #dc2626; }
		.stroybrigada-page-editor__city-card--add { align-items: center; justify-items: center; gap: 8px; border-style: dashed; border-color: rgba(148, 163, 184, .75); background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(241,245,249,.95)); cursor: pointer; color: #0f172a; font-weight: 700; }
		.stroybrigada-page-editor__services-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
		.stroybrigada-page-editor__service-card { position: relative; display: grid; gap: 12px; min-width: 0; padding: 16px; border: 1px solid #dcdcde; border-radius: 16px; background: #fff; box-sizing: border-box; box-shadow: 0 6px 20px rgba(15, 23, 42, .04); }
		.stroybrigada-page-editor__service-card label { display: grid; gap: 5px; font-weight: 600; }
		.stroybrigada-page-editor__service-card input[type="text"],
		.stroybrigada-page-editor__service-card textarea { width: 100%; box-sizing: border-box; }
		.stroybrigada-page-editor__service-image { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 8px 12px; align-items: start; }
		.stroybrigada-page-editor__service-image img { grid-row: 1 / 3; width: 88px; height: 88px; object-fit: cover; border: 1px solid #dcdcde; border-radius: 12px; background: #f6f7f7; }
		.stroybrigada-page-editor__service-image .button { justify-self: start; }
		.stroybrigada-page-editor__service-remove { position: absolute; top: 8px; right: 8px; z-index: 2; width: 28px; height: 28px; padding: 0; border: 0; border-radius: 999px; background: #ef4444; color: #fff; font-size: 18px; line-height: 1; font-weight: 700; cursor: pointer; box-shadow: 0 1px 4px rgba(15, 23, 42, .2); }
		.stroybrigada-page-editor__service-remove:hover { background: #dc2626; }
		.stroybrigada-page-editor__service-card--add { min-height: 280px; align-items: center; align-content: center; justify-items: center; border-style: dashed; border-color: rgba(148, 163, 184, .75); background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(241,245,249,.95)); cursor: pointer; color: #0f172a; font-weight: 700; }
		.stroybrigada-page-editor__image-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 12px; align-items: start; }
		.stroybrigada-page-editor__image-row img { max-width: 120px; height: auto; border: 1px solid #dcdcde; background: #f6f7f7; }
		.stroybrigada-page-editor__image-row--removable { position: relative; }
		.stroybrigada-page-editor__image-remove { position: absolute; top: -7px; left: 81px; z-index: 2; display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 999px; background: #ef4444; color: #fff; font-size: 17px; line-height: 1; font-weight: 700; cursor: pointer; box-shadow: 0 1px 4px rgba(15, 23, 42, .25); }
		.stroybrigada-page-editor__image-remove:hover { background: #dc2626; color: #fff; }
		.stroybrigada-page-editor__image-row--empty img,
		.stroybrigada-page-editor__image-row--empty .stroybrigada-page-editor__image-remove { visibility: hidden; }
		.stroybrigada-page-editor__video-item { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; margin: 0 0 14px; padding: 14px; border: 1px solid #dcdcde; background: #fff; }
		.stroybrigada-page-editor__video-item label:first-child { grid-column: 1 / -1; }
		.stroybrigada-page-editor__media-upload { display: grid; gap: 8px; align-content: start; }
		.stroybrigada-page-editor__media-upload label { display: grid; gap: 5px; margin: 0; }
		.stroybrigada-page-editor__media-upload input[type="text"] { width: 100%; }
		.stroybrigada-page-editor__media-upload img { width: 120px; height: 80px; object-fit: cover; border: 1px solid #dcdcde; border-radius: 8px; background: #f6f7f7; }
		.stroybrigada-page-editor__media-upload-button { justify-self: start; }
		.stroybrigada-page-editor__readonly { padding: 16px; border: 1px solid #dcdcde; border-radius: 12px; background: #fff; }
		.stroybrigada-page-editor__readonly-note { margin-top: 0; font-size: 14px; }
		.stroybrigada-page-editor__managed-list { display: grid; gap: 8px; margin: 14px 0 0; }
		.stroybrigada-page-editor__managed-list li { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 0; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
		.stroybrigada-page-editor__managed-list a { margin-left: auto; }
		.stroybrigada-quiz-editor { display: grid; gap: 18px; }
		.stroybrigada-quiz-editor__toolbar { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; padding: 18px 20px; border: 1px solid #dcdcde; border-radius: 18px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); }
		.stroybrigada-quiz-editor__toolbar h3 { margin: 0; font-size: 18px; line-height: 1.25; }
		.stroybrigada-quiz-editor__toolbar p { margin: 6px 0 0; color: #475569; }
		.stroybrigada-quiz-editor__add-step { flex: 0 0 auto; }
		.stroybrigada-quiz-editor__nav { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
		.stroybrigada-quiz-editor__nav a { display: inline-flex; align-items: center; min-height: 32px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; color: #0f172a; text-decoration: none; font-weight: 600; }
		.stroybrigada-quiz-editor__global-field { padding: 16px; border: 1px solid #dcdcde; border-radius: 16px; background: #fff; }
		.stroybrigada-quiz-editor__steps { display: grid; gap: 18px; }
		.stroybrigada-quiz-editor__step { overflow: hidden; border: 1px solid #dcdcde; border-radius: 20px; background: #fff; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06); scroll-margin-top: 80px; }
		.stroybrigada-quiz-editor__step-header { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 18px 20px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); }
		.stroybrigada-quiz-editor__step-header h3 { margin: 8px 0 0; font-size: 20px; line-height: 1.25; }
		.stroybrigada-quiz-editor__badge { display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 999px; background: #0f172a; color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; }
		.stroybrigada-quiz-editor__flag { display: inline-flex; align-items: center; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; color: #334155; font-size: 12px; font-weight: 700; white-space: nowrap; }
		.stroybrigada-quiz-editor__step-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; align-items: center; }
		.stroybrigada-quiz-editor__move-actions { display: inline-flex; flex-wrap: wrap; gap: 6px; align-items: center; }
		.stroybrigada-quiz-editor__move-button[disabled] { opacity: .45; cursor: not-allowed; }
		.stroybrigada-quiz-editor__remove-step { color: #b91c1c !important; border-color: rgba(185, 28, 28, .28) !important; }
		.stroybrigada-quiz-editor__step-body { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); }
		.stroybrigada-quiz-editor__question,
		.stroybrigada-quiz-editor__options { padding: 20px; min-width: 0; }
		.stroybrigada-quiz-editor__options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; border-left: 1px solid #e2e8f0; background: linear-gradient(180deg, #f8fafc 0%, #fff 100%); }
		.stroybrigada-quiz-editor__option { position: relative; display: grid; gap: 12px; min-width: 0; padding: 14px 52px 14px 14px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04); }
		.stroybrigada-quiz-editor__option--add { min-height: 150px; align-items: center; justify-items: center; border-style: dashed; border-color: rgba(148, 163, 184, .75); background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(241,245,249,.95)); cursor: pointer; color: #0f172a; font-weight: 700; }
		.stroybrigada-quiz-editor__add-plus { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 999px; background: rgba(15, 23, 42, .08); font-size: 28px; line-height: 1; }
		.stroybrigada-quiz-editor__remove-option { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border: 0; border-radius: 999px; background: #ef4444; color: #fff; font-size: 18px; line-height: 1; font-weight: 700; cursor: pointer; }
		.stroybrigada-quiz-editor__remove-option:hover { background: #dc2626; }
		.stroybrigada-quiz-editor__option-header { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; min-width: 0; }
		.stroybrigada-quiz-editor__option-header .stroybrigada-quiz-editor__move-actions { justify-content: flex-end; max-width: 150px; }
		.stroybrigada-quiz-editor__option-badge { display: inline-flex; justify-self: start; padding: 5px 10px; border-radius: 999px; background: #e2e8f0; color: #0f172a; font-size: 12px; font-weight: 700; }
		.stroybrigada-quiz-editor__field { margin: 0; min-width: 0; }
		.stroybrigada-quiz-editor__field + .stroybrigada-quiz-editor__field { margin-top: 12px; }
		.stroybrigada-quiz-editor__field label,
		.stroybrigada-quiz-editor__global-field label { display: block; margin: 0 0 7px; color: #334155; font-size: 13px; font-weight: 700; }
		.stroybrigada-quiz-editor__field input[type="text"],
		.stroybrigada-quiz-editor__field textarea,
		.stroybrigada-quiz-editor__global-field input[type="text"],
		.stroybrigada-quiz-editor__global-field textarea { width: 100%; max-width: 100%; min-height: 42px; padding: 10px 12px; border-radius: 12px; border-color: #cbd5e1; background: #fff; color: #0f172a; font-size: 14px; line-height: 1.45; box-sizing: border-box; }
		.stroybrigada-quiz-editor__field .stroybrigada-quiz-editor__question-input { min-height: 52px; font-size: 18px; font-weight: 700; line-height: 1.3; }
		.stroybrigada-quiz-editor__field .stroybrigada-page-editor__image-row { grid-template-columns: 96px minmax(0, 1fr); }
		.stroybrigada-quiz-editor__field .stroybrigada-page-editor__image-row img { width: 96px; height: 96px; object-fit: cover; border-radius: 12px; }
		@media (max-width: 1180px) {
			.stroybrigada-page-editor__cities-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
			.stroybrigada-page-editor__services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
			.stroybrigada-quiz-editor__step-body { grid-template-columns: 1fr; }
			.stroybrigada-quiz-editor__options { border-left: 0; border-top: 1px solid #e2e8f0; }
		}
		@media (max-width: 782px) {
			.stroybrigada-page-editor__cities-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
			.stroybrigada-page-editor__services-grid { grid-template-columns: 1fr; }
			.stroybrigada-quiz-editor__toolbar,
			.stroybrigada-quiz-editor__step-header { flex-direction: column; align-items: stretch; }
			.stroybrigada-quiz-editor__nav { justify-content: flex-start; }
			.stroybrigada-quiz-editor__options { grid-template-columns: 1fr; }
		}
	</style>
	<p><?php esc_html_e('Все данные сохраняются в этой странице и не используются на других страницах. Общими остаются только header и footer.', 'stroybrigada'); ?></p>
	<?php
	?>
	<div class="stroybrigada-page-editor__section">
		<div class="stroybrigada-page-editor__body">
			<div class="stroybrigada-page-editor__field">
				<label for="stroybrigada-page-metrika-goal"><?php esc_html_e('Цель Яндекс Метрики для этой страницы', 'stroybrigada'); ?></label>
				<input id="stroybrigada-page-metrika-goal" type="text" name="stroybrigada_page_metric_goal" value="<?php echo esc_attr(stroybrigada_metric_goal_for_post((int) $post->ID)); ?>" placeholder="form_submit_page_name" pattern="[A-Za-z0-9_-]+">
				<p class="description"><?php esc_html_e('Эта цель отправляется после успешной отправки любой формы или квиза на странице. Если оставить пустым, используется общая цель из настроек сайта.', 'stroybrigada'); ?></p>
			</div>
		</div>
	</div>
	<?php
	foreach ($sections as $section_index => $section) {
		if (! is_array($section)) {
			continue;
		}

		$kind   = stroybrigada_page_editor_section_kind($section);
		$html   = (string) ($section['html'] ?? '');
		if (in_array($kind, ['cases', 'video', 'reviews'], true)) {
			$tokens = [];
		} else {
			$tokens = stroybrigada_page_editor_extract_tokens($html, (string) $kind);
		}
		if (! $tokens && ! in_array($kind, ['cases', 'video', 'reviews'], true)) {
			continue;
		}

		$section_label = (string) ($section['label'] ?? $section['key'] ?? sprintf(__('Секция %d', 'stroybrigada'), ((int) $section_index) + 1));
		?>
		<details class="stroybrigada-page-editor__section" open>
			<summary>
				<span class="stroybrigada-page-editor__summary-title">
					<span class="stroybrigada-page-editor__summary-index"><?php echo esc_html(sprintf('%02d', ((int) $section_index) + 1)); ?></span>
					<span><?php echo esc_html($section_label); ?></span>
					<span class="stroybrigada-page-editor__summary-kind"><?php echo esc_html(stroybrigada_page_editor_kind_title((string) $kind)); ?></span>
				</span>
			</summary>
			<div class="stroybrigada-page-editor__body">
			<?php if ('quiz' === $kind) : ?>
				<?php stroybrigada_page_editor_render_quiz_section((int) $section_index, $tokens, $html); ?>
			<?php elseif (str_contains($html, 'services__item_link')) : ?>
				<?php stroybrigada_page_editor_render_services_section((int) $section_index, $tokens, $html); ?>
			<?php elseif ('cases' === $kind) : ?>
				<?php stroybrigada_page_editor_render_cases_section((int) $post->ID); ?>
			<?php elseif ('video' === $kind) : ?>
				<?php stroybrigada_page_editor_render_videos_section((int) $post->ID, (int) $section_index, $html); ?>
			<?php elseif ('reviews' === $kind) : ?>
				<?php stroybrigada_page_editor_render_reviews_section((int) $post->ID); ?>
			<?php elseif (str_contains($html, 'city_item') || str_contains($html, 'id="cities"')) : ?>
				<?php stroybrigada_page_editor_render_cities_section((int) $section_index, $tokens, $html); ?>
			<?php elseif ('content' === $kind) : ?>
				<?php stroybrigada_page_editor_render_content_article((int) $section_index, $html); ?>
				<?php if (stroybrigada_page_editor_content_article_data($html)) : ?>
				<?php foreach ($tokens as $token_index => $token) : ?>
					<?php if ('service_button' === ($token['type'] ?? '')) { stroybrigada_page_editor_render_token_field((int) $section_index, (int) $token_index, $token, (string) $kind); } ?>
				<?php endforeach; ?>
				<?php endif; ?>
				<?php else : ?>
					<?php $cities_grid_open = false; ?>
					<?php foreach ($tokens as $token_index => $token) : ?>
						<?php $is_city_field = 'stroybrigada-page-editor__field--city' === (string) ($token['editor_class'] ?? ''); ?>
						<?php if ($is_city_field && ! $cities_grid_open) : ?>
							<div class="stroybrigada-page-editor__cities-grid">
							<?php $cities_grid_open = true; ?>
						<?php endif; ?>
						<?php if (! $is_city_field && $cities_grid_open) : ?>
							</div>
							<?php $cities_grid_open = false; ?>
						<?php endif; ?>
						<?php stroybrigada_page_editor_render_token_field((int) $section_index, (int) $token_index, $token, (string) $kind); ?>
					<?php endforeach; ?>
					<?php if ($cities_grid_open) : ?>
						</div>
					<?php endif; ?>
				<?php endif; ?>
			</div>
		</details>
		<?php
	}
}

function stroybrigada_page_editor_enqueue_media(string $hook_suffix): void {
	if (! in_array($hook_suffix, ['post.php', 'post-new.php'], true)) {
		return;
	}

	$screen = get_current_screen();
	if (! $screen || 'page' !== $screen->post_type) {
		return;
	}

	wp_enqueue_media();
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',function(event){var remove=event.target.closest('[data-quiz-remove-image]');if(remove){event.preventDefault();var removeRow=remove.closest('.stroybrigada-page-editor__image-row');var removeInput=removeRow?removeRow.querySelector('input[type=\"text\"]'):null;if(removeInput){removeInput.value='';removeInput.dispatchEvent(new Event('input',{bubbles:true}));}if(removeRow){removeRow.classList.add('stroybrigada-page-editor__image-row--empty');}return;}var button=event.target.closest('.stroybrigada-page-editor__media-button,.stroybrigada-page-editor__media-upload-button');if(!button){return;}event.preventDefault();var upload=button.closest('.stroybrigada-page-editor__media-upload');var imageRow=button.closest('.stroybrigada-page-editor__image-row');var serviceImage=button.closest('.stroybrigada-page-editor__service-image');var wrap=upload||imageRow||serviceImage;var input=wrap?wrap.querySelector('input[type=\"text\"]'):null;var preview=wrap?wrap.querySelector('img'):null;if(!input){return;}var kind=button.getAttribute('data-media-kind')||'image';var isVideo=kind==='video';var frame=wp.media({title:isVideo?'Выберите видео':'Выберите изображение',button:{text:'Использовать'},multiple:false,library:isVideo?{type:'video'}:{type:'image'}});frame.on('select',function(){var attachment=frame.state().get('selection').first().toJSON();if(!attachment||!attachment.url){return;}input.value=attachment.url;if(preview&&!isVideo){preview.src=attachment.url;}if(imageRow){imageRow.classList.remove('stroybrigada-page-editor__image-row--empty');}input.dispatchEvent(new Event('input',{bubbles:true}));});frame.open();});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('DOMContentLoaded',function(){function slugify(value){var map={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shh','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};return String(value||'').toLowerCase().split('').map(function(ch){return map[ch]!==undefined?map[ch]:ch;}).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'novyj-gorod';}function makeCard(editor){var card=document.createElement('div');card.className='stroybrigada-page-editor__city-card';card.setAttribute('data-city-card','');card.dataset.originalCity='';card.dataset.cityHref='';card.innerHTML='<button type=\"button\" class=\"stroybrigada-page-editor__city-remove\" data-city-remove aria-label=\"Удалить город\">×</button><label><span>Город</span><textarea rows=\"2\" data-city-name>Новый город</textarea></label>';return card;}function serialize(editor){var payload=editor.parentElement?editor.parentElement.querySelector('.stroybrigada-page-editor__cities-payload'):null;if(!payload){return;}var suffix=editor.dataset.citySuffix||'/';var cities=Array.from(editor.querySelectorAll('[data-city-card]')).map(function(card){var input=card.querySelector('[data-city-name]');var text=input?input.value.trim():'';if(!text){return null;}var href=card.dataset.cityHref||('/'+slugify(text)+suffix);return{original:card.dataset.originalCity||'',href:href,text:text};}).filter(Boolean);payload.value=JSON.stringify({cities:cities});}document.addEventListener('click',function(event){var add=event.target.closest('[data-city-add]');if(add){event.preventDefault();var editor=add.closest('[data-cities-editor]');if(!editor){return;}var card=makeCard(editor);editor.insertBefore(card,add);var input=card.querySelector('[data-city-name]');if(input){input.focus();input.select();}serialize(editor);return;}var remove=event.target.closest('[data-city-remove]');if(remove){event.preventDefault();var editor=remove.closest('[data-cities-editor]');var card=remove.closest('[data-city-card]');if(card){card.remove();}if(editor){serialize(editor);}return;}});document.addEventListener('input',function(event){var editor=event.target.closest&&event.target.closest('[data-cities-editor]');if(editor){serialize(editor);}});document.addEventListener('submit',function(event){var form=event.target;if(!form||!form.querySelectorAll){return;}form.querySelectorAll('[data-cities-editor]').forEach(serialize);},true);document.querySelectorAll('[data-cities-editor]').forEach(serialize);});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('DOMContentLoaded',function(){function makeCard(){var card=document.createElement('div');card.className='stroybrigada-page-editor__service-card';card.setAttribute('data-service-card','');card.dataset.originalService='';card.innerHTML='<button type=\"button\" class=\"stroybrigada-page-editor__service-remove\" data-service-remove aria-label=\"Удалить услугу\">×</button><div class=\"stroybrigada-page-editor__service-image\"><img src=\"data:image/gif;base64,R0lGODlhAQABAID/AP///wAAACwAAAAAAQABAAACAkQBADs=\" alt=\"\"><input type=\"text\" value=\"\" data-service-image><button type=\"button\" class=\"button stroybrigada-page-editor__media-button\">Выбрать изображение</button></div><label><span>Название услуги</span><input type=\"text\" value=\"Новая услуга\" data-service-title></label><label><span>Описание</span><textarea rows=\"3\" data-service-description></textarea></label><label><span>Ссылка</span><input type=\"text\" value=\"#\" data-service-url></label>';return card;}function serialize(editor){var payload=editor.parentElement?editor.parentElement.querySelector('.stroybrigada-page-editor__services-payload'):null;if(!payload){return;}payload.value=JSON.stringify({services:Array.from(editor.querySelectorAll('[data-service-card]')).map(function(card){function value(selector){var field=card.querySelector(selector);return field?field.value.trim():'';}return{original:card.dataset.originalService||'',image:value('[data-service-image]'),title:value('[data-service-title]'),description:value('[data-service-description]'),url:value('[data-service-url]')};}).filter(function(item){return item.title!=='';})});}document.addEventListener('click',function(event){var add=event.target.closest('[data-service-add]');if(add){event.preventDefault();var editor=add.closest('[data-services-editor]');if(!editor){return;}var card=makeCard();editor.insertBefore(card,add);var input=card.querySelector('[data-service-title]');if(input){input.focus();input.select();}serialize(editor);return;}var remove=event.target.closest('[data-service-remove]');if(remove){event.preventDefault();var editor=remove.closest('[data-services-editor]');var card=remove.closest('[data-service-card]');if(card){card.remove();}if(editor){serialize(editor);}return;}});document.addEventListener('input',function(event){var editor=event.target.closest&&event.target.closest('[data-services-editor]');if(editor){serialize(editor);}});document.addEventListener('submit',function(event){var form=event.target;if(!form||!form.querySelectorAll){return;}form.querySelectorAll('[data-services-editor]').forEach(serialize);},true);document.querySelectorAll('[data-services-editor]').forEach(serialize);});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('DOMContentLoaded',function(){function stripNames(node){node.querySelectorAll('input[name],textarea[name]').forEach(function(field){field.removeAttribute('name');});}function textField(option){return option.querySelector('textarea[data-quiz-option-text],textarea[name],textarea:not(.stroybrigada-quiz-editor__payload),input[data-quiz-option-text]');}function imageField(option){var row=option.querySelector('.stroybrigada-page-editor__image-row');return row?row.querySelector('input[type=\"text\"]'):option.querySelector('input[data-quiz-option-image]');}function sync(editor){var steps=Array.from(editor.querySelectorAll('[data-quiz-step]'));var nav=editor.querySelector('.stroybrigada-quiz-editor__nav');if(nav){nav.replaceChildren();}steps.forEach(function(step,index){step.id='stroybrigada-quiz-step-auto-'+(index+1);var badge=step.querySelector('.stroybrigada-quiz-editor__badge');if(badge){badge.textContent='Шаг '+(index+1);}var title=step.querySelector('.stroybrigada-quiz-editor__question-input, .stroybrigada-quiz-editor__question textarea, .stroybrigada-quiz-editor__question input[type=\"text\"]');var heading=step.querySelector('[data-quiz-step-heading]');if(heading&&title){heading.textContent=title.value.trim()||'Новый вопрос';}var options=Array.from(step.querySelectorAll('[data-quiz-option]:not(.stroybrigada-quiz-editor__option--add)'));options.forEach(function(option,optionIndex){var optionBadge=option.querySelector('.stroybrigada-quiz-editor__option-badge');if(optionBadge){optionBadge.textContent='Вариант '+(optionIndex+1);}});var count=step.querySelector('[data-quiz-option-count]');if(count){var n=options.length;count.textContent=n+' '+(n===1?'вариант':(n>1&&n<5?'варианта':'вариантов'));}if(nav){var link=document.createElement('a');link.href='#'+step.id;link.textContent='Шаг '+(index+1);nav.appendChild(link);}});}function serialize(editor){var payload=editor.querySelector('.stroybrigada-quiz-editor__payload');if(!payload){return;}var steps=Array.from(editor.querySelectorAll('[data-quiz-step]')).map(function(step){var title=step.querySelector('.stroybrigada-quiz-editor__question-input, .stroybrigada-quiz-editor__question textarea, .stroybrigada-quiz-editor__question input[type=\"text\"]');return{original:step.dataset.originalStep||'',title:title?title.value:'',options:Array.from(step.querySelectorAll('[data-quiz-option]:not(.stroybrigada-quiz-editor__option--add)')).map(function(option){var text=textField(option);var image=imageField(option);return{original:option.dataset.originalOption||'',text:text?text.value:'',image:image?image.value:''};})};});payload.value=JSON.stringify({steps:steps});}document.addEventListener('click',function(event){var addStep=event.target.closest('[data-quiz-add-step]');if(addStep){var editor=addStep.closest('.stroybrigada-quiz-editor');var grid=editor&&editor.querySelector('[data-quiz-steps]');var allSteps=grid?Array.from(grid.querySelectorAll('[data-quiz-step]')):[];var source=allSteps.find(function(step){return step.querySelector('[data-quiz-option]');});if(editor&&grid&&source){var clone=source.cloneNode(true);stripNames(clone);var title=clone.querySelector('.stroybrigada-quiz-editor__question-input, .stroybrigada-quiz-editor__question textarea, .stroybrigada-quiz-editor__question input[type=\"text\"]');if(title){title.value='Новый вопрос';}clone.querySelectorAll('[data-quiz-option]:not(.stroybrigada-quiz-editor__option--add)').forEach(function(option,index){if(index>1){option.remove();return;}var text=textField(option);if(text){text.value=index===0?'Новый вариант':'Другой вариант';}});var last=allSteps[allSteps.length-1];if(last&&!last.querySelector('[data-quiz-option]')){grid.insertBefore(clone,last);}else{grid.appendChild(clone);}sync(editor);}return;}var removeStep=event.target.closest('[data-quiz-remove-step]');if(removeStep){var editor=removeStep.closest('.stroybrigada-quiz-editor');var steps=editor?editor.querySelectorAll('[data-quiz-step]'):[];if(steps.length>1){removeStep.closest('[data-quiz-step]').remove();sync(editor);}return;}var addOption=event.target.closest('[data-quiz-add-option]');if(addOption){var editor=addOption.closest('.stroybrigada-quiz-editor');var grid=addOption.closest('[data-quiz-options]');var source=grid&&grid.querySelector('[data-quiz-option]:not(.stroybrigada-quiz-editor__option--add)');if(editor&&grid&&source){var clone=source.cloneNode(true);stripNames(clone);var text=textField(clone);if(text){text.value='Новый вариант';}var add=grid.querySelector('[data-quiz-add-option]');grid.insertBefore(clone,add);sync(editor);}return;}var removeOption=event.target.closest('[data-quiz-remove-option]');if(removeOption){var editor=removeOption.closest('.stroybrigada-quiz-editor');var option=removeOption.closest('[data-quiz-option]');if(option){option.remove();sync(editor);}return;}});document.addEventListener('input',function(event){var editor=event.target.closest&&event.target.closest('.stroybrigada-quiz-editor');if(editor){sync(editor);}});document.querySelectorAll('.stroybrigada-quiz-editor').forEach(sync);document.addEventListener('submit',function(event){var form=event.target;if(!form||!form.querySelectorAll){return;}form.querySelectorAll('.stroybrigada-quiz-editor').forEach(serialize);},true);});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('click',function(event){var add=event.target.closest&&event.target.closest('[data-quiz-add-option]');if(!add){return;}var grid=add.closest('[data-quiz-options]');if(!grid||grid.querySelector('[data-quiz-option]:not(.stroybrigada-quiz-editor__option--add)')){return;}event.preventDefault();event.stopImmediatePropagation();var option=document.createElement('div');option.className='stroybrigada-quiz-editor__option';option.setAttribute('data-quiz-option','');option.dataset.originalOption='';option.innerHTML='<div class=\"stroybrigada-quiz-editor__option-header\"><span class=\"stroybrigada-quiz-editor__option-badge\">Вариант 1</span><div class=\"stroybrigada-quiz-editor__move-actions\"><button type=\"button\" class=\"button button-small stroybrigada-quiz-editor__move-button\" data-quiz-move-option=\"up\">Вверх</button><button type=\"button\" class=\"button button-small stroybrigada-quiz-editor__move-button\" data-quiz-move-option=\"down\">Вниз</button></div></div><button type=\"button\" class=\"stroybrigada-quiz-editor__remove-option\" data-quiz-remove-option aria-label=\"Удалить вариант\">×</button><label class=\"stroybrigada-quiz-editor__field\"><span>Вариант ответа</span><textarea data-quiz-option-text rows=\"3\">Новый вариант</textarea></label><div class=\"stroybrigada-quiz-editor__field stroybrigada-page-editor__image-row stroybrigada-page-editor__image-row--removable stroybrigada-page-editor__image-row--empty\"><img src=\"data:image/gif;base64,R0lGODlhAQABAID/AP///wAAACwAAAAAAQABAAACAkQBADs=\" alt=\"\"><button type=\"button\" class=\"stroybrigada-page-editor__image-remove\" data-quiz-remove-image aria-label=\"Удалить изображение\">×</button><div><label>Изображение</label><input type=\"text\" data-quiz-option-image value=\"\"><button type=\"button\" class=\"button stroybrigada-page-editor__media-button\">Выбрать изображение</button></div></div>';grid.insertBefore(option,add);var step=grid.closest('[data-quiz-step]');var count=step&&step.querySelector('[data-quiz-option-count]');if(count){count.textContent='1 вариант';}var input=option.querySelector('[data-quiz-option-text]');if(input){input.focus();input.select();}});"
	);
	wp_add_inline_script(
		'media-editor',
		"document.addEventListener('DOMContentLoaded',function(){function steps(editor){return Array.from(editor.querySelectorAll('[data-quiz-step]'));}function options(step){return Array.from(step.querySelectorAll('[data-quiz-option]:not(.stroybrigada-quiz-editor__option--add)'));}function update(editor){var nav=editor.querySelector('.stroybrigada-quiz-editor__nav');if(nav){nav.replaceChildren();}steps(editor).forEach(function(step,index,all){step.id='stroybrigada-quiz-step-auto-'+(index+1);var badge=step.querySelector('.stroybrigada-quiz-editor__badge');if(badge){badge.textContent='Шаг '+(index+1);}var title=step.querySelector('.stroybrigada-quiz-editor__question-input, .stroybrigada-quiz-editor__question textarea, .stroybrigada-quiz-editor__question input[type=\"text\"]');var heading=step.querySelector('[data-quiz-step-heading]');if(heading&&title){heading.textContent=title.value.trim()||'Новый вопрос';}step.querySelectorAll('[data-quiz-move-step=\"up\"]').forEach(function(button){button.disabled=index===0;});step.querySelectorAll('[data-quiz-move-step=\"down\"]').forEach(function(button){button.disabled=index===all.length-1;});var stepOptions=options(step);stepOptions.forEach(function(option,optionIndex,optionAll){var optionBadge=option.querySelector('.stroybrigada-quiz-editor__option-badge');if(optionBadge){optionBadge.textContent='Вариант '+(optionIndex+1);}option.querySelectorAll('[data-quiz-move-option=\"up\"]').forEach(function(button){button.disabled=optionIndex===0;});option.querySelectorAll('[data-quiz-move-option=\"down\"]').forEach(function(button){button.disabled=optionIndex===optionAll.length-1;});});var count=step.querySelector('[data-quiz-option-count]');if(count){var n=stepOptions.length;count.textContent=n+' '+(n===1?'вариант':(n>1&&n<5?'варианта':'вариантов'));}if(nav){var link=document.createElement('a');link.href='#'+step.id;link.textContent='Шаг '+(index+1);nav.appendChild(link);}});}document.addEventListener('click',function(event){var moveStep=event.target.closest('[data-quiz-move-step]');if(moveStep){event.preventDefault();var step=moveStep.closest('[data-quiz-step]');var editor=moveStep.closest('.stroybrigada-quiz-editor');if(!step||!editor){return;}var direction=moveStep.getAttribute('data-quiz-move-step');if(direction==='up'&&step.previousElementSibling){step.parentNode.insertBefore(step,step.previousElementSibling);}if(direction==='down'&&step.nextElementSibling){step.parentNode.insertBefore(step.nextElementSibling,step);}update(editor);return;}var moveOption=event.target.closest('[data-quiz-move-option]');if(moveOption){event.preventDefault();var option=moveOption.closest('[data-quiz-option]');var editor=moveOption.closest('.stroybrigada-quiz-editor');if(!option||!editor){return;}var directionOption=moveOption.getAttribute('data-quiz-move-option');var previous=option.previousElementSibling;var next=option.nextElementSibling;if(directionOption==='up'&&previous&&previous.matches('[data-quiz-option]')){option.parentNode.insertBefore(option,previous);}if(directionOption==='down'&&next&&next.matches('[data-quiz-option]')){option.parentNode.insertBefore(next,option);}update(editor);return;}var editor=event.target.closest&&event.target.closest('.stroybrigada-quiz-editor');if(editor&&(event.target.closest('[data-quiz-add-step]')||event.target.closest('[data-quiz-remove-step]')||event.target.closest('[data-quiz-add-option]')||event.target.closest('[data-quiz-remove-option]'))){window.setTimeout(function(){update(editor);},0);}});document.addEventListener('input',function(event){var editor=event.target.closest&&event.target.closest('.stroybrigada-quiz-editor');if(editor){update(editor);}});document.querySelectorAll('.stroybrigada-quiz-editor').forEach(update);});"
	);
}
add_action('admin_enqueue_scripts', 'stroybrigada_page_editor_enqueue_media');

function stroybrigada_page_editor_replace_text(string $original, string $value): string {
	$value = nl2br(esc_html($value), false);
	return preg_replace_callback(
		'/>(.*?)<\/([a-z0-9]+)>$/is',
		static function (array $match) use ($value): string {
			return '>' . $value . '</' . $match[2] . '>';
		},
		$original,
		1
	) ?? $original;
}

function stroybrigada_page_editor_sanitize_inline_html_text(string $value): string {
	$value = wp_kses(
		$value,
		[
			'br' => [],
			'span' => [
				'class' => true,
			],
			'strong' => [],
			'b' => [],
			'em' => [],
			'i' => [],
		]
	);

	return trim($value);
}

function stroybrigada_page_editor_replace_html_text(string $original, string $value): string {
	$value = stroybrigada_page_editor_sanitize_inline_html_text($value);
	return preg_replace_callback(
		'/>(.*?)<\/([a-z0-9]+)>$/is',
		static function (array $match) use ($value): string {
			return '>' . $value . '</' . $match[2] . '>';
		},
		$original,
		1
	) ?? $original;
}

function stroybrigada_page_editor_replace_faq_question(string $original, string $value): string {
	$image = preg_match('/<img\b[^>]*>/i', $original, $match) ? (string) $match[0] : '';
	$value = esc_html(trim($value)) . $image;

	return preg_replace_callback(
		'/>(.*?)<\/([a-z0-9]+)>$/is',
		static fn(array $match): string => '>' . $value . '</' . $match[2] . '>',
		$original,
		1
	) ?? $original;
}

function stroybrigada_page_editor_replace_content_article(string $html, string $heading, string $body): string {
	if (! preg_match('/<div\b[^>]*class=(["\'])(?=[^"\']*\bcontent-block-text\b)[^"\']*\1[^>]*>/i', $html, $match, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$offset = (int) $match[0][1];
	$open_tag = (string) $match[0][0];
	$wrapper = stroybrigada_page_editor_find_element_html($html, 'div', $offset, $open_tag);
	if ('' === $wrapper) {
		return $html;
	}

	$body_html = trim(wp_kses_post(wpautop($body)));
	$replacement = $open_tag . "\n<h2>" . esc_html(trim($heading)) . "</h2>\n" . $body_html . "\n</div>";

	return substr_replace($html, $replacement, $offset, strlen($wrapper));
}

function stroybrigada_page_editor_replace_occurrence(string $html, string $original, string $replacement, int $occurrence): string {
	if ($occurrence < 1) {
		return str_replace($original, $replacement, $html);
	}

	$offset = 0;
	for ($index = 1; $index <= $occurrence; $index++) {
		$position = strpos($html, $original, $offset);
		if (false === $position) {
			return $html;
		}

		if ($index === $occurrence) {
			return substr_replace($html, $replacement, $position, strlen($original));
		}

		$offset = $position + strlen($original);
	}

	return $html;
}

function stroybrigada_page_editor_sync_quiz_option_value(string $html, string $original, string $value): string {
	if (! str_contains($original, 'pick-item__label') || ! str_contains($html, $original)) {
		return $html;
	}

	$position = strpos($html, $original);
	if (false === $position) {
		return $html;
	}

	$before = substr($html, 0, $position);
	$label_start = strripos($before, '<label');
	if (false === $label_start) {
		return $html;
	}

	$after = substr($html, $position);
	$label_end_position = stripos($after, '</label>');
	if (false === $label_end_position) {
		return $html;
	}

	$label_length = ($position - $label_start) + $label_end_position + strlen('</label>');
	$label_html = substr($html, $label_start, $label_length);
	$clean_value = sanitize_text_field($value);

	$label_html = preg_replace_callback(
		'/(<input\b[^>]*\svalue\s*=\s*)(["\'])(.*?)\2/i',
		static function (array $match) use ($clean_value): string {
			return $match[1] . $match[2] . esc_attr($clean_value) . $match[2];
		},
		$label_html,
		1
	) ?? $label_html;

	$label_html = preg_replace_callback(
		'/(<img\b[^>]*\salt\s*=\s*)(["\'])(.*?)\2/i',
		static function (array $match) use ($clean_value): string {
			return $match[1] . $match[2] . esc_attr($clean_value) . $match[2];
		},
		$label_html,
		1
	) ?? $label_html;

	return substr_replace($html, $label_html, $label_start, $label_length);
}

function stroybrigada_page_editor_replace_inner_text(string $html, string $selector_class, string $value): string {
	$value = esc_html($value);
	return preg_replace_callback(
		'/(<([a-z0-9]+)\b[^>]*class=(["\'])(?=[^"\']*\b' . preg_quote($selector_class, '/') . '\b)[^"\']*\3[^>]*>)(.*?)(<\/\2>)/is',
		static function (array $match) use ($value): string {
			return $match[1] . $value . $match[5];
		},
		$html,
		1
	) ?? $html;
}

function stroybrigada_page_editor_replace_quiz_option_text(string $html, string $value): string {
	$value = esc_html($value);
	return preg_replace_callback(
		'/(<div\b[^>]*class=(["\'])(?=[^"\']*\bpick-item__label(?:_img|_checkbox)?\b)[^"\']*\2[^>]*>)(.*?)(<\/div>)/is',
		static function (array $match) use ($value): string {
			return $match[1] . $value . $match[4];
		},
		$html,
		1
	) ?? $html;
}

function stroybrigada_page_editor_rebuild_quiz_option(string $option_html, array $option, int $step_number, int $option_number): string {
	$text = sanitize_text_field((string) ($option['text'] ?? __('Новый вариант', 'stroybrigada')));
	$image = str_replace(['"', "'"], '', sanitize_text_field((string) ($option['image'] ?? '')));

	$option_html = stroybrigada_page_editor_replace_quiz_option_text($option_html, $text);
	$option_html = preg_replace('/(\sfor\s*=\s*)(["\'])(.*?)\2/i', '${1}${2}step' . $step_number . '-' . $option_number . '${2}', $option_html, 1) ?? $option_html;
	$option_html = preg_replace('/(\sid\s*=\s*)(["\'])(.*?)\2/i', '${1}${2}step' . $step_number . '-' . $option_number . '${2}', $option_html, 1) ?? $option_html;
	$option_html = preg_replace('/(\sname\s*=\s*)(["\'])q\d+(\[\])?\2/i', '${1}${2}q' . $step_number . '$3${2}', $option_html, 1) ?? $option_html;
	$option_html = preg_replace_callback(
		'/(<input\b[^>]*\svalue\s*=\s*)(["\'])(.*?)\2/i',
		static function (array $match) use ($text): string {
			return $match[1] . $match[2] . esc_attr($text) . $match[2];
		},
		$option_html,
		1
	) ?? $option_html;

	if ('' !== $image) {
		$option_html = preg_replace(
			'/class=(["\'])(?=[^"\']*\bpick-item__label_checkbox\b)[^"\']*\1/i',
			'class="pick-item__label pick-item__label_img"',
			$option_html,
			1
		) ?? $option_html;
		if (preg_match('/<img\b/i', $option_html)) {
			$option_html = preg_replace_callback(
				'/(<img\b[^>]*\s(?:data-src|src)\s*=\s*)(["\'])(.*?)\2/i',
				static function (array $match) use ($image): string {
					return $match[1] . $match[2] . esc_attr($image) . $match[2];
				},
				$option_html,
				1
			) ?? $option_html;
			$option_html = preg_replace_callback(
				'/(<img\b[^>]*\salt\s*=\s*)(["\'])(.*?)\2/i',
				static function (array $match) use ($text): string {
					return $match[1] . $match[2] . esc_attr($text) . $match[2];
				},
				$option_html,
				1
			) ?? $option_html;
		} else {
			$image_html = '<div class="pick-item__img"><img src="' . esc_attr($image) . '" alt="' . esc_attr($text) . '"></div>';
			$option_html = preg_replace('/(<label\b[^>]*>)/i', '$1' . $image_html, $option_html, 1) ?? $option_html;
		}
	} else {
		$option_html = preg_replace('/<div\b[^>]*class=(["\'])(?=[^"\']*\bpick-item__img\b)[^"\']*\1[^>]*>\s*<img\b[^>]*>\s*<\/div>/is', '', $option_html, 1) ?? $option_html;
		$option_html = preg_replace('/<img\b[^>]*>/i', '', $option_html, 1) ?? $option_html;
		$option_html = preg_replace(
			'/class=(["\'])(?=[^"\']*\bpick-item__label_img\b)[^"\']*\1/i',
			'class="pick-item__label_checkbox"',
			$option_html,
			1
		) ?? $option_html;
	}

	return $option_html;
}

function stroybrigada_page_editor_default_quiz_option_html(string $text, int $step_number, int $option_number): string {
	$id = 'step' . $step_number . '-' . $option_number;

	return sprintf(
		'<label for="%1$s" class="pick-item quiz-option"><input class="pick-item__input quiz-option__input" type="radio" name="q%2$d" value="%3$s" id="%1$s"><div class="pick-item__label_checkbox">%4$s</div></label>',
		esc_attr($id),
		$step_number,
		esc_attr($text),
		esc_html($text)
	);
}

function stroybrigada_page_editor_rebuild_quiz_step(string $step_html, array $step, int $step_number, int $total_steps): string {
	$title = sanitize_text_field((string) ($step['title'] ?? __('Новый вопрос', 'stroybrigada')));
	$step_html = stroybrigada_page_editor_replace_inner_text($step_html, 'step-slide__title', $title);
	$step_html = preg_replace('/(\sdata-step\s*=\s*)(["\']?)\d+\2/i', '${1}${2}' . $step_number . '${2}', $step_html, 1) ?? $step_html;
	$step_html = preg_replace('/Вопрос\s+\d+(&nbsp;|\s)*<\/span>\s*из\s*\d+/u', 'Вопрос ' . $step_number . '&nbsp;</span> из ' . $total_steps, $step_html, 1) ?? $step_html;

	$options = is_array($step['options'] ?? null) ? (array) $step['options'] : [];
	if (! $options) {
		if (! preg_match_all('/<label\b[^>]*class=(["\'])(?=[^"\']*\bpick-item\b)(?=[^"\']*\bquiz-option\b)[^"\']*\1[^>]*>.*?<\/label>/is', $step_html, $matches, PREG_OFFSET_CAPTURE)) {
			return $step_html;
		}

		$first = $matches[0][0];
		$last = $matches[0][count($matches[0]) - 1];
		$start = (int) $first[1];
		$end = (int) $last[1] + strlen((string) $last[0]);

		return substr_replace($step_html, '', $start, $end - $start);
	}

	$existing_options = stroybrigada_page_editor_extract_quiz_option_blocks($step_html);
	$fallback_option = $existing_options[0] ?? (string) ($options[0]['original'] ?? '');

	$new_options = [];
	foreach (array_values($options) as $option_index => $option) {
		if (! is_array($option)) {
			continue;
		}

		$option_template = base64_decode((string) ($option['original'] ?? ''), true);
		if (! is_string($option_template) || '' === $option_template) {
			$option_template = $fallback_option;
		}
		if ('' === $option_template) {
			$option_template = stroybrigada_page_editor_default_quiz_option_html(
				sanitize_text_field((string) ($option['text'] ?? __('Новый вариант', 'stroybrigada'))),
				$step_number,
				$option_index + 1
			);
		}

		$new_options[] = stroybrigada_page_editor_rebuild_quiz_option($option_template, $option, $step_number, $option_index + 1);
	}

	if (! $new_options) {
		return $step_html;
	}

	$rebuilt_options_html = implode("\n", $new_options);
	if (str_contains($rebuilt_options_html, 'pick-item__img')) {
		$layout_class = count($new_options) >= 4 ? 'four-in-line' : 'three-in-line';
		$step_html = preg_replace_callback(
			'/class=(["\'])([^"\']*\bstep-slide__grid\b[^"\']*)\1/i',
			static function (array $match) use ($layout_class): string {
				$classes = preg_replace('/\b(no_img|two_in_line|two-in-line|three-in-line|four-in-line)\b/i', '', (string) $match[2]) ?? (string) $match[2];
				$classes = trim(preg_replace('/\s+/', ' ', $classes) ?? $classes);
				return 'class=' . $match[1] . trim($classes . ' ' . $layout_class) . $match[1];
			},
			$step_html,
			1
		) ?? $step_html;
	}

	if (! preg_match_all('/<label\b[^>]*class=(["\'])(?=[^"\']*\bpick-item\b)(?=[^"\']*\bquiz-option\b)[^"\']*\1[^>]*>.*?<\/label>/is', $step_html, $matches, PREG_OFFSET_CAPTURE)) {
		return preg_replace(
			'/(<div\b[^>]*class=(["\'])(?=[^"\']*\bstep-slide__grid\b)[^"\']*\2[^>]*>)/i',
			'$1' . "\n" . $rebuilt_options_html,
			$step_html,
			1
		) ?? $step_html;
	}

	$first = $matches[0][0];
	$last = $matches[0][count($matches[0]) - 1];
	$start = (int) $first[1];
	$end = (int) $last[1] + strlen((string) $last[0]);

	return substr_replace($step_html, $rebuilt_options_html, $start, $end - $start);
}

function stroybrigada_page_editor_apply_quiz_payload(string $html, string $payload): string {
	$data = json_decode(wp_unslash($payload), true);
	if (! is_array($data) || empty($data['steps']) || ! is_array($data['steps'])) {
		return $html;
	}

	$steps = array_values(array_filter((array) $data['steps'], 'is_array'));
	if (! $steps) {
		return $html;
	}

	$existing_blocks = stroybrigada_page_editor_extract_quiz_step_blocks($html);
	if (! $existing_blocks) {
		return $html;
	}

	$rebuilt = [];
	$total = count($steps);
	foreach ($steps as $step_index => $step) {
		$step_template = base64_decode((string) ($step['original'] ?? ''), true);
		if (! is_string($step_template) || '' === $step_template) {
			$step_template = $existing_blocks[min($step_index, count($existing_blocks) - 1)];
		}

		$rebuilt[] = stroybrigada_page_editor_rebuild_quiz_step($step_template, $step, $step_index + 1, $total);
	}

	$first_pos = strpos($html, $existing_blocks[0]);
	$last_block = $existing_blocks[count($existing_blocks) - 1];
	$last_pos = strrpos($html, $last_block);
	if (false === $first_pos || false === $last_pos) {
		return $html;
	}

	return substr_replace($html, implode("\n", $rebuilt), $first_pos, ($last_pos + strlen($last_block)) - $first_pos);
}

function stroybrigada_page_editor_default_service_block(): string {
	return '<div class="col-lg-3 col-md-4 col-sm-6 mb2"><a class="services__item_link" href="#"><div class="services__item"><div class="services__image"><img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAID/AP///wAAACwAAAAAAQABAAACAkQBADs=" data-src="" alt=""></div><div class="services__content"><div class="services__top"><div class="services__title tac"><span>Новая услуга</span></div><div class="services__desc tac"><span></span></div></div></div></div></a></div>';
}

function stroybrigada_page_editor_replace_service_text(string $html, string $class_name, string $value): string {
	$value = esc_html($value);
	return preg_replace_callback(
		'/(<([a-z0-9]+)\b[^>]*class=(["\'])(?=[^"\']*\b' . preg_quote($class_name, '/') . '\b)[^"\']*\3[^>]*>)(.*?)(<\/\2>)/is',
		static function (array $match) use ($value): string {
			$inner = preg_match('/<span\b[^>]*>.*?<\/span>/is', (string) $match[4])
				? (preg_replace('/(<span\b[^>]*>).*?(<\/span>)/is', '$1' . $value . '$2', (string) $match[4], 1) ?? (string) $match[4])
				: $value;
			return $match[1] . $inner . $match[5];
		},
		$html,
		1
	) ?? $html;
}

function stroybrigada_page_editor_rebuild_service_block(string $template, array $service): string {
	$title = sanitize_text_field((string) ($service['title'] ?? ''));
	if ('' === $title) {
		return '';
	}

	$description = sanitize_textarea_field((string) ($service['description'] ?? ''));
	$image = str_replace(['"', "'"], '', sanitize_text_field((string) ($service['image'] ?? '')));
	$url = str_replace(['"', "'"], '', sanitize_text_field((string) ($service['url'] ?? '#')));
	if ('' === $url) {
		$url = '#';
	}
	if (! str_contains($template, 'services__item_link')) {
		$template = stroybrigada_page_editor_default_service_block();
	}

	$template = preg_replace_callback(
		'/(<a\b[^>]*class=(["\'])(?=[^"\']*\bservices__item_link\b)[^"\']*\2[^>]*\shref\s*=\s*)(["\'])(.*?)\3/i',
		static fn(array $match): string => $match[1] . $match[3] . esc_attr($url) . $match[3],
		$template,
		1
	) ?? $template;
	$template = stroybrigada_page_editor_replace_service_text($template, 'services__title', $title);
	$template = stroybrigada_page_editor_replace_service_text($template, 'services__desc', $description);
	$image_attr = preg_match('/<img\b[^>]*\sdata-src\s*=/i', $template) ? 'data-src' : 'src';
	$template = preg_replace_callback(
		'/(<img\b[^>]*\s' . preg_quote($image_attr, '/') . '\s*=\s*)(["\'])(.*?)\2/i',
		static fn(array $match): string => $match[1] . $match[2] . esc_attr($image) . $match[2],
		$template,
		1
	) ?? $template;
	$template = preg_replace_callback(
		'/(<img\b[^>]*\salt\s*=\s*)(["\'])(.*?)\2/i',
		static fn(array $match): string => $match[1] . $match[2] . esc_attr($title) . $match[2],
		$template,
		1
	) ?? $template;

	return $template;
}

function stroybrigada_page_editor_apply_services_payload(string $html, string $payload): string {
	$data = json_decode(wp_unslash($payload), true);
	if (! is_array($data) || ! isset($data['services']) || ! is_array($data['services'])) {
		return $html;
	}

	$existing_blocks = stroybrigada_page_editor_extract_service_blocks($html);
	if (! $existing_blocks) {
		return $html;
	}

	$rebuilt = [];
	foreach (array_values($data['services']) as $index => $service) {
		if (! is_array($service)) {
			continue;
		}
		$template = base64_decode((string) ($service['original'] ?? ''), true);
		if (! is_string($template) || '' === $template) {
			$template = $existing_blocks[min((int) $index, count($existing_blocks) - 1)] ?? stroybrigada_page_editor_default_service_block();
		}
		$block = stroybrigada_page_editor_rebuild_service_block($template, $service);
		if ('' !== $block) {
			$rebuilt[] = $block;
		}
	}

	$first_pos = strpos($html, $existing_blocks[0]);
	$last_block = $existing_blocks[count($existing_blocks) - 1];
	$last_pos = strrpos($html, $last_block);
	if (false === $first_pos || false === $last_pos) {
		return $html;
	}

	return substr_replace($html, implode("\n", $rebuilt), $first_pos, ($last_pos + strlen($last_block)) - $first_pos);
}

function stroybrigada_page_editor_city_href_from_text(string $text, string $suffix): string {
	$map = [
		'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
		'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'j', 'к' => 'k', 'л' => 'l', 'м' => 'm',
		'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
		'ф' => 'f', 'х' => 'h', 'ц' => 'c', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'shh', 'ъ' => '',
		'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
	];
	$lower = function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
	$slug = strtr($lower, $map);
	$slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
	$slug = trim($slug, '-');
	if ('' === $slug) {
		$slug = 'novyj-gorod';
	}

	$suffix = '/' . trim($suffix, '/') . '/';
	if ('//' === $suffix) {
		$suffix = '/';
	}

	return '/' . $slug . $suffix;
}

function stroybrigada_page_editor_rebuild_city_block(string $template, array $city, string $suffix): string {
	$text = sanitize_text_field((string) ($city['text'] ?? ''));
	if ('' === $text) {
		return '';
	}

	if (preg_match('/^(<div\b[^>]*\bcity_item\b[^>]*>).*<\/div>$/is', $template, $wrapper_match)) {
		return (string) $wrapper_match[1] . '<span>' . esc_html($text) . '</span></div>';
	}

	return '<div class="city_item"><span>' . esc_html($text) . '</span></div>';
}

function stroybrigada_page_editor_apply_cities_payload(string $html, string $payload): string {
	$data = json_decode(wp_unslash($payload), true);
	if (! is_array($data) || ! isset($data['cities']) || ! is_array($data['cities'])) {
		return $html;
	}

	$existing_blocks = stroybrigada_page_editor_extract_city_blocks($html);
	if (! $existing_blocks) {
		return $html;
	}

	$cards = stroybrigada_page_editor_city_cards($html);
	$suffix = stroybrigada_page_editor_city_suffix($cards);
	$fallback = $existing_blocks[0];
	$rebuilt = [];

	foreach (array_values((array) $data['cities']) as $city_index => $city) {
		if (! is_array($city)) {
			continue;
		}

		$template = base64_decode((string) ($city['original'] ?? ''), true);
		if (! is_string($template) || '' === $template) {
			$template = $existing_blocks[min((int) $city_index, count($existing_blocks) - 1)] ?? $fallback;
		}

		$block = stroybrigada_page_editor_rebuild_city_block($template, $city, $suffix);
		if ('' !== $block) {
			$rebuilt[] = $block;
		}
	}

	$first_pos = strpos($html, $existing_blocks[0]);
	$last_block = $existing_blocks[count($existing_blocks) - 1];
	$last_pos = strrpos($html, $last_block);
	if (false === $first_pos || false === $last_pos) {
		return $html;
	}

	return substr_replace($html, implode("\n", $rebuilt), $first_pos, ($last_pos + strlen($last_block)) - $first_pos);
}

function stroybrigada_page_editor_sanitize_reviews_payload($payload): array {
	if (! is_array($payload)) {
		return [];
	}

	$items = [];
	foreach ($payload as $item) {
		if (! is_array($item)) {
			continue;
		}

		$name = sanitize_text_field(wp_unslash((string) ($item['name'] ?? '')));
		$text = sanitize_textarea_field(wp_unslash((string) ($item['text'] ?? '')));
		if ('' === $name && '' === $text) {
			continue;
		}

		$tags_raw = (string) wp_unslash($item['tags'] ?? '');
		$tags = preg_split('/\r\n|\r|\n/', $tags_raw);
		$tags = is_array($tags) ? $tags : [];

		$items[] = [
			'image'  => str_replace(['"', "'"], '', sanitize_text_field(wp_unslash((string) ($item['image'] ?? '')))),
			'name'   => $name,
			'tags'   => array_values(array_filter(array_map(static fn($tag): string => sanitize_text_field((string) $tag), $tags))),
			'text'   => $text,
			'source' => sanitize_text_field(wp_unslash((string) ($item['source'] ?? ''))),
		];
	}

	return $items;
}

function stroybrigada_page_editor_replace_reviews_wrapper(string $html, array $items): string {
	if (! function_exists('stroybrigada_render_review_slides') || ! $items) {
		return $html;
	}

	if (! preg_match('/<div\b[^>]*class=(["\'])(?=[^"\']*\bswiper-wrapper\b)[^"\']*\1[^>]*>/i', $html, $match, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$start = (int) $match[0][1];
	if (! preg_match_all('/<\/?div\b[^>]*>/i', substr($html, $start), $div_matches, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$depth = 0;
	foreach ($div_matches[0] as $div_match) {
		$tag = strtolower((string) $div_match[0]);
		$offset = $start + (int) $div_match[1];
		$depth += str_starts_with($tag, '</div') ? -1 : 1;
		if (0 === $depth) {
			$open_tag = (string) $match[0][0];
			$replacement = $open_tag . "\n" . stroybrigada_render_review_slides($items) . "\n</div>";
			return substr_replace($html, $replacement, $start, ($offset + strlen($tag)) - $start);
		}
	}

	return $html;
}

function stroybrigada_page_editor_replace_image(string $original, string $attr, string $value): string {
	$value = str_replace(['"', "'"], '', sanitize_text_field($value));
	return preg_replace_callback(
		'/(\s' . preg_quote($attr, '/') . '\s*=\s*)(["\'])(.*?)\2/i',
		static function (array $match) use ($value): string {
			return $match[1] . $match[2] . $value . $match[2];
		},
		$original,
		1
	) ?? $original;
}

function stroybrigada_page_editor_replace_hero_background(string $original, string $value): string {
	$value = str_replace(['"', "'"], '', sanitize_text_field($value));
	if ('' === $value) {
		return $original;
	}

	$background = 'background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.60) 100%), url(' . $value . ') !important;';
	if (preg_match('/\sstyle\s*=\s*(["\'])(.*?)\1/is', $original, $match)) {
		$quote = (string) $match[1];
		$style = (string) $match[2];
		if (preg_match('/background-image\s*:\s*[^;]+;?/i', $style)) {
			$style = preg_replace('/background-image\s*:\s*[^;]+;?/i', $background, $style, 1) ?? $style;
		} else {
			$style = rtrim($style);
			$style .= ('' !== $style && ! str_ends_with($style, ';') ? '; ' : ' ') . $background;
		}

		return preg_replace('/\sstyle\s*=\s*(["\'])(.*?)\1/is', ' style=' . $quote . esc_attr($style) . $quote, $original, 1) ?? $original;
	}

	return preg_replace('/>$/', ' style="' . esc_attr($background) . '">', $original, 1) ?? $original;
}

function stroybrigada_page_editor_replace_video_items(string $original, $value): string {
	if (! is_array($value)) {
		return $original;
	}

	$items = [];
	foreach ($value as $item) {
		if (! is_array($item)) {
			continue;
		}

		$src     = str_replace(['"', "'"], '', sanitize_text_field((string) ($item['src'] ?? '')));
		$preview = str_replace(['"', "'"], '', sanitize_text_field((string) ($item['preview'] ?? '')));
		if ('' === $src || '' === $preview) {
			continue;
		}

		$items[] = [
			'src'     => $src,
			'preview' => $preview,
			'title'   => sanitize_text_field((string) ($item['title'] ?? '')),
		];
	}

	$json = wp_json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	if (! is_string($json)) {
		return $original;
	}

	return "data-video-items='" . esc_attr($json) . "'";
}

function stroybrigada_page_editor_replace_gallery_primary_image(string $html, string $original, string $value): string {
	if (! str_contains($original, 'preview') || ! str_contains($html, $original)) {
		return $html;
	}

	$image_position = strpos($html, $original);
	if (false === $image_position) {
		return $html;
	}

	$prefix = substr($html, 0, $image_position);
	if (! preg_match_all('/<a\b[^>]*data-fancybox=(["\']).*?\1[^>]*>/is', $prefix, $link_matches, PREG_OFFSET_CAPTURE)) {
		return $html;
	}

	$link_match = end($link_matches[0]);
	if (! is_array($link_match)) {
		return $html;
	}

	$link_tag      = (string) $link_match[0];
	$link_position = (int) $link_match[1];
	$old_href      = stroybrigada_page_editor_extract_attr($link_tag, 'href');
	if ('' === $old_href) {
		return $html;
	}

	$value        = str_replace(['"', "'"], '', sanitize_text_field($value));
	$new_link_tag = preg_replace_callback(
		'/(\shref\s*=\s*)(["\'])(.*?)\2/i',
		static function (array $match) use ($value): string {
			return $match[1] . $match[2] . $value . $match[2];
		},
		$link_tag,
		1
	) ?? $link_tag;

	$html = substr_replace($html, $new_link_tag, $link_position, strlen($link_tag));

	$cost_pattern = '/(\sdata-link\s*=\s*)(["\'])' . preg_quote($old_href, '/') . '\2/i';
	return preg_replace_callback(
		$cost_pattern,
		static function (array $match) use ($value): string {
			return $match[1] . $match[2] . $value . $match[2];
		},
		$html,
		1
	) ?? $html;
}

function stroybrigada_page_editor_save(int $post_id, WP_Post $post): void {
	if (! in_array($post->post_type, ['page', 'service'], true) || wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
		return;
	}

	if (! isset($_POST['stroybrigada_page_editor_nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash((string) $_POST['stroybrigada_page_editor_nonce'])), 'stroybrigada_page_editor_save')) {
		return;
	}

	if (! current_user_can('edit_post', $post_id)) {
		return;
	}

	$page_metric_goal = sanitize_text_field(wp_unslash((string) ($_POST['stroybrigada_page_metric_goal'] ?? '')));
	$page_metric_goal = preg_replace('/[^A-Za-z0-9_-]/', '', $page_metric_goal) ?? '';
	if ('' !== $page_metric_goal) {
		update_post_meta($post_id, '_stroybrigada_metric_goal', $page_metric_goal);
	} else {
		delete_post_meta($post_id, '_stroybrigada_metric_goal');
	}

	$posted = $_POST['stroybrigada_page_editor'] ?? null; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if (! is_array($posted)) {
		$posted = [];
	}

	$sections = stroybrigada_get_page_sections($post_id);
	if (! is_array($sections)) {
		return;
	}

	foreach ($posted as $section_index => $edits) {
		$section_index = (int) $section_index;
		if (! isset($sections[$section_index]) || ! is_array($edits)) {
			continue;
		}
		if (isset($sections[$section_index]) && is_array($sections[$section_index]) && in_array(stroybrigada_page_editor_section_kind($sections[$section_index]), ['cases', 'reviews'], true)) {
			continue;
		}

		$html = (string) ($sections[$section_index]['html'] ?? '');
		$edits = array_values($edits);
		usort(
			$edits,
			static function ($left, $right): int {
				$left_offset  = is_array($left) && isset($left['offset']) ? (int) $left['offset'] : PHP_INT_MIN;
				$right_offset = is_array($right) && isset($right['offset']) ? (int) $right['offset'] : PHP_INT_MIN;
				return $right_offset <=> $left_offset;
			}
		);

		foreach ($edits as $edit) {
			if (! is_array($edit) || empty($edit['original']) || empty($edit['type'])) {
				continue;
			}

			$original = base64_decode((string) wp_unslash($edit['original']), true);
			if (! is_string($original) || '' === $original || ! str_contains($html, $original)) {
				continue;
			}

			$type = sanitize_key((string) wp_unslash($edit['type']));
			$kind = sanitize_key((string) wp_unslash($edit['kind'] ?? ''));
			if ('service_button' === $type) {
				$replacement = stroybrigada_page_editor_replace_service_button($original, (string) wp_unslash($edit['value'] ?? ''), (string) wp_unslash($edit['url'] ?? ''));
			} elseif ('background_image' === $type) {
				$value       = (string) wp_unslash($edit['value'] ?? '');
				$replacement = stroybrigada_page_editor_replace_hero_background($original, $value);
			} elseif ('image' === $type) {
				$value       = (string) wp_unslash($edit['value'] ?? '');
				$attr        = sanitize_key((string) wp_unslash($edit['attr'] ?? 'src'));
				$replacement = stroybrigada_page_editor_replace_image($original, $attr, $value);
				$html        = stroybrigada_page_editor_replace_gallery_primary_image($html, $original, $value);
			} elseif ('video_items' === $type) {
				$replacement = stroybrigada_page_editor_replace_video_items($original, wp_unslash($edit['value'] ?? []));
			} elseif ('faq_question' === $type) {
				$value       = (string) wp_unslash($edit['value'] ?? '');
				$replacement = stroybrigada_page_editor_replace_faq_question($original, $value);
			} elseif ('html_text' === $type) {
				$value       = (string) wp_unslash($edit['value'] ?? '');
				$replacement = stroybrigada_page_editor_replace_html_text($original, $value);
			} else {
				$value       = (string) wp_unslash($edit['value'] ?? '');
				$replacement = stroybrigada_page_editor_replace_text($original, $value);
				if ('quiz' === $kind) {
					$html = stroybrigada_page_editor_sync_quiz_option_value($html, $original, $value);
				}
			}

			$occurrence = isset($edit['occurrence']) ? (int) wp_unslash($edit['occurrence']) : 0;
			$html = stroybrigada_page_editor_replace_occurrence($html, $original, $replacement, $occurrence);
		}

		$sections[$section_index]['html'] = $html;
	}

	$content_payloads = $_POST['stroybrigada_content_editor'] ?? null; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if (is_array($content_payloads)) {
		foreach ($content_payloads as $section_index => $payload) {
			$section_index = (int) $section_index;
			if (! isset($sections[$section_index]) || ! is_array($sections[$section_index]) || ! is_array($payload)) {
				continue;
			}

			$heading = sanitize_text_field(wp_unslash((string) ($payload['heading'] ?? '')));
			$body = wp_kses_post(wp_unslash((string) ($payload['body'] ?? '')));
			$sections[$section_index]['html'] = stroybrigada_page_editor_replace_content_article(
				(string) ($sections[$section_index]['html'] ?? ''),
				$heading,
				$body
			);
		}
	}

	$quiz_payloads = $_POST['stroybrigada_quiz_editor'] ?? null; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if (is_array($quiz_payloads)) {
		foreach ($quiz_payloads as $section_index => $payload) {
			$section_index = (int) $section_index;
			if (! isset($sections[$section_index]) || ! is_array($sections[$section_index])) {
				continue;
			}

			$payload = (string) $payload;
			if ('' === $payload) {
				continue;
			}

			$sections[$section_index]['html'] = stroybrigada_page_editor_apply_quiz_payload((string) ($sections[$section_index]['html'] ?? ''), $payload);
		}
	}

	$cities_payloads = $_POST['stroybrigada_cities_editor'] ?? null; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if (is_array($cities_payloads)) {
		foreach ($cities_payloads as $section_index => $payload) {
			$section_index = (int) $section_index;
			if (! isset($sections[$section_index]) || ! is_array($sections[$section_index])) {
				continue;
			}

			$payload = (string) $payload;
			if ('' === $payload) {
				continue;
			}

			$sections[$section_index]['html'] = stroybrigada_page_editor_apply_cities_payload((string) ($sections[$section_index]['html'] ?? ''), $payload);
		}
	}

	$sections = stroybrigada_normalize_page_sections($sections);
	stroybrigada_update_page_sections($post_id, $sections, true);
	update_post_meta($post_id, '_stroybrigada_page_editor_sections_snapshot', $sections);
}
add_action('save_post_page', 'stroybrigada_page_editor_save', 10, 2);
add_action('save_post_service', 'stroybrigada_page_editor_save', 10, 2);
