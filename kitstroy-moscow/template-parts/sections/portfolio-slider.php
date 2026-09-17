<?php
/**
 * Portfolio section: объекты с техническими данными.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$portfolio_query = new WP_Query(
	array(
		'post_type'      => 'portfolio',
		'posts_per_page' => 6,
		'post_status'    => 'publish',
	)
);

$archive_url = get_post_type_archive_link( 'portfolio' );
$archive_url = $archive_url ? $archive_url : home_url( '/portfolio/' );
?>
<section class="section section--panel portfolio-section" id="portfolio">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Объекты', 'kitstroy-moscow' ); ?></p>
				<h2><?php echo esc_html( kitstroy_get_home_text( 'home_portfolio_title', 'Что уже смонтировано и сдано' ) ); ?></h2>
			</div>
			<p class="lead portfolio-section__intro">
				<?php echo esc_html( kitstroy_get_home_text( 'home_portfolio_text', 'Каждый объект — это площадь, расчётная мощность, состав систем и срок. Так видно масштаб работ, а не только фотографию щита.' ) ); ?>
			</p>
		</div>

		<div class="card-grid card-grid--wide">
			<?php if ( $portfolio_query->have_posts() ) : ?>
				<?php
				while ( $portfolio_query->have_posts() ) :
					$portfolio_query->the_post();
					get_template_part( 'template-parts/cards/portfolio-card', null, array( 'post_id' => get_the_ID() ) );
				endwhile;
				wp_reset_postdata();
				?>
			<?php else : ?>
				<?php foreach ( kitstroy_get_demo_portfolio() as $portfolio_item ) : ?>
					<?php get_template_part( 'template-parts/cards/portfolio-card', null, array( 'item' => $portfolio_item ) ); ?>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>

		<div class="section__actions">
			<a class="button button--secondary" href="<?php echo esc_url( $archive_url ); ?>">
				<span><?php esc_html_e( 'Все объекты', 'kitstroy-moscow' ); ?></span>
			</a>
		</div>
	</div>
</section>
