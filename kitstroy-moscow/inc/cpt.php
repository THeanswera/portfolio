<?php
/**
 * Register custom post types.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_register_post_types(): void {
	register_post_type(
		'service',
		array(
			'labels'             => array(
				'name'               => __( 'Услуги', 'kitstroy-moscow' ),
				'singular_name'      => __( 'Услуга', 'kitstroy-moscow' ),
				'add_new_item'       => __( 'Добавить услугу', 'kitstroy-moscow' ),
				'edit_item'          => __( 'Редактировать услугу', 'kitstroy-moscow' ),
				'new_item'           => __( 'Новая услуга', 'kitstroy-moscow' ),
				'view_item'          => __( 'Смотреть услугу', 'kitstroy-moscow' ),
				'search_items'       => __( 'Найти услугу', 'kitstroy-moscow' ),
				'not_found'          => __( 'Услуги не найдены', 'kitstroy-moscow' ),
				'not_found_in_trash' => __( 'В корзине услуг нет', 'kitstroy-moscow' ),
				'menu_name'          => __( 'Услуги', 'kitstroy-moscow' ),
			),
			'public'             => true,
			'has_archive'        => 'services',
			'show_in_rest'       => true,
			'menu_icon'          => 'dashicons-admin-tools',
			'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ),
			'rewrite'            => array(
				'slug'       => 'services',
				'with_front' => false,
			),
			'menu_position'      => 20,
			'publicly_queryable' => true,
		)
	);

	register_post_type(
		'portfolio',
		array(
			'labels'             => array(
				'name'               => __( 'Портфолио', 'kitstroy-moscow' ),
				'singular_name'      => __( 'Проект', 'kitstroy-moscow' ),
				'add_new_item'       => __( 'Добавить проект', 'kitstroy-moscow' ),
				'edit_item'          => __( 'Редактировать проект', 'kitstroy-moscow' ),
				'new_item'           => __( 'Новый проект', 'kitstroy-moscow' ),
				'view_item'          => __( 'Смотреть проект', 'kitstroy-moscow' ),
				'search_items'       => __( 'Найти проект', 'kitstroy-moscow' ),
				'not_found'          => __( 'Проекты не найдены', 'kitstroy-moscow' ),
				'not_found_in_trash' => __( 'В корзине проектов нет', 'kitstroy-moscow' ),
				'menu_name'          => __( 'Портфолио', 'kitstroy-moscow' ),
			),
			'public'             => true,
			'has_archive'        => 'portfolio',
			'show_in_rest'       => true,
			'menu_icon'          => 'dashicons-portfolio',
			'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ),
			'rewrite'            => array(
				'slug'       => 'portfolio',
				'with_front' => false,
			),
			'menu_position'      => 21,
			'publicly_queryable' => true,
		)
	);
}
add_action( 'init', 'kitstroy_register_post_types' );
