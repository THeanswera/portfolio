<?php
/**
 * Blog archive.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main">
	<div class="page-head">
		<div class="container">
			<?php kitstroy_breadcrumbs(); ?>
			<p class="kicker"><?php esc_html_e( 'Блог', 'kitstroy-moscow' ); ?></p>
			<h1><?php esc_html_e( 'Инженерные системы: практика, а не теория', 'kitstroy-moscow' ); ?></h1>
			<p class="lead"><?php esc_html_e( 'Разбираем проектирование, приёмку и эксплуатацию: как читать однолинейную схему, что проверять в щите, какие документы требовать у подрядчика.', 'kitstroy-moscow' ); ?></p>
		</div>
	</div>

	<div class="section">
		<div class="container">
			<div class="blog-grid">
				<?php if ( have_posts() ) : ?>
					<?php while ( have_posts() ) : the_post(); ?>
						<?php get_template_part( 'template-parts/cards/blog-card', null, array( 'post_id' => get_the_ID() ) ); ?>
					<?php endwhile; ?>
				<?php else : ?>
					<?php foreach ( kitstroy_get_demo_posts() as $post_item ) : ?>
						<?php get_template_part( 'template-parts/cards/blog-card', null, array( 'item' => $post_item ) ); ?>
					<?php endforeach; ?>
				<?php endif; ?>
			</div>
			<?php echo wp_kses_post( kitstroy_get_paginated_links( (int) $GLOBALS['wp_query']->max_num_pages, kitstroy_get_archive_current_page() ) ); ?>
		</div>
	</div>

	<?php
	get_template_part(
		'template-parts/sections/quiz-form',
		null,
		array(
			'form_type'  => 'universal',
			'section_id' => 'blog-consultation',
			'title'      => __( 'Остались вопросы по объекту?', 'kitstroy-moscow' ),
			'subtitle'   => __( 'Спросите инженера: ответим по делу и без «приезжайте, обсудим».', 'kitstroy-moscow' ),
		)
	);
	?>
</main>
<?php
get_footer();
