# ACF Guide

Тема уже регистрирует группы полей программно. После активации `ACF Pro` создавать их вручную не нужно.

## Options Pages

### 1. `KIT-Stroy -> Контакты`

- `phone` — Text
- `secondary_phone` — Text
- `email` — Email
- `address` — Textarea
- `telegram` — URL
- `telegram_label` — Text
- `max` — URL
- `max_label` — Text
- `working_hours` — Text
- `route_url` — URL
- `latitude` — Text
- `longitude` — Text
- `map_embed_url` — URL
- `requisites` — Textarea
- `form_recipient_email` — Email
- `recaptcha_site_key` — Text
- `recaptcha_secret_key` — Text

### 2. `KIT-Stroy -> Главная`

- `hero_slides` — Repeater
  - `title` — Text
  - `text` — Textarea
  - `image` — Image
  - `primary_label` — Text
  - `primary_url` — URL
  - `secondary_label` — Text
  - `secondary_url` — URL
- `home_advantages` — Repeater
  - `value` — Text
  - `label` — Text
- `home_services_title` — Text
- `home_services_text` — Textarea
- `home_portfolio_title` — Text
- `home_portfolio_text` — Textarea
- `home_about_title` — Text
- `home_about_text` — Textarea
- `home_process_title` — Text
- `home_process_steps` — Repeater
  - `title` — Text
  - `text` — Text
- `home_cta_title` — Text
- `home_cta_text` — Textarea
- `home_blog_title` — Text
- `home_blog_text` — Textarea
- `home_contacts_title` — Text
- `home_contacts_text` — Textarea

### 3. `KIT-Stroy -> SEO и Schema`

- `organization_name` — Text
- `legal_name` — Text
- `organization_description` — Textarea
- `organization_area_served` — Text
- `organization_price_range` — Text
- `organization_founding_date` — Text
- `organization_license_number` — Text
- `organization_sro_number` — Text
- `organization_logo` — Image
- `organization_og_image` — Image
- `organization_tax_id` — Text
- `organization_vat_id` — Text
- `home_seo_title` — Text
- `home_seo_description` — Textarea

## Поля услуг `post_type = service`

- `service_subtitle` — Text
- `service_short_description` — Textarea
- `service_icon` — Text
- `service_benefits` — Repeater -> `text`
- `service_stages` — Repeater -> `text`
- `service_included_works` — Repeater -> `text`
- `service_gallery` — Gallery
- `seo_title` — Text
- `seo_description` — Textarea
- `service_faq` — Repeater
  - `question` — Text
  - `answer` — Textarea
- `related_services` — Relationship
- `service_cta_title` — Text
- `service_cta_text` — Textarea

## Поля проектов `post_type = portfolio`

- `portfolio_object_type` — Taxonomy (`portfolio_type`, save/load terms enabled)
- `portfolio_city` — Text
- `portfolio_duration` — Text
- `portfolio_scope` — Textarea
- `portfolio_short_description` — Textarea
- `portfolio_task` — Textarea
- `portfolio_work_done` — Textarea
- `portfolio_result` — Textarea
- `portfolio_main_image` — Image
- `portfolio_gallery` — Gallery
- `portfolio_systems` — Repeater -> `text`
- `portfolio_completion_date` — Date Picker
- `seo_title` — Text
- `seo_description` — Textarea

## Страница `О компании`

Шаблон: `page-about.php`

- `about_heading` — Text
- `about_intro` — Textarea
- `about_advantages` — Repeater -> `text`
- `about_certificates` — Gallery
- `about_numbers` — Repeater
  - `value` — Text
  - `label` — Text
- `about_why_us` — Repeater -> `text`
- `about_cta_title` — Text
- `about_cta_text` — Textarea

## Страница `Цены`

Шаблон: `page-prices.php`

- `prices_intro` — Textarea
- `prices_table` — Repeater
  - `service` — Text
  - `unit` — Text
  - `price` — Text
  - `note` — Textarea
- `prices_note` — Textarea
- `prices_cta_title` — Text
- `prices_cta_text` — Textarea

## Важно

- SEO-поля у услуг и проектов встроены в тему. Если на проекте используется Rank Math или Yoast, можно продолжить вести мета-данные уже через SEO-плагин.
- Поле `requisites` сделано textarea. Каждая новая строка будет показана отдельным пунктом в контактах.
