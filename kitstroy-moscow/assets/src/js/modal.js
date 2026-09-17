const body = document.body;
let lastFocusedElement = null;

const closeModal = (modal) => {
	if (!modal) {
		return;
	}

	modal.classList.remove('is-open');
	modal.setAttribute('aria-hidden', 'true');
	body.classList.remove('modal-open');
	lastFocusedElement?.focus?.();
};

document.querySelectorAll('[data-modal-open]').forEach((button) => {
	button.addEventListener('click', () => {
		const modalId = button.getAttribute('data-modal-open');
		const modal = document.getElementById(modalId);
		const dialog = modal?.querySelector('.modal__dialog');

		if (!modal || !dialog) {
			return;
		}

		lastFocusedElement = button;
		modal.classList.add('is-open');
		modal.setAttribute('aria-hidden', 'false');
		body.classList.add('modal-open');
		dialog.focus();
	});
});

document.querySelectorAll('[data-modal-close]').forEach((button) => {
	button.addEventListener('click', (event) => {
		closeModal(event.target.closest('.modal'));
	});
});

document.addEventListener('keydown', (event) => {
	if (event.key !== 'Escape') {
		return;
	}

	closeModal(document.querySelector('.modal.is-open'));
});
