<?php
/**
 * Virtual routes for the theme demo content.
 *
 * Serves /services/{slug}/, /portfolio/{slug}/, /blog/{slug}/, /services/, /portfolio/,
 * /blog/, /about/, /prices/, /contacts/ and /privacy-policy/ from the theme demo data
 * when the WordPress database has no matching content. Real WordPress content always
 * wins: routes step aside as soon as a published post with the same path exists.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

defined( 'KITSTROY_VIRTUAL_ROUTES_VERSION' ) || define( 'KITSTROY_VIRTUAL_ROUTES_VERSION', '1.0.0' );

/**
 * Route table for the theme demo content.
 *
 * Keys are route paths without leading and trailing slashes.
 *
 * @return array<string, array<string, mixed>>
 */
function kitstroy_get_virtual_route_map(): array {
	$routes = array(
		'about'          => array(
			'kind'     => 'page',
			'template' => 'page-about.php',
			'title'    => __( 'О компании', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Проектируем и реализуем инженерные системы для частных, коммерческих и производственных объектов. Работаем с задачами, где важны безопасность, понятная смета и предсказуемый результат.', 'kitstroy-moscow' ),
			'content'  => array(
				'<p>ООО «КИТ-Строй.Москва» выполняет проектирование, монтаж и пусконаладку инженерных систем для квартир, частных домов, офисов, складов, производственных и торговых объектов.</p>',
				'<p>Основной фокус компании — надежность системы в эксплуатации, соблюдение нормативной базы, понятная смета и управляемый срок производства работ. Специалисты компании работают с электротехническими и слаботочными системами более 10 лет.</p>',
			),
		),
		'prices'         => array(
			'kind'     => 'page',
			'template' => 'page-prices.php',
			'title'    => __( 'Цены', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Ориентировочные цены на типовые работы и открытая формула расчёта: площадь, состав систем, поправки на высоту и удалённость.', 'kitstroy-moscow' ),
		),
		'calculator'     => array(
			'kind'     => 'page',
			'template' => 'page-calculator.php',
			'title'    => __( 'Калькулятор стоимости', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Предварительный расчёт инженерных систем: тип объекта, площадь, высота потолков, состав систем и удалённость от МКАД.', 'kitstroy-moscow' ),
		),
		'workflow'       => array(
			'kind'     => 'page',
			'template' => 'page-workflow.php',
			'title'    => __( 'Как работаем', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Пять этапов от заявки до акта: результат, срок и порядок оплаты на каждом шаге, а также зона ответственности заказчика.', 'kitstroy-moscow' ),
		),
		'documents'      => array(
			'kind'     => 'page',
			'template' => 'page-documents.php',
			'title'    => __( 'Документы', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Что заказчик получает после сдачи объекта: проект, исполнительные схемы, протоколы измерений и акты.', 'kitstroy-moscow' ),
		),
		'contacts'       => array(
			'kind'     => 'page',
			'template' => 'page-contacts.php',
			'title'    => __( 'Контакты', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Свяжитесь с нами любым удобным способом или отправьте заявку через форму обратной связи.', 'kitstroy-moscow' ),
		),
		'blog'           => array(
			'kind'     => 'page',
			'template' => 'page-blog.php',
			'title'    => __( 'Инфо-блог по инженерным системам', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Полезные материалы по проектированию, эксплуатации и приемке инженерных систем.', 'kitstroy-moscow' ),
		),
		'privacy-policy' => array(
			'kind'     => 'page',
			'template' => 'page.php',
			'title'    => __( 'Политика конфиденциальности', 'kitstroy-moscow' ),
			'excerpt'  => __( 'Порядок обработки персональных данных посетителей сайта ООО «КИТ-Строй.Москва».', 'kitstroy-moscow' ),
			'content'  => array( 'kitstroy_get_privacy_page_content' ),
		),
		'services'       => array(
			'kind'      => 'archive',
			'post_type' => 'service',
			'template'  => 'archive-service.php',
		),
		'portfolio'      => array(
			'kind'      => 'archive',
			'post_type' => 'portfolio',
			'template'  => 'archive-portfolio.php',
		),
	);

	if ( function_exists( 'kitstroy_get_demo_services' ) ) {
		foreach ( kitstroy_get_demo_services() as $service ) {
			$slug = isset( $service['slug'] ) ? (string) $service['slug'] : '';

			if ( '' === $slug ) {
				continue;
			}

			$routes[ 'services/' . $slug ] = array(
				'kind'      => 'single',
				'post_type' => 'service',
				'template'  => 'single-service.php',
				'slug'      => $slug,
				'title'     => isset( $service['title'] ) ? (string) $service['title'] : '',
				'excerpt'   => isset( $service['excerpt'] ) ? (string) $service['excerpt'] : '',
			);
		}
	}

	if ( function_exists( 'kitstroy_get_demo_portfolio' ) ) {
		foreach ( kitstroy_get_demo_portfolio() as $project ) {
			$slug = isset( $project['slug'] ) ? (string) $project['slug'] : '';

			if ( '' === $slug ) {
				continue;
			}

			$routes[ 'portfolio/' . $slug ] = array(
				'kind'      => 'single',
				'post_type' => 'portfolio',
				'template'  => 'single-portfolio.php',
				'slug'      => $slug,
				'title'     => isset( $project['title'] ) ? (string) $project['title'] : '',
				'excerpt'   => isset( $project['short'] ) ? (string) $project['short'] : '',
			);
		}
	}

	if ( function_exists( 'kitstroy_get_demo_posts' ) ) {
		foreach ( kitstroy_get_demo_posts() as $demo_post ) {
			$slug = isset( $demo_post['slug'] ) ? (string) $demo_post['slug'] : '';

			if ( '' === $slug ) {
				continue;
			}

			$routes[ 'blog/' . $slug ] = array(
				'kind'        => 'single',
				'post_type'   => 'post',
				'template'    => 'single.php',
				'slug'        => $slug,
				'title'       => isset( $demo_post['title'] ) ? (string) $demo_post['title'] : '',
				'excerpt'     => isset( $demo_post['excerpt'] ) ? (string) $demo_post['excerpt'] : '',
				'date'        => isset( $demo_post['date'] ) ? (string) $demo_post['date'] : '',
				'content_key' => $slug,
			);
		}
	}

	foreach ( $routes as $path => $route ) {
		$routes[ $path ]['path'] = (string) $path;
	}

	return $routes;
}

/**
 * Normalizes a route path: lowercase, no duplicate or surrounding slashes.
 *
 * @param string $path Raw path.
 * @return string
 */
function kitstroy_normalize_route_path( string $path ): string {
	$path = strtolower( trim( $path ) );
	$path = (string) preg_replace( '#/+#', '/', $path );

	return trim( $path, '/' );
}

/**
 * Returns the requested route path built from the current request URI.
 *
 * @return string
 */
function kitstroy_get_request_route_path(): string {
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
	$path        = (string) wp_parse_url( $request_uri, PHP_URL_PATH );

	if ( '' === $path ) {
		return '';
	}

	$home_path = (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH );

	if ( '' !== $home_path && '/' !== $home_path ) {
		$path = (string) preg_replace( '#' . preg_quote( untrailingslashit( $home_path ), '#' ) . '#', '', $path, 1 );
	}

	return kitstroy_normalize_route_path( rawurldecode( $path ) );
}

/**
 * Finds a route definition by path.
 *
 * @param string $path Route path without surrounding slashes.
 * @return array<string, mixed>
 */
function kitstroy_resolve_virtual_route( string $path ): array {
	$path = kitstroy_normalize_route_path( $path );

	if ( '' === $path ) {
		return array();
	}

	$routes = kitstroy_get_virtual_route_map();

	return isset( $routes[ $path ] ) ? $routes[ $path ] : array();
}

/**
 * Route of the current request, resolved from the parsed query variable.
 *
 * @return array<string, mixed>
 */
function kitstroy_get_active_virtual_route(): array {
	static $route = null;

	if ( null !== $route ) {
		return $route;
	}

	$route = array();
	$path  = (string) get_query_var( 'kitstroy_path' );

	if ( '' === $path ) {
		return $route;
	}

	$route = kitstroy_resolve_virtual_route( $path );

	return $route;
}

/**
 * Deterministic post IDs for the virtual routes.
 *
 * IDs are positive, because WP_Post::get_instance() ignores non-positive IDs
 * since WordPress 6.9. The reserved range is far above any reachable auto
 * increment value, so a collision with real content is not realistic.
 *
 * @return array<string, int>
 */
function kitstroy_get_virtual_post_ids(): array {
	static $ids = null;

	if ( is_array( $ids ) ) {
		return $ids;
	}

	$ids   = array();
	$index = 0;

	foreach ( array_keys( kitstroy_get_virtual_route_map() ) as $path ) {
		++$index;
		$ids[ (string) $path ] = 900000000 + $index;
	}

	return $ids;
}

/**
 * Virtual post ID for a route path.
 *
 * @param string $path Route path.
 * @return int
 */
function kitstroy_get_virtual_post_id( string $path ): int {
	$ids = kitstroy_get_virtual_post_ids();

	return isset( $ids[ $path ] ) ? (int) $ids[ $path ] : 0;
}

/**
 * Public URL of a virtual post, empty for regular posts.
 *
 * @param WP_Post|int|null $post Post object or ID.
 * @return string
 */
function kitstroy_get_virtual_post_url( $post = null ): string {
	$post = get_post( $post );

	if ( ! $post instanceof WP_Post ) {
		return '';
	}

	$post_id = (int) $post->ID;

	foreach ( kitstroy_get_virtual_post_ids() as $path => $virtual_id ) {
		if ( (int) $virtual_id === $post_id ) {
			return home_url( '/' . $path . '/' );
		}
	}

	return '';
}

/**
 * Full text of a demo article.
 *
 * @param string $slug Demo post slug.
 * @return string
 */
function kitstroy_get_demo_post_content( string $slug ): string {
	$articles = array(
		'podgotovka-obekta-k-montazhu-pozharnoy-signalizatsii' => array(
			'<p>Пожарная сигнализация монтируется не в пустом помещении. К моменту выхода монтажной бригады должны быть готовы планировки, согласованный состав системы и понятный порядок взаимодействия с другими подрядчиками. Чем больше вводных данных собрано заранее, тем меньше переделок возникает на этапе пусконаладки.</p>',
			'<h2>Что подготовить до выхода на объект</h2>',
			'<ul><li>Планировки этажей с назначением помещений и указанием путей эвакуации.</li><li>Согласованный состав системы: тип извещателей, оповещателей, приборов приема и управления.</li><li>Данные о конструкциях потолков и стен, от них зависит способ прокладки линий и крепление оборудования.</li><li>Сведения о системах, с которыми потребуется интеграция: вентиляция, дымоудаление, СКУД, лифты.</li></ul>',
			'<h2>Порядок доступа и режим работ</h2>',
			'<p>Отдельно согласуйте доступ в помещения, время работ и возможность шумных операций. На действующем объекте монтаж планируется по этапам, а работы в зонах постоянного присутствия людей выносятся за пределы рабочих часов.</p>',
			'<h2>Что уточняется на обследовании</h2>',
			'<p>Инженер фиксирует зоны контроля, высоту установки оборудования, способы прохода через стены и перегородки, точки подключения питания и трассы совместной прокладки. По результатам обследования уточняется схема линий и объем материалов.</p>',
			'<p>Если эти данные собраны до старта работ, монтаж идет без остановок, а к сдаче остается проверить сценарии работы системы и передать исполнительную документацию.</p>',
		),
		'oshibki-pri-sborke-elektroshchita' => array(
			'<p>Щит удобно собирать, когда схема понятна не только автору сборки. Большинство проблем проявляется позже, при обслуживании: чтобы найти нужную линию или заменить автомат, приходится разбирать половину шкафа. Ниже — ошибки, которые встречаются чаще всего.</p>',
			'<h2>1. Отсутствие маркировки</h2>',
			'<p>Без подписей на аппаратах, клеммах и кабелях невозможно быстро понять назначение линии. Маркировка выполняется сразу при сборке: на автоматы, на вводные концы и на ответственные клеммные соединения.</p>',
			'<h2>2. Нет запаса по модулям</h2>',
			'<p>Щит, собранный впритык по количеству модулей, не позволяет добавить линию без переделки. Резерв по посадочным местам и по вводному аппарату закладывается на этапе проектирования с учетом развития объекта.</p>',
			'<h2>3. Смешение силовых и слаботочных линий</h2>',
			'<p>Совместная прокладка без разделения и экранирования приводит к наводкам и нестабильной работе слаботочных систем. Силовые и информационные линии разводятся по отдельным зонам и вводам.</p>',
			'<h2>4. Неаккуратные соединения</h2>',
			'<p>Скрутки, соединения вне клемм и плохо обжатые наконечники — потенциальный источник нагрева и отказов. Все соединения выполняются на клеммах и аппаратах, рассчитанных на соответствующий ток.</p>',
			'<h2>5. Нет исполнительной схемы</h2>',
			'<p>Даже аккуратный щит без схемы теряет смысл при первом же изменении. После сборки передаются схема, ведомость установленных аппаратов и фотофиксация внутреннего монтажа.</p>',
			'<p>Перечисленные пункты не требуют дополнительных затрат, если выполняются в процессе сборки. Исправлять их после запуска объекта заметно дороже.</p>',
		),
		'proverka-skud-pered-zapuskom-v-ofise' => array(
			'<p>Система контроля доступа запускается не в момент подключения контроллеров, а в момент, когда сотрудники начинают пользоваться ей ежедневно. Перед вводом в эксплуатацию стоит пройти короткий чек-лист вместе с подрядчиком и службой эксплуатации.</p>',
			'<h2>Проверка точек прохода</h2>',
			'<ul><li>Все двери и турникеты отрабатывают открытие и закрытие без заеданий.</li><li>Считыватели установлены на рабочей высоте и не мешают проходу.</li><li>Кнопки выхода и датчики положения двери срабатывают корректно.</li></ul>',
			'<h2>Права и сценарии</h2>',
			'<p>Проверьте уровни доступа по подразделениям, графикам и зонам: кто и когда проходит, что происходит при попытке прохода вне расписания. Отдельно проверяются сценарии разблокировки на случай пожарной тревоги.</p>',
			'<h2>Архив событий и учетные записи</h2>',
			'<p>Убедитесь, что события пишутся с корректным временем, а доступ администратора не остается на стандартном пароле. Учетные записи монтажников закрываются после сдачи, доступ передается ответственным сотрудникам заказчика.</p>',
			'<h2>Документы и обучение</h2>',
			'<p>К запуску прикладываются исполнительная схема, перечень оборудования и инструкция для службы эксплуатации. Короткое обучение сотрудников снижает количество обращений в поддержку в первые недели работы системы.</p>',
		),
	);

	if ( empty( $articles[ $slug ] ) ) {
		return '';
	}

	return implode( "\n\n", $articles[ $slug ] );
}

/**
 * Privacy policy text taken from the theme documentation.
 *
 * @return string
 */
function kitstroy_get_privacy_page_content(): string {
	$contacts = function_exists( 'kitstroy_get_contact_data' ) ? kitstroy_get_contact_data() : array();

	$sections = array(
		'<p>ООО «КИТ-Строй.Москва» уважает право посетителей сайта на конфиденциальность и обеспечивает обработку персональных данных в соответствии с применимыми требованиями законодательства Российской Федерации.</p>',
		'<h2>1. Какие данные могут собираться</h2>',
		'<p>Через формы на сайте могут собираться имя, телефон, адрес электронной почты и комментарий к заявке. Дополнительно сайт может использовать технические данные: cookie-файлы, IP-адрес, данные браузера и устройства, обезличенные данные веб-аналитики.</p>',
		'<h2>2. Для чего используются данные</h2>',
		'<p>Персональные данные используются исключительно для обратной связи с пользователем, обработки заявок, уточнения состава работ, подготовки предложения и информирования по обращению.</p>',
		'<h2>3. Cookies и аналитика</h2>',
		'<p>Сайт может использовать cookie-файлы для корректной работы страниц, сохранения пользовательских настроек и анализа поведения посетителей, а также системы аналитики для оценки посещаемости и улучшения сайта.</p>',
		'<h2>4. Защита данных</h2>',
		'<p>Компания принимает разумные организационные и технические меры для защиты данных от утраты, несанкционированного доступа, изменения и распространения.</p>',
		'<h2>5. Передача данных третьим лицам</h2>',
		'<p>Персональные данные не передаются третьим лицам, за исключением случаев, когда такая передача необходима для исполнения запроса пользователя, предусмотрена законодательством или требуется техническими сервисами, обеспечивающими работу сайта.</p>',
		'<h2>6. Срок хранения</h2>',
		'<p>Данные хранятся не дольше, чем это необходимо для обработки обращения пользователя, исполнения обязательств и соблюдения требований законодательства.</p>',
		'<h2>7. Права пользователя</h2>',
		'<p>Пользователь вправе запросить уточнение, обновление или удаление своих персональных данных, а также направить вопрос по обработке данных через контактные каналы, указанные на сайте.</p>',
		'<h2>8. Контакты по вопросам обработки данных</h2>',
	);

	$contact_line = array();

	if ( ! empty( $contacts['email'] ) ) {
		$contact_line[] = 'email: ' . esc_html( (string) $contacts['email'] );
	}

	if ( ! empty( $contacts['phone'] ) ) {
		$contact_line[] = 'телефон: ' . esc_html( (string) $contacts['phone'] );
	}

	$sections[] = '<p>По вопросам обработки персональных данных: ' . implode( ', ', $contact_line ) . '. Контактные данные также размещены на странице «Контакты».</p>';

	return implode( "\n\n", $sections );
}

/**
 * Post content for a route.
 *
 * @param array<string, mixed> $route Route definition.
 * @return string
 */
function kitstroy_get_virtual_route_content( array $route ): string {
	if ( ! empty( $route['content'] ) && is_array( $route['content'] ) ) {
		$parts = array();

		foreach ( $route['content'] as $part ) {
			if ( is_string( $part ) && function_exists( $part ) ) {
				$parts[] = (string) call_user_func( $part );
			} elseif ( is_string( $part ) ) {
				$parts[] = $part;
			}
		}

		return implode( "\n\n", array_filter( $parts ) );
	}

	if ( ! empty( $route['content_key'] ) ) {
		return kitstroy_get_demo_post_content( (string) $route['content_key'] );
	}

	return '';
}

/**
 * Builds a synthetic WP_Post for a single demo route.
 *
 * @param array<string, mixed> $route Route definition.
 * @return WP_Post|null
 */
function kitstroy_build_virtual_post( array $route ) {
	$path    = isset( $route['path'] ) ? (string) $route['path'] : '';
	$post_id = kitstroy_get_virtual_post_id( $path );

	if ( $post_id <= 0 ) {
		return null;
	}

	$post_type = isset( $route['post_type'] ) ? (string) $route['post_type'] : 'page';
	$date      = ! empty( $route['date'] ) ? (string) $route['date'] : '2026-01-15';
	$timestamp = strtotime( $date . ' 09:00:00' );

	if ( false === $timestamp ) {
		$timestamp = strtotime( '2026-01-15 09:00:00' );
	}

	$post_date = gmdate( 'Y-m-d H:i:s', $timestamp );
	$url       = home_url( '/' . $path . '/' );

	$data = array(
		'ID'                    => $post_id,
		'post_author'           => 1,
		'post_date'             => $post_date,
		'post_date_gmt'         => $post_date,
		'post_content'          => kitstroy_get_virtual_route_content( $route ),
		'post_title'            => isset( $route['title'] ) ? (string) $route['title'] : '',
		'post_excerpt'          => isset( $route['excerpt'] ) ? (string) $route['excerpt'] : '',
		'post_status'           => 'publish',
		'comment_status'        => 'closed',
		'ping_status'           => 'closed',
		'post_password'         => '',
		'post_name'             => isset( $route['slug'] ) ? (string) $route['slug'] : $path,
		'to_ping'               => '',
		'pinged'                => '',
		'post_modified'         => $post_date,
		'post_modified_gmt'     => $post_date,
		'post_content_filtered' => '',
		'post_parent'           => 0,
		'guid'                  => $url,
		'menu_order'            => 0,
		'post_type'             => $post_type,
		'post_mime_type'        => '',
		'comment_count'         => 0,
		'filter'                => 'raw',
	);

	return new WP_Post( (object) $data );
}

/**
 * Posts served by a route. Archives are rendered from the template demo fallback,
 * so they intentionally return no posts.
 *
 * @param array<string, mixed> $route Route definition.
 * @return WP_Post[]
 */
function kitstroy_build_virtual_route_posts( array $route ): array {
	if ( empty( $route['kind'] ) || 'archive' === $route['kind'] ) {
		return array();
	}

	$post = kitstroy_build_virtual_post( $route );

	return $post instanceof WP_Post ? array( $post ) : array();
}

/**
 * Rewrites the main query of the current request so that WordPress renders the
 * demo route instead of the 404 template.
 *
 * @param array<string, mixed> $route Route definition.
 * @param WP_Post[]            $posts Posts to serve.
 * @return void
 */
function kitstroy_setup_virtual_query( array $route, array $posts ): void {
	global $wp_query;

	if ( ! $wp_query instanceof WP_Query ) {
		return;
	}

	$kind          = isset( $route['kind'] ) ? (string) $route['kind'] : 'page';
	$is_singular   = in_array( $kind, array( 'single', 'page' ), true );
	$is_archive    = ( 'archive' === $kind );
	$is_post_type  = in_array( $kind, array( 'single', 'archive' ), true );
	$post_type     = isset( $route['post_type'] ) ? (string) $route['post_type'] : 'page';
	$first_post    = ! empty( $posts ) ? $posts[0] : null;

	$wp_query->posts                = $posts;
	$wp_query->post_count           = count( $posts );
	$wp_query->found_posts          = count( $posts );
	$wp_query->max_num_pages        = 1;
	$wp_query->current_post         = -1;
	$wp_query->in_the_loop          = false;
	$wp_query->post                 = $first_post;
	$wp_query->is_404               = false;
	$wp_query->is_home              = false;
	$wp_query->is_single            = ( 'single' === $kind );
	$wp_query->is_page              = ( 'page' === $kind );
	$wp_query->is_singular          = $is_singular;
	$wp_query->is_archive           = $is_archive;
	$wp_query->is_post_type_archive = $is_archive;
	$wp_query->is_posts_page        = false;
	$wp_query->is_category          = false;
	$wp_query->is_tag               = false;
	$wp_query->is_tax               = false;
	$wp_query->is_author            = false;
	$wp_query->is_date              = false;
	$wp_query->is_search            = false;
	$wp_query->is_attachment        = false;
	$wp_query->is_paged             = false;

	if ( $is_archive ) {
		$wp_query->queried_object    = get_post_type_object( $post_type );
		$wp_query->queried_object_id = 0;
	} elseif ( $first_post instanceof WP_Post ) {
		$wp_query->queried_object    = $first_post;
		$wp_query->queried_object_id = (int) $first_post->ID;
	}

	if ( $is_post_type ) {
		$wp_query->query_vars['post_type'] = $post_type;
	}

	// Keeps WP_Query::the_post() on the branch that uses $wp_query->posts as is.
	$wp_query->query_vars['fields'] = 'all';

	unset(
		$wp_query->query_vars['page_id'],
		$wp_query->query_vars['pagename'],
		$wp_query->query_vars['p'],
		$wp_query->query_vars['name'],
		$wp_query->query_vars['error']
	);

	if ( $first_post instanceof WP_Post ) {
		$GLOBALS['post'] = $first_post;
	}
}

/**
 * Whether the database already has published content for a route.
 *
 * @param array<string, mixed> $route Route definition.
 * @return bool
 */
function kitstroy_virtual_route_has_real_content( array $route ): bool {
	$post_type = isset( $route['post_type'] ) ? (string) $route['post_type'] : '';

	if ( empty( $route['kind'] ) ) {
		return true;
	}

	if ( 'archive' === $route['kind'] ) {
		if ( '' === $post_type ) {
			return true;
		}

		$real_posts = get_posts(
			array(
				'post_type'              => $post_type,
				'post_status'            => 'publish',
				'posts_per_page'         => 1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_term_cache' => false,
				'update_post_meta_cache' => false,
				'suppress_filters'       => true,
				'kitstroy_internal'      => true,
			)
		);

		return ! empty( $real_posts );
	}

	$slug      = isset( $route['slug'] ) ? (string) $route['slug'] : '';
	$post_type = $post_type ? $post_type : 'page';

	// У страничных маршрутов отдельного slug нет — он совпадает с последним сегментом пути.
	if ( '' === $slug && ! empty( $route['path'] ) ) {
		$slug = basename( (string) $route['path'] );
	}

	if ( '' === $slug ) {
		return true;
	}

	$post_id = kitstroy_find_post_id_by_slug( $slug, $post_type );

	if ( $post_id <= 0 ) {
		return false;
	}

	$post = get_post( $post_id );

	return $post instanceof WP_Post && 'publish' === $post->post_status;
}

/**
 * Finds a post ID by slug and post type.
 *
 * @param string $slug      Post slug.
 * @param string $post_type Post type.
 * @return int
 */
function kitstroy_find_post_id_by_slug( string $slug, string $post_type ): int {
	if ( '' === $slug || '' === $post_type ) {
		return 0;
	}

	$posts = get_posts(
		array(
			'name'                   => $slug,
			'post_type'              => $post_type,
			'post_status'            => 'any',
			'posts_per_page'         => 1,
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
			'update_post_meta_cache' => false,
			'suppress_filters'       => true,
			'kitstroy_internal'      => true,
		)
	);

	return ! empty( $posts ) ? (int) $posts[0] : 0;
}

/**
 * Whether a given post type is queried by the current query.
 *
 * @param WP_Query $query Query object.
 * @param string   $type  Post type to look for.
 * @return bool
 */
function kitstroy_query_targets_post_type( WP_Query $query, string $type ): bool {
	$post_type = $query->get( 'post_type' );

	if ( is_array( $post_type ) ) {
		return in_array( $type, $post_type, true );
	}

	if ( '' === (string) $post_type ) {
		return 'post' === $type;
	}

	return $type === (string) $post_type;
}

/**
 * Registers the query variable used by the virtual routes.
 *
 * @param string[] $vars Public query vars.
 * @return string[]
 */
function kitstroy_register_virtual_query_vars( array $vars ): array {
	$vars[] = 'kitstroy_path';

	return $vars;
}
add_filter( 'query_vars', 'kitstroy_register_virtual_query_vars' );

/**
 * Adds a rewrite rule for every known demo route.
 *
 * Rules are added with the lowest priority: real WordPress content keeps its own
 * rules and wins, the theme rules only cover paths that WordPress cannot resolve.
 *
 * @return void
 */
function kitstroy_register_virtual_rewrite_rules(): void {
	foreach ( array_keys( kitstroy_get_virtual_route_map() ) as $path ) {
		add_rewrite_rule(
			'^' . preg_quote( (string) $path, '/' ) . '/?$',
			'index.php?kitstroy_path=' . (string) $path,
			'bottom'
		);
	}
}
add_action( 'init', 'kitstroy_register_virtual_rewrite_rules', 20 );

/**
 * Flushes rewrite rules once per routes version, without visiting the admin.
 *
 * @return void
 */
function kitstroy_maybe_flush_virtual_rewrite_rules(): void {
	if ( ! function_exists( 'flush_rewrite_rules' ) ) {
		return;
	}

	if ( KITSTROY_VIRTUAL_ROUTES_VERSION === (string) get_option( 'kitstroy_virtual_routes_version', '' ) ) {
		return;
	}

	flush_rewrite_rules( false );
	update_option( 'kitstroy_virtual_routes_version', KITSTROY_VIRTUAL_ROUTES_VERSION, false );
}
add_action( 'init', 'kitstroy_maybe_flush_virtual_rewrite_rules', 99 );

/**
 * Flushes rewrite rules when the theme is activated.
 *
 * @return void
 */
function kitstroy_virtual_routes_after_switch_theme(): void {
	if ( ! function_exists( 'flush_rewrite_rules' ) ) {
		return;
	}

	flush_rewrite_rules( false );
	update_option( 'kitstroy_virtual_routes_version', KITSTROY_VIRTUAL_ROUTES_VERSION, false );
}
add_action( 'after_switch_theme', 'kitstroy_virtual_routes_after_switch_theme' );

/**
 * Resolves the requested path into a demo route and clears the 404 flag.
 *
 * Works both with flushed rewrite rules and without them.
 *
 * @param mixed $wp WP environment object.
 * @return void
 */
function kitstroy_virtual_routes_parse_request( $wp ): void {
	if ( ! $wp instanceof WP ) {
		return;
	}

	if ( ! is_array( $wp->query_vars ) ) {
		$wp->query_vars = array();
	}

	$path = '';

	if ( ! empty( $wp->query_vars['kitstroy_path'] ) ) {
		$path = (string) $wp->query_vars['kitstroy_path'];
	} else {
		$path = kitstroy_get_request_route_path();
	}

	$route = kitstroy_resolve_virtual_route( $path );

	if ( empty( $route ) ) {
		return;
	}

	if ( kitstroy_virtual_route_has_real_content( $route ) ) {
		return;
	}

	$wp->query_vars = array( 'kitstroy_path' => (string) $route['path'] );
}
add_action( 'parse_request', 'kitstroy_virtual_routes_parse_request' );

/**
 * Hides default WordPress content: the first post and the sample page.
 *
 * @param WP_Query $query Query object.
 * @return void
 */
function kitstroy_exclude_default_content( $query ): void {
	static $is_running = false;

	if ( ! $query instanceof WP_Query || $is_running ) {
		return;
	}

	if ( $query->get( 'kitstroy_internal' ) ) {
		return;
	}

	if ( is_admin() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}

	$excluded = array();

	$is_running = true;

	if ( kitstroy_query_targets_post_type( $query, 'post' ) ) {
		$excluded = array_merge( $excluded, kitstroy_get_hidden_post_ids( 'post' ) );
	}

	if ( kitstroy_query_targets_post_type( $query, 'page' ) ) {
		$excluded = array_merge( $excluded, kitstroy_get_hidden_post_ids( 'page' ) );
	}

	$is_running = false;

	if ( empty( $excluded ) ) {
		return;
	}

	$query->set( 'post__not_in', array_merge( (array) $query->get( 'post__not_in' ), $excluded ) );
}
add_action( 'pre_get_posts', 'kitstroy_exclude_default_content' );

/**
 * IDs of the default WordPress content that must not be listed on the front end.
 *
 * @param string $post_type Post type: post or page.
 * @return int[]
 */
function kitstroy_get_hidden_post_ids( string $post_type ): array {
	static $cache = array();

	if ( isset( $cache[ $post_type ] ) ) {
		return $cache[ $post_type ];
	}

	$cache[ $post_type ] = array();

	$slugs = array(
		'post' => 'hello-world',
		'page' => 'sample-page',
	);

	if ( empty( $slugs[ $post_type ] ) ) {
		return $cache[ $post_type ];
	}

	$post_id = kitstroy_find_post_id_by_slug( $slugs[ $post_type ], $post_type );

	if ( $post_id > 0 ) {
		$cache[ $post_type ][] = $post_id;
	}

	return $cache[ $post_type ];
}

/**
 * Keeps the main query empty for demo routes: the theme renders its own content.
 *
 * @param WP_Query $query Query object.
 * @return void
 */
function kitstroy_neutralize_virtual_main_query( $query ): void {
	if ( ! $query instanceof WP_Query || ! $query->is_main_query() ) {
		return;
	}

	if ( '' === (string) $query->get( 'kitstroy_path' ) ) {
		return;
	}

	$query->set( 'post__in', array( 0 ) );
	$query->set( 'posts_per_page', 1 );
	$query->set( 'ignore_sticky_posts', true );
	$query->set( 'no_found_rows', true );
	$query->is_404 = false;
}
add_action( 'pre_get_posts', 'kitstroy_neutralize_virtual_main_query', 20 );

/**
 * Keeps WordPress from turning a demo route into a 404 response.
 *
 * @param mixed    $preempt Whether to short-circuit the 404 handling.
 * @param WP_Query $query   Query object handled by WP::handle_404().
 * @return mixed
 */
function kitstroy_virtual_routes_pre_handle_404( $preempt, $query = null ) {
	if ( ! empty( kitstroy_get_active_virtual_route() ) ) {
		return true;
	}

	return $preempt;
}
add_filter( 'pre_handle_404', 'kitstroy_virtual_routes_pre_handle_404', 10, 2 );

/**
 * Serves the demo route: replaces the main query result and sends HTTP 200.
 *
 * @return void
 */
function kitstroy_virtual_routes_template_redirect(): void {
	$route = kitstroy_get_active_virtual_route();

	if ( empty( $route ) ) {
		return;
	}

	$posts = kitstroy_build_virtual_route_posts( $route );

	foreach ( $posts as $virtual_post ) {
		wp_cache_set( $virtual_post->ID, $virtual_post, 'posts' );
	}

	kitstroy_setup_virtual_query( $route, $posts );

	status_header( 200 );

	// The theme prints its own canonical tag from inc/seo.php.
	remove_action( 'wp_head', 'rel_canonical' );
}
add_action( 'template_redirect', 'kitstroy_virtual_routes_template_redirect', 5 );

/**
 * Loads the template that belongs to the demo route.
 *
 * @param string $template Resolved template path.
 * @return string
 */
function kitstroy_virtual_routes_template_include( $template ) {
	$route = kitstroy_get_active_virtual_route();

	if ( empty( $route['template'] ) ) {
		return $template;
	}

	$located = locate_template( array( (string) $route['template'], 'index.php' ) );

	return $located ? $located : $template;
}
add_filter( 'template_include', 'kitstroy_virtual_routes_template_include' );

/**
 * Permalink of a virtual post points to its own route.
 *
 * @param string           $url  Generated URL.
 * @param WP_Post|int|null $post Post object or ID.
 * @return string
 */
function kitstroy_filter_virtual_permalink( $url, $post = null ) {
	$virtual_url = kitstroy_get_virtual_post_url( $post );

	return '' !== $virtual_url ? $virtual_url : $url;
}
add_filter( 'post_link', 'kitstroy_filter_virtual_permalink', 10, 2 );
add_filter( 'page_link', 'kitstroy_filter_virtual_permalink', 10, 2 );
add_filter( 'post_type_link', 'kitstroy_filter_virtual_permalink', 10, 2 );

/**
 * Canonical URL of a virtual post points to its own route.
 *
 * @param string  $canonical_url Canonical URL.
 * @param WP_Post $post          Post object.
 * @return string
 */
function kitstroy_filter_virtual_canonical_url( $canonical_url, $post = null ) {
	$virtual_url = kitstroy_get_virtual_post_url( $post );

	return '' !== $virtual_url ? $virtual_url : $canonical_url;
}
add_filter( 'get_canonical_url', 'kitstroy_filter_virtual_canonical_url', 10, 2 );

/**
 * Blog URL: the posts page when it exists, the /blog/ demo route otherwise.
 *
 * @return string
 */
function kitstroy_get_blog_url(): string {
	$page_for_posts = (int) get_option( 'page_for_posts' );

	if ( $page_for_posts > 0 ) {
		$permalink = get_permalink( $page_for_posts );

		if ( $permalink ) {
			return (string) $permalink;
		}
	}

	return home_url( '/blog/' );
}

/**
 * Fills breadcrumb links that WordPress cannot resolve for demo routes.
 *
 * @param array<int, array<string, string>> $items Breadcrumb items.
 * @return array<int, array<string, string>>
 */
function kitstroy_filter_virtual_breadcrumbs( array $items ): array {
	$route_links = array(
		'Блог'      => kitstroy_get_blog_url(),
		'Услуги'    => home_url( '/services/' ),
		'Портфолио' => home_url( '/portfolio/' ),
	);

	foreach ( $items as $index => $item ) {
		$label = isset( $item['label'] ) ? (string) $item['label'] : '';

		if ( ! isset( $route_links[ $label ] ) ) {
			continue;
		}

		// The blog link has no reliable source in WordPress without a posts page.
		if ( 'Блог' === $label || empty( $item['url'] ) ) {
			$items[ $index ]['url'] = $route_links[ $label ];
		}
	}

	return $items;
}
add_filter( 'kitstroy_breadcrumb_items', 'kitstroy_filter_virtual_breadcrumbs' );

/**
 * Menu items of the theme fallback menu.
 *
 * @return array<int, array<string, string>>
 */
function kitstroy_get_primary_menu_items(): array {
	return array(
		array(
			'label' => __( 'Услуги', 'kitstroy-moscow' ),
			'path'  => 'services',
		),
		array(
			'label' => __( 'Объекты', 'kitstroy-moscow' ),
			'path'  => 'portfolio',
		),
		array(
			'label' => __( 'Расчёт', 'kitstroy-moscow' ),
			'path'  => 'calculator',
		),
		array(
			'label' => __( 'Цены', 'kitstroy-moscow' ),
			'path'  => 'prices',
		),
		array(
			'label' => __( 'Как работаем', 'kitstroy-moscow' ),
			'path'  => 'workflow',
		),
		array(
			'label' => __( 'Документы', 'kitstroy-moscow' ),
			'path'  => 'documents',
		),
		array(
			'label' => __( 'О компании', 'kitstroy-moscow' ),
			'path'  => 'about',
		),
		array(
			'label' => __( 'Контакты', 'kitstroy-moscow' ),
			'path'  => 'contacts',
		),
	);
}

/**
 * Fallback for wp_nav_menu when no menu is assigned to the location.
 *
 * @param array<string, mixed> $args Arguments passed by wp_nav_menu().
 * @return void
 */
function kitstroy_nav_menu_fallback( $args = array() ): void {
	$args = is_array( $args ) ? $args : array();

	$menu_class = ! empty( $args['menu_class'] ) ? (string) $args['menu_class'] : 'site-menu';
	$container  = isset( $args['container'] ) ? $args['container'] : '';
	$current    = kitstroy_get_active_virtual_route();
	$current    = isset( $current['path'] ) ? (string) $current['path'] : '';

	$html = '';

	foreach ( kitstroy_get_primary_menu_items() as $item ) {
		$path    = (string) $item['path'];
		$classes = array( 'menu-item' );

		if ( '' !== $current && ( $current === $path || str_starts_with( $current, $path . '/' ) ) ) {
			$classes[] = 'current-menu-item';
		}

		$html .= '<li class="' . esc_attr( implode( ' ', $classes ) ) . '">';
		$html .= '<a href="' . esc_url( home_url( '/' . $path . '/' ) ) . '">' . esc_html( (string) $item['label'] ) . '</a>';
		$html .= '</li>';
	}

	$html = '<ul class="' . esc_attr( $menu_class ) . '">' . $html . '</ul>';

	if ( ! empty( $container ) && is_string( $container ) ) {
		$html = '<' . tag_escape( $container ) . ' class="menu">' . $html . '</' . tag_escape( $container ) . '>';
	}

	echo wp_kses_post( $html );
}
