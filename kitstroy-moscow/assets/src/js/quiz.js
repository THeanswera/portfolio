/**
 * Квиз заявки: три шага, сводка по объекту и подготовка письма.
 */
document.querySelectorAll('[data-quiz]').forEach((form) => {
	const panels = [...form.querySelectorAll('[data-step]')];
	const indicators = [...form.querySelectorAll('[data-step-indicator]')];
	const summary = {
		object: form.querySelector('[data-summary-object]'),
		area: form.querySelector('[data-summary-area]'),
		systems: form.querySelector('[data-summary-systems]'),
		estimate: form.querySelector('[data-summary-estimate]'),
	};
	const estimateField = form.querySelector('[data-quiz-estimate]');
	const rub = (value) =>
		new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(value)) + ' ₽';

	let current = 1;

	const number = (value) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);

	const show = (step) => {
		current = Math.min(Math.max(1, step), panels.length);

		panels.forEach((panel) => {
			panel.hidden = Number(panel.dataset.step) !== current;
		});

		indicators.forEach((indicator) => {
			const index = Number(indicator.dataset.stepIndicator);
			indicator.classList.toggle('is-active', index === current);
			indicator.classList.toggle('is-done', index < current);
		});

		const focusTarget = form.querySelector(`[data-step="${current}"] [data-quiz-focus]`)
			?? form.querySelector(`[data-step="${current}"] .quiz__question`);
		focusTarget?.setAttribute('tabindex', '-1');
		focusTarget?.focus?.({ preventScroll: true });
	};

	// Площадь живёт в первом шаге и обновляет подпись у ползунка.
	const areaInput = form.querySelector('input[name="quiz_area"]');
	const areaOutput = areaInput?.closest('.calculator__group')?.querySelector('output');
	const syncArea = () => {
		if (areaOutput && areaInput) {
			areaOutput.textContent = `${number(areaInput.value)} м²`;
		}
	};

	// Расчёт в сводке повторяет формулу калькулятора: те же ставки и множители.
	const quizQuote = () => {
		const area = Number(areaInput?.value ?? 80);
		const power = form.querySelector('input[name="quiz_object"]:checked');
		const rates = { flat: 1450, house: 1850, office: 1650, warehouse: 1250 };
		const mins = { flat: 60000, house: 120000, office: 150000, warehouse: 200000 };
		const multipliers = { power: 1, low: 0.28, fire: 0.34, access: 0.3 };
		const labels = {
			power: 'Электроснабжение и освещение',
			low: 'Слаботочные системы',
			fire: 'Пожарная сигнализация и оповещение',
			access: 'Доступ и видеонаблюдение',
		};
		const key = power?.value ?? 'flat';
		const rate = rates[key] ?? rates.flat;
		const base = area * rate;
		const chosen = [...form.querySelectorAll('input[name="quiz_systems[]"]:checked')].map((input) => input.value);

		if (!chosen.length) {
			chosen.push('power');
		}

		let total = 0;

		chosen.forEach((system) => {
			let cost = base * (multipliers[system] ?? 0);
			if (system === 'power' && cost < 45000) {
				cost = 45000;
			}
			total += cost;
		});

		total = Math.max(mins[key] ?? mins.flat, total);

		if (chosen.length > 1) {
			total *= 0.94;
		}

		total = Math.round(total / 1000) * 1000;
		const spread = Math.round((total * 0.12) / 1000) * 1000;

		return {
			total,
			low: Math.max(0, total - spread),
			high: total + spread,
			systems: chosen.map((system) => labels[system] ?? system),
			object: power?.closest('.quiz__option')?.querySelector('strong')?.textContent?.trim() ?? '',
		};
	};

	const refreshSummary = () => {
		const quote = quizQuote();

		if (summary.object) summary.object.textContent = quote.object;
		if (summary.area && areaInput) summary.area.textContent = number(areaInput.value);
		if (summary.systems) summary.systems.textContent = quote.systems.join(', ');
		if (summary.estimate) {
			summary.estimate.textContent = `${rub(quote.low)} — ${rub(quote.high)}`;
		}
		if (estimateField) {
			estimateField.value = `${rub(quote.low)} — ${rub(quote.high)}`;
		}
	};

	form.querySelectorAll('[data-quiz-next]').forEach((button) => {
		button.addEventListener('click', () => {
			const target = Number(button.dataset.quizNext);

			// Первый шаг без выбранного объекта не пропускаем.
			if (current === 1) {
				const object = form.querySelector('input[name="quiz_object"]:checked');
				if (!object) {
					form.querySelector('input[name="quiz_object"]')?.focus();
					form.querySelector('.quiz__options')?.classList.add('is-error');
					return;
				}
				form.querySelector('.quiz__options')?.classList.remove('is-error');
			}

			if (target === 3) {
				refreshSummary();
			}

			show(target);
		});
	});

	form.querySelectorAll('[data-quiz-back]').forEach((button) => {
		button.addEventListener('click', () => show(Number(button.dataset.quizBack)));
	});

	areaInput?.addEventListener('input', () => {
		syncArea();
		if (current === 3) {
			refreshSummary();
		}
	});

	form.addEventListener('change', () => {
		if (current === 3) {
			refreshSummary();
		}
	});

	syncArea();
	show(1);
});
