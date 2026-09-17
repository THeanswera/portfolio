<?php
/**
 * Register custom taxonomies and defaults.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_register_taxonomies(): void {
	register_taxonomy(
		'service_category',
		array( 'service' ),
		array(
			'labels'            => array(
				'name'          => __( 'Категории услуг', 'kitstroy-moscow' ),
				'singular_name' => __( 'Категория услуги', 'kitstroy-moscow' ),
				'menu_name'     => __( 'Категории услуг', 'kitstroy-moscow' ),
			),
			'public'            => true,
			'hierarchical'      => true,
			'show_in_rest'      => true,
			'rewrite'           => array(
				'slug'       => 'services/category',
				'with_front' => false,
			),
			'show_admin_column' => true,
		)
	);

	register_taxonomy(
		'portfolio_type',
		array( 'portfolio' ),
		array(
			'labels'            => array(
				'name'          => __( 'Типы объектов', 'kitstroy-moscow' ),
				'singular_name' => __( 'Тип объекта', 'kitstroy-moscow' ),
				'menu_name'     => __( 'Типы объектов', 'kitstroy-moscow' ),
			),
			'public'            => true,
			'hierarchical'      => true,
			'show_in_rest'      => true,
			'rewrite'           => array(
				'slug'       => 'portfolio/type',
				'with_front' => false,
			),
			'show_admin_column' => true,
		)
	);
}
add_action( 'init', 'kitstroy_register_taxonomies' );

function kitstroy_register_default_terms(): void {
	$portfolio_terms = array(
		'Дома'        => 'doma',
		'Офисы'       => 'ofisy',
		'Производство' => 'proizvodstvo',
	);

	foreach ( $portfolio_terms as $name => $slug ) {
		if ( ! term_exists( $name, 'portfolio_type' ) ) {
			wp_insert_term( $name, 'portfolio_type', array( 'slug' => $slug ) );
		}
	}

	$service_terms = array(
		'Электромонтаж',
		'Пожарные системы',
		'Слаботочные системы',
		'Щитовое оборудование',
		'Пусконаладка',
	);

	foreach ( $service_terms as $service_term ) {
		if ( ! term_exists( $service_term, 'service_category' ) ) {
			wp_insert_term( $service_term, 'service_category' );
		}
	}
}

function kitstroy_register_default_categories(): void {
	$categories = array(
		'Электробезопасность' => 'elektrobezopasnost',
		'Советы'              => 'sovety',
		'Новости компании'    => 'novosti-kompanii',
	);

	foreach ( $categories as $name => $slug ) {
		if ( ! term_exists( $name, 'category' ) ) {
			wp_insert_term(
				$name,
				'category',
				array(
					'slug'        => $slug,
					'description' => '',
				)
			);
		}
	}
}
