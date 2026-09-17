<?php
/**
 * Blog card.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$post_id = isset( $args['post_id'] ) ? (int) $args['post_id'] : 0;
$item    = $args['item'] ?? array();

if ( $post_id > 0 ) {
	$title    = get_the_title( $post_id );
	$url      = get_permalink( $post_id );
	$date     = get_the_date( 'd.m.Y', $post_id );
	$datetime = get_the_date( DATE_W3C, $post_id );
	$excerpt  = get_the_excerpt( $post_id );
	$category = get_the_category( $post_id );
	$category = ! empty( $category ) ? $category[0]->name : '';
} else {
	$title    = $item['title'] ?? '';
	$url      = ! empty( $item['slug'] ) ? home_url( '/blog/' . $item['slug'] . '/' ) : home_url( '/blog/' );
	$date     = ! empty( $item['date'] ) ? wp_date( 'd.m.Y', strtotime( $item['date'] ) ) : '';
	$datetime = ! empty( $item['date'] ) ? gmdate( DATE_W3C, strtotime( $item['date'] ) ) : '';
	$excerpt  = $item['excerpt'] ?? '';
	$category = $item['cat'] ?? '';
}

if ( empty( $title ) ) {
	return;
}
?>
<article class="blog-card" data-reveal>
	<div class="blog-card__meta">
		<?php if ( $category ) : ?><span><?php echo esc_html( $category ); ?></span><?php endif; ?>
		<?php if ( $date ) : ?><time datetime="<?php echo esc_attr( $datetime ); ?>"><?php echo esc_html( $date ); ?></time><?php endif; ?>
	</div>
	<h3 class="blog-card__title"><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $title ); ?></a></h3>
	<p class="blog-card__excerpt"><?php echo esc_html( kitstroy_trim_words( $excerpt, 22 ) ); ?></p>
	<div class="card__footer">
		<a class="card__link" href="<?php echo esc_url( $url ); ?>"><?php esc_html_e( 'Читать', 'kitstroy-moscow' ); ?></a>
	</div>
</article>
