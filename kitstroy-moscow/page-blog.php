<?php
/**
 * Template Name: Блог
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$current_page = kitstroy_get_archive_current_page();
$blog_query   = new WP_Query(
	array(
		'post_type'      => 'post',
		'posts_per_page' => 9,
		'post_status'    => 'publish',
		'paged'          => $current_page,
	)
);

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
					'kicker'   => 'Блог',
					'title'    => get_the_title(),
					'subtitle' => get_the_excerpt() ?: 'Материалы по электромонтажу, инженерным системам, приемке работ и эксплуатации объектов.',
				)
			);
			?>
		<?php endwhile; ?>
		<div class="blog-grid">
			<?php if ( $blog_query->have_posts() ) : ?>
				<?php while ( $blog_query->have_posts() ) : $blog_query->the_post(); ?>
					<?php get_template_part( 'template-parts/cards/blog-card', null, array( 'post_id' => get_the_ID() ) ); ?>
				<?php endwhile; ?>
				<?php wp_reset_postdata(); ?>
			<?php else : ?>
				<?php foreach ( kitstroy_get_demo_posts() as $post_item ) : ?>
					<?php get_template_part( 'template-parts/cards/blog-card', null, array( 'item' => $post_item ) ); ?>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>
		<?php echo wp_kses_post( kitstroy_get_paginated_links( (int) $blog_query->max_num_pages, $current_page ) ); ?>
	</div>
</main>
<?php
get_footer();
