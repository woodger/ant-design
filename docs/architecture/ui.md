# UI Architecture

UI-приложение следует архитектуре с явным разделением бизнес-логики, сценариев приложения, инфраструктуры и представления.

Основные слои:

```text
Domain
  ↑
Application
  ↑          ↑
Presentation Infrastructure
       \     /
       Bootstrap
```

## Dependency Direction

Зависимости направляются внутрь архитектуры.

* `Domain` не зависит от других слоёв приложения.
* `Application` может зависеть от `Domain`.
* `Presentation` может зависеть от `Application` и `Domain`.
* `Infrastructure` может зависеть от `Application` и `Domain`.
* `Bootstrap` может зависеть от всех слоёв для сборки приложения.

Запрещены зависимости:

```text
Domain         → Application
Domain         → Infrastructure
Domain         → Presentation

Application    → Infrastructure
Application    → Presentation

Presentation   → Infrastructure
Infrastructure → Presentation
```

Инфраструктурные реализации передаются приложению через явно определённые порты или интерфейсы.

`Bootstrap` является местом связывания конкретных реализаций с их абстракциями.

## Contract Ownership

У каждого контракта должен быть один основной владелец точной формы. Владелец определяет сигнатуру, формат или набор допустимых значений; остальные представления являются производными и обновляются вместе с ним.

Этот документ нормативно задаёт границы ответственности и направление зависимостей. Точные machine-verifiable контракты принадлежат перечисленным ниже артефактам. Reference-документация объясняет их семантику и приводит примеры, но не создаёт независимое определение того же контракта.

Tests проверяют observable contract владельца, но не являются владельцами его точной формы.

| Контракт | Владелец точной формы | Роль документации |
| --- | --- | --- |
| Domain-модели и инварианты | Domain types, value objects и чистые validation rules | Объясняет предметный смысл и причины ограничений |
| Application use cases, ports и errors | Application interfaces, input/output types и result types | Описывает сценарии, гарантии и error semantics |
| Props, callbacks и snippets компонента | `$props` определяющего компонента или явно экспортированный рядом Props type | Показывает использование, accessibility и lifecycle semantics |
| API presentation model | Exported factory/interface соответствующей presentation model | Описывает observable state, действия и lifecycle модели |
| URL, query parameters и HTTP behavior страницы | SvelteKit route loader/handler; Domain rules владеют переиспользуемыми инвариантами | Публикует человекочитаемый reference форматов, статусов и примеров |
| Persisted preference | Consumer, который задаёт key, version, payload type и validator | Описывает поддерживаемое поведение, migration/fallback и ограничения |
| npm commands | `scripts` в `package.json` | Описывает назначение и поддерживаемый workflow команды |
| Dependency wiring | Bootstrap/composition root | Показывает data flow и выбор реализаций без дублирования их interfaces |

Если производное представление расходится с владельцем, расхождение считается дефектом. Изменение контракта должно быть выражено в его владельце, а consumers, tests, generated representations и документация синхронизируются в той же задаче.

## Domain

`Domain` содержит бизнес-сущности, значения, правила и чистые функции предметной области.

Domain-код:

* не импортирует Svelte;
* не использует `$state`, `$derived`, `$effect` или другие механизмы реактивности;
* не обращается к HTTP, WebSocket, `localStorage`, DOM или другим browser API;
* не зависит от формата API DTO;
* не содержит состояния отображения: `loading`, `selected`, `expanded`, `modalOpen` и подобного.

Domain должен оставаться обычным TypeScript-кодом, который можно использовать и тестировать без UI runtime.

## Application

`Application` описывает сценарии использования приложения.

Здесь находятся:

* use cases;
* application services;
* команды и запросы;
* порты для внешних зависимостей;
* координация нескольких domain-операций.

Application не знает:

* каким компонентом инициирован сценарий;
* каким HTTP-клиентом выполняется запрос;
* где данные отображаются;
* каким способом UI хранит реактивное состояние.

Application не импортирует Svelte.

Use case возвращает результат сценария, но не управляет состояниями `loading`, `disabled`, `modalOpen` или другими деталями интерфейса.

## Infrastructure

`Infrastructure` содержит реализации внешних взаимодействий:

* HTTP API;
* WebSocket;
* browser storage;
* IndexedDB;
* platform APIs;
* внешние SDK;
* сериализацию и десериализацию.

Transport DTO не должны распространяться за инфраструктурную границу без необходимости.

Infrastructure преобразует внешнее представление данных в application/domain representation и обратно.

Компоненты Svelte не выполняют `fetch` и не импортируют конкретные API clients напрямую.

## Presentation

`Presentation` отвечает за отображение состояния и пользовательское взаимодействие.

Только этот слой использует Svelte как UI framework.

Presentation может содержать:

```text
presentation/
  features/
  shared/
  pages/
```

или эквивалентную feature-oriented структуру.

Presentation отвечает за:

