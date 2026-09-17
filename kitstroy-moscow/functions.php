<?php
/**
 * Theme bootstrap file.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

define( 'KITSTROY_THEME_VERSION', '2.0.0' );
define( 'KITSTROY_THEME_PATH', get_template_directory() );
define( 'KITSTROY_THEME_URL', get_template_directory_uri() );

$kitstroy_includes = array(
	'/inc/setup.php',
	'/inc/theme-support.php',
	'/inc/helpers.php',
	'/inc/estimate.php',
	'/inc/demo-data.php',
	'/inc/enqueue.php',
	'/inc/cpt.php',
	'/inc/taxonomies.php',
	'/inc/acf-fields-guide.php',
	'/inc/breadcrumbs.php',
	'/inc/seo.php',
	'/inc/schema.php',
	'/inc/forms.php',
	'/inc/security.php',
	'/inc/virtual-routes.php',
);

foreach ( $kitstroy_includes as $kitstroy_file ) {
	$kitstroy_path = KITSTROY_THEME_PATH . $kitstroy_file;

	if ( file_exists( $kitstroy_path ) ) {
		require_once $kitstroy_path;
	}
}
