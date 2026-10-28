# Политика тестирования

> Type: Policy. Этот документ задаёт требования к тестируемости, структуре и
> именованию тестов проекта.

## Назначение

Тест защищает observable contract и конкретный риск. Он не должен зеркалить
реализацию, фиксировать случайную структуру объекта или проходить вместе с
неверным production algorithm.

Основной вопрос:

> Какое поведение или boundary защищено?

## Текущий test contour

`npm test` запускает Vitest:

- environment: `node`;
- include: `src/**/*.{test,spec}.{js,ts}` и `tools/**/*.{test,spec}.mjs` для
  проверок инструментов реестра и извлечения CSS;
- assertions обязательны через `expect.requireAssertions`;
- реальная сеть и внешняя infrastructure не используются.

`npm run test:e2e` запускает отдельный Playwright Chromium contour из `e2e`.
Конфигурация принадлежит `playwright.config.ts`; тесты используют свежую
production-сборку приложения и локальный Vite-стенд компонентов. Внешние
сервисы не используются. Типы тестов и стенда проверяются через
`svelte-check --tsconfig ./e2e/tsconfig.json --tsgo`.

Успешный `npm test` не подтверждает реальный DOM, focus behavior, hydration,
responsive layout, Canvas browser integration или production deployment.

Добавление browser/e2e tooling является отдельным изменением dependencies и
test pipeline. Нельзя внедрять его скрыто внутри обычной component-задачи.

## Что обязательно тестировать

Тесты нужны для нового или изменённого поведения в:

- parsing, formatting, validation и normalization;
- date/time и timezone boundaries;
- URL query contract и HTTP statuses;
- storage serialization, version и fallback;
- server allowlist, token handling и response forwarding;
- chart layout, pan calculations и draw primitives;
- table formatting, collapse и clipboard representation;
- reusable keyboard/list/calendar engines;
- concurrency guard, fallback или error branch с риском stale/corrupt state;
- regression case исправляемого дефекта.

Если reusable component содержит сложную чистую логику, её следует проверять на
engine boundary. Это не заменяет DOM-test доступности самого component.

## Что обычно не требует отдельного unit test

- тривиальная Svelte composition без собственной логики;
- простой pass-through prop/callback;
- CSS declaration или статический markup;
- framework boilerplate;
- private helper, полностью покрытый публичным behavior;
- re-export без преобразования;
- generated OpenAPI declarations.

Отсутствие unit test не означает отсутствие проверки: визуальный или
accessibility change может требовать browser smoke/manual inspection. Итоговый
отчёт должен различать автоматическую и ручную проверку.

## Уровни проверки

### Pure unit

Предпочтительный уровень для `*.engine.ts`, config, parsers и formatters.
Проверяет input/output без DOM, Svelte lifecycle, clock или network.

### Server boundary

Route loader/handler, server Bootstrap и server Infrastructure проверяются с
контролируемыми `fetch` и env mocks. Тест должен утверждать observable
status/data/security behavior, а не только факт вызова mock.

### Rendering primitives

Canvas draw functions можно тестировать через минимальный recording context,
если assertions выражают видимые primitives/order, являющиеся contract.
Mock Canvas не подтверждает реальную browser rendering.

### Component/browser behavior

Focus, keyboard event dispatch, popover dismissal, accessible tree, hydration и
responsive behavior требуют browser-capable проверки. Нельзя подменять её
тестом, который вызывает private function и заявляет полную component coverage.

При существенном UI-риске выполняются релевантные browser-тесты или явно
описывается manual/browser smoke доступными средствами. Дополнительное tooling
за пределами существующего контура добавляется отдельным изменением.

## Observable behavior

Предпочитайте assertions на:

- возвращаемое значение;
- thrown/rejected error;
- HTTP response;
- serialized output;
- public controller state после действия;
- зарегистрированный visible draw operation;
- отсутствие утечки token/private data;
- сохранённый supported side effect.

Избегайте assertions только на количество вызовов mock, если production result
может быть неверным при том же количестве вызовов.

## Структура и именование

Используйте установленный в проекте Vitest style:

```ts
describe('resolvePanDelta', () => {
  it('ignores pointer movement below the drag threshold', () => {
    const result = resolvePanDelta(input);

    expect(result).toBe(0);
  });
});
```

Top-level `describe` называет публичную функцию, module contract или component
engine. `it` описывает ожидаемое поведение прямым глаголом:

- `returns`, `rejects`, `parses`, `formats`;
- `preserves`, `normalizes`, `maps`, `builds`;
- `ignores`, `prevents`, `keeps`, `does not`.

