<?php
/**
 * Template Name: Калькулятор
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="site-main">
	<div class="page-head">
		<div class="container">
			<?php kitstroy_breadcrumbs(); ?>
			<p class="kicker"><?php esc_html_e( 'Расчёт стоимости', 'kitstroy-moscow' ); ?></p>
			<h1><?php esc_html_e( 'Калькулятор инженерных систем', 'kitstroy-moscow' ); ?></h1>
			<p class="lead">
				<?php esc_html_e( 'Пять параметров дают порядок суммы: тип объекта, площадь, высота потолков, состав систем и удалённость от МКАД. Расчёт предварительный — после выезда инженера смета фиксируется в договоре и не меняется.', 'kitstroy-moscow' ); ?>
			</p>
		</div>
	</div>

	<?php get_template_part( 'template-parts/sections/calculator' ); ?>

	<section class="section section--tight">
		<div class="container">
			<div class="formula">
				<div class="formula__intro">
					<p class="kicker"><?php esc_html_e( 'Открытая формула', 'kitstroy-moscow' ); ?></p>
					<h2><?php esc_html_e( 'Как считается сумма', 'kitstroy-moscow' ); ?></h2>
					<p class="lead">
						<?php esc_html_e( 'Никаких «менеджер посчитает». Формула простая, и её можно проверить на калькуляторе: площадь умножается на ставку типа объекта, к ней добавляются системы со своими коэффициентами и надбавка за удалённость.', 'kitstroy-moscow' ); ?>
					</p>
				</div>
				<ol class="formula__steps">
					<li>
						<span class="formula__num">01</span>
						<div>
							<h3><?php esc_html_e( 'База: площадь × ставка объекта', 'kitstroy-moscow' ); ?></h3>
							<p><?php esc_html_e( 'Квартира — 1 450 ₽/м², дом — 1 850 ₽/м², офис — 1 650 ₽/м², склад или производство — 1 250 ₽/м². Ставка включает монтаж трасс, групп и щита.', 'kitstroy-moscow' ); ?></p>
						</div>
					</li>
					<li>
						<span class="formula__num">02</span>
						<div>
							<h3><?php esc_html_e( 'Системы: коэффициент к базе', 'kitstroy-moscow' ); ?></h3>
							<p><?php esc_html_e( 'Слаботочка добавляет 28 %, пожарная сигнализация с оповещением — 34 %, доступ и видеонаблюдение — 30 %. Если систем несколько, общая сумма уменьшается на 6 %: одна бригада, один график.', 'kitstroy-moscow' ); ?></p>
						</div>
					</li>
					<li>
						<span class="formula__num">03</span>
						<div>
							<h3><?php esc_html_e( 'Поправки: высота и удалённость', 'kitstroy-moscow' ); ?></h3>
							<p><?php esc_html_e( 'Потолки выше трёх метров добавляют 6 % за каждый метр. Выезд до 30 км от МКАД — плюс 6 %, дальше — плюс 12 % на дорогу и проживание бригады.', 'kitstroy-moscow' ); ?></p>
						</div>
					</li>
					<li>
						<span class="formula__num">04</span>
						<div>
							<h3><?php esc_html_e( 'Вилка ±7 %', 'kitstroy-moscow' ); ?></h3>
							<p><?php esc_html_e( 'В расчёте показываем диапазон: он закрывает разброс по материалам и фактическим трассам. После замера диапазон превращается в точную смету.', 'kitstroy-moscow' ); ?></p>
						</div>
					</li>
				</ol>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/sections/documents' ); ?>

	<?php
	get_template_part(
		'template-parts/sections/quiz-form',
		null,
		array(
			'form_type'  => 'estimate',
			'section_id' => 'consultation',
			'title'      => __( 'Пришлите параметры — вернёмся со сметой', 'kitstroy-moscow' ),
			'subtitle'   => __( 'Если объект нестандартный, калькулятор даст только порядок суммы. Опишите задачу: инженер уточнит детали и подготовит расчёт по позициям.', 'kitstroy-moscow' ),
		)
	);
	?>
</main>
<?php
get_footer();
