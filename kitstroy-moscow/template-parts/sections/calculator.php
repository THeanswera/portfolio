<?php
/**
 * Калькулятор стоимости: расчёт по параметрам объекта.
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

$objects  = kitstroy_get_estimate_objects();
$systems  = kitstroy_get_estimate_systems();
$cities   = kitstroy_get_estimate_cities();
$estimate = kitstroy_get_estimate_from_request();
$money    = static fn( $value ) => number_format_i18n( (float) $value, 0, ',', ' ' ) . ' ₽';
?>
<section class="section section--panel" id="calculator">
	<div class="container">
		<div class="section-head section-head--row">
			<div>
				<p class="kicker"><?php esc_html_e( 'Расчёт стоимости', 'kitstroy-moscow' ); ?></p>
				<h2><?php esc_html_e( 'Соберите объект — увидите порядок суммы', 'kitstroy-moscow' ); ?></h2>
			</div>
			<p class="lead calculator__intro">
				<?php esc_html_e( 'Четыре параметра: тип объекта, площадь, высота потолков и состав систем. Расчёт предварительный: точную смету фиксируем после выезда инженера.', 'kitstroy-moscow' ); ?>
			</p>
		</div>

		<form class="calculator js-calculator" method="get" action="<?php echo esc_url( home_url( '/calculator/' ) ); ?>" data-calculator>
			<div class="calculator__controls">
				<fieldset class="calculator__group">
					<legend class="calculator__legend"><?php esc_html_e( 'Тип объекта', 'kitstroy-moscow' ); ?></legend>
					<div class="calculator__options">
						<?php foreach ( $objects as $key => $object ) : ?>
							<label class="calculator__option">
								<input type="radio" name="object" value="<?php echo esc_attr( (string) $key ); ?>" <?php checked( $estimate['object'], $key ); ?>>
								<span class="calculator__option-body">
									<strong><?php echo esc_html( (string) $object['label'] ); ?></strong>
									<small><?php echo esc_html( (string) $object['hint'] ); ?></small>
									<span class="calculator__option-rate tech"><?php echo esc_html( $money( $object['rate'] ) . '/м²' ); ?></span>
								</span>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>

				<div class="calculator__group">
					<div class="calculator__row">
						<label class="calculator__legend" for="calc-area"><?php esc_html_e( 'Площадь объекта', 'kitstroy-moscow' ); ?></label>
						<output class="calculator__value tech" for="calc-area" data-area-value><?php echo esc_html( (string) $estimate['area'] ); ?> м²</output>
					</div>
					<input class="calculator__range" id="calc-area" type="range" name="area" min="20" max="1200" step="10" value="<?php echo esc_attr( (string) $estimate['area'] ); ?>">
					<div class="calculator__scale tech"><span>20 м²</span><span>600 м²</span><span>1200 м²</span></div>
				</div>

				<div class="calculator__group">
					<div class="calculator__row">
						<label class="calculator__legend" for="calc-height"><?php esc_html_e( 'Высота потолков', 'kitstroy-moscow' ); ?></label>
						<output class="calculator__value tech" for="calc-height" data-height-value><?php echo esc_html( number_format_i18n( (float) $estimate['height'], 1 ) ); ?> м</output>
					</div>
					<input class="calculator__range" id="calc-height" type="range" name="height" min="2.5" max="6" step="0.1" value="<?php echo esc_attr( (string) $estimate['height'] ); ?>">
					<div class="calculator__scale tech"><span>2,5 м</span><span>4 м</span><span>6 м</span></div>
				</div>

				<fieldset class="calculator__group">
					<legend class="calculator__legend"><?php esc_html_e( 'Состав систем', 'kitstroy-moscow' ); ?></legend>
					<div class="calculator__systems">
						<?php foreach ( $systems as $key => $system ) : ?>
							<label class="calculator__system">
								<input type="checkbox" name="systems[]" value="<?php echo esc_attr( (string) $key ); ?>" <?php checked( in_array( $key, (array) $estimate['systems'], true ) ); ?>>
								<span class="calculator__system-body">
									<span class="calculator__system-head">
										<strong><?php echo esc_html( (string) $system['short'] ); ?></strong>
										<span class="tech"><?php echo esc_html( (string) $system['label'] ); ?></span>
									</span>
									<small><?php echo esc_html( (string) $system['hint'] ); ?></small>
								</span>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>

				<div class="calculator__group">
					<label class="calculator__legend" for="calc-city"><?php esc_html_e( 'Адрес объекта', 'kitstroy-moscow' ); ?></label>
					<select class="calculator__select" id="calc-city" name="city">
						<?php foreach ( $cities as $key => $city ) : ?>
							<option value="<?php echo esc_attr( (string) $key ); ?>" <?php selected( $estimate['city'], $key ); ?>><?php echo esc_html( (string) $city['label'] ); ?></option>
						<?php endforeach; ?>
					</select>
					<p class="calculator__hint tech"><?php esc_html_e( 'Дальние выезды считаем с коэффициентом на дорогу', 'kitstroy-moscow' ); ?></p>
				</div>

				<noscript>
					<button class="button button--secondary button--block" type="submit"><?php esc_html_e( 'Пересчитать', 'kitstroy-moscow' ); ?></button>
				</noscript>
			</div>

			<aside class="calculator__result js-calculator-result" aria-live="polite">
				<div class="calculator__result-head">
					<span class="kicker kicker--plain"><?php esc_html_e( 'Предварительная смета', 'kitstroy-moscow' ); ?></span>
					<span class="tag" data-object-label><?php echo esc_html( (string) $estimate['object_label'] ); ?></span>
				</div>

				<p class="calculator__total" data-total><?php echo esc_html( $money( $estimate['total'] ) ); ?></p>
				<p class="calculator__spread tech">
					<?php esc_html_e( 'вилка', 'kitstroy-moscow' ); ?>
					<span data-spread><?php echo esc_html( $money( $estimate['low'] ) . ' — ' . $money( $estimate['high'] ) ); ?></span>
				</p>

				<ul class="calculator__lines" data-lines>
					<?php foreach ( $estimate['lines'] as $line ) : ?>
						<li class="calculator__line">
							<span><?php echo esc_html( (string) $line['label'] ); ?></span>
							<span class="tech" data-line-cost="<?php echo esc_attr( (string) $line['key'] ); ?>"><?php echo esc_html( $money( $line['cost'] ) ); ?></span>
						</li>
					<?php endforeach; ?>
				</ul>

				<dl class="calculator__facts">
					<div>
						<dt><?php esc_html_e( 'Расчётная мощность', 'kitstroy-moscow' ); ?></dt>
						<dd data-power><?php echo esc_html( number_format_i18n( (float) $estimate['power_kw'], 1 ) ); ?> кВт</dd>
					</div>
					<div>
						<dt><?php esc_html_e( 'Срок работ', 'kitstroy-moscow' ); ?></dt>
						<dd data-days><?php echo esc_html( $estimate['days'][0] . '–' . $estimate['days'][1] ); ?> <?php esc_html_e( 'дней', 'kitstroy-moscow' ); ?></dd>
					</div>
					<div>
						<dt><?php esc_html_e( 'Выходит за метр', 'kitstroy-moscow' ); ?></dt>
						<dd data-per-meter><?php echo esc_html( $money( $estimate['per_meter'] ) ); ?>/м²</dd>
					</div>
					<div>
						<dt><?php esc_html_e( 'Адрес', 'kitstroy-moscow' ); ?></dt>
						<dd data-city><?php echo esc_html( (string) $estimate['city_label'] ); ?></dd>
					</div>
				</dl>

				<a class="button button--primary button--block" href="#consultation">
					<span><?php esc_html_e( 'Отправить расчёт инженеру', 'kitstroy-moscow' ); ?></span>
				</a>
				<p class="calculator__note tech">
					<?php esc_html_e( 'Смета предварительная и не заменяет проект. Формула расчёта открыта на странице «Цены».', 'kitstroy-moscow' ); ?>
				</p>
			</aside>
		</form>
	</div>
</section>
