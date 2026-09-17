<?php
/**
 * Enqueue styles and scripts.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_asset_version( string $relative_path ): string {
	$file_path = KITSTROY_THEME_PATH . $relative_path;

	if ( file_exists( $file_path ) ) {
		return (string) filemtime( $file_path );
	}

	return KITSTROY_THEME_VERSION;
}

function kitstroy_enqueue_assets(): void {
	$recaptcha_site_key = kitstroy_get_theme_option( 'recaptcha_site_key', '' );
	$forms_dependencies = array( 'kitstroy-main' );

	wp_enqueue_style(
		'kitstroy-main',
		KITSTROY_THEME_URL . '/assets/dist/css/main.css',
		array(),
		kitstroy_asset_version( '/assets/dist/css/main.css' )
	);

	wp_enqueue_style( 'kitstroy-theme-style', get_stylesheet_uri(), array( 'kitstroy-main' ), KITSTROY_THEME_VERSION );

	wp_enqueue_script(
		'kitstroy-main',
		KITSTROY_THEME_URL . '/assets/dist/js/main.js',
		array(),
		kitstroy_asset_version( '/assets/dist/js/main.js' ),
		true
	);

	wp_enqueue_script(
		'kitstroy-mobile-menu',
		KITSTROY_THEME_URL . '/assets/dist/js/mobile-menu.js',
		array( 'kitstroy-main' ),
		kitstroy_asset_version( '/assets/dist/js/mobile-menu.js' ),
		true
	);

	wp_enqueue_script(
		'kitstroy-modal',
		KITSTROY_THEME_URL . '/assets/dist/js/modal.js',
		array( 'kitstroy-main' ),
		kitstroy_asset_version( '/assets/dist/js/modal.js' ),
		true
	);

	wp_enqueue_script(
		'kitstroy-calculator',
		KITSTROY_THEME_URL . '/assets/dist/js/calculator.js',
		array( 'kitstroy-main' ),
		kitstroy_asset_version( '/assets/dist/js/calculator.js' ),
		true
	);

	wp_enqueue_script(
		'kitstroy-quiz',
		KITSTROY_THEME_URL . '/assets/dist/js/quiz.js',
		array( 'kitstroy-main' ),
		kitstroy_asset_version( '/assets/dist/js/quiz.js' ),
		true
	);

	if ( $recaptcha_site_key ) {
		wp_enqueue_script(
			'kitstroy-recaptcha',
			'https://www.google.com/recaptcha/api.js?render=' . rawurlencode( $recaptcha_site_key ),
			array(),
			null,
			true
		);

		$forms_dependencies[] = 'kitstroy-recaptcha';
	}

	wp_enqueue_script(
		'kitstroy-forms',
		KITSTROY_THEME_URL . '/assets/dist/js/forms.js',
		$forms_dependencies,
		kitstroy_asset_version( '/assets/dist/js/forms.js' ),
		true
	);

	wp_localize_script(
		'kitstroy-main',
		'kitstroyTheme',
		array(
			'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
			'adminPostUrl' => admin_url( 'admin-post.php' ),
			'phoneMask'    => '+7 (___) ___-__-__',
			'successText'  => __( 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'kitstroy-moscow' ),
			'errorText'    => __( 'Не удалось отправить форму. Проверьте поля и повторите попытку.', 'kitstroy-moscow' ),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'kitstroy_enqueue_assets' );
