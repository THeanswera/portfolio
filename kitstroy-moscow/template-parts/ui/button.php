<?php
/**
 * Button UI component.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$args = wp_parse_args(
	$args ?? array(),
	array(
		'label'   => '',
		'url'     => '#',
		'class'   => '',
		'variant' => 'primary',
		'target'  => '',
		'rel'     => '',
		'attrs'   => array(),
	)
);

if ( empty( $args['label'] ) ) {
	return;
}

$attributes = '';
$rel        = trim( (string) $args['rel'] );

if ( '_blank' === $args['target'] ) {
	$rel = trim( $rel . ' noopener noreferrer' );
}

foreach ( (array) $args['attrs'] as $attribute => $value ) {
	$attributes .= sprintf( ' %s="%s"', esc_attr( $attribute ), esc_attr( (string) $value ) );
}
?>
<a class="button button--<?php echo esc_attr( $args['variant'] ); ?> <?php echo esc_attr( $args['class'] ); ?>" href="<?php echo esc_url( $args['url'] ); ?>"<?php echo $args['target'] ? ' target="' . esc_attr( $args['target'] ) . '"' : ''; ?><?php echo $rel ? ' rel="' . esc_attr( $rel ) . '"' : ''; ?><?php echo $attributes; ?>>
	<span><?php echo esc_html( $args['label'] ); ?></span>
</a>
