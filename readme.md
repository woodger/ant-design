# SvelteKit Starter

Минимальный каркас на SvelteKit, Svelte 5 и TypeScript. В проекте настроены
Oxlint, проверка Svelte/TypeScript, Vitest и production-сборка через adapter-node.

## Быстрый старт

Используйте Node.js 20 от версии 20.19, Node.js 22 от версии 22.12 либо Node.js
24 или новее. Единственный поддерживаемый менеджер пакетов — npm.

```sh
npm ci
npm run dev
```

Для локального запуска переменные окружения не нужны. Настройки production-сервера
описаны в [справочнике конфигурации](docs/reference/configuration.md).

## Структура

- `src/routes/+page.svelte` — стартовая страница;
- `src/routes/+layout.svelte` — общий layout;
- `src/lib/architecture.test.ts` — проверка направления зависимостей;
- `static` — статические файлы;
- `docs` — документация и правила разработки.

При добавлении сценариев размещайте код по его ответственности. Не создавайте
пустые слои или абстракции заранее; правила описаны в
[архитектурной политике](docs/policy/architecture.md).

## Проверки

```sh
npm run lint
npm exec -- svelte-kit sync
npm exec -- svelte-check --tsconfig ./tsconfig.json --tsgo
npm test
```

Oxlint проверяет JavaScript, TypeScript и `<script>`-блоки Svelte. Диагностика
Svelte-шаблонов выполняется отдельной командой `svelte-check`.

## Сборка

```sh
npm run build
npm run preview
```

`npm run preview` предназначен для локальной проверки. Production-сервер
запускается командой `node build`; настройка окружения и systemd описаны в
[инструкции deployment](docs/deployment/systemd.md).

## Документация

- [карта документации](docs/README.md)
- [политики разработки](docs/policy/index.md)
- [история изменений](CHANGELOG.md)
