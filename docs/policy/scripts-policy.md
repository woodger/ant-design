# Политика скриптов и сборки

> Type: Policy. Этот документ задаёт ограничения на npm scripts, SvelteKit/Vite
> config, test pipeline и сборку npm-пакета.

## Поддерживаемый контур

Команды определены в локальном `package.json`:

- `npm run build` — сборка npm-пакета в `dist` через `svelte-package`;
- `npm run dev` — watch-сборка пакета;
- `npm run lint` — Oxlint для исходников, инструментов и конфигурации;
- `npm run check` — Svelte/TypeScript check;
- `npm run check:tests` — Svelte/TypeScript check тестов и фикстур;
- `npm test` — Vitest для компонентов и инструментов;
- `npm run test:package` — сборка и SSR-проверки публичного пакета;
- `npm run test:browser` — Playwright для компонентов на собственном Vite-стенде.

Типизация фикстур, package-тесты и браузерный стенд читают текущий `dist`.
Их команды собирают пакет
перед проверкой; это зависимые шаги. Стенд работает на порту `4175`, не требует
homepage и не входит в npm-архив. Playwright, его lifecycle и browser artifacts
настраиваются в `playwright.config.ts`.

`npm run cli -- ...` запускает служебный CLI этого репозитория через `icore`:
`registry check`, `registry report`, `registry show <component>` и `css`.
`npm run cli -- --help` выводит команды и параметры. Их формат описан в
[справочнике переноса](../reference/ant-design-porting/readme.md).
Для этих команд не нужны исходники приложения-потребителя.

## Изменение scripts

Scripts и config меняются только когда задача прямо требует новый workflow или
существующий workflow не может корректно выполнить свой contract.

Без явного основания запрещено:

- добавлять `pre*`/`post*` hooks;
- менять порядок существующих шагов;
- объединять независимые проверки через `&&`;
- добавлять автоматическое удаление `build`, `.svelte-kit` или других каталогов;
- менять test environment или include pattern;
- отключать SSR, diagnostics или assertion requirements;
- заменять JavaScript/framework behavior shell-specific workaround;
- добавлять OS-specific command в поддерживаемый script.

Новый script должен иметь стабильную developer/CI ответственность, а не быть
одноразовым alias локальной команды.

## Generated и build output

- `.svelte-kit` создаётся SvelteKit tooling и не является source.
- `dist` создаётся `svelte-package` и не редактируется вручную.
- Stale artifact не исправляется изменением исходного кода или постоянным
  `clean` hook без доказанной причины.
- Проверка изменённого source не опирается на старый `build`.

Удаление конкретного generated output допустимо как явная локальная операция,
когда это требуется диагностикой, но не должно незаметно становиться частью
package script.

## Конфигурационные файлы

`svelte.config.js`, `vite.config.ts`, `tsconfig.json` и package metadata являются
runtime/build wiring. Изменение alias, adapter, rune mode, test environment,
compiler option или plugin рассматривается как compatibility-sensitive.

Нельзя менять config для подавления ошибки приложения или проблемы окружения.

## Environment

Build-time и runtime variables не подменяются package scripts. Их contract
задают `.env.example`, SvelteKit env imports и deployment environment.

Секрет нельзя записывать в script, command example с реальным значением или
публичную environment variable.

## Проверка

При изменении scripts/config нужно выполнить каждый затронутый command отдельно
и проверить:

- exit status;
- отсутствие новых side effects;
- SSR/build output;
- совместимость local и production workflows;
- отсутствие случайного расширения lint/test scope.

Если команда не запускалась, это указывается явно.
