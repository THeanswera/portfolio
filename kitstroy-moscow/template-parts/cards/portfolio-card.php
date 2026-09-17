<?php
/**
 * Portfolio card: объект с составом систем и техническими данными.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$post_id = isset( $args['post_id'] ) ? (int) $args['post_id'] : 0;
$item    = $args['item'] ?? array();

if ( $post_id > 0 ) {
	$title = get_the_title( $post_id );
	$url   = get_permalink( $post_id );
	$image = kitstroy_get_image_data( kitstroy_get_post_field_value( 'portfolio_main_image', $post_id, get_post_thumbnail_id( $post_id ) ), $title );
	$data  = kitstroy_get_portfolio_data( $post_id );
} else {
	$title = $item['title'] ?? '';
	$url   = ! empty( $item['slug'] ) ? home_url( '/portfolio/' . $item['slug'] . '/' ) : get_post_type_archive_link( 'portfolio' );
	$image = kitstroy_get_image_data( 0, $item['image_title'] ?? $title );
	$data  = array(
		'type'            => $item['type'] ?? '',
		'city'            => $item['city'] ?? '',
		'duration'        => $item['duration'] ?? '',
		'scope'           => $item['scope'] ?? '',
		'short'           => $item['short'] ?? '',
		'systems'         => $item['systems'] ?? array(),
		'completion_date' => $item['completion_date'] ?? '',
	);
}

if ( empty( $title ) ) {
	return;
}

$specs = kitstroy_get_project_specs(
	array(
		'title'   => $title,
		'systems' => $data['systems'] ?? array(),
		'scope'   => $data['scope'] ?? '',
	)
);
?>
<article class="project-card" data-reveal>
	<a class="project-card__media" href="<?php echo esc_url( $url ); ?>" tabindex="-1" aria-hidden="true">
		<img src="<?php echo esc_url( $image['url'] ); ?>" alt="" loading="lazy">
		<?php if ( ! empty( $data['type'] ) ) : ?>
			<span class="project-card__badge"><?php echo esc_html( (string) $data['type'] ); ?></span>
		<?php endif; ?>
	</a>
	<div class="project-card__body">
		<div class="project-card__meta">
			<?php if ( ! empty( $data['city'] ) ) : ?><span><?php echo esc_html( (string) $data['city'] ); ?></span><?php endif; ?>
			<?php if ( ! empty( $data['completion_date'] ) ) : ?><span><?php echo esc_html( kitstroy_format_optional_date( (string) $data['completion_date'], 'm.Y' ) ); ?></span><?php endif; ?>
			<?php if ( ! empty( $data['duration'] ) ) : ?><span><?php echo esc_html( (string) $data['duration'] ); ?></span><?php endif; ?>
		</div>
		<h3 class="project-card__title"><a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $title ); ?></a></h3>
		<p class="project-card__text"><?php echo esc_html( kitstroy_trim_words( (string) ( $data['short'] ?: $data['scope'] ), 24 ) ); ?></p>

		<?php if ( ! empty( $data['systems'] ) ) : ?>
			<div class="tag-list">
				<?php foreach ( array_slice( (array) $data['systems'], 0, 4 ) as $system ) : ?>
					<span class="tag"><?php echo esc_html( (string) $system ); ?></span>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>

		<div class="project-card__specs">
			<p class="project-card__spec"><span><?php esc_html_e( 'Площадь', 'kitstroy-moscow' ); ?></span><span><?php echo esc_html( $specs['area'] ); ?></span></p>
			<p class="project-card__spec"><span><?php esc_html_e( 'Мощность', 'kitstroy-moscow' ); ?></span><span><?php echo esc_html( $specs['power'] ); ?></span></p>
			<p class="project-card__spec"><span><?php esc_html_e( 'Точек и линий', 'kitstroy-moscow' ); ?></span><span><?php echo esc_html( $specs['points'] ); ?></span></p>
		</div>
	</div>
</article>
