<?php
/**
 * Services grid section.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$services_query = new WP_Query(
	array(
		'post_type'      => 'service',
		'posts_per_page' => 6,
		'post_status'    => 'publish',
	)
);

$archive_url = get_post_type_archive_link( 'service' );
$archive_url = $archive_url ? $archive_url : home_url( '/services/' );
?>
<section class="section services-section" id="services">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Что делаем', 'kitstroy-moscow' ); ?></p>
				<h2><?php echo esc_html( kitstroy_get_home_text( 'home_services_title', 'Инженерные системы под один договор' ) ); ?></h2>
			</div>
			<p class="lead services-section__intro">
				<?php echo esc_html( kitstroy_get_home_text( 'home_services_text', 'От обследования и проекта до монтажа, сборки щитов и пусконаладки. В каждой услуге видно, что именно входит в работу и чем она заканчивается.' ) ); ?>
			</p>
		</div>

		<div class="card-grid">
			<?php if ( $services_query->have_posts() ) : ?>
				<?php
				$index = 0;
				while ( $services_query->have_posts() ) :
					$services_query->the_post();
					get_template_part( 'template-parts/cards/service-card', null, array( 'post_id' => get_the_ID(), 'index' => $index ) );
					$index++;
				endwhile;
				wp_reset_postdata();
				?>
			<?php else : ?>
				<?php foreach ( kitstroy_get_demo_services() as $index => $service_item ) : ?>
					<?php get_template_part( 'template-parts/cards/service-card', null, array( 'item' => $service_item, 'index' => $index ) ); ?>
				<?php endforeach; ?>
			<?php endif; ?>
		</div>

		<div class="section__actions">
			<a class="button button--secondary" href="<?php echo esc_url( $archive_url ); ?>">
				<span><?php esc_html_e( 'Все услуги и состав работ', 'kitstroy-moscow' ); ?></span>
			</a>
		</div>
	</div>
</section>
