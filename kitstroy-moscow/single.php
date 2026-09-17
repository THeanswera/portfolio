<?php
/**
 * Default single template for posts.
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
			<article <?php post_class( 'article-layout' ); ?>>
				<header class="article-layout__header">
					<div class="article-layout__meta">
						<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date( 'd.m.Y' ) ); ?></time>
					</div>
					<h1><?php the_title(); ?></h1>
				</header>
				<?php if ( has_post_thumbnail() ) : ?>
					<div class="article-layout__thumbnail"><?php the_post_thumbnail( 'large', array( 'loading' => 'eager' ) ); ?></div>
				<?php endif; ?>
				<div class="entry-content"><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>
	</div>
</main>
<?php
get_footer();
