<?php
/**
 * Template Name: Контакты
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main">
	<div class="section">
		<div class="container">
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
				<?php kitstroy_breadcrumbs(); ?>
				<?php
				get_template_part(
					'template-parts/ui/section-title',
					null,
					array(
						'kicker'   => 'Контакты',
						'title'    => get_the_title(),
						'subtitle' => get_the_excerpt() ?: 'Свяжитесь с нами любым удобным способом или отправьте заявку через форму обратной связи.',
					)
				);
				?>
			<?php endwhile; endif; ?>
		</div>
	</div>
	<?php get_template_part( 'template-parts/sections/contacts-map' ); ?>
	<?php
	get_template_part(
		'template-parts/sections/quiz-form',
		null,
		array(
			'form_type'  => 'universal',
			'section_id' => 'contact-form',
			'title'      => __( 'Заявка инженеру', 'kitstroy-moscow' ),
			'subtitle'   => __( 'Опишите объект и задачу — ответим в рабочее время, при необходимости приедем на осмотр.', 'kitstroy-moscow' ),
		)
	);
	?>
</main>
<?php
get_footer();
