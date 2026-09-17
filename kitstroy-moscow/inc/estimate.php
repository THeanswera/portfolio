<?php
/**
 * Смета: справочные данные для калькулятора стоимости.
 *
 * Цифры демонстрационные и открыто описаны на странице «Расчёт»: клиент видит,
 * из чего складывается сумма и что она предварительная до выезда инженера.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

/**
 * Типы объектов: базовая ставка за м2 и минимальная сумма выезда.
 *
 * @return array<string, array<string, mixed>>
 */
function kitstroy_get_estimate_objects(): array {
	return array(
		'flat'      => array(
			'label'    => __( 'Квартира', 'kitstroy-moscow' ),
			'hint'     => __( 'Новостройка или вторичное жильё, до 200 м²', 'kitstroy-moscow' ),
			'rate'     => 1450,
			'min'      => 60000,
			'days'     => array( 7, 21 ),
		),
		'house'     => array(
			'label'    => __( 'Частный дом', 'kitstroy-moscow' ),
			'hint'     => __( 'Ввод, щит, контур заземления, наружные линии', 'kitstroy-moscow' ),
			'rate'     => 1850,
			'min'      => 120000,
			'days'     => array( 14, 45 ),
		),
		'office'    => array(
			'label'    => __( 'Офис или торговля', 'kitstroy-moscow' ),
			'hint'     => __( 'Рабочие места, серверная, освещение, слаботочка', 'kitstroy-moscow' ),
			'rate'     => 1650,
			'min'      => 150000,
			'days'     => array( 14, 40 ),
		),
		'warehouse' => array(
			'label'    => __( 'Склад или производство', 'kitstroy-moscow' ),
			'hint'     => __( 'Силовые линии, распределение, освещение цеха', 'kitstroy-moscow' ),
			'rate'     => 1250,
			'min'      => 200000,
			'days'     => array( 21, 60 ),
		),
	);
}

/**
 * Системы: доля в смете, минимальная мощность на м2 и типовой срок.
 *
 * @return array<string, array<string, mixed>>
 */
function kitstroy_get_estimate_systems(): array {
	return array(
		'power'   => array(
			'label'     => __( 'Электроснабжение и освещение', 'kitstroy-moscow' ),
			'short'     => __( 'ЭОМ', 'kitstroy-moscow' ),
			'hint'      => __( 'Кабельные линии, щит, группы, светильники, розетки', 'kitstroy-moscow' ),
			'multiplier' => 1.0,
			'watts'     => 12,
			'days'      => 5,
		),
		'low'     => array(
			'label'     => __( 'Слаботочные системы', 'kitstroy-moscow' ),
			'short'     => __( 'СКС', 'kitstroy-moscow' ),
			'hint'      => __( 'Интернет, телефон, ТВ, серверная, патч-панели', 'kitstroy-moscow' ),
			'multiplier' => 0.28,
			'watts'     => 0,
			'days'      => 3,
		),
		'fire'    => array(
			'label'     => __( 'Пожарная сигнализация и оповещение', 'kitstroy-moscow' ),
			'short'     => __( 'АПС/СОУЭ', 'kitstroy-moscow' ),
			'hint'      => __( 'Извещатели, приборы, сирены, табло, сценарии', 'kitstroy-moscow' ),
			'multiplier' => 0.34,
			'watts'     => 0,
			'days'      => 4,
		),
		'access'  => array(
			'label'     => __( 'Доступ и видеонаблюдение', 'kitstroy-moscow' ),
			'short'     => __( 'СКУД/СОТ', 'kitstroy-moscow' ),
			'hint'      => __( 'Камеры, контроллеры, замки, архив, удалённый доступ', 'kitstroy-moscow' ),
			'multiplier' => 0.30,
			'watts'     => 0,
			'days'      => 4,
		),
	);
}

/**
 * Города и коэффициенты выезда.
 *
 * @return array<string, array<string, mixed>>
 */
function kitstroy_get_estimate_cities(): array {
	return array(
		'moscow'   => array(
			'label' => __( 'Москва', 'kitstroy-moscow' ),
			'rate'  => 1.0,
		),
		'near'     => array(
			'label' => __( 'До 30 км от МКАД', 'kitstroy-moscow' ),
			'rate'  => 1.06,
		),
		'far'      => array(
			'label' => __( 'Дальше 30 км от МКАД', 'kitstroy-moscow' ),
			'rate'  => 1.12,
		),
	);
}

/**
 * Что входит в предварительную смету.
 *
 * @return array<int, array<string, string>>
 */
function kitstroy_get_estimate_included(): array {
	return array(
		array(
			'title' => __( 'Проектная документация', 'kitstroy-moscow' ),
			'text'  => __( 'Схема ЭОМ, планы трасс, спецификация материалов и щита.', 'kitstroy-moscow' ),
			'value' => '8 %',
		),
		array(
			'title' => __( 'Черновые материалы', 'kitstroy-moscow' ),
			'text'  => __( 'Кабель, гофра, лотки, подрозетники, клеммы, крепёж.', 'kitstroy-moscow' ),
			'value' => __( 'по спецификации', 'kitstroy-moscow' ),
		),
		array(
			'title' => __( 'Монтажные работы', 'kitstroy-moscow' ),
			'text'  => __( 'Трассы, штробление, прокладка, сборка щита, установка оборудования.', 'kitstroy-moscow' ),
			'value' => __( 'основа сметы', 'kitstroy-moscow' ),
		),
		array(
			'title' => __( 'Пусконаладка и сдача', 'kitstroy-moscow' ),
			'text'  => __( 'Прогон логики, замеры сопротивления, протоколы и акты.', 'kitstroy-moscow' ),
			'value' => '8 %',
		),
	);
}

