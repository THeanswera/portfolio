<?php
/**
 * Template Name: Документы
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$sets = array(
	array(
		'title' => __( 'Для квартиры или дома', 'kitstroy-moscow' ),
		'items' => array(
			__( 'Однолинейная схема щита с номиналами аппаратов', 'kitstroy-moscow' ),
			__( 'План групп с привязкой к помещениям', 'kitstroy-moscow' ),
			__( 'Спецификация кабеля и аппаратов', 'kitstroy-moscow' ),
			__( 'Протокол замера сопротивления изоляции', 'kitstroy-moscow' ),
			__( 'Акт приёмки и гарантийный талон', 'kitstroy-moscow' ),
		),
	),
	array(
		'title' => __( 'Для офиса и коммерции', 'kitstroy-moscow' ),
		'items' => array(
			__( 'Рабочая документация ЭОМ и СС', 'kitstroy-moscow' ),
			__( 'Кабельный журнал и ведомость материалов', 'kitstroy-moscow' ),
			__( 'Протоколы измерений и проверки УЗО', 'kitstroy-moscow' ),
			__( 'Акты скрытых работ по трассам', 'kitstroy-moscow' ),
			__( 'Паспорта щитов и журнал маркировки', 'kitstroy-moscow' ),
		),
	),
	array(
		'title' => __( 'Для производств и складов', 'kitstroy-moscow' ),
		'items' => array(
			__( 'Схемы распределения нагрузок по секциям', 'kitstroy-moscow' ),
			__( 'Расчёт потерь и балансировка фаз', 'kitstroy-moscow' ),
			__( 'Протоколы пусконаладочных испытаний', 'kitstroy-moscow' ),
			__( 'Программа и график обслуживания', 'kitstroy-moscow' ),
			__( 'Журнал эксплуатации и инструктажа персонала', 'kitstroy-moscow' ),
		),
	),
);
?>
<main id="primary" class="site-main">
	<div class="page-head">
		<div class="container">
			<?php kitstroy_breadcrumbs(); ?>
			<p class="kicker"><?php esc_html_e( 'Документы', 'kitstroy-moscow' ); ?></p>
			<h1><?php esc_html_e( 'Что остаётся у заказчика после сдачи', 'kitstroy-moscow' ); ?></h1>
			<p class="lead">
				<?php esc_html_e( 'Инженерная система живёт годами: её обслуживают, ремонтируют, расширяют. Без документов каждый электрик начинает с нуля и рискует ошибиться. Поэтому комплект документации — часть работы, а не бонус.', 'kitstroy-moscow' ); ?>
			</p>
		</div>
	</div>

	<?php get_template_part( 'template-parts/sections/documents' ); ?>

	<section class="section section--tight">
		<div class="container">
			<div class="section-head">
				<p class="kicker"><?php esc_html_e( 'Комплекты', 'kitstroy-moscow' ); ?></p>
				<h2><?php esc_html_e( 'Состав зависит от типа объекта', 'kitstroy-moscow' ); ?></h2>
			</div>
			<div class="card-grid">
				<?php foreach ( $sets as $set ) : ?>
					<article class="card" data-reveal>
						<h3 class="card__title"><?php echo esc_html( (string) $set['title'] ); ?></h3>
						<ul class="card__list">
							<?php foreach ( $set['items'] as $item ) : ?>
								<li><?php echo esc_html( (string) $item ); ?></li>
							<?php endforeach; ?>
						</ul>
					</article>
				<?php endforeach; ?>
			</div>
			<div class="note note--info documents__note">
				<strong><?php esc_html_e( 'Демонстрация.', 'kitstroy-moscow' ); ?></strong>
				<?php esc_html_e( 'Формы протоколов и актов согласуем с вашей управляющей компанией или надзором: у разных организаций свои требования к оформлению.', 'kitstroy-moscow' ); ?>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/sections/faq' ); ?>

	<?php
	get_template_part(
		'template-parts/sections/quiz-form',
		null,
		array(
			'form_type'  => 'universal',
			'section_id' => 'consultation',
			'title'      => __( 'Нужен комплект документов по объекту?', 'kitstroy-moscow' ),
			'subtitle'   => __( 'Опишите объект: скажем, какие документы подготовим и что для этого нужно.', 'kitstroy-moscow' ),
		)
	);
	?>
</main>
<?php
get_footer();
