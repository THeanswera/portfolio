<?php
/**
 * Обработчик заявки с сайта Sertexity.
 *
 * Демонстрационный проект: письма не отправляются. Обработчик проверяет данные,
 * отсекает спам и возвращает посетителя на страницу с понятным статусом,
 * чтобы форма вела себя как настоящая.
 */

declare(strict_types=1);

$FORM_TITLES = [
	'sertexity-request' => 'Request from the Sertexity website',
];

/** Куда возвращать посетителя: только свой домен, без открытых редиректов. */
function safe_return_url(): string
{
	$fallback = '/thanks/';
	$referer = $_SERVER['HTTP_REFERER'] ?? '';

	if ($referer === '') {
		return $fallback;
	}

	$host = parse_url($referer, PHP_URL_HOST);
	$own = $_SERVER['HTTP_HOST'] ?? '';

	if ($host === null || $host !== $own) {
		return $fallback;
	}

	$path = parse_url($referer, PHP_URL_PATH) ?: '/';

	return $path;
}

function respond(string $status, string $path): void
{
	$separator = str_contains($path, '?') ? '&' : '?';
	header('Location: ' . $path . $separator . 'status=' . $status, true, 303);
	exit;
}

function text(string $key, int $max = 200): string
{
	$value = isset($_POST[$key]) ? (string) $_POST[$key] : '';
	$value = trim(preg_replace('/\s+/u', ' ', strip_tags($value)) ?? '');

	return mb_substr($value, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
	respond('error', safe_return_url());
}

$path = safe_return_url();

/* Ловушка для ботов: поле скрыто от людей. */
if (text('website') !== '') {
	respond('spam', $path);
}

/* Слишком быстрая отправка тоже признак автоматической заявки. */
$started = isset($_POST['startedAt']) ? (int) $_POST['startedAt'] : 0;
if ($started > 0 && (time() - $started) < 2) {
	respond('spam', $path);
}

$name = text('name', 80);
$email = text('email', 120);
$message = text('message', 1200);
$consent = isset($_POST['consent']) && (string) $_POST['consent'] === '1';

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$consent) {
	respond('error', $path);
}

/* Ограничение частоты: не больше одной заявки в минуту с одного адреса. */
$rateFile = sys_get_temp_dir() . '/sertexity-rate-' . md5(($_SERVER['REMOTE_ADDR'] ?? '') . ($_SERVER['HTTP_USER_AGENT'] ?? ''));
$last = is_file($rateFile) ? (int) file_get_contents($rateFile) : 0;

if ($last > 0 && (time() - $last) < 60) {
	respond('spam', $path);
}

file_put_contents($rateFile, (string) time());

/* Заявку сохраняем рядом с сайтом, чтобы её можно было посмотреть в демо. */
$logFile = __DIR__ . '/data/requests.jsonl';
$entry = [
	'time' => date('c'),
	'form' => text('form', 40) ?: 'sertexity-request',
	'name' => $name,
	'email' => $email,
	'deposit' => text('deposit', 40),
	'profile' => text('profile', 40),
	'message' => $message,
	'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
];

if (is_dir(__DIR__ . '/data') || mkdir(__DIR__ . '/data', 0755, true)) {
	file_put_contents($logFile, json_encode($entry, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

respond('sent', $path);
