/** Формат денег и чисел — одинаковый при сборке и в браузере. */

const NBSP = '\u00A0';

/** 214000 → «214 000 ₽» (неразрывные пробелы, чтобы не рвалось по строке). */
export function money(value) {
  const digits = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${digits}${NBSP}₽`;
}

/** 320 → «320 см», 3.2 → «3,2 м». */
export function cm(value) {
  return `${Math.round(value)}${NBSP}см`;
}

export function meters(value) {
  return `${value.toFixed(1).replace('.', ',')}${NBSP}м`;
}

/** 1 200 000 → «1,2 млн» — для крупных чисел в интерфейсе. */
export function millions(value) {
  if (value < 1000000) return money(value);
  return `${(value / 1000000).toFixed(1).replace('.', ',')}${NBSP}млн${NBSP}₽`;
}

/** Русские формы множественного числа: 21 день, 22 дня, 25 дней. */
export function plural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/** 21 → «21 день», 45 → «45 дней». */
export function days(count) {
  return `${count}${NBSP}${plural(count, 'день', 'дня', 'дней')}`;
}
