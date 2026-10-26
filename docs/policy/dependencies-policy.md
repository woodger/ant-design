# Политика зависимостей

> Type: Policy. Этот документ задаёт критерии добавления и обновления npm
> dependencies проекта.

## Основной принцип

Dependency добавляется только когда она решает нетривиальную устойчивую задачу
лучше локальной реализации и оправдывает стоимость сопровождения.

Единственный поддерживаемый package manager — npm. `package-lock.json` является
частью воспроизводимой установки и обновляется вместе с `package.json`.

## Decision gate

Перед добавлением проверьте:

1. Нет ли нужной возможности в платформе, SvelteKit или существующем пакете.
2. Нужна ли библиотека runtime или только development contour.
3. Совместима ли она с текущими Svelte, Vite, SSR и Node versions.
4. Попадёт ли она в browser bundle и каков bundle/runtime cost.
5. Поддерживается ли пакет, понятна ли license и security history.
6. Можно ли локализовать внешний API за project-owned facade.

## Допустимые зависимости

- maintained library для сложной accessibility/format/protocol задачи;
- официальный framework adapter или plugin, необходимый runtime/build;
- typed client для поддерживаемого внешнего contract;
- UI icon set, скрытый за локальным facade;
- test/tooling package для явно принятого нового validation contour.

## Нежелательные зависимости

- пакет ради одной простой функции;
- wrapper над нативным browser/Node API без новой ответственности;
- второй инструмент, дублирующий существующий lint/test/build tool;
- крупный UI framework ради одного control;
- browser package без SSR support, если изоляция не спроектирована;
- пакет только ради более короткого синтаксиса;
- dependency «на будущее» без текущего consumer.

## Runtime boundary

Внешний API локализуется, когда это защищает проектный contract:

- provider-owned types не должны бесконтрольно распространяться по reusable UI.

Facade не нужен механически для каждого пакета. Он оправдан, если dependency
имеет несколько consumers или её API не должен стать project contract.

## Обновления

Patch/minor update допустим отдельной задачей после изучения release notes,
peer ranges и фактического dependency graph. Major update выполняется отдельно
с явной проверкой migration guide и runtime/build behavior.

Не смешивайте dependency update с feature или визуальной задачей, если update не
необходим для неё.

После изменения зависимостей проверяются:

- `npm install`/lockfile consistency;
- `npm run lint`;
- `svelte-check`;
- `npm test`;
- `npm run build`;
- релевантный runtime smoke;
- `npm audit` в согласованном audit level.

`overrides` используется только для конкретного compatibility/security случая.
Он не должен скрывать несовместимый major graph без объяснения и проверки.
