# Архитектура проекта

SvelteKit Starter — минимальное приложение на SvelteKit, Svelte 5 и TypeScript.
Каркас содержит стартовую страницу, общий layout и инструменты проверки.

## Текущая структура

```text
src/
├── app.html
├── app.d.ts
├── lib/
│   ├── architecture.test.ts
│   ├── components/ant-design/       # reusable UI и пакет исходников
│   └── presentation/ant-design/     # модель и представление showcase
└── routes/
    ├── +layout.svelte
    ├── +page.svelte
    └── ant-design/+page.svelte
static/
docs/
```

`src/routes` отвечает за URL, SSR и composition страниц. `src/app.html` задаёт
HTML-оболочку, `static` содержит статические файлы. Production-сборка использует
`@sveltejs/adapter-node` и создаёт каталог `build`.

`src/lib/components/ant-design` содержит первый набор компонентов Ant Design
на Svelte 5, контексты, модель формы и стили. Модуль не зависит от SvelteKit;
его public entrypoint — `index.ts`. Маршрут `/ant-design` компонует
showcase из Presentation. [Reference модуля](../../src/lib/components/ant-design/readme.md)
описывает поддерживаемое поведение и упаковку исходников.

## Добавление функциональности

Модули создаются по мере появления конкретных сценариев:

- бизнес-модели и чистые правила — Domain;
- сценарии и порты внешних зависимостей — Application;
- реализации HTTP, storage и других внешних взаимодействий — Infrastructure;
- компоненты и реактивные модели — Presentation;
- связывание реализаций с портами — Bootstrap.

Границы и направление импортов определены в [UI Architecture](ui.md) и
[архитектурной политике](../policy/architecture.md). Не нужно создавать пустые
каталоги слоёв заранее.

`src/lib/architecture.test.ts` проверяет направление зависимостей добавляемых
модулей. Проверка не заменяет тесты их поведения.

## Проверки и запуск

Команды lint, type/template check, Vitest и build приведены в
[корневом readme](../../readme.md). Настройка production-сервера описана в
[справочнике конфигурации](../reference/configuration.md) и
[инструкции systemd](../deployment/systemd.md).
