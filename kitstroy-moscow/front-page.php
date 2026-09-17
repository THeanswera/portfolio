<?php
/**
 * Front page: инженерный сайт-образец.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main">
	<?php get_template_part( 'template-parts/sections/hero' ); ?>
	<?php get_template_part( 'template-parts/sections/guarantees' ); ?>
	<?php get_template_part( 'template-parts/sections/services-grid' ); ?>
	<?php get_template_part( 'template-parts/sections/calculator' ); ?>
	<?php get_template_part( 'template-parts/sections/portfolio-slider' ); ?>
	<?php get_template_part( 'template-parts/sections/workflow' ); ?>
	<?php get_template_part( 'template-parts/sections/documents' ); ?>
	<?php get_template_part( 'template-parts/sections/about-company' ); ?>
	<?php get_template_part( 'template-parts/sections/quiz-form' ); ?>
	<?php get_template_part( 'template-parts/sections/contacts-map' ); ?>
</main>
<?php
get_footer();
