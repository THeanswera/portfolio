<?php
/**
 * Документы: что заказчик получает после сдачи объекта.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$documents = array(
	array(
		'title' => __( 'Рабочий проект ЭОМ', 'kitstroy-moscow' ),
		'text'  => __( 'Однолинейная схема, планы трасс и групп, расчёт нагрузок, спецификация материалов и щита.', 'kitstroy-moscow' ),
		'tag'   => __( 'до начала работ', 'kitstroy-moscow' ),
	),
	array(
		'title' => __( 'Исполнительные схемы', 'kitstroy-moscow' ),
		'text'  => __( 'Фактическое расположение линий, щитов и оборудования с маркировкой, совпадающей с объектом.', 'kitstroy-moscow' ),
		'tag'   => __( 'после монтажа', 'kitstroy-moscow' ),
	),
	array(
		'title' => __( 'Протоколы измерений', 'kitstroy-moscow' ),
		'text'  => __( 'Сопротивление изоляции, петля «фаза-нуль», целостность защитных проводников, проверка УЗО.', 'kitstroy-moscow' ),
		'tag'   => __( 'при сдаче', 'kitstroy-moscow' ),
	),
	array(
		'title' => __( 'Акты и паспорта', 'kitstroy-moscow' ),
		'text'  => __( 'Акты скрытых работ, акт приёмки, паспорта щитов и журнал кабельных линий.', 'kitstroy-moscow' ),
		'tag'   => __( 'при сдаче', 'kitstroy-moscow' ),
	),
);
?>
<section class="section documents-section" id="documents">
	<div class="container">
		<div class="documents">
			<div class="documents__intro">
				<p class="kicker"><?php esc_html_e( 'Документы', 'kitstroy-moscow' ); ?></p>
				<h2><?php esc_html_e( 'После сдачи остаётся не «сделали и уехали», а комплект документов', 'kitstroy-moscow' ); ?></h2>
				<p class="lead">
					<?php esc_html_e( 'Через год вы откроете щит и поймёте, какая линия за что отвечает. При продаже объекта или проверке документы тоже понадобятся — они уже будут на руках.', 'kitstroy-moscow' ); ?>
				</p>
				<div class="documents__note note note--info">
					<strong><?php esc_html_e( 'Демонстрация.', 'kitstroy-moscow' ); ?></strong>
					<?php esc_html_e( 'Состав комплекта показан как образец: реальные формы актов и протоколов зависят от требований вашей управляющей компании и надзора.', 'kitstroy-moscow' ); ?>
				</div>
			</div>

			<ul class="documents__list">
				<?php foreach ( $documents as $index => $document ) : ?>
					<li class="document" data-reveal>
						<span class="document__index"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
						<div>
							<div class="document__head">
								<h3><?php echo esc_html( (string) $document['title'] ); ?></h3>
								<span class="tag tag--accent"><?php echo esc_html( (string) $document['tag'] ); ?></span>
							</div>
							<p><?php echo esc_html( (string) $document['text'] ); ?></p>
						</div>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
	</div>
</section>
