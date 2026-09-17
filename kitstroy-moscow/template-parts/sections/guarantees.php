<?php
/**
 * Обещания, за которые подрядчик отвечает деньгами.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$promises = array(
	array(
		'title' => __( 'Смета фиксируется в договоре', 'kitstroy-moscow' ),
		'text'  => __( 'После замера цена не меняется. Доплаты возможны только по вашему письменному согласию — если вы сами меняете состав работ.', 'kitstroy-moscow' ),
		'mark'  => '₽',
	),
	array(
		'title' => __( 'Срок в договоре, а не «примерно»', 'kitstroy-moscow' ),
		'text'  => __( 'За каждый день просрочки по нашей вине — компенсация 1 % от суммы договора. Срок фиксируем до начала работ.', 'kitstroy-moscow' ),
		'mark'  => '⏱',
	),
	array(
		'title' => __( 'Гарантия два года на монтаж', 'kitstroy-moscow' ),
		'text'  => __( 'Гарантия на оборудование — по условиям производителя. Выезд по гарантийному случаю в течение двух рабочих дней.', 'kitstroy-moscow' ),
		'mark'  => '✓',
	),
	array(
		'title' => __( 'Исполнительная документация', 'kitstroy-moscow' ),
		'text'  => __( 'Схемы, маркировка линий, протоколы измерений и акты. Через год вы откроете щит и поймёте, что где стоит.', 'kitstroy-moscow' ),
		'mark'  => '≡',
	),
);
?>
<section class="section section--panel" id="guarantees">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Почему нам можно верить', 'kitstroy-moscow' ); ?></p>
				<h2><?php esc_html_e( 'Четыре обещания, за которые отвечаем деньгами', 'kitstroy-moscow' ); ?></h2>
			</div>
			<p class="lead guarantees__intro">
				<?php esc_html_e( 'Мы не пишем «индивидуальный подход» и «лучшие материалы». Вместо этого фиксируем в договоре цену, срок и гарантию — и объясняем, что будет, если мы их нарушим.', 'kitstroy-moscow' ); ?>
			</p>
		</div>

		<div class="guarantees">
			<?php foreach ( $promises as $index => $promise ) : ?>
				<article class="guarantee" data-reveal>
					<div class="guarantee__head">
						<span class="guarantee__index"><?php echo esc_html( str_pad( (string) ( $index + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
						<span class="guarantee__mark" aria-hidden="true"><?php echo esc_html( (string) $promise['mark'] ); ?></span>
					</div>
					<h3><?php echo esc_html( (string) $promise['title'] ); ?></h3>
					<p><?php echo esc_html( (string) $promise['text'] ); ?></p>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
