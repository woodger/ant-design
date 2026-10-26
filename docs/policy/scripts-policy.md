# Политика скриптов и сборки

> Type: Policy. Этот документ задаёт ограничения на npm scripts, SvelteKit/Vite
> config, test pipeline и adapter-node build.

## Поддерживаемый контур

Текущие public developer commands определены в `package.json`:

- `npm run dev` — Vite development server;
- `npm run build` — production SvelteKit build;
- `npm run lint` — Oxlint для `src`, `e2e` и `playwright.config.ts`;
- `npm test` — Vitest node contour;
- `npm run test:e2e` — Playwright Chromium contour;
- `npm run preview` — локальная проверка build.

Дополнительная type/template проверка выполняется через `svelte-kit sync` и
`svelte-check`, как указано в корневом readme.

Playwright собирает приложение перед запуском preview и поднимает отдельный
Vite-стенд из `e2e/fixtures`. Их lifecycle и порты задаёт
`playwright.config.ts`. Существующие серверы для тестов не переиспользуются.
Type/template check тестового кода использует `e2e/tsconfig.json`.

`npm run preview` не является production entrypoint. Adapter-node production
запускает `node build` согласно deployment guide.

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
- `build` создаётся adapter-node и не редактируется вручную.
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
