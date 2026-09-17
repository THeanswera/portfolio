<?php
/**
 * Заявка-квиз: три шага вместо длинной формы.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args(
	$args ?? array(),
	array(
		'form_type'  => 'estimate',
		'section_id' => 'consultation',
		'title'      => __( 'Заявка инженеру', 'kitstroy-moscow' ),
		'subtitle'   => __( 'Три шага: что за объект, какие системы нужны и как с вами связаться. В письмо попадёт состав работ, а не «здравствуйте».', 'kitstroy-moscow' ),
	)
);

$objects         = kitstroy_get_estimate_objects();
$systems         = kitstroy_get_estimate_systems();
$cities          = kitstroy_get_estimate_cities();
$estimate        = kitstroy_get_estimate_from_request();
$feedback        = kitstroy_get_current_form_feedback( $args['form_type'] );
$privacy_url     = kitstroy_get_privacy_page_link();
$recaptcha_key   = kitstroy_get_theme_option( 'recaptcha_site_key', '' );
$source_url      = kitstroy_get_current_url();
$form_uid        = wp_unique_id( 'kitstroy-quiz-' );
$feedback_id     = $form_uid . '-feedback';
$privacy_id      = $form_uid . '-privacy';
$deadlines       = array(
	'soon'    => __( 'В течение месяца', 'kitstroy-moscow' ),
	'quarter' => __( 'В течение трёх месяцев', 'kitstroy-moscow' ),
	'later'   => __( 'Позже, считаю бюджет', 'kitstroy-moscow' ),
);
?>
<section class="section section--panel" id="<?php echo esc_attr( (string) $args['section_id'] ); ?>">
	<div class="container">
		<div class="section-head">
			<p class="kicker"><?php esc_html_e( 'Заявка', 'kitstroy-moscow' ); ?></p>
			<h2><?php echo esc_html( (string) $args['title'] ); ?></h2>
			<p class="lead"><?php echo esc_html( (string) $args['subtitle'] ); ?></p>
		</div>

		<?php if ( ! empty( $feedback ) ) : ?>
			<div class="form-feedback form-feedback--<?php echo esc_attr( (string) $feedback['status'] ); ?>" id="<?php echo esc_attr( $feedback_id ); ?>" role="<?php echo 'success' === $feedback['status'] ? 'status' : 'alert'; ?>" aria-live="polite">
				<?php echo esc_html( (string) $feedback['message'] ); ?>
			</div>
		<?php endif; ?>

		<form
			class="form quiz js-kitstroy-quiz js-kitstroy-form"
			action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
			method="post"
			data-quiz
			data-recaptcha-sitekey="<?php echo esc_attr( $recaptcha_key ); ?>"
		>
			<input type="hidden" name="action" value="kitstroy_submit_form">
			<input type="hidden" name="kitstroy_form_type" value="<?php echo esc_attr( (string) $args['form_type'] ); ?>">
			<input type="hidden" name="kitstroy_source_url" value="<?php echo esc_attr( $source_url ); ?>">
			<input type="hidden" name="kitstroy_started_at" value="<?php echo esc_attr( (string) time() ); ?>">
			<input type="hidden" name="kitstroy_recaptcha_token" value="">
			<div class="form__honeypot" aria-hidden="true">
				<label for="<?php echo esc_attr( $form_uid ); ?>-website"><?php esc_html_e( 'Ваш сайт', 'kitstroy-moscow' ); ?></label>
				<input id="<?php echo esc_attr( $form_uid ); ?>-website" type="text" name="kitstroy_website" tabindex="-1" autocomplete="off">
			</div>
			<?php wp_nonce_field( 'kitstroy_form_submit', 'kitstroy_nonce' ); ?>

			<div class="quiz__steps" role="list">
				<span class="quiz__step is-active" role="listitem" data-step-indicator="1"><span>1</span><?php esc_html_e( 'Объект', 'kitstroy-moscow' ); ?></span>
				<span class="quiz__step" role="listitem" data-step-indicator="2"><span>2</span><?php esc_html_e( 'Системы', 'kitstroy-moscow' ); ?></span>
				<span class="quiz__step" role="listitem" data-step-indicator="3"><span>3</span><?php esc_html_e( 'Контакты', 'kitstroy-moscow' ); ?></span>
			</div>

			<div class="quiz__panel" data-step="1">
				<p class="quiz__question"><?php esc_html_e( 'Что за объект и какая площадь?', 'kitstroy-moscow' ); ?></p>
				<div class="quiz__options">
					<?php foreach ( $objects as $key => $object ) : ?>
						<label class="quiz__option">
							<input type="radio" name="quiz_object" value="<?php echo esc_attr( (string) $key ); ?>" <?php checked( $estimate['object'], $key ); ?> required>
							<span class="quiz__option-mark">✓</span>
							<span class="quiz__option-text">
								<strong><?php echo esc_html( (string) $object['label'] ); ?></strong>
								<small><?php echo esc_html( (string) $object['hint'] ); ?></small>
							</span>
						</label>
					<?php endforeach; ?>
				</div>

				<div class="calculator__group quiz__area">
					<div class="calculator__row">
						<label class="calculator__legend" for="<?php echo esc_attr( $form_uid ); ?>-area"><?php esc_html_e( 'Площадь, м²', 'kitstroy-moscow' ); ?></label>
						<output class="calculator__value tech" for="<?php echo esc_attr( $form_uid ); ?>-area"><?php echo esc_html( (string) $estimate['area'] ); ?> м²</output>
					</div>
					<input class="calculator__range" id="<?php echo esc_attr( $form_uid ); ?>-area" type="range" name="quiz_area" min="20" max="1200" step="10" value="<?php echo esc_attr( (string) $estimate['area'] ); ?>">
				</div>

				<div class="quiz__nav">
					<span class="tech"><?php esc_html_e( 'Объект нужен, чтобы подобрать бригаду и допуски', 'kitstroy-moscow' ); ?></span>
					<button class="button button--primary" type="button" data-quiz-next="2"><?php esc_html_e( 'Дальше: системы', 'kitstroy-moscow' ); ?></button>
				</div>
			</div>

			<div class="quiz__panel" data-step="2" hidden>
				<p class="quiz__question"><?php esc_html_e( 'Какие системы нужны на объекте?', 'kitstroy-moscow' ); ?></p>
				<div class="quiz__options">
					<?php foreach ( $systems as $key => $system ) : ?>
						<label class="quiz__option">
							<input type="checkbox" name="quiz_systems[]" value="<?php echo esc_attr( (string) $key ); ?>" <?php checked( in_array( $key, (array) $estimate['systems'], true ) ); ?>>
							<span class="quiz__option-mark">✓</span>
							<span class="quiz__option-text">
								<strong><?php echo esc_html( (string) $system['short'] ); ?> — <?php echo esc_html( (string) $system['label'] ); ?></strong>
								<small><?php echo esc_html( (string) $system['hint'] ); ?></small>
							</span>
						</label>
					<?php endforeach; ?>
				</div>

				<div class="calculator__group">
					<label class="calculator__legend" for="<?php echo esc_attr( $form_uid ); ?>-deadline"><?php esc_html_e( 'Когда планируете работы', 'kitstroy-moscow' ); ?></label>
					<select class="calculator__select" id="<?php echo esc_attr( $form_uid ); ?>-deadline" name="quiz_deadline">
						<?php foreach ( $deadlines as $value => $label ) : ?>
							<option value="<?php echo esc_attr( (string) $value ); ?>"><?php echo esc_html( (string) $label ); ?></option>
						<?php endforeach; ?>
					</select>
				</div>

				<div class="quiz__nav">
					<button class="button button--secondary" type="button" data-quiz-back="1"><?php esc_html_e( 'Назад', 'kitstroy-moscow' ); ?></button>
					<button class="button button--primary" type="button" data-quiz-next="3"><?php esc_html_e( 'Дальше: контакты', 'kitstroy-moscow' ); ?></button>
				</div>
			</div>

			<div class="quiz__panel" data-step="3" hidden>
				<p class="quiz__question"><?php esc_html_e( 'Куда отправить расчёт и сроки?', 'kitstroy-moscow' ); ?></p>

				<dl class="quiz__summary" data-quiz-summary>
					<div class="quiz__summary-row">
						<dt><?php esc_html_e( 'Объект', 'kitstroy-moscow' ); ?></dt>
						<dd data-summary-object><?php echo esc_html( (string) $estimate['object_label'] ); ?></dd>
					</div>
					<div class="quiz__summary-row">
						<dt><?php esc_html_e( 'Площадь и адрес', 'kitstroy-moscow' ); ?></dt>
						<dd><span data-summary-area><?php echo esc_html( number_format_i18n( (float) $estimate['area'] ) ); ?></span> м² · <?php echo esc_html( (string) $estimate['city_label'] ); ?></dd>
					</div>
					<div class="quiz__summary-row">
						<dt><?php esc_html_e( 'Системы', 'kitstroy-moscow' ); ?></dt>
						<dd data-summary-systems>
							<?php
							$labels = array();
							foreach ( $estimate['lines'] as $line ) {
								$labels[] = (string) $line['label'];
							}
							echo esc_html( implode( ', ', $labels ) );
							?>
						</dd>
					</div>
					<div class="quiz__summary-row">
						<dt><?php esc_html_e( 'Предварительно', 'kitstroy-moscow' ); ?></dt>
						<dd data-summary-estimate><?php echo esc_html( number_format_i18n( (float) $estimate['low'] ) . ' — ' . number_format_i18n( (float) $estimate['high'] ) . ' ₽' ); ?></dd>
					</div>
				</dl>

				<input type="hidden" name="quiz_estimate" value="" data-quiz-estimate>

				<input type="hidden" name="city" value="<?php echo esc_attr( (string) $estimate['city'] ); ?>">

				<div class="form__grid">
					<label class="form__field" for="<?php echo esc_attr( $form_uid ); ?>-name">
						<span><?php esc_html_e( 'Имя', 'kitstroy-moscow' ); ?></span>
						<input id="<?php echo esc_attr( $form_uid ); ?>-name" type="text" name="name" maxlength="80" minlength="2" autocomplete="name" placeholder="<?php esc_attr_e( 'Как к вам обращаться', 'kitstroy-moscow' ); ?>" required>
					</label>
					<label class="form__field" for="<?php echo esc_attr( $form_uid ); ?>-phone">
						<span><?php esc_html_e( 'Телефон', 'kitstroy-moscow' ); ?></span>
						<input id="<?php echo esc_attr( $form_uid ); ?>-phone" type="tel" name="phone" class="js-phone-input" inputmode="tel" autocomplete="tel" maxlength="24" placeholder="+7 (___) ___-__-__" required>
					</label>
					<label class="form__field form__field--full" for="<?php echo esc_attr( $form_uid ); ?>-comment">
						<span><?php esc_html_e( 'Что важно учесть', 'kitstroy-moscow' ); ?></span>
						<textarea id="<?php echo esc_attr( $form_uid ); ?>-comment" name="comment" rows="3" maxlength="1200" placeholder="<?php esc_attr_e( 'Например: есть проект, нужен только монтаж. Или: ввод 15 кВт, щит старый.', 'kitstroy-moscow' ); ?>"></textarea>
					</label>
				</div>

				<div class="form__actions">
					<div class="form__meta">
						<label class="form__consent">
							<input type="checkbox" name="kitstroy_consent" value="1" required>
							<span>
								<?php esc_html_e( 'Согласен на обработку персональных данных согласно', 'kitstroy-moscow' ); ?>
								<a href="<?php echo esc_url( $privacy_url ); ?>"><?php esc_html_e( 'политике конфиденциальности', 'kitstroy-moscow' ); ?></a>.
							</span>
						</label>
						<p class="form__privacy" id="<?php echo esc_attr( $privacy_id ); ?>">
							<?php esc_html_e( 'Контакты используем только для ответа по заявке. Сайт демонстрационный: письмо уходит на адрес владельца сайта-образца.', 'kitstroy-moscow' ); ?>
						</p>
					</div>
					<div class="quiz__nav quiz__nav--submit">
						<button class="button button--secondary" type="button" data-quiz-back="2"><?php esc_html_e( 'Назад', 'kitstroy-moscow' ); ?></button>
						<button class="button button--primary" type="submit"><?php esc_html_e( 'Отправить заявку', 'kitstroy-moscow' ); ?></button>
					</div>
				</div>
			</div>
		</form>
	</div>
</section>
