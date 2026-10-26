# Политика внесения изменений

> Type: Policy. Этот документ задаёт правило минимального безопасного изменения
> проекта.

## Decision gate

Изменение выполняется только если оно прямо требуется текущей задачей либо
минимально необходимо для корректности результата. Существующий код и
наблюдаемое поведение считаются намеренными, пока repository evidence не
показывает обратное.

Перед правкой нужно определить:

1. Какое требование задачи покрывает изменение.
2. Как сейчас реализован затронутый сценарий и где находится его владелец.
3. Меняется ли public API компонента, URL, persistence, network boundary,
   SSR/browser behavior, accessibility или build pipeline.
4. Можно ли получить результат меньшим и более локальным diff.
5. Какие тесты и документы выражают существующий контракт.

Если разные трактовки существенно меняют runtime, public contract, stored data,
security или architecture, решение владельца нужно получить до правки.

## Понимание перед изменением

До редактирования нужно изучить относящиеся к задаче:

- Svelte-компоненты, controllers и engines;
- route loaders и server handlers;
- config, types и public `index.ts`;
- тесты и живые UI-примеры;
- профильные документы и policies.

Не следует угадывать framework behavior, формат данных или направление
зависимости, если ответ можно получить из репозитория.

## Минимальность изменений

В scope входят:

- код, прямо необходимый задаче;
- затронутые тесты;
- затронутая документация;
- минимальная поддерживающая правка для корректности.

Без отдельного основания запрещены:

- широкий cleanup или форматирование;
- массовое переименование;
- перепроектирование соседнего UI;
- изменение dependency, scripts, Vite/SvelteKit config или deployment;
- изменение URL, storage schema или API-запросов;
- перенос файлов и публичных exports;
- исправление независимых проблем «заодно».

## Локальные улучшения

Небольшое соседнее улучшение допустимо, если оно одновременно:

- непосредственно помогает текущей задаче;
- сохраняет наблюдаемое поведение;
- остаётся локальным и проверяемым;
- не создаёт новый public contract или архитектурную границу.

Большие улучшения описываются отдельно и не внедряются без расширения scope.

## Сохраняемые свойства UI

Если задача не требует обратного, изменение сохраняет:

- SSR и hydration;
- keyboard navigation, focus order и доступные имена;
- семантику нативных элементов и ARIA;
- responsive layout и hit targets;
- публичные props, callback contracts и форматы значений;
- порядок side effects и сетевых запросов;
- URL/query semantics;
- `localStorage` keys, versions и fallback behavior;
- обработку loading, error и disabled states;
- Canvas Worker lifecycle и message contract;
- build output adapter-node и поддерживаемые npm commands.

Визуальное изменение не считается только CSS-деталью, если оно влияет на
доступность control, навигацию, читаемость данных или размер интерактивной зоны.

## Public contracts

К compatibility-sensitive изменениям относятся:

- маршрут и допустимые query-параметры;
- server response status и security boundary;
- exported component/type/config API;
- формат даты, таблицы, clipboard output или persisted JSON;
- generated OpenAPI contract;
- worker messages;
- environment variables;
- package scripts и deployment entrypoint.

Такой контракт меняется только явно. Реализация, тесты и living documentation
обновляются вместе.

## Работа в общей рабочей копии

Перед изменением проверяется `git status`. Существующие изменения принадлежат
пользователю или параллельной работе, пока не доказано обратное.

Нельзя откатывать, перезаписывать, форматировать или включать в собственный
cleanup чужие изменения. При пересечении файлов нужно сохранить обе задачи или
остановиться, если безопасное объединение невозможно.

## Cleanup и жизненность кода

Код или asset считается живым, если у него есть подтверждённая роль в product
runtime, developer showcase, build graph, test graph либо поддерживаемом
public/internal contract. Компиляция, barrel export или наличие теста сами по
себе не доказывают product runtime usage.

При deletion audit учитываются отдельные графы:

- product runtime начинается от SvelteKit routes, loaders, handlers и их
  imports, включая server boundary, Workers и static assets;
- build graph включает scripts, lockfile, Svelte/Vite/TypeScript config,
  environment declarations и generated types;
- test graph начинается от test files и подтверждает проверяемое поведение, но
  не product runtime usage.

SvelteKit route convention, dynamic import и `new URL(..., import.meta.url)`
могут связывать файл без обычного import. Код, достижимый только из tests,
showcase или barrel export, классифицируется отдельно и не удаляется
автоматически.

Для аудита используются следующие решения:

- `keep` — подтверждённый product, developer, build или contract code;
- `delete candidate` — нет активного graph, framework binding, поддерживаемого
  API или документированного намерения;
- `move to roadmap` — согласованный будущий scope без текущего consumer;
- `needs owner decision` — test-only implementation, barrel-only export,
  orphaned island или значимая роль без подтверждённого entrypoint.

Перед решением проверяются imports по path и symbol, public `index.ts`, route
conventions, dynamic/Worker references, tests и mocks, docs и showcase,
scripts/config/aliases, CSS/static references, storage/runtime keys и роль
generated declarations. Одного поиска по имени файла недостаточно.

Deletion pass ограничивается заранее перечисленными точными targets. Он не
должен попутно менять behavior, перепроектировать модуль, обновлять dependencies
или scripts либо удалять owner-decision candidates. После удаления выполняются
проверки затронутого graph, а в отчёте перечисляются удалённые объекты и способ
их восстановления.

## Проблемы окружения

Проблемы контейнера или локальной машины не являются основанием менять код
проекта, отключать проверку или добавлять workaround в scripts.

Допустима эквивалентная локальная команда, если она не меняет проект и сохраняет
смысл проверки. Если необходимого инструмента нет, нужно сообщить, что именно
не выполнено и почему.

## Проверка результата

Сначала запускается самая узкая релевантная проверка, затем более широкий
контур соразмерно риску. Нельзя использовать stale build artifacts как
доказательство корректности изменённого source.

Перед завершением нужно проверить:

- решено ли исходное требование;
- сохранены ли независимые свойства;
- не расширился ли scope;
- обновлены ли тесты и документация;
- не содержит ли diff случайных или пользовательских файлов.

Правила выбора тестов находятся в [testing policy](./testing-policy.md), а
ограничения build/scripts — в [scripts policy](./scripts-policy.md).
