<?php
/**
 * Theme header.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$contacts = kitstroy_get_contact_data();
$estimate = kitstroy_get_estimate_summary();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Перейти к основному содержимому', 'kitstroy-moscow' ); ?></a>
<div id="page" class="site">
	<header class="site-header">
		<div class="container site-header__inner">
			<div class="site-header__brand">
				<?php if ( has_custom_logo() ) : ?>
					<?php the_custom_logo(); ?>
				<?php else : ?>
					<a class="site-header__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
						<span class="site-header__logo-mark">КС</span>
						<span class="site-header__logo-text">
							<span>КИТ-Строй</span>
							<small>.Москва · инженерные системы</small>
						</span>
					</a>
				<?php endif; ?>
			</div>

			<nav class="site-header__nav" aria-label="<?php esc_attr_e( 'Основная навигация', 'kitstroy-moscow' ); ?>">
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'primary',
						'container'      => false,
						'menu_class'     => 'site-menu',
						'fallback_cb'    => 'kitstroy_nav_menu_fallback',
					)
				);
				?>
			</nav>

			<div class="site-header__contacts">
				<a class="site-header__phone" href="tel:<?php echo esc_attr( kitstroy_format_phone_href( $contacts['phone'] ) ); ?>">
					<?php echo esc_html( $contacts['phone'] ); ?>
					<span class="site-header__note"><?php esc_html_e( 'Пн-Пт 09:00-19:00', 'kitstroy-moscow' ); ?></span>
				</a>
				<a class="button button--primary button--small site-header__cta" href="<?php echo esc_url( home_url( '/calculator/' ) ); ?>">
					<span><?php esc_html_e( 'Рассчитать стоимость', 'kitstroy-moscow' ); ?></span>
				</a>
				<button class="site-header__burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="<?php esc_attr_e( 'Открыть мобильное меню', 'kitstroy-moscow' ); ?>">
					<span></span><span></span><span></span>
				</button>
			</div>
		</div>
		<div class="site-header__mobile-panel" id="mobile-menu" hidden>
			<div class="container">
				<nav aria-label="<?php esc_attr_e( 'Мобильная навигация', 'kitstroy-moscow' ); ?>">
					<?php
					wp_nav_menu(
						array(
							'theme_location' => 'primary',
							'container'      => false,
							'menu_class'     => 'site-menu site-menu--mobile',
							'fallback_cb'    => 'kitstroy_nav_menu_fallback',
						)
					);
					?>
				</nav>
				<div class="site-header__mobile-contacts">
					<a href="tel:<?php echo esc_attr( kitstroy_format_phone_href( $contacts['phone'] ) ); ?>"><?php echo esc_html( $contacts['phone'] ); ?></a>
					<a href="mailto:<?php echo esc_attr( $contacts['email'] ); ?>"><?php echo esc_html( $contacts['email'] ); ?></a>
					<a class="button button--primary button--block" href="<?php echo esc_url( home_url( '/calculator/' ) ); ?>">
						<span><?php esc_html_e( 'Рассчитать стоимость', 'kitstroy-moscow' ); ?></span>
					</a>
				</div>
			</div>
		</div>
	</header>
