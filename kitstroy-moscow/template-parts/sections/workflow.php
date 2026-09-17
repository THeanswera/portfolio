<?php
/**
 * Как работаем: этапы с результатом каждого шага.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$steps = kitstroy_get_home_process_steps();
$extra = array(
	array(
		'days'   => __( '1 день', 'kitstroy-moscow' ),
		'result' => __( 'Заявка с составом работ и площадью', 'kitstroy-moscow' ),
		'pay'    => __( 'бесплатно', 'kitstroy-moscow' ),
	),
	array(
		'days'   => __( '1–3 дня', 'kitstroy-moscow' ),
		'result' => __( 'Акт обследования и технические решения', 'kitstroy-moscow' ),
		'pay'    => __( 'бесплатно при заказе', 'kitstroy-moscow' ),
	),
	array(
		'days'   => __( '3–5 дней', 'kitstroy-moscow' ),
		'result' => __( 'Смета по позициям и график работ', 'kitstroy-moscow' ),
		'pay'    => __( 'входит в договор', 'kitstroy-moscow' ),
	),
	array(
		'days'   => __( 'по графику', 'kitstroy-moscow' ),
		'result' => __( 'Смонтированные системы и фотоотчёт по этапам', 'kitstroy-moscow' ),
		'pay'    => __( 'по этапам договора', 'kitstroy-moscow' ),
	),
	array(
		'days'   => __( '1 день', 'kitstroy-moscow' ),
		'result' => __( 'Протоколы, исполнительные схемы, акт', 'kitstroy-moscow' ),
		'pay'    => __( 'после подписания', 'kitstroy-moscow' ),
	),
);
?>
<section class="section workflow-section" id="workflow">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Как работаем', 'kitstroy-moscow' ); ?></p>
				<h2><?php echo esc_html( kitstroy_get_home_text( 'home_process_title', 'Пять шагов от заявки до акта' ) ); ?></h2>
			</div>
			<p class="lead workflow-section__intro">
				<?php esc_html_e( 'У каждого шага есть результат, срок и цена. Вы всегда знаете, на каком этапе находится объект и что будет дальше.', 'kitstroy-moscow' ); ?>
			</p>
		</div>

		<ol class="timeline">
			<?php foreach ( $steps as $index => $step ) : ?>
				<?php $meta = $extra[ $index ] ?? array(); ?>
				<li class="timeline__item" data-reveal>
					<span class="timeline__index"><?php echo esc_html( sprintf( '%02d', $index + 1 ) ); ?></span>
					<div class="timeline__body">
						<div class="timeline__head">
							<h3><?php echo esc_html( (string) ( $step['title'] ?? '' ) ); ?></h3>
							<?php if ( ! empty( $meta['days'] ) ) : ?>
								<span class="tag"><?php echo esc_html( (string) $meta['days'] ); ?></span>
							<?php endif; ?>
						</div>
						<p><?php echo esc_html( (string) ( $step['text'] ?? '' ) ); ?></p>
						<?php if ( ! empty( $meta['result'] ) ) : ?>
							<dl class="timeline__meta">
								<div>
									<dt><?php esc_html_e( 'Результат', 'kitstroy-moscow' ); ?></dt>
									<dd><?php echo esc_html( (string) $meta['result'] ); ?></dd>
								</div>
								<div>
									<dt><?php esc_html_e( 'Оплата', 'kitstroy-moscow' ); ?></dt>
									<dd><?php echo esc_html( (string) $meta['pay'] ); ?></dd>
								</div>
							</dl>
						<?php endif; ?>
					</div>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