* Svelte components;
* UI state;
* reactive view models;
* обработку пользовательских действий;
* преобразование application state в представление;
* состояния `loading`, `error`, `empty`, `selected`, `expanded` и подобные.

Бизнес-правила не должны реализовываться внутри `.svelte` компонентов.

## Components

`.svelte` компонент в первую очередь является декларативным описанием представления.

Компонент может:

* принимать props;
* отображать данные;
* хранить локальное UI state;
* вычислять presentation-only derived state;
* преобразовывать DOM events в пользовательские действия;
* вызывать методы принадлежащего ему presentation model.

Компонент не должен:

* содержать бизнес-правила;
* самостоятельно создавать infrastructure services;
* напрямую обращаться к backend API;
* дублировать application logic;
* использовать `$effect` для построения цепочек изменения внутреннего состояния.

Чем более переиспользуемым является компонент, тем меньше он должен знать о предметной области приложения.

Shared UI components должны по возможности работать только через props, callbacks и snippets.

## Component Boundaries

Компонент должен иметь одну основную ответственность: отображение, пользовательское взаимодействие или композицию других компонентов.

Компонент может содержать локальное presentation state, если это состояние:

* принадлежит только этому компоненту;
* не требуется независимым соседним компонентам;
* не представляет самостоятельный сценарий приложения.

Состояние и поведение следует выносить в `*.svelte.ts` presentation model, если компонент начинает:

* координировать несколько пользовательских действий;
* управлять асинхронными сценариями;
* содержать значительный объём `$state` или `$derived`;
* повторно использовать одну и ту же presentation logic;
* смешивать markup с нетривиальной логикой состояния.

Компонент не должен:

* выполнять бизнес-правила;
* напрямую использовать Infrastructure;
* самостоятельно создавать application services;
* координировать несколько независимых use cases без отдельной presentation model.

Container/page components могут знать о feature models и application use cases.

Низкоуровневые и reusable components должны зависеть только от явно переданных:

* props;
* callbacks;
* snippets;
* presentation-neutral types.

Чем ниже компонент находится в UI-иерархии, тем меньше контекста приложения он должен знать.

---

## Reactive State

Svelte 5 runes используются только в presentation layer или в коде, непосредственно обслуживающем presentation.

### `$state`

`$state` используется для состояния, которым владеет текущий presentation scope.

Состояние должно иметь очевидного владельца.

Не следует поднимать состояние на application-wide уровень только ради возможности обращаться к нему из нескольких компонентов.

### `$derived`

Значение, которое полностью определяется другим реактивным состоянием, должно выражаться через `$derived`.

Например:

```ts
let items = $state<Item[]>([]);
let selectedId = $state<string | null>(null);

let selected = $derived(
  items.find((item) => item.id === selectedId) ?? null,
);
```

Не следует хранить независимо изменяемую копию значения, которое может быть вычислено.

### `$effect`

`$effect` используется для синхронизации реактивного состояния с внешней системой.

Допустимые примеры:

* DOM API;
* сторонняя imperative library;
* analytics;
* browser API;
* lifecycle внешнего ресурса.

`$effect` не должен использоваться как основной механизм вычисления или синхронизации внутреннего состояния.

Вместо:

```ts
let total = $state(0);

$effect(() => {
  total = price * quantity;
});
```

следует использовать:

```ts
let total = $derived(price * quantity);
```

Последовательность `$effect → изменение state → другой $effect` рассматривается как признак неправильного распределения ответственности.

## Reactive Models

Если feature имеет нетривиальное состояние и поведение, оно выносится из `.svelte` компонента в presentation model.

Для реактивных моделей Svelte 5 допускаются `.svelte.ts` файлы.

Например:

```text
features/
  item/
    item-view.svelte
    item-model.svelte.ts
```

Presentation model может содержать:

* `$state`;
* `$derived`;
* UI-specific methods;
* вызовы application use cases.

При этом model остаётся частью `Presentation`, даже если не содержит markup.

Не следует переносить reactive presentation model в `Application` только потому, что код вынесен из компонента.

## State Ownership

Каждое изменяемое состояние должно иметь определённого владельца.

Предпочтительный порядок владения:

```text
component
    ↓
feature
    ↓
page
    ↓
application scope
```

Состояние поднимается выше только тогда, когда это действительно необходимо нескольким независимым потребителям.

Глобальное mutable state без явно определённого владельца запрещено.

## State Management Policy

Каждое изменяемое состояние должно иметь одного явно определённого владельца.

Состояние размещается на минимально возможном уровне:

```text
component
    ↓
feature
    ↓
page
    ↓
application scope
```

Поднимать состояние выше разрешается только при появлении нескольких независимых потребителей.

Не следует создавать глобальное состояние заранее.

### Derived State

Данные, полностью определяемые другим состоянием, не хранятся отдельно.

Для таких значений используется `$derived` или обычная чистая функция.

Запрещается поддерживать синхронность двух копий одного состояния через `$effect`.

### Effects

`$effect` используется только для взаимодействия с внешней imperative системой.

