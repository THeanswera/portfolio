<?php
/**
 * Search template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main section">
	<div class="container content-layout">
		<?php kitstroy_breadcrumbs(); ?>
		<h1><?php printf( esc_html__( 'Результаты поиска: %s', 'kitstroy-moscow' ), esc_html( get_search_query() ) ); ?></h1>
		<?php if ( have_posts() ) : ?>
			<?php while ( have_posts() ) : the_post(); ?>
				<article <?php post_class( 'post-card' ); ?>>
					<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
					<?php the_excerpt(); ?>
				</article>
			<?php endwhile; ?>
		<?php else : ?>
			<p><?php esc_html_e( 'По вашему запросу ничего не найдено.', 'kitstroy-moscow' ); ?></p>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
