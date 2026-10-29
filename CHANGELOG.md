# Changelog

Все заметные изменения проекта документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
а версии проекта следуют [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Compact spacing использует закреплённую size map Ant Design для padding,
  margin и content aliases; вложенный compact=false восстанавливает обычные
  интервалы, inline overrides сохраняются.
- Пример Layout автоматически скрывает боковую панель ниже md, сохраняя внешний
  переключатель доступным в узком viewport.
- StatisticTimer сохраняет различие upstream между default=0 при форматировании
  отсутствующего value и исходной отсутствующей целью в callbacks.
- Divider сохраняет стандартные отступы без явного size/componentSize и наследует
  явно заданный размер через вложенные ConfigProvider. Уточнён приоритет preset
  и custom gap в документации Flex; счётчик галереи обновлён до 39 компонентов.
- Production-страницы подключают локальный SVG favicon; браузер больше не
  запрашивает отсутствующий /favicon.ico при открытии галереи.

### Added

- Timeline: items, mode/placement, pending/loading/reverse, colors, titleSpan,
  horizontal и semantic styles поверх общих Steps. Сохранены passive ol/li,
  SSR, native content и keyed focus; добавлены CSS-рецепт, проверки и галерея.

- Steps: dot/inline/navigation/panel, outlined, initial/maxCount/percent/ellipsis,
  semantic slots, item callbacks, iconRender и legacy aliases. Базовый API,
  нативные кнопки и фокус сохранены. Tooltip поддерживает Snippet title для
  rich inline content; CSS Steps полностью воспроизводится рецептом.

- Anchor/AnchorLink: вложенные items, horizontal, Affix, scroll tracking, offsets,
  highlight mapping, push/replace history и отменяемая cubic-анимация. Добавлены
  semantic styles, CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.

- Affix: top/bottom, window/custom target, onChange, updatePosition/cancel,
  ResizeObserver и cleanup. Сохранены SSR, нативный контент и геометрия upstream;
  добавлены CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.

- Space/Compact/Addon: keyed items со Snippet, orientation/align/wrap, gaps,
  separator/split, компактные стыки и размеры controls, вложенность, addon
  variants/status и изоляция Popup-контекста. Добавлены CSS-рецепты и проверки
  DOM/фокуса, RTL и production-галереи.
- Breadcrumb: items/legacy routes, path/params, разделители, Snippet itemRender,
  semantic styles, темы/RTL и меню. Dropdown получил нативные href/target/rel
  items с Enter/Space, disabled и отменой навигации. Добавлены CSS-рецепт и проверки.
- Card/Grid/Meta: слоты, варианты оформления, загрузка с сохранением фокуса,
  автоопределение Grid, вкладки и semantic styles. Tabs получил left/right extra
  content и числовые labels. Добавлены CSS-рецепт, unit/SSR/Chromium и галерея.
- Descriptions: items/Snippet, responsive column/span/filled, таблицы обоих
  направлений, bordered, semantic styles с исходным приоритетом, темы и RTL.
  Добавлены CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.
- Layout/Header/Content/Footer/Sider: нативные секции, вложенные контексты,
  hasSider/SSR CSS fallback, collapsed/zero-width, accessible trigger и responsive
  callbacks с cleanup. Добавлены темы/locale, CSS-рецепт, unit/SSR/Chromium и галерея.
- Grid Row/Col: 24 колонки, responsive props xs–xxxl, CSS/числовые gutter,
  align/justify, flex и вложенные контексты. Добавлены createBreakpoint с cleanup,
  воспроизводимый CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.
- Segmented: типизированные options/value, defaultValue/onChange, native radio,
  клавиатура, размеры, block/round, semantic slots, темы и RTL. Добавлены thumb
  через Web Animations API с отменой/resize/reduced motion и option.tooltip через
  существующий Tooltip, включая disabled options и block/scale-геометрию.
  Добавлены CSS-рецепт, unit/SSR/Chromium, отдельная фикстура и галерея.
- StatisticTimer и совместимый StatisticCountdown: countup/countdown, формат
  длительности, onChange/onFinish, стабильный SSR-placeholder, cleanup и защита
  от поздних callbacks. Добавлены unit/SSR/Chromium, отдельная фикстура и запуск
  отсчёта в галерее; реестр отмечает покрытый основной объём семейства Statistic.
- Statistic: строковое форматирование чисел с precision без округления,
  разделителями и formatter, title/prefix/suffix snippets, valueRender,
  semantic slots и loading через Skeleton. Добавлены CSS-рецепт, unit/SSR/Chromium,
  изолированная фикстура и пример галереи; Timer/Countdown пока не перенесены.
- Flex: направления, align/justify, wrap, preset/числовой/CSS gap и flex shorthand
  с прямыми детьми без обёрток. Добавлены нативный component/bind:nativeElement,
  CSS-рецепт, SSR/Chromium-проверки, изолированная фикстура и галерея.
- Divider: horizontal/vertical, подпись string/number/Snippet, titlePlacement,
  RTL, размеры, plain, dashed/dotted и совместимые aliases. Добавлены semantic
  slots, bind:nativeElement, воспроизводимый CSS-рецепт, SSR/Chromium-проверки,
  изолированная фикстура и пример галереи.
- Инструменты переноса Ant Design: версионируемый реестр 73 семейств со сводкой
  покрытия, проверкой ссылок/экспортов и пилотными аудитами Avatar/Select/DatePicker;
  извлечение Avatar/AvatarGroup/Badge CSS из закреплённого npm-архива с проверкой
  SHA-256 и явным preview/check/write. Добавлены 37 изолированных маршрутов фикстур
  с сохранением общей страницы и unit/Chromium-проверки инструментов и изоляции.
- AvatarGroup: типизированные items с ключами, общие size/shape, перекрытие,
  max.count и нативная кнопка +N с ленивым списком в Popover. Добавлены локаль,
  темы/compact/RTL, восстановление фокуса, unit/SSR/Chromium-проверки и галерея
  добавления/удаления/перестановки участников. Avatar сохраняет ошибку изображения
  при перестановке с тем же src/srcSet; Popover игнорирует blur после destroy.
- Avatar: изображения с src/srcSet, icon/children fallback, onError, circle/square,
  размеры из контекста или числовой size, gap и автоматическая подгонка текста.
  Добавлены стили Ant Design 6.6.8, устойчивое доступное имя, темы/compact/RTL,
  cleanup ResizeObserver/listeners, unit/SSR/Chromium-проверки и галерея участников
  с Badge, выбором изображения/инициалов и сохранением профиля в Drawer.
- Badge: числовой count, overflow/showZero/dot, пять статусов, 13 preset цветов,
  string/Snippet text, medium/small, offset и полное доступное значение.
  Добавлены стили Ant Design 6.6.8, локаль, темы/compact/RTL/reduced motion,
  unit/SSR/Chromium-проверки и галерея уведомлений с Drawer. Количество вычисляется
  из сообщений; чтение сохраняет записи, фокус и исходную кнопку открытия.
- Tag и CheckableTag: preset/status цвета, filled/outlined/solid, snippets,
  отменяемый onClose, disabled, нативные кнопки и восстановление фокуса.
  Добавлены стили Ant Design 6.6.8, темы/compact/RTL/reduced motion, SSR и
  Chromium-проверки. Галерея показывает защищённые метки, добавление/удаление/
  повторное создание и фильтрацию отдельной Table через управляемый checked.
- Steps: управляемый current/onChange, стабильные items, четыре статуса,
  title/subTitle/content/icon snippets, horizontal/vertical и medium/small.
  Добавлены стили Ant Design 6.6.8, локаль, темы/compact/RTL/reduced motion,
  responsive, нативная клавиатура и восстановление фокуса. Галерея показывает
  Form → проверка → отправка → Result с сохранением полей, retry и отменой
  pending work при reset/unmount; добавлены unit/SSR/Chromium-проверки.
- Result: семь статусов, официальные иконки и иллюстрации 403/404/500,
  string/Snippet title/subTitle, extra/children и семантический заголовок.
  Добавлены стили Ant Design 6.6.8, темы/compact/RTL, восстановление фокуса
  общим механизмом с Empty, SSR и Chromium-проверки. Галерея показывает
  Form → success/error → редактирование/retry без потери данных и отменяет
  позднее завершение при reset/unmount; маршруты и HTTP-статусы не изменены.
- Empty: default/simple SVG, image/description snippets, скрытые части,
  действия и восстановление фокуса при удалении. Добавлены стили Ant Design
  6.6.8, локаль, темы/compact/RTL, SSR и галерея создания первой записи,
  пустого поиска и сброса фильтра. Table использует simple Empty с сохранением
  colspan, переводов, приоритета empty snippet и loading; добавлены SSR/Chromium-проверки.
- Skeleton: loading/active/round, конфигурации avatar/title/paragraph,
  ширины и число строк, замена children, доступный статус и парковка фокуса.
  Добавлены стили Ant Design 6.6.8, темы/compact/RTL/reduced motion, SSR,
  галерея первой загрузки с обновлением через Spin и сохранением черновика,
  ошибки/retry, отмена/сброс и unit/SSR/Chromium-проверки.
- Spin: standalone и сохранённые children, spinning/delay, три размера,
  description/indicator snippets, немедленная блокировка через inert/aria-busy
  и восстановление фокуса. Добавлены стили Ant Design 6.6.8, локаль, темы/RTL/
  reduced motion, интеграция с Table, галерея с отменой/ошибкой/retry
  и unit/SSR/Chromium-проверки.
- Progress: line/circle, нормализация percent, явные/автоматические статусы,
  размеры, цвета, подпись/format, доступные значения и локаль. Добавлены стили
  Ant Design 6.6.8, SVG-дуга, темы/RTL/reduced motion, галерея и unit/SSR/Chromium.
  Пример экспорта Notification показывает этапы выполнения и отмену с повтором;
  отдельная модель отменяет таймеры и защищает от поздних результатов.
- Notification: createNotification и NotificationHolder, четыре статуса,
  title/description/actions snippets, шесть положений, ключи и обновления,
  duration/hover/focus-паузы, maxCount и закрытие. Добавлены доступная клавиатура,
  восстановление фокуса, SSR, ConfigProvider, Modal/Drawer, темы/RTL/reduced
  motion, пример экспорта с CSV/retry и unit/SSR/Chromium-проверки.
  Message и Notification используют общее внутреннее ядро очереди и DOM-видимости.
- Message: createMessage и MessageHolder, пять типов, строки/snippets,
  ключи и обновления, duration/hover-пауза/maxCount, destroy и callable/thenable
  handles. Добавлены изоляция SSR и контекст ConfigProvider, нативный popover
  внутри Modal/Drawer, темы/RTL/reduced motion, пример loading → success/error
  и unit/SSR/Chromium-проверки.
- Alert: success/info/warning/error, title/description/icon/action snippets,
  outlined/filled, banner, closable с callbacks, анимацией и reduced motion.
  Добавлены filled-иконки Ant Design с MIT-лицензией, доступные объявления,
  перенос фокуса, темы/RTL, мобильные действия, пример и SSR/Chromium-проверки.
  Ошибка загрузки удалённой Table использует Alert с прежним retry и query.
- Drawer: модальная панель на нативном dialog, bind:open, callbacks, четыре
  стороны и размеры, title/extra/footer snippets, анимация и reduced motion.
  Добавлены ленивое содержимое, сохранение state, forceRender/destroyOnHidden,
  клавиатура и возврат фокуса, стили Ant Design 6.6.8, темы/RTL, работа с Modal,
  редактор строки Table через Form/Tabs/Collapse и unit/SSR/Chromium-проверки.
- Collapse: типизированные items/snippets, extra, bind:activeKey, defaults и
  callbacks, независимые панели и accordion, header/icon/disabled и размеры.
  Добавлены ленивые панели с сохранением state, forceRender/destroyOnHidden,
  нативные заголовки с клавиатурой и восстановлением фокуса, стили Ant Design
  6.6.8, темы/RTL, вложенность, Modal, пример анкеты и unit/SSR/Chromium-проверки.
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
