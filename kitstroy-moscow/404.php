<?php
/**
 * 404 template.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main section">
	<div class="container content-layout content-layout--narrow">
		<h1>404</h1>
		<p><?php esc_html_e( 'Страница не найдена. Возможно, она была удалена или перемещена.', 'kitstroy-moscow' ); ?></p>
		<?php
		get_template_part(
			'template-parts/ui/button',
			null,
			array(
				'label'   => 'Вернуться на главную',
				'url'     => home_url( '/' ),
				'variant' => 'primary',
			)
		);
		?>
	</div>
</main>
<?php
get_footer();
