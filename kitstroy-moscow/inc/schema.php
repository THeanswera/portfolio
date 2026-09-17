<?php
/**
 * JSON-LD schema output.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

function kitstroy_output_schema(): void {
	$enabled = apply_filters( 'kitstroy_enable_schema', ! kitstroy_is_seo_plugin_active() );

	if ( ! $enabled || is_404() ) {
		return;
	}

	$graph            = array();
	$organization     = kitstroy_get_organization_data();
	$canonical_url    = kitstroy_get_canonical_url() ?: home_url( '/' );
	$organization_id  = home_url( '/#organization' );
	$localbusiness_id = home_url( '/#localbusiness' );
	$logo             = kitstroy_get_image_data( $organization['logo'], $organization['name'], 'medium' );

	$graph[] = array(
		'@type'       => 'Organization',
		'@id'         => $organization_id,
		'name'        => $organization['name'],
		'legalName'   => $organization['legal_name'],
		'url'         => home_url( '/' ),
		'telephone'   => $organization['phone'],
		'email'       => $organization['email'],
		'description' => $organization['description'],
		'logo'        => $logo['url'],
		'taxID'       => $organization['tax_id'],
		'vatID'       => $organization['vat_id'],
		'sameAs'      => array_filter( array( $organization['telegram'], $organization['max'] ) ),
	);

	$graph[] = array(
		'@type'              => 'LocalBusiness',
		'@id'                => $localbusiness_id,
		'name'               => $organization['name'],
		'url'                => home_url( '/' ),
		'telephone'          => $organization['phone'],
		'email'              => $organization['email'],
		'priceRange'         => $organization['price_range'],
		'areaServed'         => $organization['area_served'],
		'image'              => $logo['url'],
		'parentOrganization' => array( '@id' => $organization_id ),
		'address'            => array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => $organization['address'],
			'addressLocality' => 'Москва',
			'addressCountry'  => 'RU',
		),
		'geo'                => array(
			'@type'     => 'GeoCoordinates',
			'latitude'  => $organization['geo_latitude'],
			'longitude' => $organization['geo_longitude'],
		),
		'openingHours'       => $organization['opening_hours'],
	);

	$breadcrumbs = kitstroy_get_breadcrumb_items();

	if ( count( $breadcrumbs ) > 1 ) {
		$list = array();

		foreach ( $breadcrumbs as $index => $item ) {
			$list[] = array(
				'@type'    => 'ListItem',
				'position' => $index + 1,
				'name'     => $item['label'],
				'item'     => $item['url'] ?: $canonical_url,
			);
		}

		$graph[] = array(
			'@type'           => 'BreadcrumbList',
			'@id'             => $canonical_url . '#breadcrumbs',
			'itemListElement' => $list,
		);
	}

	$graph[] = array(
		'@type'       => 'WebSite',
		'@id'         => home_url( '/#website' ),
		'url'         => home_url( '/' ),
		'name'        => get_bloginfo( 'name' ),
		'description' => get_bloginfo( 'description' ),
		'publisher'   => array( '@id' => $organization_id ),
		'inLanguage'  => 'ru-RU',
	);

	if ( ! is_front_page() ) {
		$webpage = array(
			'@type'            => 'WebPage',
			'@id'              => $canonical_url . '#webpage',
			'url'              => $canonical_url,
			'name'             => kitstroy_get_meta_title( wp_get_document_title() ),
			'description'      => kitstroy_get_meta_description(),
			'inLanguage'       => 'ru-RU',
			'isPartOf'         => array( '@id' => home_url( '/#website' ) ),
			'mainEntityOfPage' => $canonical_url,
		);

		if ( count( $breadcrumbs ) > 1 ) {
			$webpage['breadcrumb'] = array( '@id' => $canonical_url . '#breadcrumbs' );
		}

		$graph[] = $webpage;
	}

	if ( is_singular( 'service' ) ) {
		$service_data = kitstroy_get_service_data( get_the_ID() );

		$graph[] = array(
			'@type'        => 'Service',
			'@id'          => get_permalink() . '#service',
			'name'         => get_the_title(),
			'description'  => kitstroy_get_meta_description(),
			'serviceType'  => get_the_title(),
			'provider'     => array( '@id' => $organization_id ),
			'areaServed'   => $organization['area_served'],
			'url'          => get_permalink(),
			'image'        => kitstroy_get_og_image_url(),
		);

		$faq_entities = array();

		foreach ( $service_data['faq_items'] as $faq_item ) {
			$question = isset( $faq_item['question'] ) ? trim( (string) $faq_item['question'] ) : '';
			$answer   = isset( $faq_item['answer'] ) ? trim( (string) $faq_item['answer'] ) : '';

			if ( '' === $question || '' === $answer ) {
				continue;
			}

			$faq_entities[] = array(
				'@type'          => 'Question',
				'name'           => $question,
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => wp_strip_all_tags( $answer ),
				),
			);
		}

		if ( ! empty( $faq_entities ) ) {
			$graph[] = array(
				'@type'      => 'FAQPage',
				'@id'        => get_permalink() . '#faq',
				'mainEntity' => $faq_entities,
			);
		}
	}

	if ( is_singular( 'post' ) ) {
		$graph[] = array(
			'@type'            => 'Article',
			'@id'              => get_permalink() . '#article',
			'headline'         => get_the_title(),
			'datePublished'    => get_the_date( DATE_W3C ),
			'dateModified'     => get_the_modified_date( DATE_W3C ),
			'author'           => array(
				'@type' => 'Person',
				'name'  => get_the_author(),
			),
			'publisher'        => array( '@id' => $organization_id ),
			'description'      => kitstroy_get_meta_description(),
			'mainEntityOfPage' => get_permalink(),
			'image'            => kitstroy_get_og_image_url(),
		);
	}

	$schema = array(
		'@context' => 'https://schema.org',
		'@graph'   => array_values( array_filter( $graph ) ),
	);

	echo "\n" . '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
}
add_action( 'wp_head', 'kitstroy_output_schema', 30 );
