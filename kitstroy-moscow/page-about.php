<?php
/**
 * Template Name: О компании
 *
 * @package kitstroy-moscow
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();

	$heading      = kitstroy_get_post_field_value( 'about_heading', get_the_ID(), 'Инженерный подрядчик с проектной частью' );
	$intro        = kitstroy_get_post_field_value( 'about_intro', get_the_ID(), 'Проектируем и монтируем системы электроснабжения, пожарной безопасности и слаботочные системы. Работаем на объектах, где важна не картинка, а предсказуемая эксплуатация: решения считаем до монтажа, документацию передаём после сдачи.' );
	$advantages   = kitstroy_normalize_repeater_text_list( kitstroy_get_post_field_value( 'about_advantages', get_the_ID(), array() ) );
	$certificates = kitstroy_get_post_field_value( 'about_certificates', get_the_ID(), array() );
	$numbers      = kitstroy_get_post_field_value(
		'about_numbers',
		get_the_ID(),
		array(
			array( 'value' => '12', 'label' => 'лет на инженерных объектах' ),
			array( 'value' => '240+', 'label' => 'сданных объектов' ),
			array( 'value' => '2 года', 'label' => 'гарантии на монтаж' ),
			array( 'value' => '4', 'label' => 'бригады и проектная группа' ),
		)
	);
	$why_us       = kitstroy_normalize_repeater_text_list( kitstroy_get_post_field_value( 'about_why_us', get_the_ID(), array() ) );
	$has_content  = '' !== trim( wp_strip_all_tags( get_the_content() ) );
	?>
	<main id="primary" class="site-main">
		<div class="page-head">
			<div class="container">
				<?php kitstroy_breadcrumbs(); ?>
				<p class="kicker"><?php esc_html_e( 'О компании', 'kitstroy-moscow' ); ?></p>
				<h1><?php echo esc_html( $heading ); ?></h1>
				<p class="lead"><?php echo esc_html( $intro ); ?></p>
			</div>
		</div>

		<div class="section section--tight">
			<div class="container">
				<dl class="spec-grid">
					<?php foreach ( $numbers as $number ) : ?>
						<div class="spec-grid__item">
							<dt><?php echo esc_html( (string) ( $number['label'] ?? '' ) ); ?></dt>
							<dd><?php echo esc_html( (string) ( $number['value'] ?? '' ) ); ?></dd>
						</div>
					<?php endforeach; ?>
				</dl>
			</div>
		</div>

		<div class="section section--panel">
			<div class="container">
				<div class="about-page">
					<div class="about-page__intro">
						<p class="kicker"><?php esc_html_e( 'Как устроена работа', 'kitstroy-moscow' ); ?></p>
						<h2><?php esc_html_e( 'Проект, монтаж и документы в одних руках', 'kitstroy-moscow' ); ?></h2>
						<?php if ( $has_content ) : ?>
							<div class="entry-content"><?php the_content(); ?></div>
						<?php else : ?>
							<p class="lead">
								<?php esc_html_e( 'В компании четыре монтажные бригады и проектная группа. Инженер ведёт объект от обследования до акта: считает нагрузки, готовит рабочую документацию, контролирует монтаж и подписывает исполнительные схемы. Поэтому на объекте нет ситуации «проектировщик сказал одно, монтажник сделал другое».', 'kitstroy-moscow' ); ?>
							</p>
						<?php endif; ?>
					</div>

					<div class="about-page__grid">
						<div>
							<h3><?php esc_html_e( 'Что для нас важно', 'kitstroy-moscow' ); ?></h3>
							<ul class="feature-list feature-list--accent">
								<?php
								$principles = ! empty( $why_us ) ? $why_us : array(
									__( 'Считаем нагрузки и сечения, а не «как обычно делают»', 'kitstroy-moscow' ),
									__( 'Маркируем каждую линию и оставляем схему, по которой можно работать', 'kitstroy-moscow' ),
									__( 'Работаем по ПУЭ, ГОСТ и регламентам управляющих компаний', 'kitstroy-moscow' ),
									__( 'Фиксируем срок и цену в договоре с ответственностью за просрочку', 'kitstroy-moscow' ),
								);
								?>
								<?php foreach ( $principles as $item ) : ?>
									<li><?php echo esc_html( $item ); ?></li>
								<?php endforeach; ?>
							</ul>
						</div>

						<div>
							<h3><?php esc_html_e( 'Чем подтверждена компетенция', 'kitstroy-moscow' ); ?></h3>
							<ul class="feature-list">
								<?php
								$proofs = ! empty( $advantages ) ? $advantages : array(
									__( 'Лицензия МЧС на монтаж и обслуживание систем пожарной безопасности', 'kitstroy-moscow' ),
									__( 'Членство в СРО, допуск к работам на объектах повышенной ответственности', 'kitstroy-moscow' ),
									__( 'Аттестованные электромонтёры с группами допуска по электробезопасности', 'kitstroy-moscow' ),
									__( 'Собственная лаборатория для протоколов измерений', 'kitstroy-moscow' ),
								);
								?>
								<?php foreach ( $proofs as $item ) : ?>
									<li><?php echo esc_html( $item ); ?></li>
								<?php endforeach; ?>
							</ul>
						</div>
					</div>
				</div>

				<?php if ( ! empty( $certificates ) ) : ?>
					<div class="gallery-grid">
						<?php foreach ( $certificates as $certificate ) : ?>
							<?php $image = kitstroy_get_image_data( is_array( $certificate ) && isset( $certificate['ID'] ) ? $certificate['ID'] : $certificate, 'Документ компании' ); ?>
							<figure class="gallery-grid__item">
								<img src="<?php echo esc_url( $image['url'] ); ?>" alt="<?php echo esc_attr( $image['alt'] ); ?>" loading="lazy">
							</figure>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<div class="note note--info about-page__note">
					<strong><?php esc_html_e( 'Демонстрация.', 'kitstroy-moscow' ); ?></strong>
					<?php esc_html_e( 'Компания, объекты, цены и контакты на этом сайте вымышлены: он показывает, как может быть устроен сайт подрядчика инженерных систем.', 'kitstroy-moscow' ); ?>
				</div>
			</div>
		</div>

		<?php get_template_part( 'template-parts/sections/documents' ); ?>

		<?php
		get_template_part(
			'template-parts/sections/quiz-form',
			null,
			array(
				'form_type'  => 'universal',
				'section_id' => 'about-consultation',
				'title'      => __( 'Обсудим ваш объект', 'kitstroy-moscow' ),
				'subtitle'   => __( 'Расскажите про задачу: подберём состав систем, порядок работ и бригаду.', 'kitstroy-moscow' ),
			)
		);
		?>
	</main>
	<?php
endwhile;

get_footer();
