<?php
/**
 * Default page template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main section">
	<div class="container content-layout">
		<?php while ( have_posts() ) : the_post(); ?>
			<?php kitstroy_breadcrumbs(); ?>
			<article <?php post_class( 'page-content' ); ?>>
				<h1 class="page-title"><?php the_title(); ?></h1>
				<div class="entry-content"><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>
	</div>
</main>
<?php
get_footer();
