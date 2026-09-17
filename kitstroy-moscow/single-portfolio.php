<?php
/**
 * Single portfolio template: объект со спецификацией и этапами.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$portfolio_data  = kitstroy_get_portfolio_data( get_the_ID() );
	$type            = $portfolio_data['type'];
	$city            = $portfolio_data['city'];
	$duration        = $portfolio_data['duration'];
	$scope           = $portfolio_data['scope'];
	$short           = $portfolio_data['short'];
	$task            = $portfolio_data['task'];
	$work_done       = $portfolio_data['work_done'];
	$result          = $portfolio_data['result'];
	$main_image      = $portfolio_data['main_image'];
	$gallery         = $portfolio_data['gallery'];
	$systems         = $portfolio_data['systems'];
	$completion_date = kitstroy_format_optional_date( $portfolio_data['completion_date'], 'm.Y' );
	$has_description = '' !== trim( wp_strip_all_tags( get_the_content() ) );
	$specs           = kitstroy_get_project_specs(
		array(
			'title'   => get_the_title(),
			'systems' => $systems,
			'scope'   => $scope,
		)
	);
	?>
	<main id="primary" class="site-main">
		<div class="page-head">
			<div class="container">
				<?php kitstroy_breadcrumbs(); ?>
				<div class="project-hero">
					<div class="project-hero__content">
						<p class="kicker"><?php esc_html_e( 'Объект', 'kitstroy-moscow' ); ?></p>
						<h1><?php the_title(); ?></h1>
						<?php if ( $short ) : ?><p class="lead"><?php echo esc_html( $short ); ?></p><?php endif; ?>
						<div class="tag-list project-hero__tags">
							<?php foreach ( (array) $systems as $system ) : ?>
								<span class="tag tag--accent"><?php echo esc_html( (string) $system ); ?></span>
							<?php endforeach; ?>
						</div>
						<div class="project-hero__actions">
							<a class="button button--primary" href="#portfolio-consultation">
								<span><?php esc_html_e( 'Хочу такой объект', 'kitstroy-moscow' ); ?></span>
							</a>
							<a class="button button--secondary" href="<?php echo esc_url( home_url( '/portfolio/' ) ); ?>">
								<span><?php esc_html_e( 'Все объекты', 'kitstroy-moscow' ); ?></span>
							</a>
						</div>
					</div>

					<figure class="project-hero__media corners">
						<img src="<?php echo esc_url( $main_image['url'] ); ?>" alt="<?php echo esc_attr( $main_image['alt'] ); ?>" loading="eager">
						<figcaption class="tech"><?php echo esc_html( $scope ?: $type ); ?></figcaption>
					</figure>
				</div>
			</div>
		</div>

		<div class="section section--tight">
			<div class="container">
				<dl class="spec-grid">
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Тип объекта', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $type ?: __( 'Не указан', 'kitstroy-moscow' ) ); ?></dd>
					</div>
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Адрес', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $city ?: __( 'Москва и область', 'kitstroy-moscow' ) ); ?></dd>
					</div>
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Площадь', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $specs['area'] ); ?></dd>
					</div>
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Расчётная мощность', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $specs['power'] ); ?></dd>
					</div>
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Точек и линий', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $specs['points'] ); ?></dd>
					</div>
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Срок работ', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $duration ?: __( 'по графику', 'kitstroy-moscow' ) ); ?></dd>
					</div>
					<div class="spec-grid__item">
						<dt><?php esc_html_e( 'Сдача', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $completion_date ?: __( 'текущий год', 'kitstroy-moscow' ) ); ?></dd>
					</div>
					<div class="spec-grid__item spec-grid__item--accent">
						<dt><?php esc_html_e( 'Ориентир сметы', 'kitstroy-moscow' ); ?></dt>
						<dd><?php echo esc_html( $specs['estimate'] ); ?></dd>
					</div>
				</dl>
			</div>
		</div>

		<div class="section section--panel">
			<div class="container">
				<div class="project-story">
					<?php if ( $has_description ) : ?>
						<section class="content-block">
							<h2><?php esc_html_e( 'Описание объекта', 'kitstroy-moscow' ); ?></h2>
							<div class="entry-content"><?php the_content(); ?></div>
						</section>
					<?php endif; ?>

					<?php if ( $task ) : ?>
						<section class="content-block">
							<h2><?php esc_html_e( 'Задача', 'kitstroy-moscow' ); ?></h2>
							<p class="lead"><?php echo esc_html( $task ); ?></p>
						</section>
					<?php endif; ?>

					<?php if ( $work_done ) : ?>
						<section class="content-block">
							<h2><?php esc_html_e( 'Что сделали', 'kitstroy-moscow' ); ?></h2>
							<p class="lead"><?php echo esc_html( $work_done ); ?></p>
						</section>
					<?php endif; ?>

					<?php if ( $result ) : ?>
						<section class="content-block">
							<h2><?php esc_html_e( 'Результат', 'kitstroy-moscow' ); ?></h2>
							<p class="note note--info"><?php echo esc_html( $result ); ?></p>
						</section>
					<?php endif; ?>

					<?php if ( ! empty( $systems ) ) : ?>
						<section class="content-block">
							<h2><?php esc_html_e( 'Состав систем', 'kitstroy-moscow' ); ?></h2>
							<ul class="feature-list">
								<?php foreach ( $systems as $system ) : ?>
									<li><?php echo esc_html( (string) $system ); ?></li>
								<?php endforeach; ?>
							</ul>
						</section>
					<?php endif; ?>
				</div>

				<?php if ( ! empty( $gallery ) ) : ?>
					<div class="gallery-grid">
						<?php foreach ( $gallery as $gallery_item ) : ?>
							<?php $image = kitstroy_get_image_data( is_array( $gallery_item ) && isset( $gallery_item['ID'] ) ? $gallery_item['ID'] : $gallery_item, get_the_title() ); ?>
							<figure class="gallery-grid__item">
								<img src="<?php echo esc_url( $image['url'] ); ?>" alt="<?php echo esc_attr( $image['alt'] ); ?>" loading="lazy">
							</figure>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<?php
		get_template_part(
			'template-parts/sections/quiz-form',
			null,
			array(
				'form_type'  => 'universal',
				'section_id' => 'portfolio-consultation',
				'title'      => __( 'Нужен похожий объект?', 'kitstroy-moscow' ),
				'subtitle'   => __( 'Опишите площадь, состояние объекта и срок — предложим состав систем и бригаду.', 'kitstroy-moscow' ),
			)
		);
		?>
	</main>
	<?php
endwhile;

get_footer();
