<?php
/**
 * ACF field registration and options pages.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_acf_text_field( string $key, string $label, string $name, string $type = 'text', array $extra = array() ): array {
	return array_merge(
		array(
			'key'   => $key,
			'label' => $label,
			'name'  => $name,
			'type'  => $type,
		),
		$extra
	);
}

function kitstroy_acf_repeater_field( string $key, string $label, string $name, array $sub_fields, array $extra = array() ): array {
	return array_merge(
		array(
			'key'          => $key,
			'label'        => $label,
			'name'         => $name,
			'type'         => 'repeater',
			'layout'       => 'block',
			'button_label' => __( 'Добавить элемент', 'kitstroy-moscow' ),
			'sub_fields'   => $sub_fields,
		),
		$extra
	);
}

function kitstroy_register_acf_options_pages(): void {
	if ( ! function_exists( 'acf_add_options_page' ) ) {
		return;
	}

	acf_add_options_page(
		array(
			'page_title' => __( 'Настройки темы KIT-Stroy', 'kitstroy-moscow' ),
			'menu_title' => __( 'KIT-Stroy', 'kitstroy-moscow' ),
			'menu_slug'  => 'kitstroy-theme-settings',
			'capability' => 'manage_options',
			'redirect'   => true,
		)
	);

	acf_add_options_sub_page(
		array(
			'page_title'  => __( 'Контакты и формы', 'kitstroy-moscow' ),
			'menu_title'  => __( 'Контакты', 'kitstroy-moscow' ),
			'parent_slug' => 'kitstroy-theme-settings',
			'menu_slug'   => 'kitstroy-contact-settings',
		)
	);

	acf_add_options_sub_page(
		array(
			'page_title'  => __( 'Главная страница', 'kitstroy-moscow' ),
			'menu_title'  => __( 'Главная', 'kitstroy-moscow' ),
			'parent_slug' => 'kitstroy-theme-settings',
			'menu_slug'   => 'kitstroy-homepage-settings',
		)
	);

	acf_add_options_sub_page(
		array(
			'page_title'  => __( 'Организация и SEO', 'kitstroy-moscow' ),
			'menu_title'  => __( 'SEO и Schema', 'kitstroy-moscow' ),
			'parent_slug' => 'kitstroy-theme-settings',
			'menu_slug'   => 'kitstroy-seo-settings',
		)
	);
}
add_action( 'acf/init', 'kitstroy_register_acf_options_pages' );

function kitstroy_register_acf_field_groups(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	$single_text_repeater = function ( string $parent_key, string $label, string $name, string $sub_label = 'Текст' ): array {
		return kitstroy_acf_repeater_field(
			$parent_key,
			$label,
			$name,
			array(
				kitstroy_acf_text_field( $parent_key . '_item', $sub_label, 'text' ),
			)
		);
	};

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_service',
			'title'    => __( 'Данные услуги', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_text_field( 'field_service_subtitle', 'Подзаголовок', 'service_subtitle' ),
				kitstroy_acf_text_field( 'field_service_short', 'Краткое описание', 'service_short_description', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_service_icon', 'Класс иконки / SVG-класс', 'service_icon' ),
				$single_text_repeater( 'field_service_benefits', 'Преимущества услуги', 'service_benefits' ),
				$single_text_repeater( 'field_service_stages', 'Этапы работ', 'service_stages' ),
				$single_text_repeater( 'field_service_included', 'Список включенных работ', 'service_included_works', 'Работа' ),
				kitstroy_acf_text_field( 'field_service_gallery', 'Галерея', 'service_gallery', 'gallery', array( 'preview_size' => 'medium', 'insert' => 'append' ) ),
				kitstroy_acf_text_field( 'field_service_seo_title', 'SEO title', 'seo_title' ),
				kitstroy_acf_text_field( 'field_service_seo_desc', 'SEO description', 'seo_description', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_repeater_field(
					'field_service_faq',
					'FAQ по услуге',
					'service_faq',
					array(
						kitstroy_acf_text_field( 'field_service_faq_question', 'Вопрос', 'question' ),
						kitstroy_acf_text_field( 'field_service_faq_answer', 'Ответ', 'answer', 'textarea', array( 'rows' => 3 ) ),
					)
				),
				kitstroy_acf_text_field(
					'field_service_related',
					'Сопутствующие услуги',
					'related_services',
					'relationship',
					array(
						'post_type'     => array( 'service' ),
						'filters'       => array( 'search' ),
						'return_format' => 'id',
					)
				),
				kitstroy_acf_text_field( 'field_service_cta_title', 'CTA заголовок', 'service_cta_title' ),
				kitstroy_acf_text_field( 'field_service_cta_text', 'CTA текст', 'service_cta_text', 'textarea', array( 'rows' => 3 ) ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'service',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_portfolio',
			'title'    => __( 'Данные проекта', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_text_field(
					'field_portfolio_type',
					'Тип объекта',
					'portfolio_object_type',
					'taxonomy',
					array(
						'taxonomy'      => 'portfolio_type',
						'field_type'    => 'select',
						'return_format' => 'object',
						'load_terms'    => 1,
						'save_terms'    => 1,
					)
				),
				kitstroy_acf_text_field( 'field_portfolio_city', 'Город', 'portfolio_city' ),
				kitstroy_acf_text_field( 'field_portfolio_duration', 'Срок выполнения', 'portfolio_duration' ),
				kitstroy_acf_text_field( 'field_portfolio_scope', 'Объем работ', 'portfolio_scope', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_portfolio_short', 'Краткое описание', 'portfolio_short_description', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_portfolio_task', 'Задача проекта', 'portfolio_task', 'textarea', array( 'rows' => 4 ) ),
				kitstroy_acf_text_field( 'field_portfolio_done', 'Что было сделано', 'portfolio_work_done', 'textarea', array( 'rows' => 5 ) ),
				kitstroy_acf_text_field( 'field_portfolio_result', 'Результат', 'portfolio_result', 'textarea', array( 'rows' => 4 ) ),
				kitstroy_acf_text_field( 'field_portfolio_main_image', 'Основное изображение', 'portfolio_main_image', 'image', array( 'return_format' => 'id', 'preview_size' => 'medium' ) ),
				kitstroy_acf_text_field( 'field_portfolio_gallery', 'Галерея', 'portfolio_gallery', 'gallery', array( 'preview_size' => 'medium', 'insert' => 'append' ) ),
				$single_text_repeater( 'field_portfolio_systems', 'Список выполненных систем', 'portfolio_systems', 'Система' ),
				kitstroy_acf_text_field( 'field_portfolio_date', 'Дата завершения', 'portfolio_completion_date', 'date_picker', array( 'display_format' => 'd.m.Y', 'return_format' => 'Y-m-d' ) ),
				kitstroy_acf_text_field( 'field_portfolio_seo_title', 'SEO title', 'seo_title' ),
				kitstroy_acf_text_field( 'field_portfolio_seo_desc', 'SEO description', 'seo_description', 'textarea', array( 'rows' => 3 ) ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'portfolio',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_about_page',
			'title'    => __( 'Страница "О компании"', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_text_field( 'field_about_heading', 'Заголовок блока', 'about_heading' ),
				kitstroy_acf_text_field( 'field_about_intro', 'Вводный текст', 'about_intro', 'textarea', array( 'rows' => 4 ) ),
				$single_text_repeater( 'field_about_advantages', 'Преимущества', 'about_advantages' ),
				kitstroy_acf_text_field( 'field_about_certificates', 'Лицензии / сертификаты', 'about_certificates', 'gallery', array( 'preview_size' => 'medium' ) ),
				kitstroy_acf_repeater_field(
					'field_about_numbers',
					'Ключевые цифры',
					'about_numbers',
					array(
						kitstroy_acf_text_field( 'field_about_number_value', 'Значение', 'value' ),
						kitstroy_acf_text_field( 'field_about_number_label', 'Подпись', 'label' ),
					)
				),
				$single_text_repeater( 'field_about_why_us', 'Почему выбирают нас', 'about_why_us', 'Причина' ),
				kitstroy_acf_text_field( 'field_about_cta_title', 'CTA заголовок', 'about_cta_title' ),
				kitstroy_acf_text_field( 'field_about_cta_text', 'CTA текст', 'about_cta_text', 'textarea', array( 'rows' => 3 ) ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'page_template',
						'operator' => '==',
						'value'    => 'page-about.php',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_prices_page',
			'title'    => __( 'Страница "Цены"', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_text_field( 'field_prices_intro', 'Вступительный текст', 'prices_intro', 'textarea', array( 'rows' => 4 ) ),
				kitstroy_acf_repeater_field(
					'field_prices_table',
					'Таблица популярных услуг',
					'prices_table',
					array(
						kitstroy_acf_text_field( 'field_price_service', 'Услуга', 'service' ),
						kitstroy_acf_text_field( 'field_price_unit', 'Единица', 'unit' ),
						kitstroy_acf_text_field( 'field_price_value', 'Цена', 'price' ),
						kitstroy_acf_text_field( 'field_price_note', 'Примечание', 'note', 'textarea', array( 'rows' => 2 ) ),
					)
				),
				kitstroy_acf_text_field( 'field_prices_note', 'Примечание по стоимости', 'prices_note', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_prices_cta_title', 'CTA заголовок', 'prices_cta_title' ),
				kitstroy_acf_text_field( 'field_prices_cta_text', 'CTA текст', 'prices_cta_text', 'textarea', array( 'rows' => 3 ) ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'page_template',
						'operator' => '==',
						'value'    => 'page-prices.php',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_contacts_options',
			'title'    => __( 'Контакты и формы', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_text_field( 'field_contact_phone', 'Телефон', 'phone' ),
				kitstroy_acf_text_field( 'field_contact_second_phone', 'Дополнительный телефон', 'secondary_phone' ),
				kitstroy_acf_text_field( 'field_contact_email', 'Email', 'email', 'email' ),
				kitstroy_acf_text_field( 'field_contact_address', 'Адрес', 'address', 'textarea', array( 'rows' => 2 ) ),
				kitstroy_acf_text_field( 'field_contact_telegram', 'Telegram URL', 'telegram', 'url' ),
				kitstroy_acf_text_field( 'field_contact_telegram_label', 'Telegram подпись', 'telegram_label' ),
				kitstroy_acf_text_field( 'field_contact_max', 'Max URL', 'max', 'url' ),
				kitstroy_acf_text_field( 'field_contact_max_label', 'Max подпись', 'max_label' ),
				kitstroy_acf_text_field( 'field_contact_hours', 'Режим работы', 'working_hours' ),
				kitstroy_acf_text_field( 'field_contact_route', 'Ссылка "Проложить маршрут"', 'route_url', 'url' ),
				kitstroy_acf_text_field( 'field_contact_lat', 'Широта', 'latitude' ),
				kitstroy_acf_text_field( 'field_contact_lng', 'Долгота', 'longitude' ),
				kitstroy_acf_text_field( 'field_contact_map', 'Ссылка embed карты', 'map_embed_url', 'url' ),
				kitstroy_acf_text_field( 'field_contact_requisites', 'Реквизиты', 'requisites', 'textarea', array( 'rows' => 6 ) ),
				kitstroy_acf_text_field( 'field_contact_form_recipient', 'Email получателя форм', 'form_recipient_email', 'email' ),
				kitstroy_acf_text_field( 'field_contact_recaptcha_site', 'reCAPTCHA v3 site key', 'recaptcha_site_key' ),
				kitstroy_acf_text_field( 'field_contact_recaptcha_secret', 'reCAPTCHA v3 secret key', 'recaptcha_secret_key' ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => 'kitstroy-contact-settings',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_home_options',
			'title'    => __( 'Главная страница', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_repeater_field(
					'field_home_hero_slides',
					'Hero слайды',
					'hero_slides',
					array(
						kitstroy_acf_text_field( 'field_home_slide_title', 'Заголовок', 'title' ),
						kitstroy_acf_text_field( 'field_home_slide_text', 'Текст', 'text', 'textarea', array( 'rows' => 3 ) ),
						kitstroy_acf_text_field( 'field_home_slide_image', 'Фоновое изображение', 'image', 'image', array( 'return_format' => 'id', 'preview_size' => 'medium' ) ),
						kitstroy_acf_text_field( 'field_home_slide_primary_label', 'Текст основной кнопки', 'primary_label' ),
						kitstroy_acf_text_field( 'field_home_slide_primary_url', 'Ссылка основной кнопки', 'primary_url', 'url' ),
						kitstroy_acf_text_field( 'field_home_slide_secondary_label', 'Текст второй кнопки', 'secondary_label' ),
						kitstroy_acf_text_field( 'field_home_slide_secondary_url', 'Ссылка второй кнопки', 'secondary_url', 'url' ),
					)
				),
				kitstroy_acf_repeater_field(
					'field_home_advantages',
					'Преимущества в hero',
					'home_advantages',
					array(
						kitstroy_acf_text_field( 'field_home_advantage_value', 'Значение', 'value' ),
						kitstroy_acf_text_field( 'field_home_advantage_label', 'Подпись', 'label' ),
					)
				),
				kitstroy_acf_text_field( 'field_home_services_title', 'Заголовок блока услуг', 'home_services_title' ),
				kitstroy_acf_text_field( 'field_home_services_text', 'Текст блока услуг', 'home_services_text', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_home_portfolio_title', 'Заголовок портфолио', 'home_portfolio_title' ),
				kitstroy_acf_text_field( 'field_home_portfolio_text', 'Текст портфолио', 'home_portfolio_text', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_home_about_title', 'Заголовок блока о компании', 'home_about_title' ),
				kitstroy_acf_text_field( 'field_home_about_text', 'Текст блока о компании', 'home_about_text', 'textarea', array( 'rows' => 4 ) ),
				kitstroy_acf_text_field( 'field_home_process_title', 'Заголовок схемы работы', 'home_process_title' ),
				kitstroy_acf_repeater_field(
					'field_home_process_steps',
					'Схема работы',
					'home_process_steps',
					array(
						kitstroy_acf_text_field( 'field_home_process_step_title', 'Этап', 'title' ),
						kitstroy_acf_text_field( 'field_home_process_step_text', 'Описание', 'text' ),
					)
				),
				kitstroy_acf_text_field( 'field_home_cta_title', 'Заголовок CTA', 'home_cta_title' ),
				kitstroy_acf_text_field( 'field_home_cta_text', 'Текст CTA', 'home_cta_text', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_home_blog_title', 'Заголовок блога', 'home_blog_title' ),
				kitstroy_acf_text_field( 'field_home_blog_text', 'Текст блока блога', 'home_blog_text', 'textarea', array( 'rows' => 3 ) ),
				kitstroy_acf_text_field( 'field_home_contacts_title', 'Заголовок блока контактов', 'home_contacts_title' ),
				kitstroy_acf_text_field( 'field_home_contacts_text', 'Текст блока контактов', 'home_contacts_text', 'textarea', array( 'rows' => 3 ) ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => 'kitstroy-homepage-settings',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_kitstroy_seo_options',
			'title'    => __( 'Организация и SEO', 'kitstroy-moscow' ),
			'fields'   => array(
				kitstroy_acf_text_field( 'field_org_name', 'Название организации', 'organization_name' ),
				kitstroy_acf_text_field( 'field_org_legal_name', 'Юридическое название', 'legal_name' ),
				kitstroy_acf_text_field( 'field_org_desc', 'Описание организации', 'organization_description', 'textarea', array( 'rows' => 4 ) ),
				kitstroy_acf_text_field( 'field_org_area', 'Регион обслуживания', 'organization_area_served' ),
				kitstroy_acf_text_field( 'field_org_price_range', 'Price range', 'organization_price_range' ),
				kitstroy_acf_text_field( 'field_org_found', 'Год основания', 'organization_founding_date' ),
				kitstroy_acf_text_field( 'field_org_license', 'Лицензия МЧС', 'organization_license_number' ),
				kitstroy_acf_text_field( 'field_org_sro', 'Номер СРО', 'organization_sro_number' ),
				kitstroy_acf_text_field( 'field_org_logo', 'Логотип для schema', 'organization_logo', 'image', array( 'return_format' => 'id' ) ),
				kitstroy_acf_text_field( 'field_org_og_image', 'OG изображение', 'organization_og_image', 'image', array( 'return_format' => 'id' ) ),
				kitstroy_acf_text_field( 'field_org_tax', 'ИНН', 'organization_tax_id' ),
				kitstroy_acf_text_field( 'field_org_vat', 'КПП', 'organization_vat_id' ),
				kitstroy_acf_text_field( 'field_home_seo_title', 'SEO title главной', 'home_seo_title' ),
				kitstroy_acf_text_field( 'field_home_seo_description', 'SEO description главной', 'home_seo_description', 'textarea', array( 'rows' => 3 ) ),
			),
			'location' => array(
				array(
					array(
						'param'    => 'options_page',
						'operator' => '==',
						'value'    => 'kitstroy-seo-settings',
					),
				),
			),
		)
	);
}
add_action( 'acf/init', 'kitstroy_register_acf_field_groups' );
