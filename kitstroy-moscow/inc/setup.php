<?php
/**
 * Theme setup routines.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_setup_theme(): void {
	load_theme_textdomain( 'kitstroy-moscow', KITSTROY_THEME_PATH . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 72,
			'width'       => 220,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'assets/dist/css/main.css' );

	register_nav_menus(
		array(
			'primary' => __( 'Основное меню', 'kitstroy-moscow' ),
			'footer'  => __( 'Меню в футере', 'kitstroy-moscow' ),
		)
	);

	add_image_size( 'kitstroy-card', 720, 480, true );
	add_image_size( 'kitstroy-hero', 1600, 900, true );
	add_image_size( 'kitstroy-square', 960, 960, true );
}
add_action( 'after_setup_theme', 'kitstroy_setup_theme' );

function kitstroy_content_width(): void {
	$GLOBALS['content_width'] = 760;
}
add_action( 'after_setup_theme', 'kitstroy_content_width', 0 );

function kitstroy_after_switch_theme(): void {
	kitstroy_register_default_terms();
	kitstroy_register_default_categories();
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'kitstroy_after_switch_theme' );