`$effect` не используется для:

* копирования одного state в другой;
* реализации derived state;
* скрытого запуска application use cases в ответ на случайное изменение зависимостей;
* построения цепочек реактивных side effects.

Пользовательские действия должны по возможности запускать сценарии явно:

```ts
function submit() {
  model.submit();
}
```

а не косвенно через изменение state и последующий `$effect`.

### Shared State

Общее состояние feature должно предоставляться через явно определённый API.

Предпочтительно:

```ts
feature.select(...)
feature.reload()
feature.state
```

чем предоставление внешнему коду прямого доступа к произвольным mutable `$state` полям.

Глобальный mutable singleton допускается только для действительно application-wide состояния с явно определённым lifecycle.

---

## Context

Svelte Context используется для предоставления зависимостей или состояния ограниченному дереву компонентов.

Context не должен использоваться как неявная глобальная шина данных.

Предпочтительно предоставлять typed API:

```ts
provideItemContext(...)
useItemContext()
```

вместо распространения строковых ключей и прямых вызовов `getContext` по приложению.

Context не заменяет Application dependency injection.

## Async State

Асинхронная операция должна иметь явно представимое состояние.

Например:

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'error'; error: AppError };
```

Конкретная форма может отличаться, но невозможные комбинации вроде:

```text
loading = true
data != null
error != null
```

не должны возникать из-за набора независимых boolean-полей.

## Errors

Infrastructure errors преобразуются в ошибки, понятные Application.

Presentation решает только то, как эти ошибки показать пользователю.

UI components не должны интерпретировать HTTP status codes или transport-specific error structures.

Например, нежелательно:

```ts
if (error.response.status === 404) {
  ...
}
```

внутри `.svelte` компонента.

## Bootstrap

Создание конкретных зависимостей выполняется централизованно.

Например:

```text
ApiClient
    ↓
ItemRepository
    ↓
LoadItem
    ↓
ItemModel
    ↓
ItemView
```

Компонент не должен создавать эту цепочку самостоятельно.

Bootstrap/composition root определяет конкретные реализации и передаёт их наружу через props, factories или context.

## Feature Boundaries

Код группируется прежде всего по пользовательским возможностям и предметным областям, а не только по техническому типу файла.

Предпочтительно:

```text
features/
  items/
    components/
    item-model.svelte.ts
    ...
  chart/
    components/
    chart-model.svelte.ts
    ...
```

чем глобальные каталоги:

```text
components/
models/
helpers/
services/
```

если последние постепенно превращаются в несвязанные хранилища кода.

Shared-код выносится только после появления реального совместного использования.

## Feature Structure

Feature является минимальной вертикальной единицей пользовательской возможности.

Feature должна группировать код по назначению, а не только по техническому типу файла.

Рекомендуемая структура:

```text
features/
  item-search/
    components/
      item-search.svelte
      item-result.svelte

    item-search-model.svelte.ts
    item-search.types.ts
```

Feature может содержать:

* components;
* presentation models;
* presentation-specific types;
* feature-local formatting and mapping;
* feature-local utilities.

Feature не должна содержать:

* infrastructure implementations;
* application use cases, принадлежащие всему приложению;
* domain entities;
* generic UI primitives.

Feature может зависеть от:

```text
Presentation shared code
Application
Domain
```

Feature не должна напрямую зависеть от другой feature.

Если двум feature требуется одно и то же поведение, оно должно быть либо:

* вынесено в общий Presentation abstraction;
* предоставлено Application;
* выражено через Domain;

но не импортироваться напрямую из внутренностей соседней feature.

Страница является composition boundary.

Она может объединять несколько feature и координировать их взаимодействие.

Связь:

```text
feature A → feature B
```

нежелательна.

Предпочтительно:

```text
feature A
    ↓
   page
    ↑
feature B
```

Shared-код создаётся только после появления реального повторного использования.

Код не переносится в `shared` только потому, что потенциально может понадобиться в будущем.

---

## Shared UI

`shared` содержит только действительно предметно-независимые UI primitives и общие presentation utilities.

Например:

```text
Button
Input
Modal
Spinner
Tabs
```

Компонент, содержащий знания о конкретной бизнес-сущности, не становится shared только потому, что используется в двух местах.

## Framework Boundary

Svelte является деталями presentation layer.

Импорты Svelte API ниже Presentation запрещены.

В частности:

```text
domain/**         → no svelte imports
application/**    → no svelte imports
```

Это относится также к `.svelte.ts`: наличие возможности использовать runes вне компонентов не является основанием переносить Svelte reactivity в Application или Domain.

## Architectural Test

Для любого нового кода должно быть возможно ответить на четыре вопроса:

1. Кто владеет этим состоянием?
2. К какому слою относится это поведение?
3. Какие зависимости этому слою разрешены?
4. Можно ли удалить Svelte из Domain/Application, не переписывая их?

Если ответ на последний вопрос отрицательный, граница между Presentation и внутренними слоями, вероятно, нарушена.
