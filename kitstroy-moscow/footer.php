<?php
/**
 * Theme footer.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$contacts  = kitstroy_get_contact_data();
$menu_path = array(
	'services'   => __( 'Услуги', 'kitstroy-moscow' ),
	'portfolio'  => __( 'Объекты', 'kitstroy-moscow' ),
	'calculator' => __( 'Расчёт стоимости', 'kitstroy-moscow' ),
	'prices'     => __( 'Цены', 'kitstroy-moscow' ),
	'workflow'   => __( 'Как работаем', 'kitstroy-moscow' ),
	'documents'  => __( 'Документы', 'kitstroy-moscow' ),
	'about'      => __( 'О компании', 'kitstroy-moscow' ),
	'contacts'   => __( 'Контакты', 'kitstroy-moscow' ),
);
?>
	<footer class="site-footer">
		<div class="container site-footer__inner">
			<div class="site-footer__brand">
				<span class="site-footer__title">ООО «КИТ-Строй.Москва»</span>
				<p>Проектирование, монтаж и пусконаладка систем электроснабжения, пожарной безопасности и слаботочных систем. Москва и Московская область.</p>
				<div class="site-footer__demo">
					<span aria-hidden="true">!</span>
					<p><strong>Демонстрационный сайт.</strong> Компания, объекты, цены и контакты вымышлены и показывают, как может работать сайт подрядчика инженерных систем.</p>
				</div>
			</div>

			<div class="site-footer__column">
				<h2><?php esc_html_e( 'Разделы', 'kitstroy-moscow' ); ?></h2>
				<?php foreach ( $menu_path as $path => $label ) : ?>
					<a href="<?php echo esc_url( home_url( '/' . $path . '/' ) ); ?>"><?php echo esc_html( $label ); ?></a>
				<?php endforeach; ?>
			</div>

			<div class="site-footer__column">
				<h2><?php esc_html_e( 'Контакты', 'kitstroy-moscow' ); ?></h2>
				<a href="tel:<?php echo esc_attr( kitstroy_format_phone_href( $contacts['phone'] ) ); ?>"><?php echo esc_html( $contacts['phone'] ); ?></a>
				<a href="mailto:<?php echo esc_attr( $contacts['email'] ); ?>"><?php echo esc_html( $contacts['email'] ); ?></a>
				<a href="<?php echo esc_url( $contacts['telegram'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $contacts['telegram_label'] ); ?></a>
				<p class="site-footer__requisites"><?php echo esc_html( $contacts['address'] ); ?></p>
				<p class="site-footer__requisites"><?php echo esc_html( $contacts['working_hours'] ); ?></p>
			</div>

			<div class="site-footer__column">
				<h2><?php esc_html_e( 'Реквизиты', 'kitstroy-moscow' ); ?></h2>
				<div class="site-footer__requisites">
					<?php foreach ( $contacts['requisites'] as $line ) : ?>
						<span><?php echo esc_html( $line ); ?></span>
					<?php endforeach; ?>
				</div>
				<a href="<?php echo esc_url( kitstroy_get_privacy_page_link() ); ?>"><?php esc_html_e( 'Политика конфиденциальности', 'kitstroy-moscow' ); ?></a>
			</div>
		</div>

		<div class="container site-footer__bottom">
			<p>© <?php echo esc_html( wp_date( 'Y' ) ); ?> ООО «КИТ-Строй.Москва» · сайт-образец</p>
			<p><?php esc_html_e( 'Сверстано вручную: HTML, CSS и JavaScript без конструкторов', 'kitstroy-moscow' ); ?></p>
		</div>
	</footer>
	<?php get_template_part( 'template-parts/ui/modal' ); ?>
</div>
<?php wp_footer(); ?>
</body>
</html>
