# Сайт-портфолио Александры Мельниковой

Одностраничный сайт-портфолио фронтенд-разработчика в концепции «печатный каталог»: бумага, чернила,
киноварь, антиква в заголовках. Работы показаны списком-индексом с превью, следующим за курсором.

## Стек

- **Vite 8** + **React 19** + **TypeScript** (строгий режим)
- **Tailwind CSS 4** (токены в `src/index.css` через `@theme`)
- **lucide-react** — единый набор иконок
- Анимации — CSS + `IntersectionObserver` + `requestAnimationFrame` (без тяжёлых библиотек)
- Шрифты — **Playfair Display / Inter / JetBrains Mono**, собираются Vite из `src/fonts`
- Сборка — `npm run build` → папка `dist`

## Команды

```bash
npm install         # установка зависимостей
npm run dev         # локальная разработка (http://localhost:5173)
npm run build       # проверка типов + production-сборка в dist/
npm run preview     # предпросмотр собранной версии
```

Служебные скрипты (запускаются вручную, не входят в сборку):

```bash
node scripts/fetch-fonts.mjs      # перекачать шрифты Google в src/fonts + src/fonts.css
node scripts/shots.mjs            # снять скриншоты работ и собрать public/og-image.png (headless Chrome, CDP)
node scripts/check-responsive.mjs # проверить адаптив, меню, квиз, cookie, превью кейсов и страницу политики
node scripts/shot-urls.mjs <папка> <ширина> <url...>  # скриншоты любых страниц
node scripts/verify-live.mjs <url># проверить опубликованный сайт в браузере
node scripts/probe-site.mjs <url> # посмотреть структуру и текст чужой страницы
node scripts/check-links.mjs <папка>          # внутренние ссылки и якоря статического сайта
node scripts/check-mojibake.mjs <папка>       # поиск испорченной кодировки
node scripts/fix-mojibake.mjs <файл> --write  # обратное перекодирование текста
node scripts/ftp-prune.mjs --base <url> --dir <папка> [--write]  # чистка устаревших файлов на хостинге
node scripts/ftp-pull.mjs <удалённая-папка> <локальная-папка>    # резервная копия с сервера
```

## Структура

```text
index.html                 SEO-теги, Open Graph, микроразметка Person
privacy.html               политика конфиденциальности (второй вход сборки)
src/
  App.tsx                  композиция страницы и cookie-уведомление
  privacy.tsx              вход страницы политики
  index.css                токены темы, кнопки, карточки, анимации
  fonts.css                генерируется скриптом, править вручную не нужно
  data/site.ts             весь контент: контакты, услуги, работы, процесс, стек, реквизиты
  data/concepts.ts         демонстрационные кейсы — на сайте не выводятся, сохранены на будущее
  pages/Privacy.tsx        текст политики конфиденциальности
  lib/reveal.tsx           появление при скролле, позиция скролла, компонент Reveal
  lib/counters.ts          анимация числовых показателей
  lib/asset.ts             путь к файлу из public/ с учётом базового адреса
  components/              Header, Hero, Services, Works, Process, Approach, Contact, Footer, Chrome, Logo, CookieBanner, Mockups, Marquee
  fonts/                   woff2 (кириллица + латиница), собираются Vite
public/
  shots/                   скриншоты реальных проектов (webp)
  favicon.svg              знак-логотип: метки-уголки и киноварный квадрат
  og-image.png             картинка для соцсетей 1200×630
scripts/                   служебные скрипты (шрифты, скриншоты, проверки, деплой)
context/                   бриф проекта, дизайн-концепция, состояние
```

## Контент и юридические страницы

Тексты и данные — в `src/data/site.ts`: контакты, шесть услуг, четыре реальных проекта,
процесс, причины выбрать, стек, строки «спецификации» и реквизиты для документов (`legal`).

Демонстрационные интерфейсные кейсы лежат в `src/data/concepts.ts` и на сайте не выводятся —
в портфолио показываются только реальные проекты. Чтобы вернуть их, достаточно импортировать
массив в `Works.tsx`.

Юридическая часть: уведомление об использовании cookie (`src/components/CookieBanner.tsx`),
страница политики конфиденциальности (`privacy.html` + `src/pages/Privacy.tsx`), согласие
на обработку данных в квизе заявки и в форме внутри карточки кейса.
В `legal` нужно подставить свои реквизиты вместо плейсхолдеров `[укажите …]`.

## Что проверено автоматически

`node scripts/check-responsive.mjs` собирает отчёт `.tmp-check/report.json` и скриншоты секций:

| Проверка | 360 px | 768 px | 1440 px |
| --- | --- | --- | --- |
| Горизонтальное переполнение | нет | нет | нет |
| Элементы за границей вьюпорта | нет | нет | нет |

Дополнительно проверяются: загрузка всех скриншотов, наличие всех якорных ссылок,
уведомление об использовании cookie (показ, принятие, сохранение выбора), превью кейса за курсором
(не уезжает под шапку и за края экрана), открытие и закрытие мобильного меню, три шага квиза заявки,
модальное окно кейса (`aria-modal`, закрытие по `Escape`, разблокировка скролла) и страница политики
конфиденциальности на 1440 и 360 пикселях.

## Деплой на хостинг reg.ru

Сайт опубликован: **http://rootlost.online/** (папка `/www/rootlost.online` на хостинге `31.31.196.221`).

Порядок публикации:

```powershell
npm run build                     # сборка в dist/
$env:FTP_USER='...'               # FTP-пользователь
$env:FTP_PASS='...'               # пароль (в файлах не хранится)
$env:FTP_DIR='/www/rootlost.online'
npm run deploy                    # загрузка содержимого dist по FTP
npm run verify:live -- http://rootlost.online/   # проверка в браузере
```

`scripts/deploy.mjs` загружает только содержимое `dist`, создаёт вложенные папки и передаёт пароль через
конфиг на stdin, чтобы он не попадал в аргументы процесса. Параметр `--dry-run` показывает список файлов
без загрузки.

Тем же скриптом публикуются соседние проекты — через переменную `FTP_SRC`:

```powershell
# тема WordPress для rootlost.ru
$env:FTP_DIR='/www/rootlost.ru/wp-content/themes/kitstroy-moscow'
$env:FTP_SRC='D:\фриланс\Portfolio\Корпоративный сайт\kitstroy-moscow'
npm run deploy

# демонстрационный сайт сервисного центра в подпапке портфолио
$env:FTP_DIR='/www/rootlost.online/remont'
$env:FTP_SRC='D:\фриланс\Portfolio\2_корп сайт Sergey_aoqado\repair-site'
npm run deploy
```

Резервная копия перед изменениями: `node scripts/ftp-pull.mjs <удалённая-папка> <локальная-папка>`
(так сохранены прежняя версия rootlost.online в `.backup/rootlost.online-2026-04-03/` и тема
rootlost.ru в `.backup/rootlost.ru-theme-before-changes/`).

Важно:

- заливать нужно **содержимое** `dist`, не удаляя файлы вне папки сайта (`.env`, `uploads` на других доменах);
- сборка использует относительные пути (`base: './'`), поэтому работает и в корне домена, и в подпапке;
- на домене `rootlost.online` не установлен SSL-сертификат: `http://` открывается, `https://` — нет.
  Включается в панели reg.ru (Let's Encrypt). Пока сертификата нет, `canonical` и `og:url` в `index.html`
  указывают на `https://` — если HTTPS включить нельзя, замените их на `http://` и пересоберите.
- резервная копия предыдущей версии сайта с этого домена лежит в `.backup/rootlost.online-2026-04-03/`.
