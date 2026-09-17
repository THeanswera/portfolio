<?php
/**
 * Breadcrumb builder.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_get_breadcrumb_items(): array {
	$items   = array();
	$items[] = array(
		'label' => __( 'Главная', 'kitstroy-moscow' ),
		'url'   => home_url( '/' ),
	);

	if ( is_front_page() ) {
		return $items;
	}

	if ( is_home() ) {
		$items[] = array( 'label' => __( 'Блог', 'kitstroy-moscow' ), 'url' => '' );
		return $items;
	}

	if ( is_post_type_archive( 'service' ) ) {
		$items[] = array( 'label' => __( 'Услуги', 'kitstroy-moscow' ), 'url' => '' );
		return $items;
	}

	if ( is_singular( 'service' ) ) {
		$items[] = array( 'label' => __( 'Услуги', 'kitstroy-moscow' ), 'url' => get_post_type_archive_link( 'service' ) );
		$items[] = array( 'label' => get_the_title(), 'url' => '' );
		return $items;
	}

	if ( is_post_type_archive( 'portfolio' ) ) {
		$items[] = array( 'label' => __( 'Портфолио', 'kitstroy-moscow' ), 'url' => '' );
		return $items;
	}

	if ( is_singular( 'portfolio' ) ) {
		$items[] = array( 'label' => __( 'Портфолио', 'kitstroy-moscow' ), 'url' => get_post_type_archive_link( 'portfolio' ) );
		$items[] = array( 'label' => get_the_title(), 'url' => '' );
		return $items;
	}

	if ( is_singular( 'post' ) ) {
		$items[] = array( 'label' => __( 'Блог', 'kitstroy-moscow' ), 'url' => get_permalink( get_option( 'page_for_posts' ) ) ?: get_post_type_archive_link( 'post' ) );
		$items[] = array( 'label' => get_the_title(), 'url' => '' );
		return $items;
	}

	if ( is_page() ) {
		$ancestors = array_reverse( get_post_ancestors( get_the_ID() ) );

		foreach ( $ancestors as $ancestor_id ) {
			$items[] = array(
				'label' => get_the_title( $ancestor_id ),
				'url'   => get_permalink( $ancestor_id ),
			);
		}

		$items[] = array( 'label' => get_the_title(), 'url' => '' );
		return $items;
	}

	if ( is_archive() ) {
		$items[] = array( 'label' => post_type_archive_title( '', false ) ?: single_cat_title( '', false ), 'url' => '' );
		return $items;
	}

	if ( is_search() ) {
		$items[] = array( 'label' => sprintf( __( 'Поиск: %s', 'kitstroy-moscow' ), get_search_query() ), 'url' => '' );
		return $items;
	}

	if ( is_404() ) {
		$items[] = array( 'label' => __( 'Страница не найдена', 'kitstroy-moscow' ), 'url' => '' );
	}

	return $items;
}

function kitstroy_breadcrumbs(): void {
	$items = kitstroy_get_breadcrumb_items();

	/**
	 * Filters the breadcrumb items before they are rendered.
	 *
	 * @param array<int, array<string, string>> $items Breadcrumb items.
	 */
	$items = apply_filters( 'kitstroy_breadcrumb_items', $items );

	if ( count( $items ) <= 1 ) {
		return;
	}

	get_template_part(
		'template-parts/ui/breadcrumbs',
		null,
		array(
			'items' => $items,
		)
	);
}
