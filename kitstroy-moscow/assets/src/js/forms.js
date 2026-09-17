const maskPhoneValue = (value) => {
	const digits = value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
	const template = '+7 (___) ___-__-__';
	let result = '';
	let index = digits.startsWith('7') ? 1 : 0;

	for (const char of template) {
		if (char === '_') {
			result += digits[index] || '';
			index += 1;
		} else {
			result += char;
		}
	}

	return result.trim();
};

document.querySelectorAll('.js-phone-input').forEach((input) => {
	input.value = maskPhoneValue(input.value);

	input.addEventListener('input', () => {
		input.value = maskPhoneValue(input.value);
	});
});

document.querySelectorAll('.js-kitstroy-form').forEach((form) => {
	form.addEventListener('submit', (event) => {
		const submitButton = form.querySelector('button[type="submit"]');
		const tokenField = form.querySelector('input[name="kitstroy_recaptcha_token"]');
		const siteKey = form.dataset.recaptchaSitekey;

		if (form.dataset.submitting === 'true') {
			event.preventDefault();
			return;
		}

		submitButton?.setAttribute('disabled', 'disabled');

		if (!siteKey) {
			form.dataset.submitting = 'true';
			return;
		}

		if (!window.grecaptcha || !tokenField) {
			event.preventDefault();
			submitButton?.removeAttribute('disabled');
			window.alert(window.kitstroyTheme?.errorText || 'Form submission is temporarily unavailable.');
			return;
		}

		if (tokenField.value) {
			form.dataset.submitting = 'true';
			return;
		}

		event.preventDefault();

		window.grecaptcha.ready(() => {
			window.grecaptcha
				.execute(siteKey, { action: 'submit' })
				.then((token) => {
					tokenField.value = token;
					form.dataset.submitting = 'true';
					form.submit();
				})
				.catch(() => {
					submitButton?.removeAttribute('disabled');
				});
		});
	});
});
