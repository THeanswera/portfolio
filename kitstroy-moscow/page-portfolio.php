<?php
/**
 * Template Name: Портфолио
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$terms         = get_terms( array( 'taxonomy' => 'portfolio_type', 'hide_empty' => false ) );
$selected_term = isset( $_GET['object_type'] ) ? sanitize_title( wp_unslash( $_GET['object_type'] ) ) : '';
$current_page  = kitstroy_get_archive_current_page();
$query_args    = array(
	'post_type'      => 'portfolio',
	'posts_per_page' => 12,
	'post_status'    => 'publish',
	'paged'          => $current_page,
);

if ( $selected_term ) {
	$query_args['tax_query'] = array(
		array(
			'taxonomy' => 'portfolio_type',
			'field'    => 'slug',
			'terms'    => $selected_term,
		),
	);
}

$portfolio_query = new WP_Query( $query_args );

get_header();
?>
<main id="primary" class="site-main section">
	<div class="container">
		<?php while ( have_posts() ) : the_post(); ?>
			<?php kitstroy_breadcrumbs(); ?>
			<?php
			get_template_part(
				'template-parts/ui/section-title',
				null,
				array(
					'kicker'   => 'Портфолио',
					'title'    => get_the_title(),
					'subtitle' => get_the_excerpt() ?: 'Реализованные объекты по Москве и Московской области: дома, офисы, склады, торговые и производственные помещения.',
				)
			);
			?>
		<?php endwhile; ?>
		<div class="filter-bar">
			<a class="filter-bar__link <?php echo '' === $selected_term ? 'is-active' : ''; ?>" href="<?php echo esc_url( get_permalink() ); ?>">Все</a>
			<?php foreach ( $terms as $term ) : ?>
				<a class="filter-bar__link <?php echo $selected_term === $term->slug ? 'is-active' : ''; ?>" href="<?php echo esc_url( add_query_arg( 'object_type', $term->slug, get_permalink() ) ); ?>"><?php echo esc_html( $term->name ); ?></a>
			<?php endforeach; ?>
		</div>
		<div class="portfolio-grid">
			<?php if ( $portfolio_query->have_posts() ) : ?>
				<?php while ( $portfolio_query->have_posts() ) : $portfolio_query->the_post(); ?>
					<?php get_template_part( 'template-parts/cards/portfolio-card', null, array( 'post_id' => get_the_ID() ) ); ?>
				<?php endwhile; ?>
				<?php wp_reset_postdata(); ?>
			<?php else : ?>
				<?php foreach ( kitstroy_get_demo_portfolio() as $portfolio_item ) : ?>
					<?php if ( $selected_term && sanitize_title( $portfolio_item['type'] ) !== $selected_term ) : continue; endif; ?>
					<?php get_template_part( 'template-parts/cards/portfolio-card', null, array( 'item' => $portfolio_item ) ); ?>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>
		<?php echo wp_kses_post( kitstroy_get_paginated_links( (int) $portfolio_query->max_num_pages, $current_page, array( 'object_type' => $selected_term ) ) ); ?>
	</div>
</main>
<?php
get_footer();
