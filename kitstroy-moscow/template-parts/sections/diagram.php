<?php
/**
 * Однолинейная схема питания — главный визуальный образ сайта.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$lines = array(
	array(
		'key'   => 'power',
		'label' => __( 'Розеточные и силовые группы', 'kitstroy-moscow' ),
		'meta'  => '16 А · 3×2,5 мм²',
		'color' => 'var(--wire)',
	),
	array(
		'key'   => 'light',
		'label' => __( 'Освещение и аварийный свет', 'kitstroy-moscow' ),
		'meta'  => '10 А · 3×1,5 мм²',
		'color' => 'var(--wire-low)',
	),
	array(
		'key'   => 'low',
		'label' => __( 'Слаботочка и серверная', 'kitstroy-moscow' ),
		'meta'  => 'U/UTP cat.5e',
		'color' => 'var(--hot)',
	),
	array(
		'key'   => 'fire',
		'label' => __( 'АПС, СОУЭ, видеонаблюдение', 'kitstroy-moscow' ),
		'meta'  => 'ППКП · IP-камеры',
		'color' => 'var(--wire-live)',
	),
);
?>
<figure class="diagram corners js-diagram" data-diagram>
	<figcaption class="diagram__caption">
		<span><?php esc_html_e( 'Схема питания объекта', 'kitstroy-moscow' ); ?></span>
		<span class="tech"><?php esc_html_e( 'пример распределения по группам', 'kitstroy-moscow' ); ?></span>
	</figcaption>

	<div class="diagram__canvas">
		<svg class="diagram__svg" viewBox="0 0 420 300" role="img" aria-label="<?php esc_attr_e( 'Однолинейная схема: ввод, щит и четыре группы потребителей', 'kitstroy-moscow' ); ?>">
			<defs>
				<pattern id="ks-grid" width="20" height="20" patternUnits="userSpaceOnUse">
					<path d="M20 0H0v20" fill="none" stroke="var(--line-soft)" stroke-width="1" />
				</pattern>
			</defs>

			<rect width="420" height="300" fill="url(#ks-grid)" />

			<!-- Ввод -->
			<path class="diagram__wire" d="M12 120H70" stroke="var(--wire)" />
			<path class="diagram__arrow" d="M62 112l10 8-10 8" />

			<!-- Щит -->
			<rect class="diagram__panel" x="82" y="60" width="86" height="120" rx="2" />
			<path class="diagram__bus" d="M125 76v88" />
			<path class="diagram__breaker" d="M104 96h42M104 120h42M104 144h42" />

			<!-- Отходящие линии -->
			<g class="diagram__line" data-line="power">
				<path d="M168 96h70l30 24h140" stroke="var(--wire)" />
				<circle cx="168" cy="96" r="3.5" fill="var(--wire)" />
			</g>
			<g class="diagram__line" data-line="light">
				<path d="M168 120h240" stroke="var(--wire-low)" />
				<circle cx="168" cy="120" r="3.5" fill="var(--wire-low)" />
			</g>
			<g class="diagram__line" data-line="low">
				<path d="M168 144h70l30-24h140" stroke="var(--hot)" />
				<circle cx="168" cy="144" r="3.5" fill="var(--hot)" />
			</g>
			<g class="diagram__line" data-line="fire">
				<path d="M168 168h40l26 46h174" stroke="var(--wire-live)" />
				<circle cx="168" cy="168" r="3.5" fill="var(--wire-live)" />
			</g>

			<!-- Заземление -->
			<path class="diagram__ground" d="M125 180v34h-12M101 220h24M105 228h16M109 236h8" />
		</svg>

		<span class="diagram__tag diagram__tag--in">
			<span class="diagram__tag-name">ВРУ</span>
			<span class="tech">0,4 кВ</span>
		</span>
		<span class="diagram__tag diagram__tag--panel">
			<span class="diagram__tag-name">ЩС-1</span>
			<span class="tech">63 А · 12 модулей</span>
		</span>
	</div>

	<ul class="diagram__legend">
		<?php foreach ( $lines as $line ) : ?>
			<li class="diagram__legend-item" data-legend="<?php echo esc_attr( (string) $line['key'] ); ?>">
				<span class="diagram__dot" style="--dot: <?php echo esc_attr( (string) $line['color'] ); ?>"></span>
				<span class="diagram__legend-text">
					<?php echo esc_html( (string) $line['label'] ); ?>
					<small><?php echo esc_html( (string) $line['meta'] ); ?></small>
				</span>
			</li>
		<?php endforeach; ?>
	</ul>
</figure>