Избегайте `works`, `handles correctly`, `test ...` и повторения subject в каждом
case name.

Nested `describe` используется только когда у subject есть несколько ясных
public operations. Не создавайте hierarchy ради визуального объёма.

## Arrange, Act, Assert

Три фазы разделяются пустыми строками, когда они различимы. Комментарии
`Arrange/Act/Assert` для короткого теста не нужны.

Несколько assertions допустимы, если вместе описывают один результат или
инвариант. Независимые причины failure разделяются на отдельные cases.

## Test data

Данные должны быть минимальными, но реалистичными для contract.

- Важные для поведения параметры видны внутри `it`.
- Не добавляйте поля, не участвующие в scenario.
- Не используйте случайное значение или текущее время без контроля.
- Большой shared fixture допустим только для устойчивой boundary-структуры,
  когда локальное повторение ухудшает ясность.
- Test helper не должен заново реализовывать production algorithm для expected
  value.

Для matrix/time-series tests размер данных выбирается минимальным, который
проявляет alignment, boundary или null behavior.

## Изоляция

Тест не зависит от:

- внешней сети и внешних сервисов;
- production credentials;
- порядка test files;
- mutable global state другого suite;
- текущей timezone/даты без явной фиксации;
- реального `localStorage`, если тестируется не browser integration;
- stale `build` или `.svelte-kit` output.

Изменённые env, timers, spies и globals восстанавливаются после case/suite.

## Async и concurrency

Async test обязан ожидать проверяемую Promise. Не используйте произвольный
`setTimeout` для ожидания состояния, если можно контролировать Promise/timer.

При логике latest-request-wins проверяется, что поздний ответ старого запроса не
перезаписывает новый state, если этот behavior доступен через тестируемую
boundary.

## Error и boundary cases

Для соответствующей ответственности проверяются:

- empty/missing input;
- минимальное и максимальное допустимое значение;
- invalid date/format;
- duplicate query parameter;
- range/window overflow;
- null/NaN/flat data в chart math;
- repeated call и cleanup;
- unavailable/disabled branch;
- storage version mismatch и malformed JSON;
- missing private token и unknown proxy path.

Не каждый модуль требует всех случаев. Набор определяется его contract.

## Regression tests

Regression test фиксирует корректное текущее поведение, а не имя старой ошибки
или прежнюю implementation detail.

Имя описывает защищаемый outcome. Исторический контекст добавляется коротким
комментарием только если без него scenario выглядит случайным.

После удаления поддерживаемого behavior удаляются посвящённые только ему tests и
fixtures. Не сохраняйте отрицательный тест на историческое имя API без текущего
compatibility contract.

## Snapshot и visual assertions

Snapshot допускается только для стабильного output contract, когда точечные
assertions хуже выражают намерение. Не используйте snapshot большого Svelte DOM
как замену semantic assertions.

Pixel screenshot/visual regression требует принятого browser tooling и
детерминированного окружения. Разовая manual screenshot не называется
автоматическим regression test.

## Связь с задачей

Тестовый diff ограничивается затронутым behavior. Нельзя переписывать соседние
suites, менять Vitest config или вводить новый test framework ради локальной
правки без явного scope.

Сначала запускается узкий test file, затем `npm test`; lint, `svelte-check`,
build и smoke добавляются соразмерно типу изменения.

Нельзя утверждать, что проверка прошла, если команда не выполнялась успешно.

## Комментарии в тестах

Сначала ясными делаются имя теста и test data. Комментарий добавляется только
для production-риска, regression context, неочевидного fixture или причины
expected value, которые нельзя выразить структурой теста.

Комментарий уместен, если он объясняет:

- timezone/local-date invariant или странный допустимый upstream input;
- формулу неочевидного expected value;
- ограничение mock Canvas, `fetch` или browser API;
- намеренно не проверяемую соседнюю responsibility;
- fixture с важным `null`, zero, duplicate или out-of-range value.

Комментарии `Arrange`, `Act`, `Assert`, `create mock`, `call function` и `check
result` в коротком тесте не нужны. `Given`/`When`/`Then` допустимы только в
длинном integration-style scenario, если помогают навигации.

Естественный текст пишется на русском; устойчивые terms `mock`, `fixture`,
`regression`, `fallback` и `contract` допустимы. Комментарий должен описывать
текущий риск, а не историю рефакторинга, и оставаться полезным после
behavior-preserving изменения реализации.
