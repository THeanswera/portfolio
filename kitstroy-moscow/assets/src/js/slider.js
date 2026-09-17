const heroSlider = document.querySelector('.js-hero-slider');

if (heroSlider) {
	const slides = Array.from(heroSlider.querySelectorAll('.hero__slide'));
	const dots = Array.from(heroSlider.querySelectorAll('.hero__dot'));
	const prevButton = heroSlider.querySelector('[data-slide-direction="prev"]');
	const nextButton = heroSlider.querySelector('[data-slide-direction="next"]');
	let currentIndex = 0;
	let timer = null;

	const setSlide = (nextIndex) => {
		slides.forEach((slide, index) => {
			slide.classList.toggle('is-active', index === nextIndex);
		});

		dots.forEach((dot, index) => {
			dot.classList.toggle('is-active', index === nextIndex);
		});

		currentIndex = nextIndex;
	};

	const nextSlide = () => {
		const nextIndex = currentIndex + 1 >= slides.length ? 0 : currentIndex + 1;
		setSlide(nextIndex);
	};

	const restart = () => {
		window.clearInterval(timer);
		timer = window.setInterval(nextSlide, 7000);
	};

	prevButton?.addEventListener('click', () => {
		setSlide(currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1);
		restart();
	});

	nextButton?.addEventListener('click', () => {
		nextSlide();
		restart();
	});

	dots.forEach((dot, index) => {
		dot.addEventListener('click', () => {
			setSlide(index);
			restart();
		});
	});

	restart();
}
