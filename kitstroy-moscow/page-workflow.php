<?php
/**
 * Template Name: Как работаем
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main">
	<div class="page-head">
		<div class="container">
			<?php kitstroy_breadcrumbs(); ?>
			<p class="kicker"><?php esc_html_e( 'Как работаем', 'kitstroy-moscow' ); ?></p>
			<h1><?php esc_html_e( 'Процесс, в котором видно каждый шаг', 'kitstroy-moscow' ); ?></h1>
			<p class="lead">
				<?php esc_html_e( 'Пять этапов с понятным результатом, сроком и порядком оплаты. Заказчик всегда знает, что происходит на объекте и что будет дальше.', 'kitstroy-moscow' ); ?>
			</p>
		</div>
	</div>

	<?php get_template_part( 'template-parts/sections/workflow' ); ?>

	<section class="section section--panel">
		<div class="container">
			<div class="rules">
				<div class="rules__intro">
					<p class="kicker"><?php esc_html_e( 'Правила работы', 'kitstroy-moscow' ); ?></p>
					<h2><?php esc_html_e( 'Что мы берём на себя, а что остаётся заказчику', 'kitstroy-moscow' ); ?></h2>
				</div>
				<div class="rules__grid">
					<div class="rules__column">
						<h3><?php esc_html_e( 'Наша часть', 'kitstroy-moscow' ); ?></h3>
						<ul class="feature-list">
							<li><?php esc_html_e( 'Расчёт нагрузок, выбор сечений и аппаратов защиты', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Рабочий проект и спецификация материалов', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Закупка черновых материалов по согласованной спецификации', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Монтаж, сборка щитов, пусконаладка', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Исполнительная документация, протоколы и акты', 'kitstroy-moscow' ); ?></li>
						</ul>
					</div>
					<div class="rules__column rules__column--muted">
						<h3><?php esc_html_e( 'Что нужно от вас', 'kitstroy-moscow' ); ?></h3>
						<ul class="feature-list">
							<li><?php esc_html_e( 'Доступ на объект и согласование графика с другими подрядчиками', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Проект интерьера или планировка, если они есть', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Решение по чистовым материалам: розетки, выключатели, светильники', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Согласование скрытых работ до зашивки стен', 'kitstroy-moscow' ); ?></li>
							<li><?php esc_html_e( 'Подписание актов этапов', 'kitstroy-moscow' ); ?></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<?php
	get_template_part(
		'template-parts/sections/quiz-form',
		null,
		array(
			'form_type'  => 'universal',
			'section_id' => 'consultation',
			'title'      => __( 'Обсудим объект', 'kitstroy-moscow' ),
			'subtitle'   => __( 'Расскажите про задачу — предложим порядок работ, срок и состав бригады.', 'kitstroy-moscow' ),
		)
	);
	?>
</main>
<?php
get_footer();
