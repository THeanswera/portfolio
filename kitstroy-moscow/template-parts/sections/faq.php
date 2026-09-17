<?php
/**
 * Частые вопросы: раскрывающийся список.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$faq = array(
	array(
		'q' => __( 'Можно ли работать по готовому проекту другого бюро?', 'kitstroy-moscow' ),
		'a' => __( 'Да. Проверяем решения на соответствие нагрузкам и ПУЭ, при необходимости даём замечания и корректируем рабочую документацию до начала монтажа.', 'kitstroy-moscow' ),
	),
	array(
		'q' => __( 'Сколько стоит выезд инженера?', 'kitstroy-moscow' ),
		'a' => __( 'Выезд по Москве и в пределах 30 км от МКАД бесплатный при заказе работ. Если объект далеко или нужен только аудит, стоимость выезда фиксируем заранее.', 'kitstroy-moscow' ),
	),
	array(
		'q' => __( 'Кто покупает материалы?', 'kitstroy-moscow' ),
		'a' => __( 'По умолчанию закупаем мы по согласованной спецификации — так проще держать сроки. Можно закупать самостоятельно: тогда даём точную ведомость с артикулами.', 'kitstroy-moscow' ),
	),
	array(
		'q' => __( 'Что с гарантией, если что-то сломалось?', 'kitstroy-moscow' ),
		'a' => __( 'На монтаж — два года, на оборудование действует гарантия производителя. Выезд по гарантийному обращению — в течение двух рабочих дней, диагностика и замена в рамках гарантии бесплатны.', 'kitstroy-moscow' ),
	),
	array(
		'q' => __( 'Работаете ли вы с управляющими компаниями и надзором?', 'kitstroy-moscow' ),
		'a' => __( 'Да. Готовим допуски, согласования и исполнительную документацию в формате, который требует УК, технадзор или инспекция.', 'kitstroy-moscow' ),
	),
	array(
		'q' => __( 'Можно ли монтировать этапами, по мере ремонта?', 'kitstroy-moscow' ),
		'a' => __( 'Да, это обычная практика. Согласуем график с отделочниками: трассы и щит — на черновом этапе, розетки и светильники — после чистовой отделки.', 'kitstroy-moscow' ),
	),
);
?>
<section class="section faq-section" id="faq">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Вопросы', 'kitstroy-moscow' ); ?></p>
				<h2><?php esc_html_e( 'Что спрашивают до заказа', 'kitstroy-moscow' ); ?></h2>
			</div>
			<p class="lead faq-section__intro">
				<?php esc_html_e( 'Если вашего вопроса здесь нет — напишите, ответим честно и без «приезжайте, обсудим на месте».', 'kitstroy-moscow' ); ?>
			</p>
		</div>

		<div class="faq">
			<?php foreach ( $faq as $index => $item ) : ?>
				<details class="faq__item" data-reveal <?php echo 0 === $index ? 'open' : ''; ?>>
					<summary>
						<span><?php echo esc_html( (string) $item['q'] ); ?></span>
						<span class="faq__mark" aria-hidden="true">+</span>
					</summary>
					<p><?php echo esc_html( (string) $item['a'] ); ?></p>
				</details>
			<?php endforeach; ?>
		</div>
	</div>
</section>
