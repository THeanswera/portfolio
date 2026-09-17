<?php
/**
 * Окно быстрой заявки: короткий вариант, когда человек не готов идти по шагам квиза.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$privacy_url = kitstroy_get_privacy_page_link();
$recaptcha   = kitstroy_get_theme_option( 'recaptcha_site_key', '' );
$source_url  = kitstroy_get_current_url();
$uid         = wp_unique_id( 'kitstroy-modal-' );
?>
<div class="modal" id="consultation-modal" aria-hidden="true">
	<div class="modal__overlay" data-modal-close></div>
	<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="consultation-modal-title" aria-describedby="consultation-modal-description" tabindex="-1">
		<button class="modal__close" type="button" data-modal-close aria-label="<?php esc_attr_e( 'Закрыть окно', 'kitstroy-moscow' ); ?>">
			<span aria-hidden="true">&times;</span>
		</button>
		<div class="modal__content">
			<p class="kicker"><?php esc_html_e( 'Быстрая заявка', 'kitstroy-moscow' ); ?></p>
			<h2 class="modal__title" id="consultation-modal-title"><?php esc_html_e( 'Инженер свяжется с вами', 'kitstroy-moscow' ); ?></h2>
			<p class="modal__text" id="consultation-modal-description"><?php esc_html_e( 'Оставьте имя и телефон — уточним задачу и предложим время выезда. Для расчёта по параметрам удобнее калькулятор.', 'kitstroy-moscow' ); ?></p>

			<form class="form js-kitstroy-form" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" data-recaptcha-sitekey="<?php echo esc_attr( $recaptcha ); ?>">
				<input type="hidden" name="action" value="kitstroy_submit_form">
				<input type="hidden" name="kitstroy_form_type" value="consultation">
				<input type="hidden" name="kitstroy_source_url" value="<?php echo esc_attr( $source_url ); ?>">
				<input type="hidden" name="kitstroy_started_at" value="<?php echo esc_attr( (string) time() ); ?>">
				<input type="hidden" name="kitstroy_recaptcha_token" value="">
				<div class="form__honeypot" aria-hidden="true">
					<label for="<?php echo esc_attr( $uid ); ?>-website"><?php esc_html_e( 'Ваш сайт', 'kitstroy-moscow' ); ?></label>
					<input id="<?php echo esc_attr( $uid ); ?>-website" type="text" name="kitstroy_website" tabindex="-1" autocomplete="off">
				</div>
				<?php wp_nonce_field( 'kitstroy_form_submit', 'kitstroy_nonce' ); ?>

				<div class="form__grid">
					<label class="form__field" for="<?php echo esc_attr( $uid ); ?>-name">
						<span><?php esc_html_e( 'Имя', 'kitstroy-moscow' ); ?></span>
						<input id="<?php echo esc_attr( $uid ); ?>-name" type="text" name="name" maxlength="80" minlength="2" autocomplete="name" required>
					</label>
					<label class="form__field" for="<?php echo esc_attr( $uid ); ?>-phone">
						<span><?php esc_html_e( 'Телефон', 'kitstroy-moscow' ); ?></span>
						<input id="<?php echo esc_attr( $uid ); ?>-phone" type="tel" name="phone" class="js-phone-input" inputmode="tel" autocomplete="tel" maxlength="24" required>
					</label>
					<label class="form__field form__field--full" for="<?php echo esc_attr( $uid ); ?>-comment">
						<span><?php esc_html_e( 'Задача', 'kitstroy-moscow' ); ?></span>
						<textarea id="<?php echo esc_attr( $uid ); ?>-comment" name="comment" rows="3" maxlength="600"></textarea>
					</label>
				</div>

				<div class="form__actions">
					<label class="form__consent">
						<input type="checkbox" name="kitstroy_consent" value="1" required>
						<span>
							<?php esc_html_e( 'Согласен на обработку данных согласно', 'kitstroy-moscow' ); ?>
							<a href="<?php echo esc_url( $privacy_url ); ?>"><?php esc_html_e( 'политике конфиденциальности', 'kitstroy-moscow' ); ?></a>.
						</span>
					</label>
					<button class="button button--primary" type="submit">
						<span><?php esc_html_e( 'Отправить', 'kitstroy-moscow' ); ?></span>
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
