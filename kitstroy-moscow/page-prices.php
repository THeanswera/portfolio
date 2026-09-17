<?php
/**
 * Template Name: Цены
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$intro      = kitstroy_get_post_field_value( 'prices_intro', get_the_ID(), 'Ниже — ориентиры по типовым работам. Точную смету фиксируем после выезда инженера: она зависит от площади, состава систем и фактических трасс.' );
	$prices     = kitstroy_get_post_field_value( 'prices_table', get_the_ID(), kitstroy_get_default_prices() );
	$note       = kitstroy_get_post_field_value( 'prices_note', get_the_ID(), 'Цены указаны без стоимости чистовых изделий: розеток, выключателей и светильников. Их подбираем вместе с вами по бюджету.' );
	$included   = kitstroy_get_estimate_included();
	$objects    = kitstroy_get_estimate_objects();
	$systems    = kitstroy_get_estimate_systems();
	?>
	<main id="primary" class="site-main">
		<div class="page-head">
			<div class="container">
				<?php kitstroy_breadcrumbs(); ?>
				<p class="kicker"><?php esc_html_e( 'Цены', 'kitstroy-moscow' ); ?></p>
				<h1><?php echo esc_html( get_the_title() ); ?></h1>
				<p class="lead"><?php echo esc_html( $intro ); ?></p>
				<div class="page-head__actions">
					<a class="button button--primary" href="<?php echo esc_url( home_url( '/calculator/' ) ); ?>">
						<span><?php esc_html_e( 'Посчитать по параметрам', 'kitstroy-moscow' ); ?></span>
					</a>
					<a class="button button--secondary" href="#prices-consultation">
						<span><?php esc_html_e( 'Запросить смету', 'kitstroy-moscow' ); ?></span>
					</a>
				</div>
			</div>
		</div>

		<div class="section section--tight">
			<div class="container">
				<div class="price-table-wrap">
					<table class="price-table">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Работа', 'kitstroy-moscow' ); ?></th>
								<th><?php esc_html_e( 'Единица', 'kitstroy-moscow' ); ?></th>
								<th><?php esc_html_e( 'Цена', 'kitstroy-moscow' ); ?></th>
								<th><?php esc_html_e( 'Что учесть', 'kitstroy-moscow' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $prices as $row ) : ?>
								<tr>
									<td data-label="<?php esc_attr_e( 'Работа', 'kitstroy-moscow' ); ?>"><?php echo esc_html( $row['service'] ?? '' ); ?></td>
									<td data-label="<?php esc_attr_e( 'Единица', 'kitstroy-moscow' ); ?>"><?php echo esc_html( $row['unit'] ?? '' ); ?></td>
									<td data-label="<?php esc_attr_e( 'Цена', 'kitstroy-moscow' ); ?>" class="price-table__price"><?php echo esc_html( $row['price'] ?? '' ); ?></td>
									<td data-label="<?php esc_attr_e( 'Что учесть', 'kitstroy-moscow' ); ?>"><?php echo esc_html( $row['note'] ?? '' ); ?></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
				<p class="calc-hint tech"><?php echo esc_html( $note ); ?></p>
			</div>
		</div>

		<div class="section section--panel">
			<div class="container">
				<div class="section-head">
					<p class="kicker"><?php esc_html_e( 'Из чего состоит смета', 'kitstroy-moscow' ); ?></p>
					<h2><?php esc_html_e( 'Четыре части каждой сметы', 'kitstroy-moscow' ); ?></h2>
				</div>
				<div class="card-grid">
					<?php foreach ( $included as $item ) : ?>
						<article class="card" data-reveal>
							<div class="card__head">
								<span class="card__index"><?php echo esc_html( (string) $item['value'] ); ?></span>
							</div>
							<h3 class="card__title"><?php echo esc_html( (string) $item['title'] ); ?></h3>
							<p class="card__text"><?php echo esc_html( (string) $item['text'] ); ?></p>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		</div>

		<div class="section">
			<div class="container">
				<div class="section-head section-head--row">
					<div>
						<p class="kicker"><?php esc_html_e( 'Ставки', 'kitstroy-moscow' ); ?></p>
						<h2><?php esc_html_e( 'База расчёта по типам объектов', 'kitstroy-moscow' ); ?></h2>
					</div>
					<p class="lead"><?php esc_html_e( 'Ставка включает монтаж трасс, групп, сборку щита и пусконаладку. Системы считаются коэффициентом к базе — подробности на странице калькулятора.', 'kitstroy-moscow' ); ?></p>
				</div>
				<div class="rate-grid">
					<?php foreach ( $objects as $object ) : ?>
						<div class="rate-grid__item">
							<span class="rate-grid__value"><?php echo esc_html( number_format_i18n( (float) $object['rate'] ) ); ?> ₽/м²</span>
							<span class="rate-grid__label"><?php echo esc_html( (string) $object['label'] ); ?></span>
							<span class="tech"><?php echo esc_html( (string) $object['hint'] ); ?></span>
						</div>
					<?php endforeach; ?>
				</div>

				<div class="tag-list rate-grid__tags">
					<?php foreach ( $systems as $system ) : ?>
						<span class="tag tag--accent"><?php echo esc_html( (string) $system['short'] ); ?> +<?php echo esc_html( (string) round( ( (float) $system['multiplier'] ) * 100 ) ); ?> %</span>
					<?php endforeach; ?>
				</div>
			</div>
		</div>

		<?php get_template_part( 'template-parts/sections/faq' ); ?>

		<?php
		get_template_part(
			'template-parts/sections/quiz-form',
			null,
			array(
				'form_type'  => 'estimate',
				'section_id' => 'prices-consultation',
				'title'      => __( 'Нужна смета по вашему объекту?', 'kitstroy-moscow' ),
				'subtitle'   => __( 'Пришлите площадь и состав систем — вернёмся со сметой по позициям и графиком работ.', 'kitstroy-moscow' ),
			)
		);
		?>
	</main>
	<?php
endwhile;

get_footer();
