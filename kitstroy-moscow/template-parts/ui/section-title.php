<?php
/**
 * Section title component.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args(
	$args ?? array(),
	array(
		'kicker'   => '',
		'title'    => '',
		'subtitle' => '',
		'class'    => '',
		'align'    => 'left',
	)
);

if ( empty( $args['title'] ) ) {
	return;
}
?>
<div class="section-title section-title--<?php echo esc_attr( $args['align'] ); ?> <?php echo esc_attr( $args['class'] ); ?>">
	<?php if ( $args['kicker'] ) : ?>
		<p class="section-title__kicker"><?php echo esc_html( $args['kicker'] ); ?></p>
	<?php endif; ?>
	<h2 class="section-title__heading"><?php echo esc_html( $args['title'] ); ?></h2>
	<?php if ( $args['subtitle'] ) : ?>
		<div class="section-title__subtitle"><?php echo wp_kses_post( wpautop( $args['subtitle'] ) ); ?></div>
	<?php endif; ?>
</div>
