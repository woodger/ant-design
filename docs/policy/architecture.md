# Архитектурная политика

> Type: Policy. Этот документ задаёт границы библиотеки, направление зависимостей,
> правила размещения файлов и выделения абстракций.

Библиотека находится в `src/lib` и не зависит от исходников приложений или
SvelteKit. Правила о маршрутах и слоях приложения ниже относятся к потребителям
библиотеки и не создают дополнительных модулей в этом репозитории.
Текущая карта системы описана в
[обзоре архитектуры](../architecture/overview.md).

## Карта границ

```text
src/routes
├── URL, SSR loaders, page composition
└── same-origin HTTP handlers
        │
        ▼
Presentation ──► Application ──► Domain
Infrastructure ──► Application / Domain
Bootstrap ──► Presentation / Application / Infrastructure / Domain
```

## `src/routes`

Маршруты владеют:

- path и query contract;
- SSR loading и HTTP status;
- SvelteKit page/layout composition;
- same-origin HTTP endpoints;
- преобразованием route input в feature input.

Route-файл не должен дублировать расчёты feature-модуля или становиться общим
хранилищем UI-логики. Project-specific server validation может оставаться в
`+page.server.ts`, если она является частью URL/HTTP boundary.

Файлы `+page.server.ts`, `+server.ts`, server Bootstrap и server Infrastructure
не импортируются в browser components.

## Feature-модули

Feature-модуль владеет одним пользовательским сценарием и его orchestration.

Рекомендуемое разделение внутри feature:

- `*.svelte` — composition, markup и локальные view styles;
- `*.model.svelte.ts` — реактивное presentation state и явные вызовы use cases;
- `*.engine.ts` — чистые вычисления, parsing и normalization;
- `config.ts` — детерминированные defaults и limits;
- `types.ts` — feature-level contracts.

Это соглашение применяется по смыслу. Не нужно создавать каждый тип файла для
простого компонента.

Feature-модуль может зависеть от reusable UI и общих утилит.
Он не должен зависеть от route-файлов или private server environment.

## Reusable UI

Компоненты библиотеки размещаются в `src/lib` и не знают о предметной области
приложения или конкретном route.

Композиционные controls общего назначения размещаются в `src/lib/layout`.

Reusable component:

- имеет предметно нейтральный API;
- сохраняет нативную семантику и accessibility;
- не выполняет feature-specific network/storage side effects;
- не импортирует feature, route или server modules.

Сложная keyboard, calendar или filtering logic выносится в engine только когда
это упрощает компонент и делает поведение независимо тестируемым.

## Общие утилиты

`src/lib/utils` предназначен для generic browser/framework-aware механизмов с
одной ясной ответственностью, например versioned storage.

Запрещено помещать в utils:

- business rules;
- component markup;
- API request orchestration;
- случайные helpers без повторного использования.

Каталог `utils` не является разрешением складывать туда любую общую функцию.

## Server boundary

Обязательные границы:

- private-токены не попадают в browser bundle или page data;
- SSR может обращаться через server client напрямую;
- feature components не читают private env;
- generated declarations не редактируются вручную;
- provider types преобразуются на границе, когда внутреннему модулю нужен более
  узкий устойчивый контракт.

## SSR и browser-only код

Код, который использует `window`, `document`, `localStorage`, Canvas, Worker или
Clipboard API, обязан учитывать SSR.

Допустимые механизмы:

- lifecycle Svelte, если API нужен только после mount;
- `browser` из `$app/environment` в framework-aware utility;
- явный server-only файл для private runtime behavior.

Нельзя скрывать SSR-проблему случайным `try/catch`, динамическим импортом или
отключением SSR без архитектурного основания.

## Состояние и side effects

- Локальное view state остаётся в компоненте.
- Повторяемое реактивное feature state может жить в controller.
- Чистые вычисления и parsing должны по возможности жить в engine.
- URL задаётся route contract или специализированной query utility.
- `localStorage` хранит только UI preferences и versioned client state.
- Network request должен иметь явного владельца и защиту от stale result, если
  возможны конкурирующие запросы.

Нельзя переносить side effect в engine ради удобства теста.

## Публичные границы

К архитектурно значимым контрактам относятся:

- exports из module `index.ts`;
- props и callback semantics reusable components;
- URL/query и HTTP status;
- storage keys и serialized format;
- Worker messages;
- environment variables;
- npm scripts и adapter-node entrypoint.

Изменение этих границ требует явного scope, тестов и обновления living docs.

## Выделение абстракций

Абстракция должна выражать устойчивую ответственность и упрощать текущий код.
Совпадение нескольких строк или подготовка к гипотетическому будущему не
являются достаточным основанием.

Перед выделением нужно проверить:

1. Повторяется ли одно поведение, а не только похожая форма кода.
2. Есть ли у нового модуля ясное имя и один владелец.
3. Станут ли consumers проще.
4. Не скрывает ли abstraction важные различия UI, state или side effects.
5. Можно ли проверить reusable behavior через публичный API.

Практическая эвристика: одно использование обычно остаётся локальным, два
требуют оценки устойчивости понятия, а повторяющееся стабильное поведение может
быть выделено. Это не механический порог.

Оправданными могут быть neutral UI control, pure engine для calendar/navigation/
layout/formatting, controller связанного feature state, versioned storage
mechanism, icon facade и typed API wrapper. Не следует создавать:

- `utils.ts`, `helpers.ts` или `common.ts` без cohesive responsibility;
- wrapper над одной строкой стандартного API без нового contract;
- base component только ради общего CSS-фрагмента;
- generic engine, options которого повторяют исходную реализацию;
- controller для одного локального boolean;
- abstraction без текущего consumer;
- общий UI API с feature-specific vocabulary.

View и engine разделяются, когда компонент смешивает markup с нетривиальной
детерминированной логикой. Engine остаётся независимым от DOM, Svelte state и
network, если его ответственность можно выразить чистой функцией. Простое
вычисление не выносится только ради увеличения test coverage.

При выделении сохраняется observable behavior consumers, тестируется устойчивый
contract новой логики, а прежнее дублирование удаляется в рамках той же задачи.
Public export добавляется только для реальных consumers; гипотетические options
в API не включаются.

## Размещение и именование файлов

Перед созданием файла определите его владельца: route, feature, reusable UI,
visualization, shared utility, server boundary, generated types, docs или static
asset.

Используйте существующие patterns:

- `PascalCase.svelte` — Svelte component;
- `*.model.svelte.ts` — rune-based presentation model;
- `*.engine.ts` — чистая нетривиальная логика;
- `*.test.ts` — Vitest test;
- `config.ts`, `types.ts`, `index.ts` — только при соответствующей роли;
- SvelteKit `+page`, `+layout`, `+server` — только в route tree.

Один class определяется в одном файле. Новая директория создаётся для
устойчивой ответственности, а не для одного случайного helper.

## Перемещение и архитектурный refactoring

Перемещение допустимо, если текущий владелец действительно неверен или задача
явно меняет границу. Причинами не являются короткий import, симметрия каталогов
или субъективно более красивое дерево.

Не следует одновременно без необходимости:

- перемещать файлы;
- переименовывать exports;
- менять public API;
- менять runtime behavior;
- переписывать tests и build config.

Если правильный владелец не определяется по коду и документации, нужно
запросить архитектурное решение владельца.
