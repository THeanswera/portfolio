document.documentElement.classList.add('js');

/* --- появление блоков при скролле --- */
const revealNodes = [...document.querySelectorAll('[data-reveal]')];

if (revealNodes.length) {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!('IntersectionObserver' in window) || reduced) {
		revealNodes.forEach((node) => node.classList.add('is-in'));
	} else {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						return;
					}

					entry.target.classList.add('is-in');
					observer.unobserve(entry.target);
				});
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
		);

		revealNodes.forEach((node) => {
			const siblings = [...(node.parentElement?.children ?? [])].filter((child) => child.hasAttribute('data-reveal'));
			node.style.transitionDelay = `${Math.min(siblings.indexOf(node), 4) * 70}ms`;
			observer.observe(node);
		});
	}
}

/* --- подсветка строки таблицы цен и активного раздела меню --- */
const header = document.querySelector('.site-header');

if (header) {
	const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });
}

/* --- схема: наведение на легенду подсвечивает линию --- */
document.querySelectorAll('[data-diagram]').forEach((diagram) => {
	const lines = [...diagram.querySelectorAll('[data-line]')];
	const items = [...diagram.querySelectorAll('[data-legend]')];

	const highlight = (key) => {
		lines.forEach((line) => line.classList.toggle('is-hot', line.dataset.line === key));
	};

	items.forEach((item) => {
		item.addEventListener('mouseenter', () => highlight(item.dataset.legend));
		item.addEventListener('mouseleave', () => highlight(null));
		item.addEventListener('focusin', () => highlight(item.dataset.legend));
		item.addEventListener('focusout', () => highlight(null));
	});
});

/* --- пароль и проценты: оживление счётчиков в спецификации --- */
const counters = [...document.querySelectorAll('[data-counter]')];

if (counters.length && 'IntersectionObserver' in window) {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const counterObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}

				const node = entry.target;
				const target = Number(node.dataset.counter);
				counterObserver.unobserve(node);

				if (reduced || !Number.isFinite(target)) {
					node.textContent = node.dataset.counterText ?? String(target);
					return;
				}

				const start = performance.now();
				const duration = 900;
				const tick = (now) => {
					const progress = Math.min(1, (now - start) / duration);
					const eased = 1 - (1 - progress) ** 3;
					node.textContent = new Intl.NumberFormat('ru-RU').format(Math.round(target * eased));
					if (progress < 1) {
						requestAnimationFrame(tick);
					} else {
						node.textContent = node.dataset.counterText ?? new Intl.NumberFormat('ru-RU').format(target);
					}
				};
				requestAnimationFrame(tick);
			});
		},
		{ threshold: 0.4 },
	);

	counters.forEach((node) => counterObserver.observe(node));
}
