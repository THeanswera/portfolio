<?php
/**
 * Fallback index template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main section">
	<div class="container content-layout">
		<?php if ( have_posts() ) : ?>
			<?php while ( have_posts() ) : the_post(); ?>
				<article <?php post_class( 'post-card' ); ?>>
					<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
					<?php the_excerpt(); ?>
				</article>
			<?php endwhile; ?>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<h1><?php esc_html_e( 'Записей пока нет', 'kitstroy-moscow' ); ?></h1>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
