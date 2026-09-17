<?php
/**
 * Service card.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$post_id = isset( $args['post_id'] ) ? (int) $args['post_id'] : 0;
$item    = $args['item'] ?? array();
$index   = isset( $args['index'] ) ? (int) $args['index'] : 0;

if ( $post_id > 0 ) {
	$title   = get_the_title( $post_id );
	$excerpt = kitstroy_get_post_field_value( 'service_short_description', $post_id, get_the_excerpt( $post_id ) );
	$url     = get_permalink( $post_id );
	$data    = kitstroy_get_service_data( $post_id );
} else {
	$title   = $item['title'] ?? '';
	$excerpt = $item['excerpt'] ?? '';
	$url     = ! empty( $item['slug'] ) ? home_url( '/services/' . $item['slug'] . '/' ) : get_post_type_archive_link( 'service' );
	$data    = array( 'included' => $item['included'] ?? array() );
}

if ( empty( $title ) ) {
	return;
}

$included = array_slice( (array) ( $data['included'] ?? array() ), 0, 3 );
?>
<article class="card service-card" data-reveal>
	<div class="card__head">
		<span class="card__index"><?php echo esc_html( str_pad( (string) ( $index + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
		<span class="card__icon" aria-hidden="true">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.4">
				<path d="M11 2v7M7 5l4-3 4 3" />
				<rect x="4" y="9" width="14" height="11" rx="1" />
				<path d="M8 13h6M8 16h4" />
			</svg>
		</span>
	</div>
	<h3 class="card__title"><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $title ); ?></a></h3>
	<p class="card__text"><?php echo esc_html( $excerpt ); ?></p>

	<?php if ( ! empty( $included ) ) : ?>
		<ul class="card__list">
			<?php foreach ( $included as $point ) : ?>
				<li><?php echo esc_html( (string) $point ); ?></li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>

	<div class="card__footer">
		<a class="card__link" href="<?php echo esc_url( $url ); ?>"><?php esc_html_e( 'Что входит', 'kitstroy-moscow' ); ?></a>
	</div>
</article>
