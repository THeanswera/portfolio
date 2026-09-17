<?php
/**
 * Native form handlers.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_get_form_config( string $form_type ): array {
	$configs = array(
		'consultation' => array(
			'label' => __( 'Консультация инженера', 'kitstroy-moscow' ),
		),
		'estimate'     => array(
			'label' => __( 'Рассчитать стоимость', 'kitstroy-moscow' ),
		),
		'universal'    => array(
			'label' => __( 'Универсальная заявка', 'kitstroy-moscow' ),
		),
	);

	return $configs[ $form_type ] ?? $configs['universal'];
}

function kitstroy_get_form_type( string $form_type ): string {
	$allowed_types = array( 'consultation', 'estimate', 'universal' );

	return in_array( $form_type, $allowed_types, true ) ? $form_type : 'universal';
}

function kitstroy_get_form_recipient(): string {
	$recipient = kitstroy_get_theme_option( 'form_recipient_email', get_option( 'admin_email' ) );

	return is_email( $recipient ) ? $recipient : get_option( 'admin_email' );
}

function kitstroy_get_form_source_url(): string {
	$posted_source = isset( $_POST['kitstroy_source_url'] ) ? esc_url_raw( wp_unslash( $_POST['kitstroy_source_url'] ) ) : '';

	if ( $posted_source ) {
		return kitstroy_get_safe_redirect_url( $posted_source );
	}

	$referer = wp_get_referer();

	if ( $referer ) {
		return kitstroy_get_safe_redirect_url( $referer );
	}

	return home_url( '/' );
}

function kitstroy_get_form_rate_limit_key(): string {
	$ip_address = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';

	return 'kitstroy_form_' . md5( $ip_address . '|' . $user_agent );
}

function kitstroy_is_form_rate_limited(): bool {
	return false !== get_transient( kitstroy_get_form_rate_limit_key() );
}

function kitstroy_mark_form_submission(): void {
	set_transient( kitstroy_get_form_rate_limit_key(), time(), 45 );
}

function kitstroy_normalize_form_text( string $value, int $max_length = 0 ): string {
	$value = sanitize_text_field( $value );
	$value = trim( preg_replace( '/\s+/u', ' ', $value ) );

	if ( $max_length > 0 ) {
		if ( function_exists( 'mb_substr' ) ) {
			$value = mb_substr( $value, 0, $max_length );
		} else {
			$value = substr( $value, 0, $max_length );
		}
	}

	return $value;
}

function kitstroy_verify_recaptcha( string $token ): bool {
	$secret = kitstroy_get_theme_option( 'recaptcha_secret_key', '' );

	if ( empty( $secret ) ) {
		return true;
	}

	if ( empty( $token ) ) {
		return false;
	}

	$response = wp_remote_post(
		'https://www.google.com/recaptcha/api/siteverify',
		array(
			'timeout' => 10,
			'body'    => array(
				'secret'   => $secret,
				'response' => $token,
				'remoteip' => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return false;
	}

	$body = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( empty( $body['success'] ) || ! empty( $body['error-codes'] ) ) {
		return false;
	}

	if ( isset( $body['action'] ) && 'submit' !== $body['action'] ) {
		return false;
	}

	return ! isset( $body['score'] ) || (float) $body['score'] >= 0.4;
}

function kitstroy_build_form_email( array $payload ): string {
	$rows = array(
		__( 'Тип формы', 'kitstroy-moscow' )       => $payload['form_label'],
		__( 'Имя', 'kitstroy-moscow' )             => $payload['name'],
		__( 'Телефон', 'kitstroy-moscow' )         => $payload['phone'],
		__( 'Комментарий', 'kitstroy-moscow' )     => $payload['comment'],
	);

	if ( ! empty( $payload['object'] ) ) {
		$rows[ __( 'Объект', 'kitstroy-moscow' ) ] = $payload['object'];
	}

	if ( ! empty( $payload['systems'] ) ) {
		$rows[ __( 'Системы', 'kitstroy-moscow' ) ] = $payload['systems'];
	}

	if ( ! empty( $payload['deadline'] ) ) {
		$rows[ __( 'Срок', 'kitstroy-moscow' ) ] = $payload['deadline'];
	}

	if ( ! empty( $payload['estimate'] ) ) {
		$rows[ __( 'Предварительная смета', 'kitstroy-moscow' ) ] = $payload['estimate'];
	}

	$rows[ __( 'Дата и время', 'kitstroy-moscow' ) ]    = $payload['datetime'];
	$rows[ __( 'Источник страницы', 'kitstroy-moscow' ) ] = $payload['source_url'];

	if ( ! empty( $payload['email'] ) ) {
		$rows[ __( 'Email', 'kitstroy-moscow' ) ] = $payload['email'];
	}

	$html = '<div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:32px;color:#1f2a33;">';
	$html .= '<div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #d9e0e6;">';
	$html .= '<div style="padding:24px 28px;background:#1f2a33;color:#ffffff;">';
	$html .= '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.72;">KIT-Stroy.Moscow</div>';
	$html .= '<h2 style="margin:10px 0 0;font-size:26px;line-height:1.25;">' . esc_html__( 'Новая заявка с сайта', 'kitstroy-moscow' ) . '</h2>';
	$html .= '</div>';
	$html .= '<div style="padding:28px;">';
	$html .= '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">';

	foreach ( $rows as $label => $value ) {
		$html .= '<tr>';
		$html .= '<td style="padding:11px 0;border-bottom:1px solid #ecf0f3;width:220px;color:#687684;font-size:14px;">' . esc_html( $label ) . '</td>';
		$html .= '<td style="padding:11px 0;border-bottom:1px solid #ecf0f3;font-size:15px;color:#1f2a33;">' . esc_html( $value ) . '</td>';
		$html .= '</tr>';
	}

	$html .= '</table>';
	$html .= '</div></div></div>';

	return $html;
}

function kitstroy_send_autoreply( string $email, string $name ): void {
	if ( ! is_email( $email ) ) {
		return;
	}

	$subject = __( 'Заявка получена', 'kitstroy-moscow' );
	$message = '<div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:32px;color:#1f2a33;">';
	$message .= '<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;border:1px solid #d9e0e6;">';
	$message .= '<div style="padding:24px 28px;background:#1f2a33;color:#ffffff;"><h2 style="margin:0;font-size:24px;">' . esc_html__( 'Спасибо, заявка принята', 'kitstroy-moscow' ) . '</h2></div>';
	$message .= '<div style="padding:28px;"><p style="margin:0 0 16px;">' . esc_html( trim( $name ) . ', ' . __( 'мы получили вашу заявку и свяжемся с вами в рабочее время.', 'kitstroy-moscow' ) ) . '</p>';
	$message .= '<p style="margin:0;color:#687684;">' . esc_html__( 'Если вопрос срочный, вы можете позвонить по телефону, указанному на сайте.', 'kitstroy-moscow' ) . '</p></div></div></div>';

	wp_mail(
		$email,
		$subject,
		$message,
		array( 'Content-Type: text/html; charset=UTF-8' )
	);
}

function kitstroy_handle_form_submission(): void {
	$form_type = isset( $_POST['kitstroy_form_type'] ) ? kitstroy_get_form_type( sanitize_key( wp_unslash( $_POST['kitstroy_form_type'] ) ) ) : 'universal';
	$config    = kitstroy_get_form_config( $form_type );
	$source    = kitstroy_get_form_source_url();

	if ( ! isset( $_POST['kitstroy_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['kitstroy_nonce'] ) ), 'kitstroy_form_submit' ) ) {
		wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'error', 'kitstroy_form_type' => $form_type ), $source ) );
		exit;
	}

	$honeypot = isset( $_POST['kitstroy_website'] ) ? trim( (string) wp_unslash( $_POST['kitstroy_website'] ) ) : '';

	if ( '' !== $honeypot ) {
		wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'spam', 'kitstroy_form_type' => $form_type ), $source ) );
		exit;
	}

	$started_at = isset( $_POST['kitstroy_started_at'] ) ? absint( wp_unslash( $_POST['kitstroy_started_at'] ) ) : 0;

	if ( $started_at > 0 ) {
		$fill_time = time() - $started_at;

		if ( $fill_time < 2 || $fill_time > DAY_IN_SECONDS ) {
			wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'spam', 'kitstroy_form_type' => $form_type ), $source ) );
			exit;
		}
	}

	if ( kitstroy_is_form_rate_limited() ) {
		wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'spam', 'kitstroy_form_type' => $form_type ), $source ) );
		exit;
	}

	$recaptcha_token = isset( $_POST['kitstroy_recaptcha_token'] ) ? sanitize_text_field( wp_unslash( $_POST['kitstroy_recaptcha_token'] ) ) : '';

	if ( ! kitstroy_verify_recaptcha( $recaptcha_token ) ) {
		wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'spam', 'kitstroy_form_type' => $form_type ), $source ) );
		exit;
	}

	$name       = isset( $_POST['name'] ) ? kitstroy_normalize_form_text( wp_unslash( $_POST['name'] ), 80 ) : '';
	$patronymic = isset( $_POST['patronymic'] ) ? kitstroy_normalize_form_text( wp_unslash( $_POST['patronymic'] ), 80 ) : '';
	$phone      = isset( $_POST['phone'] ) ? kitstroy_normalize_form_text( wp_unslash( $_POST['phone'] ), 24 ) : '';
	$email      = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$comment    = isset( $_POST['comment'] ) ? sanitize_textarea_field( wp_unslash( $_POST['comment'] ) ) : '';
	$comment    = trim( $comment );
	$consent    = isset( $_POST['kitstroy_consent'] ) && '1' === (string) wp_unslash( $_POST['kitstroy_consent'] );
	$full_name  = trim( implode( ' ', array_filter( array( $name, $patronymic ) ) ) );

	if ( ! $consent || '' === $name || ! kitstroy_is_valid_phone( $phone ) ) {
		wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'error', 'kitstroy_form_type' => $form_type ), $source ) );
		exit;
	}

	if ( ! empty( $email ) && ! is_email( $email ) ) {
		wp_safe_redirect( add_query_arg( array( 'kitstroy_form_status' => 'error', 'kitstroy_form_type' => $form_type ), $source ) );
		exit;
	}

	// Шаги квиза: объект, состав систем и срок. Значения приходят из формы и попадают в письмо.
	$objects        = kitstroy_get_estimate_objects();
	$systems_catalog = kitstroy_get_estimate_systems();
	$object_key     = isset( $_POST['quiz_object'] ) ? sanitize_key( wp_unslash( $_POST['quiz_object'] ) ) : '';
	$quiz_object    = '';

	if ( '' !== $object_key && isset( $objects[ $object_key ] ) ) {
		$quiz_object = (string) $objects[ $object_key ]['label'];
	}

	$posted_systems = isset( $_POST['quiz_systems'] ) ? (array) wp_unslash( $_POST['quiz_systems'] ) : array();
	$system_labels  = array();

	foreach ( $posted_systems as $system_key ) {
		$system_key = sanitize_key( (string) $system_key );

		if ( isset( $systems_catalog[ $system_key ] ) ) {
			$system_labels[] = (string) $systems_catalog[ $system_key ]['label'];
		}
	}

	$quiz_systems  = implode( ', ', $system_labels );
	$quiz_deadline = isset( $_POST['quiz_deadline'] ) ? kitstroy_normalize_form_text( wp_unslash( $_POST['quiz_deadline'] ), 60 ) : '';
	$quiz_estimate = isset( $_POST['quiz_estimate'] ) ? kitstroy_normalize_form_text( wp_unslash( $_POST['quiz_estimate'] ), 60 ) : '';

	kitstroy_mark_form_submission();

	$reply_name  = trim( preg_replace( '/[\r\n]+/', ' ', $full_name ) );
	$reply_email = is_email( $email ) ? sanitize_email( str_replace( array( "\r", "\n" ), '', $email ) ) : '';
	$payload     = array(
		'form_label' => $config['label'],
		'name'       => $full_name,
		'phone'      => $phone,
		'email'      => $reply_email,
		'comment'    => $comment ?: __( 'Не указан', 'kitstroy-moscow' ),
		'object'     => $quiz_object,
		'systems'    => $quiz_systems,
		'deadline'   => $quiz_deadline,
		'estimate'   => $quiz_estimate,
		'datetime'   => wp_date( 'd.m.Y H:i' ),
		'source_url' => $source,
	);

	$subject = sprintf( __( 'Заявка с сайта: %s', 'kitstroy-moscow' ), $config['label'] );
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );

	if ( $reply_email ) {
		$headers[] = 'Reply-To: ' . $reply_name . ' <' . $reply_email . '>';
	}

	$sent = wp_mail(
		kitstroy_get_form_recipient(),
		$subject,
		kitstroy_build_form_email( $payload ),
		$headers
	);

	if ( $sent && $reply_email ) {
		kitstroy_send_autoreply( $reply_email, $full_name );
	}

	wp_safe_redirect(
		add_query_arg(
			array(
				'kitstroy_form_status' => $sent ? 'success' : 'error',
				'kitstroy_form_type'   => $form_type,
			),
			$source
		)
	);
	exit;
}
add_action( 'admin_post_nopriv_kitstroy_submit_form', 'kitstroy_handle_form_submission' );
add_action( 'admin_post_kitstroy_submit_form', 'kitstroy_handle_form_submission' );
