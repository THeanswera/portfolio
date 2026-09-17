<?php
/**
 * Обработчик заявок с сайта мастерской.
 *
 * Принимает POST с JSON, проверяет данные на стороне сервера, защищается от спама
 * (скрытое поле и ограничение частоты), сохраняет заявку в файл и пытается
 * отправить письмо. Секретов в клиентском JavaScript нет: адрес получателя
 * задаётся только здесь, на сервере.
 *
 * Файлы заявок лежат в папке data/ и закрыты от доступа извне через .htaccess.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/** Адрес, на который уходят заявки. Замените на рабочую почту мастерской. */
const OWNER_EMAIL = 'zakaz@masterskaya-forma.ru';

/** Сколько заявок с одного адреса допускаем за окно и как долго окно длится. */
const RATE_LIMIT = 5;
const RATE_WINDOW = 600;

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function limit(string $value, int $max): string
{
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(['ok' => false, 'error' => 'method'], 405);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$name = limit((string) ($data['name'] ?? ''), 120);
$contact = limit((string) ($data['contact'] ?? ''), 200);
$comment = limit((string) ($data['comment'] ?? ''), 2000);
$config = limit((string) ($data['config'] ?? ''), 2000);
$page = limit((string) ($data['page'] ?? ''), 200);
$honey = trim((string) ($data['honey'] ?? ''));

// Скрытое поле заполняют только роботы: отвечаем «успех», чтобы не подсказывать.
if ($honey !== '') {
    respond(['ok' => true]);
}

if ($name === '' || $contact === '') {
    respond(['ok' => false, 'error' => 'fields'], 422);
}

// Простая проверка контакта: должен быть хоть один признак связи.
if (!preg_match('/@|\\+|\\d{5,}/u', $contact)) {
    respond(['ok' => false, 'error' => 'contact'], 422);
}

$dir = __DIR__ . '/data';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
    respond(['ok' => false, 'error' => 'storage'], 500);
}

$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
$now = time();
$rateFile = $dir . '/rate.json';
$rate = [];
if (is_file($rateFile)) {
    $decoded = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        $rate = $decoded;
    }
}
$hits = array_values(array_filter(
    is_array($rate[$ip] ?? null) ? $rate[$ip] : [],
    static fn ($time) => is_int($time) && $now - $time < RATE_WINDOW
));
if (count($hits) >= RATE_LIMIT) {
    respond(['ok' => false, 'error' => 'rate'], 429);
}
$hits[] = $now;
$rate = array_filter($rate, static fn ($_, $key) => $key === $ip, ARRAY_FILTER_USE_BOTH);
$rate[$ip] = $hits;
file_put_contents($rateFile, json_encode($rate), LOCK_EX);

$lead = [
    'time' => date('c'),
    'name' => $name,
    'contact' => $contact,
    'comment' => $comment,
    'config' => $config,
    'page' => $page,
    'ip' => $ip,
];
file_put_contents(
    $dir . '/leads.jsonl',
    json_encode($lead, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
);

$host = (string) ($_SERVER['HTTP_HOST'] ?? 'masterskaya-forma.ru');
$subject = 'Заявка с сайта: ' . $name;
$body = implode("\n", [
    'Новая заявка с сайта мастерской.',
    '',
    'Имя: ' . $name,
    'Контакт: ' . $contact,
    $comment !== '' ? 'Комментарий: ' . $comment : 'Комментарий: —',
    'Страница: ' . ($page !== '' ? $page : '—'),
    '',
    'Конфигурация:',
    $config !== '' ? $config : '—',
]);
$headers = implode("\r\n", [
    'From: robot@' . $host,
    'Reply-To: ' . OWNER_EMAIL,
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
]);

// Письмо — уведомление; заявка уже сохранена в файл, поэтому сбой почты не критичен.
$sent = @mail(
    OWNER_EMAIL,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $body,
    $headers
);

respond(['ok' => true, 'stored' => true, 'mailed' => (bool) $sent]);
