<?php
/**
 * Single service template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$service_data = kitstroy_get_service_data( get_the_ID() );
	$subtitle     = $service_data['subtitle'];
	$short        = $service_data['short'];
	$benefits     = $service_data['benefits'];
	$stages       = $service_data['stages'];
	$included     = $service_data['included'];
	$gallery      = $service_data['gallery'];
	$faq_items    = $service_data['faq_items'];
	$related_ids  = array_values(
		array_filter(
			array_map( 'absint', (array) $service_data['related_ids'] ),
			static fn( int $related_id ): bool => $related_id > 0 && get_the_ID() !== $related_id
		)
	);
	$cta_title    = $service_data['cta_title'];
	$cta_text     = $service_data['cta_text'];
	?>
	<main id="primary" class="site-main">
		<div class="page-head">
			<div class="container">
				<?php kitstroy_breadcrumbs(); ?>
				<p class="kicker"><?php esc_html_e( 'Услуга', 'kitstroy-moscow' ); ?></p>
				<h1><?php the_title(); ?></h1>
				<?php if ( $subtitle ) : ?><p class="lead"><?php echo esc_html( $subtitle ); ?></p><?php endif; ?>
				<?php if ( $short ) : ?><p class="service-single__lead"><?php echo esc_html( $short ); ?></p><?php endif; ?>
			</div>
		</div>

		<div class="section section--tight">
			<div class="container">
				<div class="service-single__content">
					<div class="service-single__main">
						<?php if ( get_the_content() ) : ?>
							<div class="entry-content"><?php the_content(); ?></div>
						<?php endif; ?>

						<?php if ( ! empty( $included ) ) : ?>
							<section class="content-block">
								<h2><?php esc_html_e( 'Что входит в состав работ', 'kitstroy-moscow' ); ?></h2>
								<ul class="feature-list">
									<?php foreach ( $included as $included_item ) : ?>
										<li><?php echo esc_html( $included_item ); ?></li>
									<?php endforeach; ?>
								</ul>
							</section>
						<?php endif; ?>

						<?php if ( ! empty( $benefits ) ) : ?>
							<section class="content-block">
								<h2><?php esc_html_e( 'Почему так, а не иначе', 'kitstroy-moscow' ); ?></h2>
								<ul class="feature-list feature-list--accent">
									<?php foreach ( $benefits as $benefit ) : ?>
										<li><?php echo esc_html( $benefit ); ?></li>
									<?php endforeach; ?>
								</ul>
							</section>
						<?php endif; ?>

						<?php if ( ! empty( $stages ) ) : ?>
							<section class="content-block">
								<h2><?php esc_html_e( 'Этапы работ', 'kitstroy-moscow' ); ?></h2>
								<ol class="stage-list">
									<?php foreach ( $stages as $stage_index => $stage ) : ?>
										<li>
											<span class="stage-list__num"><?php echo esc_html( sprintf( '%02d', $stage_index + 1 ) ); ?></span>
											<span><?php echo esc_html( $stage ); ?></span>
										</li>
									<?php endforeach; ?>
								</ol>
							</section>
						<?php endif; ?>

						<?php if ( ! empty( $gallery ) && is_array( $gallery ) ) : ?>
							<section class="content-block">
								<h2><?php esc_html_e( 'Как это выглядит', 'kitstroy-moscow' ); ?></h2>
								<div class="gallery-grid">
									<?php foreach ( $gallery as $image ) : ?>
										<?php $image_data = kitstroy_get_image_data( $image, get_the_title() ); ?>
										<figure class="gallery-grid__item">
											<img src="<?php echo esc_url( $image_data['url'] ); ?>" alt="<?php echo esc_attr( $image_data['alt'] ); ?>" loading="lazy">
										</figure>
									<?php endforeach; ?>
								</div>
							</section>
						<?php endif; ?>

						<?php
						$faq_entities = array();

						foreach ( (array) $faq_items as $faq_item ) {
							$question = is_array( $faq_item ) ? (string) ( $faq_item['question'] ?? '' ) : '';
							$answer   = is_array( $faq_item ) ? (string) ( $faq_item['answer'] ?? '' ) : '';

							if ( '' === $question || '' === $answer ) {
								continue;
							}

							$faq_entities[] = array(
								'question' => $question,
								'answer'   => $answer,
							);
						}
						?>
						<?php if ( ! empty( $faq_entities ) ) : ?>
							<section class="content-block">
								<h2><?php esc_html_e( 'Вопросы по услуге', 'kitstroy-moscow' ); ?></h2>
								<div class="faq">
									<?php foreach ( $faq_entities as $faq_item ) : ?>
										<details class="faq__item">
											<summary>
												<span><?php echo esc_html( $faq_item['question'] ); ?></span>
												<span class="faq__mark" aria-hidden="true">+</span>
											</summary>
											<div class="faq__answer"><?php echo kitstroy_render_rich_text( $faq_item['answer'] ); ?></div>
										</details>
									<?php endforeach; ?>
								</div>
							</section>
						<?php endif; ?>
					</div>

					<aside class="service-single__sidebar">
						<div class="cta-panel corners">
							<p class="kicker kicker--plain"><?php esc_html_e( 'Заявка', 'kitstroy-moscow' ); ?></p>
							<h2><?php echo esc_html( $cta_title ); ?></h2>
							<p><?php echo esc_html( $cta_text ); ?></p>
							<a class="button button--primary button--block" href="#service-consultation">
								<span><?php esc_html_e( 'Получить предложение', 'kitstroy-moscow' ); ?></span>
							</a>
							<p class="tech cta-panel__note"><?php esc_html_e( 'Ответим в рабочее время. Выезд инженера по Москве — бесплатно при заказе.', 'kitstroy-moscow' ); ?></p>
						</div>
					</aside>
				</div>
			</div>
		</div>

		<section class="section section--panel">
			<div class="container">
				<div class="section-head">
					<p class="kicker"><?php esc_html_e( 'Сопутствующие услуги', 'kitstroy-moscow' ); ?></p>
					<h2><?php esc_html_e( 'С чем это обычно заказывают', 'kitstroy-moscow' ); ?></h2>
				</div>
				<div class="card-grid">
					<?php
					if ( ! empty( $related_ids ) ) {
						foreach ( $related_ids as $related_id ) {
							get_template_part( 'template-parts/cards/service-card', null, array( 'post_id' => $related_id ) );
						}
					} else {
						$related_query = new WP_Query(
							array(
								'post_type'      => 'service',
								'posts_per_page' => 3,
								'post__not_in'   => array( get_the_ID() ),
							)
						);

						if ( $related_query->have_posts() ) {
							while ( $related_query->have_posts() ) {
								$related_query->the_post();
								get_template_part( 'template-parts/cards/service-card', null, array( 'post_id' => get_the_ID() ) );
							}
							wp_reset_postdata();
						} else {
							foreach ( array_slice( kitstroy_get_demo_services(), 0, 3 ) as $service_item ) {
								get_template_part( 'template-parts/cards/service-card', null, array( 'item' => $service_item ) );
							}
						}
					}
					?>
				</div>
			</div>
		</section>

		<?php
		get_template_part(
			'template-parts/sections/quiz-form',
			null,
			array(
				'form_type'  => 'universal',
				'section_id' => 'service-consultation',
				'title'      => __( 'Нужна эта услуга на объекте?', 'kitstroy-moscow' ),
				'subtitle'   => __( 'Пришлите вводные данные: площадь, состояние объекта и срок. Вернёмся с составом работ и сметой.', 'kitstroy-moscow' ),
			)
		);
		?>
	</main>
	<?php
endwhile;

get_footer();
