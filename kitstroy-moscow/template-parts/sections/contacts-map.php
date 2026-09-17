<?php
/**
 * Контакты и карта.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$contacts = kitstroy_get_contact_data();
?>
<section class="section contacts-section" id="contacts">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Контакты', 'kitstroy-moscow' ); ?></p>
				<h2><?php echo esc_html( kitstroy_get_home_text( 'home_contacts_title', 'Связь с инженером и офисом' ) ); ?></h2>
			</div>
			<p class="lead contacts-section__intro">
				<?php echo esc_html( kitstroy_get_home_text( 'home_contacts_text', 'Работаем по Москве и Московской области. Выезд на обследование согласуем заранее, на связи в рабочее время.' ) ); ?>
			</p>
		</div>

		<div class="contacts-layout">
			<div class="contacts-layout__info">
				<div class="contacts-cards">
					<div class="contacts-card">
						<span class="contacts-card__label"><?php esc_html_e( 'Телефон', 'kitstroy-moscow' ); ?></span>
						<a class="contacts-card__value" href="tel:<?php echo esc_attr( kitstroy_format_phone_href( $contacts['phone'] ) ); ?>"><?php echo esc_html( $contacts['phone'] ); ?></a>
						<?php if ( ! empty( $contacts['secondary_phone'] ) ) : ?>
							<a class="contacts-card__value" href="tel:<?php echo esc_attr( kitstroy_format_phone_href( $contacts['secondary_phone'] ) ); ?>"><?php echo esc_html( $contacts['secondary_phone'] ); ?></a>
						<?php endif; ?>
						<span class="tech"><?php echo esc_html( $contacts['working_hours'] ); ?></span>
					</div>

					<div class="contacts-card">
						<span class="contacts-card__label"><?php esc_html_e( 'Почта', 'kitstroy-moscow' ); ?></span>
						<a class="contacts-card__value" href="mailto:<?php echo esc_attr( $contacts['email'] ); ?>"><?php echo esc_html( $contacts['email'] ); ?></a>
						<span class="tech"><?php esc_html_e( 'присылайте проекты и планировки', 'kitstroy-moscow' ); ?></span>
					</div>

					<div class="contacts-card">
						<span class="contacts-card__label"><?php esc_html_e( 'Мессенджеры', 'kitstroy-moscow' ); ?></span>
						<a class="contacts-card__value" href="<?php echo esc_url( $contacts['telegram'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $contacts['telegram_label'] ); ?></a>
						<a class="contacts-card__value" href="<?php echo esc_url( $contacts['max'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $contacts['max_label'] ); ?></a>
					</div>

					<div class="contacts-card">
						<span class="contacts-card__label"><?php esc_html_e( 'Офис и склад', 'kitstroy-moscow' ); ?></span>
						<p class="contacts-card__value"><?php echo esc_html( $contacts['address'] ); ?></p>
						<a class="contacts-card__route" href="<?php echo esc_url( $contacts['route_url'] ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Проложить маршрут', 'kitstroy-moscow' ); ?></a>
					</div>
				</div>

				<div class="contacts-card contacts-card--requisites">
					<span class="contacts-card__label"><?php esc_html_e( 'Реквизиты', 'kitstroy-moscow' ); ?></span>
					<ul>
						<?php foreach ( $contacts['requisites'] as $line ) : ?>
							<li><?php echo esc_html( $line ); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>

			<div class="contacts-layout__map">
				<?php
				/*
				 * Карта грузится отдельным запросом и не всегда отвечает: без подстраховки
				 * на её месте остаётся пустая белая область. Ссылка под картой остаётся
				 * доступной и тогда, когда карта не загрузилась.
				 */
				?>
				<iframe title="<?php esc_attr_e( 'Карта офиса', 'kitstroy-moscow' ); ?>" src="<?php echo esc_url( $contacts['map_embed_url'] ); ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
				<p class="contacts-layout__map-fallback">
					<span><?php esc_html_e( 'Карта не загрузилась?', 'kitstroy-moscow' ); ?></span>
					<a href="<?php echo esc_url( $contacts['route_url'] ); ?>" target="_blank" rel="noopener noreferrer">
						<?php echo esc_html( $contacts['address'] ); ?>
					</a>
				</p>
			</div>
		</div>
	</div>
</section>
