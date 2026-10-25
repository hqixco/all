<?php
/**
 * Final form section.
 *
 * @package Stroybrigada
 */

declare(strict_types=1);
?>
<section id="form__bottom" class="site-section site-section--callback">
	<div class="container">
		<form class="form-callback__form" method="post">
			<div class="form-input">
				<input type="text" name="name" placeholder="<?php esc_attr_e('Ваше имя', 'stroybrigada'); ?>">
			</div>
			<div class="form-input">
				<input type="tel" name="phone" placeholder="<?php esc_attr_e('Телефон', 'stroybrigada'); ?>" required>
			</div>
			<div class="form-button">
				<input type="submit" value="<?php esc_attr_e('Отправить заявку', 'stroybrigada'); ?>" class="form-button__button button-bg btn-sm bold pulse-button">
			</div>
		</form>
	</div>
</section>

