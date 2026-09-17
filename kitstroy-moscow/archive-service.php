<?php
/**
 * Service archive template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$intro = kitstroy_get_archive_intro( 'service' );

get_header();
?>
<main id="primary" class="site-main">
	<div class="page-head">
		<div class="container">
			<?php kitstroy_breadcrumbs(); ?>
			<p class="kicker"><?php esc_html_e( 'Услуги', 'kitstroy-moscow' ); ?></p>
			<h1><?php echo esc_html( $intro['title'] ); ?></h1>
			<p class="lead"><?php echo esc_html( $intro['description'] ); ?></p>
		</div>
	</div>

	<div class="section">
		<div class="container">
			<div class="card-grid">
				<?php if ( have_posts() ) : ?>
					<?php
					$index = 0;
					while ( have_posts() ) :
						the_post();
						get_template_part( 'template-parts/cards/service-card', null, array( 'post_id' => get_the_ID(), 'index' => $index ) );
						$index++;
					endwhile;
					?>
				<?php else : ?>
					<?php foreach ( kitstroy_get_demo_services() as $index => $service_item ) : ?>
						<?php get_template_part( 'template-parts/cards/service-card', null, array( 'item' => $service_item, 'index' => $index ) ); ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			<?php echo wp_kses_post( kitstroy_get_paginated_links( (int) $GLOBALS['wp_query']->max_num_pages, kitstroy_get_archive_current_page() ) ); ?>
		</div>
	</div>

	<?php get_template_part( 'template-parts/sections/faq' ); ?>
</main>
<?php
get_footer();
