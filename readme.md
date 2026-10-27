# SvelteKit Starter

Минимальный каркас на SvelteKit, Svelte 5 и TypeScript. В проекте настроены
Oxlint, проверка Svelte/TypeScript, Vitest, Playwright и production-сборка через
adapter-node.

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
- `e2e` — браузерные проверки и отдельный стенд компонентов;
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
npm exec -- svelte-check --tsconfig ./e2e/tsconfig.json --tsgo
npm test
```

Oxlint проверяет JavaScript, TypeScript и `<script>`-блоки Svelte в `src`, `e2e`
и конфигурацию Playwright. Диагностика Svelte-шаблонов и типов выполняется
отдельно для приложения и браузерных тестов через `svelte-check`.

## Браузерные проверки

После установки npm-зависимостей установите Chromium:

```sh
npm exec -- playwright install chromium
npm run test:e2e
```

Playwright каждый раз собирает приложение из текущих исходников и запускает
preview на `127.0.0.1:4173`. Отдельный Vite-стенд из `e2e/fixtures` на порту
`4174` проверяет публичные props, bindings и управляемые асинхронные сценарии
компонентов. Оба порта должны быть свободны; серверы останавливаются после
прогона. Тестовый стенд не входит в production-сборку приложения и пакет UI.

Сценарии покрывают Input, Select, Checkbox, Pagination, Table, Modal и Form,
включая серверные страницы Table, отмену запросов, поздние ответы и ошибки/retry,
закрепление заголовка и колонок, resize и клавиатурную прокрутку,
раскрываемые строки и сохранение их состояния между страницами,
множественный Select, массивы Form, повторяющиеся поля FormData и native reset,
CheckboxGroup, выбор всех прав, отмену reset и фокус ошибок группы,
Radio/RadioGroup, нативную клавиатуру, независимые группы и одиночные значения 0/false,
Switch, loading, сохранение с откатом и поздние ответы после удаления,
InputNumber, числовой черновик, дробный шаг, precision, null/zero, FormData и reset,
Slider, мышь и касание, завершение и отмену действий, ориентацию, reverse и связь с InputNumber,
Tooltip, задержки, сохранение описаний и фокуса, позиционирование, Modal и подсказки Slider,
Popover, интерактивные snippets, click/hover/focus, клавиатуру и редактор профиля,
Popconfirm, асинхронное подтверждение, ошибки/повтор и защиту от поздних результатов,
Dropdown, меню команд строки Table, клавиатуру/typeahead, фокус, hover и шесть положений,
Tabs, ручную активацию, сохранение панелей, destroyOnHidden, прокрутку и вкладки в Modal,
Collapse, независимые панели и accordion, extra, вложенность, фокус и анкету с сохранением черновиков,
Drawer, модальность, анимацию, сохранение черновиков и редактор строки Table,
темы, размеры, RTL, локаль, узкий экран, SSR и гидратацию. Browser errors и console warnings/errors
приводят к ошибке теста. Набор выполняется в Chromium; Vitest остаётся
отдельным контуром Node unit/SSR-проверок.

HTML-отчёт сохраняется в `playwright-report`, диагностические trace и снимки —
в `test-results`. Светлая и тёмная темы и мобильная страница также сохраняются
для визуального просмотра. Сравнение скриншотов с эталоном не настроено.

```sh
npm exec -- playwright show-report
```

## Сборка

```sh
npm run build
npm run preview
```

`npm run preview` предназначен для локальной проверки. Production-сервер
запускается командой `node build`; настройка окружения и systemd описаны в
[инструкции deployment](docs/deployment/systemd.md).

## Документация

- [Ant Design для Svelte 5](src/lib/components/ant-design/readme.md) — библиотека
  компонентов и отдельный пакет исходников; живые примеры на `/ant-design`.
- [карта документации](docs/README.md)
- [политики разработки](docs/policy/index.md)
- [история изменений](CHANGELOG.md)
