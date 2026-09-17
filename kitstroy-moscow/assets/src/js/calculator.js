/**
 * Калькулятор стоимости: пересчёт сметы без перезагрузки страницы.
 * Формула повторяет серверную из inc/estimate.php — цифры не могут разойтись.
 */
const rub = (value) =>
	new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(value)) + ' ₽';

const digit = (value) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);

const round = (value, step) => Math.round(value / step) * step;

const OBJECTS = {
	flat: { rate: 1450, min: 60000, days: [7, 21], label: 'Квартира' },
	house: { rate: 1850, min: 120000, days: [14, 45], label: 'Частный дом' },
	office: { rate: 1650, min: 150000, days: [14, 40], label: 'Офис или торговля' },
	warehouse: { rate: 1250, min: 200000, days: [21, 60], label: 'Склад или производство' },
};

const SYSTEMS = {
	power: { multiplier: 1, watts: 12, days: 5, label: 'Электроснабжение и освещение' },
	low: { multiplier: 0.28, watts: 0, days: 3, label: 'Слаботочные системы' },
	fire: { multiplier: 0.34, watts: 0, days: 4, label: 'Пожарная сигнализация и оповещение' },
	access: { multiplier: 0.3, watts: 0, days: 4, label: 'Доступ и видеонаблюдение' },
};

const CITIES = {
	moscow: { rate: 1, label: 'Москва' },
	near: { rate: 1.06, label: 'До 30 км от МКАД' },
	far: { rate: 1.12, label: 'Дальше 30 км от МКАД' },
};

const calculate = ({ object, area, height, city, systems }) => {
	const type = OBJECTS[object] ?? OBJECTS.flat;
	const place = CITIES[city] ?? CITIES.moscow;
	const keys = systems.filter((key) => SYSTEMS[key]);

	const safeArea = Math.max(20, Math.min(2000, area));
	const safeHeight = Math.max(2.5, Math.min(6, height));
	const heightFactor = safeHeight > 3 ? 1 + (safeHeight - 3) * 0.06 : 1;
	const chosen = keys.length ? keys : ['power'];

	const base = safeArea * type.rate * place.rate * heightFactor;
	const lines = [];
	let total = 0;
	let watts = 0;
	let days = 0;

	chosen.forEach((key) => {
		const system = SYSTEMS[key];
		let cost = base * system.multiplier;

		if (key === 'power' && cost < 45000) {
			cost = 45000;
		}

		lines.push({ key, label: system.label, cost: round(cost, 500) });
		total += cost;
		watts += safeArea * system.watts;
		days += system.days;
	});

	total = Math.max(type.min, total);

	if (chosen.length > 1) {
		total *= 0.94;
	}

	total = round(total, 1000);
	const spread = round((total * 0.12) / 1000, 1) * 1000;

	return {
		lines,
		total,
		low: Math.max(0, total - spread),
		high: total + spread,
		power: watts > 0 ? watts / 1000 : 0,
		days: [type.days[0] + days, type.days[1] + days],
		perMeter: Math.round(total / safeArea),
		objectLabel: type.label,
		cityLabel: place.label,
	};
};

const initCalculator = (form) => {
	const result = form.querySelector('[data-calculator]') ? form : form.closest('[data-calculator]');

	const nodes = {
		total: document.querySelector('[data-total]'),
		spread: document.querySelector('[data-spread]'),
		lines: document.querySelector('[data-lines]'),
		power: document.querySelector('[data-power]'),
		days: document.querySelector('[data-days]'),
		perMeter: document.querySelector('[data-per-meter]'),
		city: document.querySelector('[data-city]'),
		objectLabel: document.querySelector('[data-object-label]'),
		areaValue: form.querySelector('[data-area-value]'),
		heightValue: form.querySelector('[data-height-value]'),
		area: form.querySelector('input[name="area"]'),
		height: form.querySelector('input[name="height"]'),
		citySelect: form.querySelector('select[name="city"]'),
	};

	const readState = () => ({
		object: form.querySelector('input[name="object"]:checked')?.value ?? 'flat',
		area: Number(nodes.area?.value ?? 80),
		height: Number(nodes.height?.value ?? 2.8),
		city: nodes.citySelect?.value ?? 'moscow',
		systems: [...form.querySelectorAll('input[name="systems[]"]:checked')].map((input) => input.value),
	});

	const render = () => {
		const state = readState();
		const estimate = calculate(state);

		if (nodes.areaValue) nodes.areaValue.textContent = `${digit(state.area)} м²`;
		if (nodes.heightValue) nodes.heightValue.textContent = `${digit(state.height).replace('.', ',')} м`;
		if (nodes.total) nodes.total.textContent = rub(estimate.total);
		if (nodes.spread) nodes.spread.textContent = `${rub(estimate.low)} — ${rub(estimate.high)}`;
		if (nodes.power) nodes.power.textContent = `${digit(estimate.power)} кВт`;
		if (nodes.days) nodes.days.textContent = `${estimate.days[0]}–${estimate.days[1]} дней`;
		if (nodes.perMeter) nodes.perMeter.textContent = `${rub(estimate.perMeter)}/м²`;
		if (nodes.city) nodes.city.textContent = estimate.cityLabel;
		if (nodes.objectLabel) nodes.objectLabel.textContent = estimate.objectLabel;

		if (nodes.lines) {
			nodes.lines.innerHTML = '';
			estimate.lines.forEach((line) => {
				const item = document.createElement('li');
				item.className = 'calculator__line';
				const name = document.createElement('span');
				name.textContent = line.label;
				const cost = document.createElement('span');
				cost.className = 'tech';
				cost.textContent = rub(line.cost);
				item.append(name, cost);
				nodes.lines.append(item);
			});
		}

		const diagram = document.querySelector('[data-diagram]');
		if (diagram) {
			const active = new Set(state.systems.length ? state.systems : ['power']);
			diagram.querySelectorAll('[data-line]').forEach((line) => {
				line.classList.toggle('is-off', !active.has(line.dataset.line));
			});
			diagram.querySelectorAll('[data-legend]').forEach((item) => {
				item.classList.toggle('is-off', !active.has(item.dataset.legend));
			});
		}
	};

	form.addEventListener('input', render);
	form.addEventListener('change', render);

	// Первый расчёт синхронизирует подписи со значениями из адреса страницы.
	render();
};

document.querySelectorAll('.js-calculator').forEach(initCalculator);

// На страницах без калькулятора схема всё равно реагирует на легенду.
const interactiveDiagram = document.querySelector('[data-diagram]');
if (interactiveDiagram && !document.querySelector('.js-calculator')) {
	interactiveDiagram.querySelectorAll('[data-legend]').forEach((item) => {
		const toggle = () => item.classList.toggle('is-off');
		item.addEventListener('click', toggle);
		item.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				toggle();
			}
		});
		item.setAttribute('tabindex', '0');
		item.setAttribute('role', 'button');
	});
}
