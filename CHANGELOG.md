# Changelog

Все заметные изменения проекта документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
а версии проекта следуют [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Tabs: типизированные items/snippets, bind:activeKey, defaults и callbacks,
  ручная клавиатурная активация, line/card, четыре положения и размеры.
  Добавлены ленивые панели с сохранением state, forceRender/destroyOnHidden,
  восстановление фокуса, стили Ant Design 6.6.8, темы/RTL, прокрутка, Modal,
  пример профиля и unit/SSR/Chromium-проверки.
- Dropdown: типизированное плоское menu.items с иконками, disabled/danger и
  разделителями, bind:open, click/hover, клавиатура/typeahead, Tab/Escape и
  возврат фокуса. Добавлены стили Ant Design 6.6.8, шесть положений, переворот,
  темы/RTL, Modal, пример действий строки Table и unit/SSR/Chromium-проверки.
- Popconfirm: title/description/icon snippets, подтверждение и отмена,
  bind:open, disabled, настройки кнопок, Promise/loading, ошибки и повтор,
  защита от повторного запуска и поздних результатов. Добавлены стили Ant Design
  6.6.8, локализация, темы/RTL, Modal/Tooltip, пример удаления строки Table
  и unit/SSR/Chromium-проверки.
- Popover: строки и Svelte snippets, bind:open, defaults, click/hover/focus,
  интерактивные поля и кнопки, естественный порядок Tab, Escape и возврат фокуса.
  Добавлены стили Ant Design 6.6.8, четыре положения, переворот у края окна,
  совместная работа с Tooltip и Modal, темы/RTL, редактор профиля в галерее
  и SSR/Chromium-проверки.
- Tooltip: текст и числовой ноль, bind:open, defaults, hover/focus, задержки,
  Escape, четыре положения, стрелка, автоматический переворот, aria-describedby
  и нативный popover внутри Modal. Добавлены подсказки Slider с форматированием,
  стили Ant Design 6.6.8, темы/RTL, галерея и unit/SSR/Chromium-проверки.
- Slider с одним бегунком: bind:value, min/max/step, мышь и касание,
  клавиатура, onChangeComplete, ориентация, reverse/RTL, disabled, FormItem,
  FormData и reset. Добавлены стили Ant Design 6.6.8, темы, отмена активных
  действий, пример с InputNumber и unit/SSR/Chromium-проверки.
- InputNumber: bind:value с number/null, defaultValue, числовой черновик,
  min/max, дробный step, precision, кнопки и клавиатура, disabled/readonly,
  FormItem, FormData и reset. Добавлены стили Ant Design 6.6.8, темы, RTL,
  локаль, пример расчёта стоимости и unit/SSR/Chromium-проверки.
- Switch: bind:checked, defaults, loading, disabled, два размера, snippets
  состояний, клавиатура, FormData и FormItem. Добавлены стили Ant Design 6.6.8,
  темы/RTL/reduced motion, пример асинхронного сохранения с откатом ошибки,
  защитой от повторных запросов и поздних ответов, unit/SSR/Chromium-проверки.
- Radio и RadioGroup: типизированный одиночный выбор, нативные стрелки/Space,
  синхронизация соседних Radio, независимые имена групп, required и отменяемый
  reset. Добавлены официальные стили Ant Design 6.6.8, интеграция с FormItem, ориентация,
  темы, RTL, примеры с 0/false и unit/SSR/Chromium-проверки.
- CheckboxGroup: типизированные строковые, числовые и boolean-массивы,
  options, disabled, нативные checkbox и FormData, отменяемый reset и интеграция
  с FormItem. Галерея прав использует группу с проверкой количества и выбором всех;
  добавлены unit/SSR/Chromium-проверки, включая RTL и мобильный экран.
- Множественный Select: mode="multiple", типизированные массивы, поиск,
  удаление элементов, клавиатура, repeated FormData, native reset, required,
  темы и RTL. Form поддерживает плоские массивы, ограничения количества и
  независимые копии defaults/snapshots; добавлены примеры и unit/SSR/Chromium-проверки.
- Раскрываемые строки Table: типизированный expandedRowRender, rowExpandable,
  bind:expandedRowKeys, defaults и отдельные callbacks. Сохранение ключей между
  страницами, доступные кнопки, закрепление колонки, RTL, SSR и примеры с проверками
  клавиатуры, выбора строк, серверного режима и мобильной прокрутки.
- Закрепление заголовка и колонок Table: scroll.y, column.fixed start/end и
  rowSelection.fixed, измерение ширин, RTL, непрозрачные фоны и клавиатурная
  прокрутка. На узком экране закрепление колонок отключается, если они не
  помещаются; добавлены примеры и unit/SSR/Chromium-проверки.
- Серверный режим Table: внешний total, удалённая сортировка и фильтры без
  локальной обработки страницы, сохранение выбранных ключей. Модель загрузки
  с отменой, защитой от поздних ответов, ошибками/retry и коррекцией страницы
  при уменьшении total; демо API в галерее и unit/SSR/Chromium-проверки.
- Фильтры колонок Table: одиночный и множественный выбор, bind:filters и
  defaultFilters, подтверждение/сброс, порядок фильтрация → сортировка → пагинация.
  Сохранение скрытого выбора, локализация, RTL, клавиатура и нативный popover.
- Table v1 на Svelte 5: типизированные колонки и snippets, стабильная сортировка,
  локальная пагинация, выбор строк по ключам, loading и пустые данные. Стили
  Ant Design 6.6.8, темы, RTL, прокрутка с клавиатуры, примеры и unit/SSR/Chromium-проверки.
- Checkbox и Pagination на Svelte 5: смешанное состояние, boolean-поля Form,
  нативный reset и FormData; переходы по страницам, выбор размера, диапазоны,
  локаль и RTL. Официальные стили 6.6.8, примеры и unit/SSR/Chromium-проверки.
- Отдельный Playwright Chromium contour: `npm run test:e2e`, изолированный стенд
  компонентов, проверки production-галереи, отчёт и диагностические артефакты.
- Первый набор Ant Design 6.6.8 на Svelte 5 и TypeScript: ConfigProvider, Button,
  Input, Select, Modal, Form и FormItem; отдельный пакет исходников и примеры
  на `/ant-design`.
- Переключаемые темы, типизированная валидация форм с защитой от устаревших
  результатов, unit- и SSR-проверки компонентов.
- Минимальный каркас SvelteKit, Svelte 5 и TypeScript со стартовой страницей.
- Oxlint, Svelte/TypeScript check, Vitest и проверка архитектурных зависимостей.
- Production-сборка через adapter-node и документация по запуску через systemd.

### Fixed

- Select открывает список при нажатии на стрелку и отступы control.
- FormItem применяет vertical/horizontal layout формы и правильно располагает
  подписи полей.