/**
 * Предварительный расчёт по параметрам.
 *
 * @param array<string, mixed> $input Параметры расчёта.
 * @return array<string, mixed>
 */
function kitstroy_calculate_estimate( array $input ): array {
	$input = wp_parse_args(
		$input,
		array(
			'object'  => 'flat',
			'area'    => 80,
			'height'  => 2.8,
			'city'    => 'moscow',
			'systems' => array( 'power' ),
		)
	);

	$objects = kitstroy_get_estimate_objects();
	$systems = kitstroy_get_estimate_systems();
	$cities  = kitstroy_get_estimate_cities();

	$object_key = isset( $objects[ $input['object'] ] ) ? (string) $input['object'] : 'flat';
	$city_key   = isset( $cities[ $input['city'] ] ) ? (string) $input['city'] : 'moscow';
	$object     = $objects[ $object_key ];
	$city       = $cities[ $city_key ];

	$area   = max( 20, min( 2000, (float) $input['area'] ) );
	$height = max( 2.5, min( 6, (float) $input['height'] ) );

	$selected = array();
	foreach ( (array) $input['systems'] as $key ) {
		if ( isset( $systems[ $key ] ) ) {
			$selected[ $key ] = $systems[ $key ];
		}
	}

	if ( empty( $selected ) ) {
		$selected['power'] = $systems['power'];
	}

	// Множитель высоты: потолки выше 3 м удорожают трассы и лестницы.
	$height_factor = $height > 3 ? 1 + ( $height - 3 ) * 0.06 : 1;

	$base   = $area * (float) $object['rate'] * (float) $city['rate'] * $height_factor;
	$lines  = array();
	$total  = 0.0;
	$watts  = 0.0;
	$days   = 0;

	foreach ( $selected as $key => $system ) {
		$cost = $base * (float) $system['multiplier'];

		if ( 'power' === $key && $cost < 45000 ) {
			$cost = 45000;
		}

		$lines[] = array(
			'key'   => $key,
			'label' => $system['label'],
			'short' => $system['short'],
			'cost'  => (int) round( $cost / 500 ) * 500,
		);

		$total += $cost;
		$watts += $area * (float) $system['watts'];
		$days  += (int) $system['days'];
	}

	$total = max( (float) $object['min'], $total );

	if ( count( $selected ) > 1 ) {
		// Комплексный объект: одна бригада, одна логика, меньше накладных.
		$total *= 0.94;
	}

	$total = (int) round( $total / 1000 ) * 1000;
	$spread = (int) round( $total * 0.12 / 1000 ) * 1000;

	$days_min = (int) $object['days'][0] + $days;
	$days_max = (int) $object['days'][1] + $days;

	$power_kw = $watts > 0 ? round( $watts / 1000, 1 ) : 0.0;

	return array(
		'object'     => $object_key,
		'object_label' => (string) $object['label'],
		'city'       => $city_key,
		'city_label' => (string) $city['label'],
		'area'       => $area,
		'height'     => $height,
		'systems'    => array_keys( $selected ),
		'lines'      => $lines,
		'power_kw'   => $power_kw,
		'total'      => $total,
		'low'        => max( 0, $total - $spread ),
		'high'       => $total + $spread,
		'days'       => array( $days_min, $days_max ),
		'per_meter'  => (int) round( $total / $area ),
		'base'       => (int) round( $base ),
	);
}

/**
 * Расчёт из параметров текущего запроса.
 *
 * @return array<string, mixed>
 */
function kitstroy_get_estimate_from_request(): array {
	$objects = kitstroy_get_estimate_objects();
	$systems = kitstroy_get_estimate_systems();
	$cities  = kitstroy_get_estimate_cities();

	$object    = isset( $_GET['object'] ) ? sanitize_key( wp_unslash( $_GET['object'] ) ) : 'flat';
	$city      = isset( $_GET['city'] ) ? sanitize_key( wp_unslash( $_GET['city'] ) ) : 'moscow';
	$area      = isset( $_GET['area'] ) ? (float) wp_unslash( $_GET['area'] ) : 80;
	$height    = isset( $_GET['height'] ) ? (float) wp_unslash( $_GET['height'] ) : 2.8;
	$raw       = isset( $_GET['systems'] ) ? (array) wp_unslash( $_GET['systems'] ) : array( 'power' );
	$selected  = array();

	foreach ( $raw as $key ) {
		$key = sanitize_key( (string) $key );

		if ( isset( $systems[ $key ] ) ) {
			$selected[] = $key;
		}
	}

	return kitstroy_calculate_estimate(
		array(
			'object'  => isset( $objects[ $object ] ) ? $object : 'flat',
			'city'    => isset( $cities[ $city ] ) ? $city : 'moscow',
			'area'    => $area,
			'height'  => $height,
			'systems' => $selected ? $selected : array( 'power' ),
		)
	);
}

/**
 * Сводка тарифов для страницы «Цены» и подсказок в интерфейсе.
 *
 * @return array<string, mixed>
 */
function kitstroy_get_estimate_summary(): array {
	return array(
		'objects' => kitstroy_get_estimate_objects(),
		'systems' => kitstroy_get_estimate_systems(),
		'cities'  => kitstroy_get_estimate_cities(),
		'included' => kitstroy_get_estimate_included(),
	);
}
