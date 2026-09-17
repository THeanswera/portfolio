<?php
/**
 * About company section.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$about_title = kitstroy_get_home_text( 'home_about_title', 'Бригады, инженеры и своя проектная часть' );
$about_text  = kitstroy_get_home_text(
	'home_about_text',
	'Проектируем и монтируем системы электроснабжения, пожарной безопасности и слаботочные системы. Работаем на объектах, где важна не картинка, а предсказуемая эксплуатация: проектные решения считаем до монтажа, а после сдачи передаём исполнительную документацию.'
);
$stats       = array(
	array(
		'value' => '12',
		'label' => __( 'лет на инженерных объектах', 'kitstroy-moscow' ),
		'count' => true,
	),
	array(
		'value' => '240+',
		'label' => __( 'сданных объектов', 'kitstroy-moscow' ),
		'count' => true,
	),
	array(
		'value' => '4',
		'label' => __( 'монтажные бригады и проектная группа', 'kitstroy-moscow' ),
		'count' => true,
	),
	array(
		'value' => '2 года',
		'label' => __( 'гарантии на монтажные работы', 'kitstroy-moscow' ),
	),
);

$principles = array(
	__( 'Считаем нагрузки и сечения, а не «как обычно делают»', 'kitstroy-moscow' ),
	__( 'Проект и монтаж в одних руках — некому перекладывать ответственность', 'kitstroy-moscow' ),
	__( 'Маркируем каждую линию и оставляем схему, по которой можно работать', 'kitstroy-moscow' ),
	__( 'Работаем по ПУЭ, ГОСТ и регламентам управляющих компаний', 'kitstroy-moscow' ),
);
?>
<section class="section section--panel about-company-section" id="about-company">
	<div class="container">
		<div class="about-company">
			<div class="about-company__content">
				<p class="kicker"><?php esc_html_e( 'О компании', 'kitstroy-moscow' ); ?></p>
				<h2><?php echo esc_html( $about_title ); ?></h2>
				<p class="lead"><?php echo esc_html( $about_text ); ?></p>

				<ul class="about-company__principles">
					<?php foreach ( $principles as $principle ) : ?>
						<li><?php echo esc_html( $principle ); ?></li>
					<?php endforeach; ?>
				</ul>

				<a class="button button--secondary" href="<?php echo esc_url( home_url( '/about/' ) ); ?>">
					<span><?php esc_html_e( 'Подробнее о компании', 'kitstroy-moscow' ); ?></span>
				</a>
			</div>

			<div class="about-company__stats">
				<?php foreach ( $stats as $stat ) : ?>
					<div class="stat">
						<?php if ( ! empty( $stat['count'] ) ) : ?>
							<strong data-counter="<?php echo esc_attr( preg_replace( '/\D/', '', (string) $stat['value'] ) ); ?>" data-counter-text="<?php echo esc_attr( (string) $stat['value'] ); ?>">0</strong>
						<?php else : ?>
							<strong><?php echo esc_html( (string) $stat['value'] ); ?></strong>
						<?php endif; ?>
						<span><?php echo esc_html( (string) $stat['label'] ); ?></span>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</section>
