<?php
/**
 * Portfolio archive template: объекты с фильтром по типу.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$terms         = get_terms( array( 'taxonomy' => 'portfolio_type', 'hide_empty' => false ) );
$selected_term = isset( $_GET['object_type'] ) ? sanitize_title( wp_unslash( $_GET['object_type'] ) ) : '';
$current_page  = kitstroy_get_archive_current_page();
$query_args    = array(
	'post_type'      => 'portfolio',
	'posts_per_page' => 12,
	'post_status'    => 'publish',
	'paged'          => $current_page,
);

if ( $selected_term ) {
	$query_args['tax_query'] = array(
		array(
			'taxonomy' => 'portfolio_type',
			'field'    => 'slug',
			'terms'    => $selected_term,
		),
	);
}

$portfolio_query = new WP_Query( $query_args );
$intro           = kitstroy_get_archive_intro( 'portfolio' );

// Типы объектов для фильтра: из таксономии, иначе из демо-данных.
$filter_items = array();

foreach ( (array) $terms as $term ) {
	$filter_items[ $term->slug ] = $term->name;
}

if ( empty( $filter_items ) ) {
	foreach ( kitstroy_get_demo_portfolio() as $project ) {
		$type = (string) ( $project['type'] ?? '' );

		if ( '' === $type ) {
			continue;
		}

		$filter_items[ sanitize_title( $type ) ] = $type;
	}
}

get_header();
?>
<main id="primary" class="site-main">
	<div class="page-head">
		<div class="container">
			<?php kitstroy_breadcrumbs(); ?>
			<p class="kicker"><?php esc_html_e( 'Объекты', 'kitstroy-moscow' ); ?></p>
			<h1><?php echo esc_html( $intro['title'] ); ?></h1>
			<p class="lead"><?php echo esc_html( $intro['description'] ); ?></p>
		</div>
	</div>

	<div class="section">
		<div class="container">
			<div class="filter-bar" role="group" aria-label="<?php esc_attr_e( 'Фильтр по типу объекта', 'kitstroy-moscow' ); ?>">
				<a class="filter-bar__link <?php echo '' === $selected_term ? 'is-active' : ''; ?>" href="<?php echo esc_url( get_post_type_archive_link( 'portfolio' ) ); ?>">
					<?php esc_html_e( 'Все объекты', 'kitstroy-moscow' ); ?>
				</a>
				<?php foreach ( $filter_items as $slug => $label ) : ?>
					<a class="filter-bar__link <?php echo $selected_term === $slug ? 'is-active' : ''; ?>" href="<?php echo esc_url( add_query_arg( 'object_type', $slug, get_post_type_archive_link( 'portfolio' ) ) ); ?>">
						<?php echo esc_html( (string) $label ); ?>
					</a>
				<?php endforeach; ?>
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
					<?php
					$shown = 0;
					foreach ( kitstroy_get_demo_portfolio() as $portfolio_item ) {
						if ( $selected_term && sanitize_title( (string) $portfolio_item['type'] ) !== $selected_term ) {
							continue;
						}

						get_template_part( 'template-parts/cards/portfolio-card', null, array( 'item' => $portfolio_item ) );
						$shown++;
					}
					?>
					<?php if ( 0 === $shown ) : ?>
						<p class="lead"><?php esc_html_e( 'В этой категории пока нет объектов. Посмотрите все проекты — там есть квартиры, дома, офисы и производства.', 'kitstroy-moscow' ); ?></p>
					<?php endif; ?>
				<?php endif; ?>
			</div>

			<?php echo wp_kses_post( kitstroy_get_paginated_links( (int) $portfolio_query->max_num_pages, $current_page, array( 'object_type' => $selected_term ) ) ); ?>
		</div>
	</div>

	<?php
	get_template_part(
		'template-parts/sections/quiz-form',
		null,
		array(
			'form_type'  => 'universal',
			'section_id' => 'portfolio-consultation',
			'title'      => __( 'Вашего объекта здесь нет?', 'kitstroy-moscow' ),
			'subtitle'   => __( 'Опишите задачу: работаем и с нестандартными объектами — цехами, складами, медицинскими и учебными помещениями.', 'kitstroy-moscow' ),
		)
	);
	?>
</main>
<?php
get_footer();
