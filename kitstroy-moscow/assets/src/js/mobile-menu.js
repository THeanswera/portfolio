const burger = document.querySelector('.site-header__burger');
const mobilePanel = document.querySelector('.site-header__mobile-panel');

if (burger && mobilePanel) {
	const closeMenu = () => {
		burger.setAttribute('aria-expanded', 'false');
		mobilePanel.classList.remove('is-open');
		mobilePanel.setAttribute('hidden', 'hidden');
	};

	const openMenu = () => {
		burger.setAttribute('aria-expanded', 'true');
		mobilePanel.classList.add('is-open');
		mobilePanel.removeAttribute('hidden');
	};

	burger.addEventListener('click', () => {
		const isOpen = burger.getAttribute('aria-expanded') === 'true';

		if (isOpen) {
			closeMenu();
			return;
		}

		openMenu();
	});

	mobilePanel.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => {
			closeMenu();
		});
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			closeMenu();
		}
	});
}
