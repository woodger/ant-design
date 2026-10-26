# Политика стиля кода

> Type: Policy. Документ фиксирует правила визуальной структуры, именования и
> комментариев в TypeScript, Svelte, CSS и тестах без изменения поведения.

## Основной принцип

Стиль должен делать логические границы видимыми и соответствовать соседнему
коду. Style policy не разрешает массовое форматирование и не заменяет
архитектурные решения.

В hand-written implementation files `src` основной TypeScript/Svelte style —
два пробела для вложенности, точки с запятой и single quotes в TypeScript.
Конфигурационные, declaration- и generated-файлы сохраняют собственный
существующий формат.

## Вертикальные отступы

Самостоятельные логические шаги внутри функции разделяются одной пустой строкой.
Многострочный вызов, объект или state declaration образуют визуальный блок.

Разделяйте по смыслу:

- получение или подготовку состояния;
- validation и guard clauses;
- преобразование данных;
- side effect или внешний вызов;
- обработку результата;
- return.

Не добавляйте пустую строку между проверкой и немедленным действием, если они
образуют одну операцию.

## TypeScript

- Предпочитайте ясные типы на module boundary и inference внутри небольшой
  реализации.
- Не добавляйте декоративные type aliases, которые только повторяют выражение.
- Используйте `unknown` и narrowing для внешнего input; не заменяйте проверку
  безусловным cast.
- Guard clause предпочтительнее глубокой вложенности, если не скрывает lifecycle.
- Один class определяется в одном файле.
- Не меняйте порядок side effects ради визуальной симметрии.

## Svelte 5

Проект работает в rune mode.

- Props объявляются через `$props` и типизируются рядом с component boundary.
- Bindable state используется только когда двусторонняя связь является частью
  API компонента.
- `$derived` выражает вычисляемое значение без side effects.
- `$effect` используется для синхронизации с runtime или внешним состоянием, а
  не вместо обычного вычисления.
- Cleanup listener, timer, Worker и другого ресурса обязателен в соответствующем
  lifecycle.
- Не переносите feature orchestration в markup expressions.

Внутри `.svelte` следуйте локальному порядку `script`, `style`, markup. Не
переставляйте крупные блоки только ради единообразия в несвязанной задаче.

## Markup и accessibility

- Используйте нативный элемент по его назначению до добавления ARIA.
- Интерактивный `div` не заменяет `button`, `a`, `input` или другой control.
- Label, accessible name, focus state и keyboard behavior являются частью
  реализации, а не необязательной документацией.
- Декоративная SVG-иконка скрывается от accessibility tree; имя задаётся
  интерактивному control.
- Не удаляйте focus outline без эквивалентного `:focus-visible` состояния.

## CSS и layout

- Component-specific styles остаются scoped внутри компонента.
- `:global` используется только для сознательной границы с child component или
  document-level стилем.
- Повторяемые theme values передаются существующими CSS variables/config, если
  это действительно общая ответственность.
- Responsive правила проверяются рядом с затронутым breakpoint.
- Фиксированный размер допустим для известного control или canvas contract, но
  не должен случайно ломать узкий viewport.
- Не переписывайте весь style block ради локального визуального изменения.

## Тесты

Arrange, Act и Assert разделяются пустыми строками, если это действительно
разные фазы. Связанные assertions одного результата остаются одним блоком.

Тестовый код следует тем же правилам TypeScript, но может использовать локальные
минимальные fixtures и mocks ради ясного сценария.

## Именование

Имя выражает роль и устойчивый vocabulary проекта, не создавая ложный
архитектурный или runtime-сигнал.

- `camelCase` используется для переменных, функций, callbacks и exported
  constants;
- `PascalCase` — для types, interfaces, classes, Svelte components и файлов
  компонентов;
- `kebab-case` — для обычных module files, URL segments, CSS classes и
  project-owned runtime keys;
- `SCREAMING_SNAKE_CASE` — для внешних contracts, прежде всего environment
  variables и стабильных external symbolic values.

Имена внешнего контракта, SvelteKit filenames и framework exports сохраняются
дословно. Generated declarations не переименовываются ради локального стиля;
при необходимости внешний тип преобразуется в project-owned type на границе.

Для компонентов и функций действуют следующие соглашения:

- component называется существительным, например `DateTimePicker`;
- DOM handler получает префикс `handle`, callback prop — `on`;
- boolean prop/state по возможности начинается с `is`, `has`, `can` либо прямо
  выражает состояние без отрицания;
- `parse`, `format`, `resolve`, `normalize`, `build`, `create`, `get`, `is`,
  `has` и `can` используются в соответствии с фактическим contract функции;
- общие имена `process`, `data`, `item` и `helper` допустимы только когда
  context делает их однозначными.

Role suffix должен соответствовать содержимому: `*.engine.ts` содержит чистую
нетривиальную логику, `*.model.svelte.ts` — rune-based presentation model,
`*.draw.ts` — Canvas rendering layer, `*.test.ts` — Vitest tests. Не создавайте
`utils.ts`, `helpers.ts` или `common.ts` без ясной cohesive responsibility.

Имена URL- и storage-ключей, serialized fields и Worker messages являются
compatibility-sensitive и не меняются как обычный cleanup. В коде и
документации сохраняются устойчивые термины используемых API.

Эта policy не является основанием для массового переименования. При необходимом
переименовании проверяются imports, exports, tests, docs, CSS selectors,
storage/URL keys и dynamic references.

## Комментарии

Комментарий объясняет причину, инвариант, lifecycle или внешнее ограничение,
которые нельзя достаточно ясно выразить именем и структурой кода. Он не должен
пересказывать следующую строку, объяснять синтаксис или хранить историю
рефакторинга.

Комментарий уместен для SSR/browser boundary, timezone или serialization
contract, stale-request protection, Canvas/Worker invariant, accessibility или
browser workaround, compatibility fallback и намеренно отсутствующего side
effect. Очевидные handlers, guards, присваивания state, markup и CSS
declarations не комментируются.

Архитектурный блок в начале файла допустим для неочевидной boundary — controller,
Worker, server proxy, сложного engine или compatibility adapter. Он не является
обязательным для простого компонента, `index.ts`, types или config.

JSDoc у exported API нужен, только если types и имя не выражают ограничения
input, side effects, error behavior, lifecycle или важную гарантию. Комментарий
в Svelte markup или CSS добавляется только для неочевидной accessibility,
layout либо browser boundary.

TODO обязан называть текущее ограничение и условие возврата. Естественный текст
комментариев пишется на русском; устойчивые API/framework terms можно оставлять
на английском. Generated code не редактируется и не комментируется вручную.

После изменения behavior комментарии в затронутой области проверяются на
актуальность. История изменения остаётся в Git, changelog или ADR.

## Исключения

Не форматируются механически:

- generated code;
- declaration-файлы с существующим framework style;
- большие строковые literals и expected text output;
- data matrices и fixtures, где форма важна тесту;
- существующий config-файл с отличающимся локальным стилем;
- пользовательские изменения вне scope.

## Style-only изменения

Style-only задача не меняет имена, imports, порядок инструкций, типы или
поведение. В feature-задаче форматируется только непосредственно изменяемый
участок.
