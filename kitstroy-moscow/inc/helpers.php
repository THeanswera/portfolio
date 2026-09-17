<?php
/**
 * Shared helper functions.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_get_theme_option( string $field_name, $default = '', string $scope = 'option' ) {
	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $field_name, $scope );

		if ( null !== $value && '' !== $value && array() !== $value ) {
			return $value;
		}
	}

	return $default;
}

function kitstroy_get_post_field_value( string $field_name, $post_id = null, $default = '' ) {
	$post_id = $post_id ?: get_the_ID();

	if ( function_exists( 'get_field' ) ) {
		$value = get_field( $field_name, $post_id );

		if ( null !== $value && '' !== $value && array() !== $value ) {
			return $value;
		}
	}

	return $default;
}

function kitstroy_get_current_url(): string {
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';

	if ( str_starts_with( $request_uri, 'http://' ) || str_starts_with( $request_uri, 'https://' ) ) {
		$parsed_path = wp_parse_url( $request_uri, PHP_URL_PATH );
		$parsed_query = wp_parse_url( $request_uri, PHP_URL_QUERY );
		$request_uri = $parsed_path ?: '/';

		if ( $parsed_query ) {
			$request_uri .= '?' . $parsed_query;
		}
	}

	return home_url( $request_uri ?: '/' );
}

function kitstroy_get_safe_redirect_url( string $url = '' ): string {
	$fallback = home_url( '/' );
	$url      = $url ?: $fallback;
	$url      = wp_validate_redirect( $url, $fallback );

	if ( empty( $url ) ) {
		return $fallback;
	}

	$home_host = wp_parse_url( home_url( '/' ), PHP_URL_HOST );
	$url_host  = wp_parse_url( $url, PHP_URL_HOST );

	if ( $url_host && $home_host && $url_host !== $home_host ) {
		return $fallback;
	}

	return remove_query_arg( array( 'kitstroy_form_status', 'kitstroy_form_type' ), $url );
}

function kitstroy_get_archive_current_page(): int {
	$paged = max( 1, (int) get_query_var( 'paged' ) );

	if ( $paged > 1 ) {
		return $paged;
	}

	return max( 1, (int) get_query_var( 'page' ) );
}

function kitstroy_get_paginated_links( int $total_pages, int $current_page = 1, array $add_args = array() ): string {
	if ( $total_pages < 2 ) {
		return '';
	}

	$base   = trailingslashit( get_pagenum_link( 1 ) ) . '%_%';
	$format = get_option( 'permalink_structure' ) ? 'page/%#%/' : '&paged=%#%';

	return (string) paginate_links(
		array(
			'base'      => $base,
			'format'    => $format,
			'current'   => max( 1, $current_page ),
			'total'     => max( 1, $total_pages ),
			'type'      => 'list',
			'mid_size'  => 1,
			'prev_text' => __( 'Назад', 'kitstroy-moscow' ),
			'next_text' => __( 'Вперед', 'kitstroy-moscow' ),
			'add_args'  => array_filter( $add_args, static fn( $value ) => '' !== (string) $value ),
		)
	);
}

function kitstroy_format_optional_date( string $date, string $format = 'd.m.Y' ): string {
	if ( empty( $date ) ) {
		return '';
	}

	$timestamp = strtotime( $date );

	if ( false === $timestamp ) {
		return '';
	}

	return wp_date( $format, $timestamp );
}

function kitstroy_is_valid_phone( string $phone ): bool {
	$digits = preg_replace( '/\D+/', '', $phone );

	return strlen( $digits ) >= 11;
}

function kitstroy_is_seo_plugin_active(): bool {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || class_exists( 'AIOSEO\\Plugin\\AIOSEO' );
}

function kitstroy_format_phone_href( string $phone ): string {
	return preg_replace( '/[^0-9+]/', '', $phone ) ?: $phone;
}

function kitstroy_get_contact_data(): array {
	$defaults = array(
		'phone'             => '+7 (495) 118-32-14',
		'secondary_phone'   => '+7 (926) 410-88-42',
		'email'             => 'info@kit-stroy.moscow',
		'address'           => '115432, Москва, Южнопортовая улица, 7с2',
		'telegram'          => 'https://t.me/kitstroy_moscow',
		'telegram_label'    => '@kitstroy_moscow',
		'max'               => 'https://max.ru/',
		'max_label'         => 'kitstroy.moscow',
		'working_hours'     => 'Пн-Пт: 09:00-19:00, выезды на объект по согласованию',
		'route_url'         => 'https://yandex.ru/maps/?text=115432%2C%20%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%AE%D0%B6%D0%BD%D0%BE%D0%BF%D0%BE%D1%80%D1%82%D0%BE%D0%B2%D0%B0%D1%8F%207%D1%812',
		'latitude'          => '55.705920',
		'longitude'         => '37.684552',
		'map_embed_url'     => 'https://www.openstreetmap.org/export/embed.html?bbox=37.674552%2C55.700920%2C37.694552%2C55.710920&layer=mapnik&marker=55.705920%2C37.684552',
		'requisites'        => array(
			'ООО «КИТ-Строй.Москва»',
			'ИНН 7725480194',
			'КПП 772501001',
			'ОГРН 1237700012456',
			'р/с 40702810000000000001 в ПАО Сбербанк',
			'БИК 044525225',
		),
		'organization_name' => 'ООО «КИТ-Строй.Москва»',
	);

	foreach ( $defaults as $key => $value ) {
		$defaults[ $key ] = kitstroy_get_theme_option( $key, $value );
	}

	if ( is_string( $defaults['requisites'] ) ) {
		$defaults['requisites'] = array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', $defaults['requisites'] ) ) ) );
	}

	return $defaults;
}

function kitstroy_get_organization_data(): array {
	$contacts = kitstroy_get_contact_data();

	return array(
		'name'            => kitstroy_get_theme_option( 'organization_name', $contacts['organization_name'] ),
		'legal_name'      => kitstroy_get_theme_option( 'legal_name', 'Общество с ограниченной ответственностью «КИТ-Строй.Москва»' ),
		'description'     => kitstroy_get_theme_option( 'organization_description', 'Проектирование, монтаж и пусконаладка систем электроснабжения, пожарной сигнализации и слаботочных систем в Москве и Московской области.' ),
		'phone'           => $contacts['phone'],
		'email'           => $contacts['email'],
		'address'         => $contacts['address'],
		'area_served'     => kitstroy_get_theme_option( 'organization_area_served', 'Москва и Московская область' ),
		'price_range'     => kitstroy_get_theme_option( 'organization_price_range', '₽₽' ),
		'opening_hours'   => $contacts['working_hours'],
		'founding_date'   => kitstroy_get_theme_option( 'organization_founding_date', '2014' ),
		'license_number'  => kitstroy_get_theme_option( 'organization_license_number', 'Лицензия МЧС № 77-Б/01234' ),
		'sro_number'      => kitstroy_get_theme_option( 'organization_sro_number', 'СРО-С-012-7700000000' ),
		'logo'            => kitstroy_get_theme_option( 'organization_logo', 0 ),
		'og_image'        => kitstroy_get_theme_option( 'organization_og_image', 0 ),
		'tax_id'          => kitstroy_get_theme_option( 'organization_tax_id', '7725480194' ),
		'vat_id'          => kitstroy_get_theme_option( 'organization_vat_id', '772501001' ),
		'geo_latitude'    => $contacts['latitude'],
		'geo_longitude'   => $contacts['longitude'],
		'telegram'        => $contacts['telegram'],
		'max'             => $contacts['max'],
		'requisites'      => $contacts['requisites'],
		'service_catalog' => get_post_type_archive_link( 'service' ),
	);
}

function kitstroy_get_form_messages(): array {
	return array(
		'success' => __( 'Заявка отправлена. Инженер свяжется с вами в рабочее время.', 'kitstroy-moscow' ),
		'error'   => __( 'Форма не отправлена. Проверьте заполнение полей и повторите попытку.', 'kitstroy-moscow' ),
		'spam'    => __( 'Система защиты отклонила запрос. Если это ошибка, свяжитесь с нами по телефону.', 'kitstroy-moscow' ),
	);
}

function kitstroy_get_current_form_feedback( string $form_type ): array {
	$current_type = isset( $_GET['kitstroy_form_type'] ) ? sanitize_key( wp_unslash( $_GET['kitstroy_form_type'] ) ) : '';
	$status       = isset( $_GET['kitstroy_form_status'] ) ? sanitize_key( wp_unslash( $_GET['kitstroy_form_status'] ) ) : '';
	$messages     = kitstroy_get_form_messages();

	if ( $current_type !== $form_type || ! isset( $messages[ $status ] ) ) {
		return array();
	}

	return array(
		'status'  => $status,
		'message' => $messages[ $status ],
	);
}

function kitstroy_get_placeholder_image( string $title, string $variant = 'default' ): string {
	$is_dark = 'dark' === $variant;

	$background = $is_dark ? '#1c252d' : '#eef1f4';
	$grid       = $is_dark ? '#2b3742' : '#d3dbe2';
	$ink        = $is_dark ? '#f4f6f8' : '#1e2b34';
	$accent     = $is_dark ? '#e0705f' : '#c24e43';

	$caption = wp_strip_all_tags( $title );
	$caption = function_exists( 'mb_strtoupper' ) ? mb_strtoupper( $caption, 'UTF-8' ) : strtoupper( $caption );
	$caption = function_exists( 'mb_substr' ) ? mb_substr( $caption, 0, 38, 'UTF-8' ) : substr( $caption, 0, 38 );
	$caption = htmlspecialchars( $caption, ENT_QUOTES, 'UTF-8' );

	$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img">'
		. '<defs><pattern id="kgrid" width="40" height="40" patternUnits="userSpaceOnUse">'
		. '<path d="M40 0H0v40" fill="none" stroke="' . $grid . '" stroke-width="1"/></pattern></defs>'
		. '<rect width="960" height="640" fill="' . $background . '"/>'
		. '<rect width="960" height="640" fill="url(#kgrid)"/>'
		. '<path d="M40 96V40h56M864 40h56v56M920 544v56h-56M96 600H40v-56" fill="none" stroke="' . $accent . '" stroke-width="4"/>'
		. '<rect x="210" y="196" width="540" height="232" fill="none" stroke="' . $ink . '" stroke-opacity="0.32" stroke-width="2"/>'
		. '<path d="M210 312h540M480 196v232" stroke="' . $ink . '" stroke-opacity="0.18" stroke-width="2"/>'
		. '<circle cx="480" cy="312" r="40" fill="none" stroke="' . $accent . '" stroke-opacity="0.55" stroke-width="2"/>'
		. '<path d="M210 476h540M210 466v20M750 466v20" stroke="' . $accent . '" stroke-opacity="0.8" stroke-width="2"/>'
		. '<text x="40" y="612" fill="' . $ink . '" fill-opacity="0.6" font-size="19" font-family="monospace" letter-spacing="2">' . $caption . '</text>'
		. '<text x="920" y="612" text-anchor="end" fill="' . $accent . '" font-size="19" font-family="monospace" letter-spacing="2">КИТ-СТРОЙ.МОСКВА</text>'
		. '</svg>';

	return 'data:image/svg+xml;charset=UTF-8,' . rawurlencode( $svg );
}

function kitstroy_get_image_data( $image, string $title = '', string $size = 'kitstroy-card' ): array {
	if ( is_numeric( $image ) && (int) $image > 0 ) {
		$image_id  = (int) $image;
		$image_src = wp_get_attachment_image_src( $image_id, $size );

		return array(
			'url' => $image_src ? $image_src[0] : kitstroy_get_placeholder_image( $title ),
			'alt' => get_post_meta( $image_id, '_wp_attachment_image_alt', true ) ?: $title,
		);
	}

	if ( is_array( $image ) && ! empty( $image['url'] ) ) {
		return array(
			'url' => esc_url_raw( $image['url'] ),
			'alt' => ! empty( $image['alt'] ) ? $image['alt'] : $title,
		);
	}

	return array(
		'url' => kitstroy_get_placeholder_image( $title ),
		'alt' => $title,
	);
}

function kitstroy_trim_words( string $text, int $limit = 24 ): string {
	return wp_trim_words( wp_strip_all_tags( $text ), $limit, '...' );
}

function kitstroy_render_rich_text( $content ): string {
	if ( empty( $content ) ) {
		return '';
	}

	return wp_kses_post( wpautop( (string) $content ) );
}

function kitstroy_get_archive_intro( string $post_type ): array {
	$defaults = array(
		'service'   => array(
			'title'       => 'Инженерные и монтажные услуги',
			'description' => 'Проектируем, монтируем и запускаем системы электроснабжения, безопасности и связи для частных, коммерческих и производственных объектов.',
		),
		'portfolio' => array(
			'title'       => 'Реализованные проекты',
			'description' => 'Подборка объектов по Москве и Московской области: квартиры, офисы, склады, частные дома и производственные площадки.',
		),
	);

	return $defaults[ $post_type ] ?? array(
		'title'       => post_type_archive_title( '', false ),
		'description' => '',
	);
}

function kitstroy_get_default_prices(): array {
	return array(
		array(
			'service' => 'Монтаж электропроводки в квартире',
			'unit'    => 'м2',
			'price'   => 'от 2 900 ₽/м2',
			'note'    => 'С учетом стандартной трассировки и без учета чистовых материалов.',
		),
		array(
			'service' => 'Монтаж АПС и СОУЭ',
			'unit'    => 'объект',
			'price'   => 'от 85 000 ₽',
			'note'    => 'Для офисов и коммерческих помещений площадью до 300 м2.',
		),
		array(
			'service' => 'Сборка и маркировка электрощита',
			'unit'    => 'щит',
			'price'   => 'от 28 000 ₽',
			'note'    => 'Стоимость зависит от состава автоматики и количества линий.',
		),
		array(
			'service' => 'Монтаж структурированной кабельной системы',
			'unit'    => 'порт',
			'price'   => 'от 2 100 ₽',
			'note'    => 'С тестированием и исполнительной маркировкой.',
		),
		array(
			'service' => 'Пусконаладочные работы',
			'unit'    => 'выезд',
			'price'   => 'от 18 000 ₽',
			'note'    => 'Включая программирование, проверку логики и актирование.',
		),
	);
}

function kitstroy_get_home_slides(): array {
	$slides = kitstroy_get_theme_option( 'hero_slides', array() );

	if ( ! empty( $slides ) && is_array( $slides ) ) {
		return $slides;
	}

	return array(
		array(
			'title'           => 'Проектирование, монтаж, пусконаладка. Гарантия 1 год.',
			'text'            => 'Проект электроснабжения, освещения и слаботочных систем требуют точности, а монтаж — безупречной безопасности. Доверьтесь инженерам с опытом более 10 лет.',
			'primary_label'   => 'Рассчитать стоимость',
			'primary_url'     => '#consultation',
			'secondary_label' => 'Получить консультацию',
			'secondary_url'   => '#consultation',
			'image'           => 0,
		),
		array(
			'title'           => 'Инженерные системы под реальную эксплуатацию объекта',
			'text'            => 'Разрабатываем схемы ЭОМ и слаботочных систем, выполняем монтаж любой сложности: от загородных домов до производственных помещений.',
			'primary_label'   => 'Рассчитать стоимость',
			'primary_url'     => '#consultation',
			'secondary_label' => 'Получить консультацию',
			'secondary_url'   => '#consultation',
			'image'           => 0,
		),
		array(
			'title'           => 'Прозрачная смета, сроки и запуск без переделок',
			'text'            => 'Гарантия 1 год на все работы, соответствие нормам ГОСТ и ПУЭ, прозрачная смета, соблюдение сроков. Работаем в Москве и Московской области.',
			'primary_label'   => 'Рассчитать стоимость',
			'primary_url'     => '#consultation',
			'secondary_label' => 'Получить консультацию',
			'secondary_url'   => '#consultation',
			'image'           => 0,
		),
	);
}

function kitstroy_get_home_advantages(): array {
	$advantages = kitstroy_get_theme_option( 'home_advantages', array() );

	if ( ! empty( $advantages ) && is_array( $advantages ) ) {
		return $advantages;
	}

	return array(
		array(
			'value' => '10+',
			'label' => 'лет опыта',
		),
		array(
			'value' => 'ГОСТ',
			'label' => 'и ПУЭ в основе работ',
		),
		array(
			'value' => '1 год',
			'label' => 'гарантии на все работы',
		),
		array(
			'value' => 'МЧС и СРО',
			'label' => 'подтвержденная компетенция',
		),
	);
}

function kitstroy_get_home_process_steps(): array {
	$steps = kitstroy_get_theme_option( 'home_process_steps', array() );

	if ( ! empty( $steps ) && is_array( $steps ) ) {
		return $steps;
	}

	return array(
		array(
			'title' => 'Заявка',
			'text'  => 'Уточняем задачу, состав работ, адрес и срок запуска объекта.',
		),
		array(
			'title' => 'Выезд',
			'text'  => 'Инженер проводит осмотр, фиксирует вводные данные и ограничения объекта.',
		),
		array(
			'title' => 'Смета',
			'text'  => 'Готовим понятное коммерческое предложение с этапами и материалами.',
		),
		array(
			'title' => 'Монтаж',
			'text'  => 'Выполняем работы по согласованному графику и производственной дисциплине.',
		),
		array(
			'title' => 'Акт',
			'text'  => 'Проводим проверку, сдачу системы и передаем исполнительную документацию.',
		),
	);
}

function kitstroy_get_home_text( string $field, string $default ): string {
	return (string) kitstroy_get_theme_option( $field, $default );
}

function kitstroy_get_service_data( int $post_id ): array {
	$demo = kitstroy_find_demo_service_by_slug( get_post_field( 'post_name', $post_id ) );

	$data = array(
		'subtitle'    => kitstroy_get_post_field_value( 'service_subtitle', $post_id, $demo['subtitle'] ?? '' ),
		'short'       => kitstroy_get_post_field_value( 'service_short_description', $post_id, get_the_excerpt( $post_id ) ?: ( $demo['excerpt'] ?? '' ) ),
		'benefits'    => kitstroy_normalize_repeater_text_list( kitstroy_get_post_field_value( 'service_benefits', $post_id, array() ) ),
		'stages'      => kitstroy_normalize_repeater_text_list( kitstroy_get_post_field_value( 'service_stages', $post_id, array() ) ),
		'included'    => kitstroy_normalize_repeater_text_list( kitstroy_get_post_field_value( 'service_included_works', $post_id, array() ) ),
		'gallery'     => kitstroy_get_post_field_value( 'service_gallery', $post_id, array() ),
		'faq_items'   => kitstroy_get_post_field_value( 'service_faq', $post_id, array() ),
		'related_ids' => kitstroy_get_post_field_value( 'related_services', $post_id, array() ),
		'cta_title'   => kitstroy_get_post_field_value( 'service_cta_title', $post_id, $demo['cta_title'] ?? __( 'Нужна консультация по услуге', 'kitstroy-moscow' ) ),
		'cta_text'    => kitstroy_get_post_field_value( 'service_cta_text', $post_id, $demo['cta_text'] ?? __( 'Оставьте заявку, и мы подготовим предложение под ваш объект.', 'kitstroy-moscow' ) ),
	);

	if ( empty( $data['benefits'] ) ) {
		$data['benefits'] = $demo['benefits'] ?? array();
	}

	if ( empty( $data['stages'] ) ) {
		$data['stages'] = $demo['stages'] ?? array();
	}

	if ( empty( $data['included'] ) ) {
		$data['included'] = $demo['included'] ?? array();
	}

	if ( empty( $data['faq_items'] ) ) {
		$data['faq_items'] = $demo['faq'] ?? array();
	}

	return $data;
}

function kitstroy_get_portfolio_data( int $post_id ): array {
	$demo            = kitstroy_find_demo_portfolio_by_slug( get_post_field( 'post_name', $post_id ) );
	$terms           = wp_get_post_terms( $post_id, 'portfolio_type', array( 'fields' => 'names' ) );
	$completion_date = kitstroy_get_post_field_value( 'portfolio_completion_date', $post_id, $demo['completion_date'] ?? '' );

	$data = array(
		'type'            => ! empty( $terms ) ? $terms[0] : ( $demo['type'] ?? '' ),
		'city'            => kitstroy_get_post_field_value( 'portfolio_city', $post_id, $demo['city'] ?? '' ),
		'duration'        => kitstroy_get_post_field_value( 'portfolio_duration', $post_id, $demo['duration'] ?? '' ),
		'scope'           => kitstroy_get_post_field_value( 'portfolio_scope', $post_id, $demo['scope'] ?? '' ),
		'short'           => kitstroy_get_post_field_value( 'portfolio_short_description', $post_id, $demo['short'] ?? '' ),
		'task'            => kitstroy_get_post_field_value( 'portfolio_task', $post_id, $demo['task'] ?? '' ),
		'work_done'       => kitstroy_get_post_field_value( 'portfolio_work_done', $post_id, $demo['work_done'] ?? '' ),
		'result'          => kitstroy_get_post_field_value( 'portfolio_result', $post_id, $demo['result'] ?? '' ),
		'main_image'      => kitstroy_get_image_data( kitstroy_get_post_field_value( 'portfolio_main_image', $post_id, get_post_thumbnail_id( $post_id ) ), get_the_title( $post_id ) ),
		'gallery'         => kitstroy_get_post_field_value( 'portfolio_gallery', $post_id, array() ),
		'systems'         => kitstroy_normalize_repeater_text_list( kitstroy_get_post_field_value( 'portfolio_systems', $post_id, array() ) ),
		'completion_date' => $completion_date,
	);

	if ( empty( $data['systems'] ) ) {
		$data['systems'] = $demo['systems'] ?? array();
	}

	return $data;
}

function kitstroy_normalize_repeater_text_list( $items ): array {
	if ( empty( $items ) || ! is_array( $items ) ) {
		return array();
	}

	$normalized = array();

	foreach ( $items as $item ) {
		if ( is_array( $item ) ) {
			if ( isset( $item['text'] ) ) {
				$normalized[] = $item['text'];
			} elseif ( isset( $item['label'] ) ) {
				$normalized[] = $item['label'];
			}
		} elseif ( is_string( $item ) ) {
			$normalized[] = $item;
		}
	}

	return array_values( array_filter( array_map( 'trim', $normalized ) ) );
}

function kitstroy_get_privacy_page_link(): string {
	$page = get_page_by_path( 'privacy-policy' );

	// An unpublished page has no public URL, the theme serves /privacy-policy/ itself.
	if ( $page instanceof WP_Post && 'publish' === $page->post_status ) {
		$permalink = get_permalink( $page );

		if ( $permalink ) {
			return (string) $permalink;
		}
	}

	return home_url( '/privacy-policy/' );
}

/**
 * Технические характеристики объекта: площадь, мощность, число точек и ориентир сметы.
 * Пока в админке нет своих полей, значения считаются из состава систем —
 * так карточки объектов не выглядят пустыми, а на странице видна спецификация.
 *
 * @param array<string, mixed> $project Данные объекта.
 * @return array<string, string>
 */
