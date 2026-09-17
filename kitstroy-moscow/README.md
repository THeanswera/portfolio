# kitstroy-moscow

Кастомная WordPress-тема для корпоративного сайта услуг компании ООО «КИТ-Строй.Москва».

## Что входит

- Кастомная тема без тяжелых зависимостей
- CPT `service` и `portfolio`
- Таксономии `service_category` и `portfolio_type`
- Нативные формы через `admin-post.php`
- Programmatic ACF field groups и options pages
- Fallback SEO: title, description, canonical, Open Graph, JSON-LD
- Шаблоны главной, услуг, портфолио, цен, контактов, компании и блога
- Документация для администратора и SEO-подготовки

## Структура

```text
kitstroy-moscow/
  assets/
    dist/
    src/
  docs/
    acf-guide.md
    content-guide.md
    demo-content.md
    privacy-policy.md
    seo-guide.md
    setup-guide.md
  inc/
  languages/
  template-parts/
  404.php
  archive-service.php
  archive-portfolio.php
  archive.php
  footer.php
  front-page.php
  functions.php
  header.php
  home.php
  index.php
  page-about.php
  page-blog.php
  page-contacts.php
  page-portfolio.php
  page-prices.php
  page.php
  search.php
  single-portfolio.php
  single-service.php
  single.php
  style.css
```

## Рекомендуемые плагины

- `ACF Pro` — обязателен для options pages и управления полями
- `Rank Math SEO` или `Yoast SEO` — достаточно одного
- `LiteSpeed Cache` или `WP Rocket` — кэш и ускорение
- `Wordfence Security` или `Solid Security` — базовая защита
- Плагин форм не нужен: формы уже реализованы нативно

## Быстрый старт

1. Поместите папку `kitstroy-moscow` в `wp-content/themes/`.
2. Активируйте тему в админке WordPress.
3. Установите и активируйте `ACF Pro`.
4. Настройте меню, постоянные ссылки и страницы по инструкции в [docs/setup-guide.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/setup-guide.md).
5. Заполните контакты и блоки главной в разделе `KIT-Stroy`.

## Стили

Исходники SCSS лежат в `assets/src/scss`, собранный файл — `assets/dist/css/main.css`.
После правки исходников пересоберите его и выгрузите на хостинг:

```bash
npx sass assets/src/scss/style.scss:assets/dist/css/main.css
```

## Важные замечания

- Если активен Rank Math или Yoast, fallback SEO-мета темы автоматически не дублируется.
- Раздел `Портфолио` уже доступен как архив CPT по адресу `/portfolio/`.
- После активации темы желательно один раз сохранить структуру постоянных ссылок.
- Для отправки форм на боевом сайте нужен рабочий SMTP.
- Карта на странице контактов — внешний iframe OpenStreetMap. Если он не отвечает, под картой
  остаётся ссылка на маршрут: пустой белой области высотой 560 px на странице не будет.

## Документация

- Установка: [setup-guide.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/setup-guide.md)
- ACF: [acf-guide.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/acf-guide.md)
- Контент и администрирование: [content-guide.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/content-guide.md)
- SEO: [seo-guide.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/seo-guide.md)
- Демо-контент: [demo-content.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/demo-content.md)
- Политика: [privacy-policy.md](/s:/фриланс/Portfolio/Корпоративный сайт/kitstroy-moscow/docs/privacy-policy.md)
