<?php
/**
 * Breadcrumbs component.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$items      = $args['items'] ?? array();
$last_index = array_key_last( $items );

if ( count( $items ) <= 1 ) {
	return;
}
?>
<nav class="breadcrumbs" aria-label="<?php esc_attr_e( 'Хлебные крошки', 'kitstroy-moscow' ); ?>">
	<ol class="breadcrumbs__list">
		<?php foreach ( $items as $index => $item ) : ?>
			<?php $is_current = $index === $last_index; ?>
			<li class="breadcrumbs__item <?php echo esc_attr( $is_current ? 'is-current' : '' ); ?>">
				<?php if ( ! empty( $item['url'] ) && ! $is_current ) : ?>
					<a href="<?php echo esc_url( $item['url'] ); ?>"><?php echo esc_html( $item['label'] ); ?></a>
				<?php else : ?>
					<span<?php echo $is_current ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $item['label'] ); ?></span>
				<?php endif; ?>
			</li>
		<?php endforeach; ?>
	</ol>
</nav>