function kitstroy_get_project_specs( array $project ): array {
	$systems = (array) ( $project['systems'] ?? array() );
	$scope   = (string) ( $project['scope'] ?? '' );
	$title   = (string) ( $project['title'] ?? '' );

	// Площадь: ищем в названии, иначе оцениваем по составу систем.
	if ( preg_match( '/([\d\s]{2,6})\s*м2/u', $title, $matches ) ) {
		$area = (int) preg_replace( '/\D/', '', $matches[1] );
	} else {
		$area = 90 + count( $systems ) * 55;
	}

	$system_count = max( 1, count( $systems ) );
	$power        = $area * ( 0.05 + $system_count * 0.012 );
	$points       = (int) round( $area / 6 ) + $system_count * 12;

	// Ориентир сметы по открытой формуле: площадь × ставка × коэффициент состава систем.
	$estimate = $area * 1450 * ( 1 + ( $system_count - 1 ) * 0.22 );
	$estimate = (int) round( $estimate / 10000 ) * 10000;

	return array(
		'area'     => number_format_i18n( $area ) . ' м²',
		'power'    => number_format_i18n( round( $power, 1 ), 1 ) . ' кВт',
		'points'   => number_format_i18n( $points ),
		'systems'  => (string) $system_count,
		'estimate' => number_format_i18n( $estimate ) . ' ₽',
		'scope'    => $scope,
	);
}
