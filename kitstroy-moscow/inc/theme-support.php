<?php
/**
 * Theme compatibility features.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_enable_elementor_support(): void {
	add_post_type_support( 'page', 'excerpt' );
	add_post_type_support( 'service', 'excerpt' );
	add_post_type_support( 'portfolio', 'excerpt' );
}
add_action( 'init', 'kitstroy_enable_elementor_support' );

function kitstroy_register_elementor_locations( $elementor_theme_manager ): void {
	if ( is_object( $elementor_theme_manager ) && method_exists( $elementor_theme_manager, 'register_all_core_location' ) ) {
		$elementor_theme_manager->register_all_core_location();
	}
}
add_action( 'elementor/theme/register_locations', 'kitstroy_register_elementor_locations' );

function kitstroy_body_classes( array $classes ): array {
	if ( is_front_page() ) {
		$classes[] = 'is-front-page';
	}

	if ( is_singular( 'service' ) ) {
		$classes[] = 'single-service-page';
	}

	if ( is_singular( 'portfolio' ) ) {
		$classes[] = 'single-portfolio-page';
	}

	if ( wp_is_mobile() ) {
		$classes[] = 'is-mobile-device';
	}

	return $classes;
}
add_filter( 'body_class', 'kitstroy_body_classes' );

function kitstroy_pingback_header(): void {
	if ( is_singular() && pings_open() ) {
		printf( '<link rel="pingback" href="%s">', esc_url( get_bloginfo( 'pingback_url' ) ) );
	}
}
add_action( 'wp_head', 'kitstroy_pingback_header' );
