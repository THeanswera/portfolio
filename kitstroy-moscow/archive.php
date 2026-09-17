<?php
/**
 * Generic archive template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main section">
	<div class="container">
		<?php kitstroy_breadcrumbs(); ?>
		<header class="archive-header">
			<h1><?php the_archive_title(); ?></h1>
			<?php the_archive_description( '<div class="archive-description">', '</div>' ); ?>
		</header>
		<div class="blog-grid">
			<?php if ( have_posts() ) : ?>
				<?php while ( have_posts() ) : the_post(); ?>
					<?php get_template_part( 'template-parts/cards/blog-card', null, array( 'post_id' => get_the_ID() ) ); ?>
				<?php endwhile; ?>
			<?php endif; ?>
		</div>
		<?php the_posts_pagination(); ?>
	</div>
</main>
<?php
get_footer();
