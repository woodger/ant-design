# Changelog

Все заметные изменения проекта документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
а версии проекта следуют [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Checkbox и Pagination на Svelte 5: смешанное состояние, boolean-поля Form,
  нативный reset и FormData; переходы по страницам, выбор размера, диапазоны,
  локаль и RTL. Официальные стили 6.6.8, примеры и unit/SSR/Chromium-проверки.
- Отдельный Playwright Chromium contour: `npm run test:e2e`, изолированный стенд
  компонентов, проверки production-галереи, отчёт и диагностические артефакты.
- Первый набор Ant Design 6.6.8 на Svelte 5 и TypeScript: ConfigProvider, Button,
  Input, Select, Modal, Form и FormItem; отдельный пакет исходников и примеры
  на `/ant-design`.
- Переключаемые темы, типизированная валидация форм с защитой от устаревших
  результатов, unit- и SSR-проверки компонентов.
- Минимальный каркас SvelteKit, Svelte 5 и TypeScript со стартовой страницей.
- Oxlint, Svelte/TypeScript check, Vitest и проверка архитектурных зависимостей.
- Production-сборка через adapter-node и документация по запуску через systemd.

### Fixed

- Select открывает список при нажатии на стрелку и отступы control.
- FormItem применяет vertical/horizontal layout формы и правильно располагает
  подписи полей.
