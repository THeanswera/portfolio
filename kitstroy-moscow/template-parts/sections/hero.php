<?php
/**
 * Первый экран главной: инженерная схема и главное действие.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$contacts = kitstroy_get_contact_data();
$facts    = kitstroy_get_home_advantages();
$systems  = kitstroy_get_estimate_systems();
?>
<section class="hero">
	<div class="container hero__inner">
		<div class="hero__content">
			<p class="kicker"><?php esc_html_e( 'Инженерные системы · Москва и область', 'kitstroy-moscow' ); ?></p>
			<h1 class="hero__title">
				<?php esc_html_e( 'Считаем нагрузку,', 'kitstroy-moscow' ); ?>
				<span class="hero__title-accent"><?php esc_html_e( 'монтируем по проекту', 'kitstroy-moscow' ); ?></span>
				<?php esc_html_e( 'и сдаём с документами', 'kitstroy-moscow' ); ?>
			</h1>
			<p class="hero__lead lead">
				<?php esc_html_e( 'Электроснабжение, освещение, пожарная сигнализация и слаботочные системы для квартир, домов, офисов и производств. Смета фиксируется в договоре, за каждый день просрочки по нашей вине — компенсация.', 'kitstroy-moscow' ); ?>
			</p>

			<div class="hero__actions">
				<a class="button button--primary" href="<?php echo esc_url( home_url( '/calculator/' ) ); ?>">
					<span><?php esc_html_e( 'Посчитать стоимость', 'kitstroy-moscow' ); ?></span>
				</a>
				<a class="button button--secondary" href="#consultation">
					<span><?php esc_html_e( 'Вызвать инженера', 'kitstroy-moscow' ); ?></span>
				</a>
			</div>

			<div class="hero__contacts">
				<a href="tel:<?php echo esc_attr( kitstroy_format_phone_href( $contacts['phone'] ) ); ?>" class="hero__phone">
					<?php echo esc_html( $contacts['phone'] ); ?>
				</a>
				<span class="tech"><?php echo esc_html( $contacts['working_hours'] ); ?></span>
			</div>
		</div>

		<div class="hero__diagram">
			<?php get_template_part( 'template-parts/sections/diagram' ); ?>
		</div>
	</div>

	<div class="container hero__facts">
		<?php foreach ( $facts as $fact ) : ?>
			<div class="hero__fact">
				<strong><?php echo esc_html( (string) ( $fact['value'] ?? '' ) ); ?></strong>
				<span><?php echo esc_html( (string) ( $fact['label'] ?? '' ) ); ?></span>
			</div>
		<?php endforeach; ?>
	</div>
</section>
