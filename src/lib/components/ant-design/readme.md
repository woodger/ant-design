# Ant Design для Svelte 5

> Type: Reference. Первая версия community-переноса компонентов Ant Design
> 6.6.8 на Svelte 5 и TypeScript.

Модуль содержит ConfigProvider, Button, Input, TextArea, DatePicker, RangePicker, Upload, UploadDragger, Tree, TreeSelect, InputNumber, Slider, Select, Checkbox, CheckboxGroup,
Radio, RadioGroup, Switch, Pagination, Table,
Modal, Tooltip, Popover, Popconfirm, Dropdown, Tabs, Collapse, Drawer, Alert,
MessageHolder, NotificationHolder, Progress, Spin, Skeleton, Empty, Result, Steps,
Tag, CheckableTag, Badge, Avatar, AvatarGroup, Divider, Flex, Statistic,
StatisticTimer, StatisticCountdown, Segmented, Row, Col, Layout, LayoutHeader,
LayoutContent, LayoutFooter, LayoutSider, Descriptions, Card, CardGrid, CardMeta,
Breadcrumb, Menu, Space, SpaceCompact, SpaceAddon, FloatButton, FloatButtonGroup,
FloatButtonBackTop, Form и FormItem.
Интерактивные примеры доступны на маршруте `/ant-design`. Публичная точка
входа — [index.ts](./index.ts). Компоненты работают без React и SvelteKit API.

## Подключение

В этом приложении используйте `$lib/components/ant-design`:

```svelte
<script lang="ts">
  import { Button, ConfigProvider, Input, Select } from '$lib/components/ant-design';

  let name = $state('');
  let role = $state<string | undefined>('developer');
</script>

<ConfigProvider theme={{ mode: 'light', primary: 'blue' }}>
  <label for="name">Имя</label>
  <Input id="name" bind:value={name} />

  <label for="role">Роль</label>
  <Select
    id="role"
    bind:value={role}
    options={[
      { value: 'developer', label: 'Разработчик' },
      { value: 'designer', label: 'Дизайнер' }
    ]}
    showSearch
    allowClear
  />

  <Button type="primary" onclick={() => console.log(name, role)}>Сохранить</Button>
</ConfigProvider>
```

ConfigProvider подключает стили. Для использования отдельных компонентов без
провайдера импортируйте `./styles.css` один раз в корневом layout.

Модуль также упаковывается отдельно:

```sh
cd src/lib/components/ant-design
npm pack --ignore-scripts
```

Полученный архив содержит исходники, стили и лицензию. В другом приложении его
точка входа — `@local/ant-design-svelte`, а явный импорт стилей —
`@local/ant-design-svelte/styles.css`. Потребителю нужен сборщик с поддержкой
Svelte 5, TypeScript и `.svelte.ts`, например Vite с официальным Svelte plugin.
Day.js должен удовлетворять peer-диапазону ^1.11.11; стенд использует 1.11.23.
Пакет имеет статус private и не публикуется в npm этим workflow.

## Компоненты

Точные типы props принадлежат определениям рядом с компонентами и экспортируются
через [index.ts](./index.ts).

| Компонент | Поддерживаемое поведение |
| --- | --- |
| ConfigProvider | Светлая и тёмная темы, три основных цвета, компактная плотность, размеры, disabled, направление и локаль |
| Button / ButtonGroup | Native button/href, color/variant/ghost, loading delay/icon, semantic slots, config, Group и Compact |
| FloatButton / FloatButtonGroup / FloatButtonBackTop | Плавающие native actions, Badge/Tooltip, меню групп и возврат с прогрессом прокрутки |
| Input | Текст, email, пароль, поиск, телефон и URL; размеры, error/warning, нативные атрибуты и события |
| DatePicker | Single Dayjs date/datetime, input/calendar/time, confirmation, clear, ограничения, locale и native формы |
| RangePicker | Пара Dayjs, связанные календари, время и подтверждение границ, allowEmpty/disabled, presets и hover |
| Upload / UploadDragger | Выбор/drop, controlled list, beforeUpload, XHR/customRequest, статусы и удаление |
| Tree | TreeData, раскрытие/выбор/отметки, strict/conduction, loadData, клавиатура и showLine |
| TreeSelect | Single/multiple, labelInValue, check strategies, поиск, loadData и native popup |
| TextArea | Многострочное значение, native constraints/events/selection, формы, размеры, статусы и RTL |
| InputNumber | Число/null, черновик ввода, min/max, дробный шаг, precision, кнопки и клавиатура, FormData, reset и FormItem |
| Slider | Одно число, min/max/step, мышь и касание, клавиатура, завершение изменения, подсказка значения, ориентация, reverse/RTL, FormData, reset и FormItem |
| Select | Одиночный и множественный выбор строковых/числовых значений; поиск, очистка, disabled options, клавиатура и FormData |
| Checkbox | Checked/defaultChecked, смешанное состояние, нативные события и FormData, интеграция с FormItem |
| CheckboxGroup | Типизированный массив выбранных значений, options, disabled, нативные checkbox, FormData, reset и интеграция с FormItem |
| Radio | Checked/defaultChecked, disabled, нативные события, синхронизация соседних radio и FormData |
| RadioGroup | Типизированный одиночный выбор, options, уникальное имя группы, горизонтальное/вертикальное расположение, required, reset и FormItem |
| Switch | Checked/defaultChecked, loading, disabled, обычный/малый размеры, snippets состояний, клавиатура, FormData и FormItem |
| Pagination | Страницы, переходы по пять страниц, выбор pageSize, диапазон записей, размеры, RTL и локаль |
| Table | Типизированные колонки и snippets, фильтры, стабильная сортировка одной колонки, локальная и серверная пагинация, выбор и раскрытие строк, закрепление заголовка и колонок, loading и пустые данные |
| Modal | Нативный dialog, заголовок, footer snippet, закрытие, confirmLoading и callbacks |
| Tooltip | Текст, hover/focus, bind:open, задержки, Escape, четыре положения, стрелка, автоматический переворот и aria-describedby |
| Popover | Интерактивные snippets, click/hover/focus, bind:open, четыре положения, стрелка, автоматический переворот, клавиатура и возврат фокуса |
| Popconfirm | Подтверждение и отмена, Promise/loading, повтор после ошибки, защита от поздних результатов, snippets, локализация и клавиатура |
| Dropdown | Плоское меню команд, click/hover, bind:open, disabled/danger, snippets, шесть положений, стрелки/typeahead и возврат фокуса |
| Menu | Items/группы/подменю, selected/open keys, horizontal/vertical/inline, native links, клавиатура и collapse |
| Tabs | Типизированные панели, bind:activeKey, line/card, четыре положения, ручная клавиатурная активация, сохранение содержимого и destroyOnHidden |
| Collapse | Независимые панели и accordion, bind:activeKey, snippets, extra, header/icon/disabled, сохранение содержимого и destroyOnHidden |
| Drawer | Модальная выдвижная панель, bind:open, четыре стороны, размеры, snippets, анимация, сохранение содержимого и destroyOnHidden |
| Alert | Четыре статуса, title/description/icon/action snippets, outlined/filled, banner, закрытие с callbacks, анимацией и доступным фокусом |
| MessageHolder / createMessage | Изолированная очередь пяти типов сообщений, ключи и обновления, таймеры, hover-пауза, maxCount, callable/thenable handle и контекст ConfigProvider |
| NotificationHolder / createNotification | Подробные уведомления с title/description/actions snippets, четыре статуса, шесть положений, ключи, таймеры, hover/focus-пауза и закрытие |
| Progress | Line/circle, управляемый percent, статусы, размеры, цвета, форматирование, ARIA, темы/RTL/reduced motion и SSR |
| Spin | Standalone и сохранённые children, spinning/delay, три размера, description/indicator snippets, блокировка busy-контента и восстановление фокуса |
| Skeleton | Каркас первой загрузки, avatar/title/paragraph, размеры и ширины, active/round, замена children, доступный статус и фокус |
| Empty | Пустое состояние, default/simple SVG, image/description snippets, действия, локаль, темы и восстановление фокуса |
| Result | Семь статусов, официальные иконки/SVG, заголовок, описание, действия, подробности и восстановление фокуса |
| Steps | Управляемые этапы, статусы, snippets, нативные кнопки, horizontal/vertical, medium/small, локаль, темы и восстановление фокуса |
| Tag | Статусные/preset цвета, filled/outlined/solid, snippets, отменяемое закрытие, disabled и восстановление фокуса |
| CheckableTag | Управляемый checked/onChange, нативная toggle-кнопка, aria-pressed, disabled и snippets |
| Badge | Числовой счётчик, overflow/showZero/dot, статусы/preset цвета, string/Snippet text, размеры, offset и доступное полное значение |
| Avatar | Изображение, icon/children fallback, circle/square, именованные и числовые размеры, подгонка текста и доступное имя |
| AvatarGroup | Типизированные items, стабильные ключи, общие размеры/форма, перекрытие, max.count и скрытые участники в Popover |
| Divider | Направления, подпись, titlePlacement, варианты линий, размеры, semantic slots и nativeElement |
| Flex | Прямые дети, направления, align/justify, wrap, gap/flex, нативный component и nativeElement |
| Statistic | Числа/строки, precision без округления, разделители, formatter, snippets, semantic slots и loading |
| StatisticTimer / StatisticCountdown | Отсчёт времени вверх/вниз, формат, callbacks, SSR-placeholder и отмена интервалов |
| Segmented | Типизированный одиночный выбор, native radio, стрелки, размеры, block/round, snippets и semantic slots |
| Row / Col | 24 колонки, responsive span/offset/order/push/pull/flex, gutter, align/justify и вложенные контексты |
| Layout / LayoutHeader / LayoutContent / LayoutFooter / LayoutSider | Нативная структура, hasSider, collapse/trigger, responsive sidebar, темы и RTL |
| Descriptions | Таблица read-only полей, responsive column/span/filled, horizontal/vertical, bordered и semantic slots |
| Card / CardGrid / CardMeta | Header/cover/body/actions, loading, grid, tabs, metadata, semantic slots и варианты оформления |
| Breadcrumb | Items/routes, params, separator items, custom Snippet renderer, меню и native navigation |
| Space / SpaceCompact / SpaceAddon | Wrappers/gaps/separators, компактные стыки controls, размеры, вложенность и addon variants/status |
| Form | Типизированная модель, валидация, submit, reset и обработка ошибок |
| FormItem | Label, required, help, ошибки и контекст доступности одного control |

Input и Select поддерживают `bind:value` и `onValueChange`. Очистка одиночного
Select возвращает `undefined`, множественного — `[]`; числовой `0` остаётся допустимым значением. `defaultValue`
используется как начальное значение отдельного control. Для control с
`bind:value` задавайте начальное значение у владельца и не передавайте
`defaultValue`. Для сброса привязанного значения изменяйте состояние владельца.

Button `type` задаёт оформление, `htmlType` задаёт нативный тип кнопки и по
умолчанию равен `button`. Вариант `link` остаётся кнопкой действия без href;
при href создаётся нативная ссылка. Кнопка loading недоступна для повторного
нажатия. Подробности — в разделе Button ниже.

## Button / ButtonGroup

Button сохраняет прежние props и native onclick; добавлены href, color/variant,
ghost, square shape, iconPlacement (приоритетнее legacy iconPosition),
classNames/styles и rootClassName. Children/icon принимают Snippet, текст,
число или boolean; 0 отображается, true создаёт пустой присутствующий контент.
ButtonProps остаётся интерфейсом native button и доступен по прежнему пути
Button.svelte; ButtonLinkProps описывает ссылку. Компонент выводит тип currentTarget
из href: существующий onclick без href получает HTMLButtonElement, с href —
HTMLAnchorElement. OnClick поддержан как alias; native onclick имеет приоритет.
Bind:nativeElement возвращает фактический button или a.

```svelte
<Button color="purple" variant="filled" iconPlacement="end">Действие</Button>
<Button href="#details">К подробностям</Button>
<ButtonGroup size="small"><Button>Назад</Button><Button>Вперёд</Button></ButtonGroup>
```

Полная пара color+variant имеет приоритет над type/danger. Без пары явный type
либо danger выбирает исходную sugar-map. Отдельный variant=solid выбирает primary;
неполные остальные пары fallback используют ConfigProvider.button либо default/
outlined, как в коде Ant Design 6.6.8. Color включает default/primary/danger и
13 preset colors. Ghost превращает solid в outlined и включает прозрачный фон;
для text/link ghost не применяется. Square использует обычный border radius без
дополнительного shape-класса. Block и размеры сохраняют прежнее поведение.

Loading принимает boolean или {delay,icon}. Положительный delay откладывает
spinner; смена delay/отмена/удаление очищают deadline. Loading.icon имеет приоритет
над button.loadingIcon. SSR не создаёт timer и не показывает отложенный spinner.
Согласованный v1 native button во время loading остаётся disabled и aria-busy;
это сохраняет существующее отличие от React click guard. Для ссылки loading
отменяет переход через preventDefault; disabled дополнительно убирает href,
ставит aria-disabled и tabindex=-1. Enabled anchor получает tabindex=0 как upstream.
Native button сохраняет htmlType/button/submit/reset и form-атрибуты; href не
превращает type=link в навигацию автоматически. AutoFocus фокусирует при mount.

ClassNames/styles — объект или функция от {props}; слоты root/icon/content.
Классы объединяются. Стилевые слои: context.styles → context.style(root) →
local styles → local style(root). ConfigProvider.button задаёт autoInsertSpace,
shape/color/variant, loadingIcon, class/style и semantic slots. Omitted button
наследует config; явный объект, включая {}, заменяет его целиком как в upstream.
FloatButton может пропустить semantic slots этого config через внутренний
_skipSemantic; обычные пользователи не должны использовать этот prop.

ButtonGroup сохраняет deprecated div-композицию Button.Group. Его size имеет
приоритет над ConfigProvider и уступает Compact и явному size кнопки. Вложенная
группа без size возвращает fallback ConfigProvider, а не размер внешней группы.
Направление и native Tab-порядок наследуются; новые role/keyboard shortcuts не
добавляются. Для новых плотных групп используйте уже существующий SpaceCompact.

AutoInsertSpace по умолчанию true: scalar children из ровно двух символов
U+4E00–U+9FA5 получают пробел на SSR, если нет icon и variant не text/link.
Svelte Snippet непрозрачен для SSR; после hydration проверяется единственный
отрендеренный text/element и применяется исходный HOC-класс letter-spacing.
Текст и DOM владельца не переписываются; такой Snippet сохраняет textContent без
ASCII-пробела, в отличие от scalar children. Изменения текста наблюдаются с cleanup.
Эта адаптация явно учитывается как partial coverage в реестре.

Wave и enter/leave анимация loading icon, prefixCls и произвольные component
Design Tokens пока отсутствуют; прежний spinner сохранён. Общий механизм тем,
RTL, Form disabled и Compact остаётся прежним. Фикстура — ?fixture=button;
расширенный пример — /ant-design#buttons. Unit/SSR/Chromium проверяют приоритеты,
формы/ссылки, delay/cancel, CJK, nested config, Group/Compact и совместимость
с Popconfirm. CSS Button уже входит в vendor/antd.css и не дублируется.

## Divider

```svelte
<Divider titlePlacement="start" variant="dashed">Раздел проекта</Divider>
<Divider orientation="vertical" />
```

Divider сохраняет структуру Ant Design 6.6.8: корневой div с role=separator,
две rail и inner-text для горизонтальной подписи. Children принимает строку,
число или Snippet; 0 отображается, null/false/пустая строка дают линию без подписи.
Переданный Snippet считается подписью, даже если он выводит пустое содержимое.
Вертикальный Divider не монтирует подпись. Aria-orientation отражает направление;
компонент не добавляет tabindex и не меняет фокус.

Orientation=horizontal/vertical имеет приоритет над boolean vertical, затем
используется deprecated type. Для совместимости orientation также принимает
старые значения размещения подписи; titlePlacement имеет над ними приоритет.
Start/end зависят от RTL, left/right сохраняют физическую сторону, default=center.
Deprecated orientationMargin действует только у start/end и переводит число
или строку из цифр в px. Styles.content может переопределить этот отступ.

Variant=solid/dashed/dotted, dashed alias и plain повторяют классы эталона.
Size=small/medium/large наследуется от явно заданного componentSize в ConfigProvider,
включая вложенные провайдеры; middle — совместимый alias medium. Без явного
размера Divider сохраняет стандартный отступ 24px без подписи и 16px с подписью.
В semantic callbacks size в этом случае undefined. Без подписи large имеет
отступ 24px, medium — 16px, small — 8px;
с подписью large использует 16px, как upstream. Размеры действуют горизонтально.
Темы, compact, RTL и componentDisabled не скрывают разделитель.

Class/style и нативные атрибуты/события передаются корню. Bind:nativeElement
даёт HTMLDivElement после mount. RootClassName добавляет корневой класс.
ClassNames/styles принимают объект со слотами root/rail/content либо callback
({ props }) с нормализованными orientation/titlePlacement/size. Значения styles —
CSS-строки, как style остальных Svelte-компонентов. Root style имеет приоритет
над styles.root; без подписи styles.rail также применяется к корню.

Пример доступен на `/ant-design#divider`, изолированная фикстура — `?fixture=divider`.
SSR и Chromium-проверки покрывают aliases, ноль, snippets, варианты, размеры,
semantic slots, геометрию размещения, темы, RTL и узкий экран.
Произвольные component tokens, prefixCls и component config пока не поддержаны.
Vendor/divider.css содержит 33 правила из закреплённого архива; рецепт divider
исключает интеграцию ColorPicker и воспроизводится через `npm run antd:css`.

## Flex

```svelte
<Flex gap="small" justify="space-between" wrap>
  <Button>Первое действие</Button>
  <Button>Второе действие</Button>
</Flex>
```

Flex сохраняет один корневой элемент и не оборачивает детей. Children — Snippet;
без содержимого контейнер скрывается CSS-правилом :empty, как в Ant Design.
Orientation=horizontal/vertical имеет приоритет над vertical. В вертикальном
режиме без align используется stretch. Align/justify поддерживают значения,
для которых эталон генерирует классы; остальные CSS-настройки доступны через style.
Wrap принимает boolean или wrap/nowrap/wrap-reverse; false не добавляет класс.

Gap принимает small/medium/middle/large, число в px или CSS-строку, включая
составной row/column gap. Preset-интервалы используют токены padding: 8/16/24px.
Ноль сохраняется. Flex принимает CSS shorthand либо число без единицы.
Числовой и произвольный CSS gap, а также flex имеют приоритет над одноимёнными
декларациями style. Preset gap задаёт CSS-класс, поэтому inline style имеет
приоритет: gap="small" со style="gap:99px" даёт 99px, gap={12} — 12px.
Component выбирает нативный HTML-тег (default=div); bind:nativeElement даёт
текущий HTMLElement и обновляется при смене тега. Class/rootClassName/style,
нативные атрибуты и события передаются корню. Собственные роли, tabindex,
reset шрифта и обработчики клавиатуры не добавляются. RTL меняет визуальное
направление, сохраняя DOM-порядок и нативный Tab.

Галерея — `/ant-design#flex`, отдельная фикстура — `?fixture=flex`.
SSR/Chromium-проверки покрывают структуру, направления, выравнивание, gap/flex,
перенос строк, пустое содержимое, смену тега, события, фокус, темы и RTL.
Рецепт flex воспроизводит 32 правила vendor/flex.css из закреплённого архива.
Пользовательские Svelte-компоненты в component, prefixCls и глобальная
конфигурация flex.vertical/class/style пока не поддержаны.

## Statistic

```svelte
<Statistic title="Баланс" value="123456.789" precision={2} suffix="₽" />
```

Value — число или строка (default=0). Встроенное форматирование повторяет
Ant Design Number.tsx: группа из трёх цифр, groupSeparator="," и decimalSeparator=".".
Precision дополняет нулями или обрезает дробную часть без округления; отрицательная
precision убирает её. Длинные числовые строки не преобразуются в number.
Пустая строка и .5 превращаются в 0 и 0.5; неподдержанная запись, например
"1e6", "-" или "1.", отображается как текст. Числа с JS-научной нотацией также
не разворачиваются. Formatter(value) получает исходный value и возвращает
строку, число или Snippet; его результат заменяет встроенное форматирование.

Title/prefix/suffix принимают string/number/Snippet, null или false. Ноль
отображается, пустые scalar-значения не создают узел. Snippet считается
присутствующим даже при пустом выводе. ValueRender — Snippet<[Snippet]>:
полученный snippet выводит готовый span значения, который можно обернуть.
ClassNames/styles поддерживают root/header/title/content/value/prefix/suffix
и callback ({ props }) с default value/loading/separators. Styles/valueStyle
передаются CSS-строками. Style перекрывает styles.root, styles.content —
deprecated valueStyle. Bind:nativeElement даёт HTMLDivElement.

Loading сохраняет заголовок и заменяет content существующим Skeleton с active
и paragraph=false. Используются его доступный статус и служебные обёртки;
formatter и valueRender скрытого значения не вызываются. Statistic не добавляет
роль, tabindex или live region для обычного значения; их можно задать нативными
атрибутами. В RTL значение остаётся LTR, интервалы prefix/suffix логические.
Темы наследуют цвета; compact меняет title/content с 14/24px на 12/20px.

Пример — `/ant-design#statistic`, фикстура — `?fixture=statistic`. Unit/SSR/Chromium
проверяют форматирование, loading, snippets, semantic styles, темы, RTL и фокус.
Рецепт statistic воспроизводит 14 правил vendor/statistic.css из закреплённого
архива. PrefixCls и глобальный component config пока отсутствуют.

StatisticTimer и StatisticCountdown — отдельные Svelte-экспорты для upstream
Statistic.Timer и deprecated Statistic.Countdown. Timer требует type=countdown/countup;
Countdown фиксирует countdown без deprecation warning в консоли. Остальные props
Statistic, включая loading и semantic slots, передаются показателю, но formatter
и valueRender заменяются встроенным выводом времени, как в upstream.

Value — timestamp в ms либо строка, которую принимает new Date(value).
При пропущенном value отображение использует default=0 самого Statistic,
но callbacks получают NaN от исходной отсутствующей цели, как в upstream.
SSR и первый hydration render выводят `-` без часов и callbacks. После mount
таймер отображает разницу с Date.now(), обновляясь через setInterval(1000/60).
Format по умолчанию HH:mm:ss; Y/M/D/H/m/s/S обозначают фиксированные единицы
365 дней/30 дней/день/час/минута/секунда/ms. Повтор токена дополняет нулями,
текст в квадратных скобках сохраняется буквально. Это формат длительности,
не календарный formatter и не полный API dayjs. Пропущенные крупные единицы
накапливаются в следующей: HH может превышать 24.

Отображаемая разница ограничена нулём, onChange(number) получает исходную
знаковую разницу на каждом тике. Countdown вызывает onFinish один раз на первом
тике строго после цели и останавливается; на точном равенстве времени не завершает
интервал. Countup не вызывает onFinish. При смене value/type интервал перезапускается,
смена format/callbacks не требует перезапуска. Loading скрывает значение, сохраняя
работу таймера. При удалении компонента интервал очищается; поздние callbacks
отменённого или заменённого запуска игнорируются. Невалидная дата сохраняет
поведение upstream (NaN в форматировании/callback, без автоматического завершения).
Bind:nativeElement даёт корневой div Statistic. Фикстура — `?fixture=statistic-timer`.

## Segmented

```svelte
<Segmented options={['День', 'Неделя', 'Месяц']} bind:value={period} />
```

Options — строки/числа или объекты value/label/icon/title/tooltip/disabled/class.
Значения должны быть уникальными; число 0 и строка "0" различаются. Label —
строка, число или Snippet; icon — Snippet. Для icon-only задавайте title либо
aria-label option. Title по умолчанию берётся из scalar label без icon,
как в Ant Design. ClassNames/styles поддерживают root/item/label/icon, объект
либо callback ({ props }); styles — CSS-строки. Style перекрывает styles.root.

Value поддерживает binding, defaultValue читается при создании; без него выбран
первый option, даже disabled. Внешняя смена value не вызывает onChange(value).
Удаление выбранного option не исправляет значение; восстановление option
возвращает checked. Size наследует ConfigProvider, orientation имеет приоритет
над vertical; block и shape=round повторяют оформление эталона. Disabled влияет
на все radio, option.disabled — на один. Как Ant Design 6.6.8, Segmented не
наследует ConfigProvider.componentDisabled; передавайте disabled явно.

Внутри radiogroup — нативные label/input[type=radio]/div label. Name общий
для inputs и уникален между экземплярами по умолчанию. Корень имеет tabindex=0,
если не disabled; native Tab также достигает выбранного radio. Стрелки циклически
выбирают enabled options в порядке массива независимо от RTL и направления.
Смена по стрелке подавляет второе нативное переключение и переводит фокус
на выбранный radio. Bind:nativeElement даёт корневой div.

Сохраняется upstream-контракт FormData: у radio нет value-атрибута, поэтому
выбранный enabled option отправляет "on" под name. Типизированное значение
получайте через binding/onChange. Native reset не меняет модель и не вызывает
onChange; checked после reset приводится к текущему value. Интеграция с FormItem
и сериализация option.value не добавляются скрыто.

Галерея — `/ant-design#segmented`, фикстура — `?fixture=segmented`.
Рецепт segmented воспроизводит 38 правил vendor/segmented.css; цвета адаптированы
к существующим темам, размеры используют токены controls. Изучена зависимость
@rc-component/segmented 1.4.0 (commit 8cbec0b3a0a4097b683a55b39b565ea1e249b47f),
её npm-архив сверяется по опубликованному SHA-512 и хранится только в .upstream.
При смене значения между существующими видимыми options создаётся штатный thumb.
Layout-геометрия labels (offset/client, без повторного применения CSS scale)
измеряется после обновления DOM; Web Animations API перемещает
индикатор с duration/easing токенов. Во время движения сохраняется selected-text,
а обычный selected фон возвращается после завершения. Повторная смена отменяет
предыдущий запуск. ResizeObserver, смена оси/RTL, изменения options и удаление
компонента очищают animation/observer; reduced motion пропускает либо завершает
движение. SSR не создаёт thumb, observers или animations.

Option.tooltip принимает строку либо props существующего Svelte Tooltip без
children. Поддержаны hover/focus/Escape, в том числе для disabled option.
Локальный Tooltip добавляет служебный span с display:contents и native popover;
label остаётся flex-item для block и измерений thumb. Пользовательский tooltip.style
может переопределить display; это меняет компоновку по явному выбору владельца.
PrefixCls и глобальный component config пока отсутствуют.

## Grid: Row, Col и breakpoints

```svelte
<Row gutter={[16, 8]}>
  <Col xs={24} md={12}>Первая колонка</Col>
  <Col xs={24} md={12}>Вторая колонка</Col>
</Row>
```

Row/Col сохраняют нативные div и 24-колоночные CSS-классы Ant Design. Span=0
скрывает колонку, order/offset/push/pull задают порядок и логическое смещение.
Responsive props xs/sm/md/lg/xl/xxl/xxxl принимают число или объект ColSize.
Span в объекте и базовый span также принимают строку; строковый shorthand
breakpoint, например md="12", игнорируется как в реализации Col эталона.
ColSize поддерживает span/order/offset/push/pull/flex, включая нулевые значения
для сброса responsive свойств. Базовые order/offset/push/pull=0 не добавляют класс.

Row.gutter — число в px, CSS-строка, responsive map чисел либо пара [horizontal,
vertical]. Горизонтальный интервал даёт отрицательный margin-inline у Row и
половину padding-inline у Col; вертикальный использует row-gap. Вложенный Row
создаёт независимый контекст. Wrap=false добавляет nowrap; Col с flex также
получает min-width:0. Flex=number даёт n n auto, auto — 1 1 auto, строка с px/em/
rem/% — 0 0 размер, остальные строки передаются как CSS shorthand. Row.style
перекрывает рассчитанные margin/gap, Col.style — padding/flex; responsive flex
CSS-переменные записываются после style, как в upstream.

Align=top/middle/bottom/stretch и justify=start/end/center/space-around/
space-between/space-evenly принимают responsive maps. Breakpoints: xs<576,
sm≥576, md≥768, lg≥992, xl≥1200, xxl≥1600, xxxl≥1920. В CSS Col класс xs —
базовый без media query, а Row выбирает xs-map только при фактическом совпадении
xs. Побеждает наибольший активный breakpoint с заданным значением.

При SSR Row не выбирает responsive align/justify, но gutter при неизвестной
ширине выбирает наибольший заданный breakpoint (поведение useGutter эталона).
После mount media queries обновляют Row; Col адаптируется CSS без JS/hydration.
CreateBreakpoint заменяет React Grid.useBreakpoint явной Svelte-моделью:
`const breakpoint = createBreakpoint();` и
`$effect(() => breakpoint.connect(window));`. Реактивное breakpoint.screens
при SSR равно {}, подключение публикует карту семи MediaQueryList, cleanup
удаляет listeners и игнорирует запоздалые события. Breakpoint.connected сообщает
наличие подключения; повторный connect завершает предыдущее.

Оба компонента поддерживают class/style, нативные атрибуты/события,
bind:nativeElement и RTL без изменения DOM-порядка. Галерея — `/ant-design#grid`,
фикстура — `?fixture=grid`. Рецепт grid извлекает 1043 правила с исходными media
scopes и без keyframes. Unit/SSR/Chromium проверяют gutters, вложенность, ширины,
границы media, нулевые reset-значения, CSS units, RTL и cleanup.
PrefixCls и пользовательские breakpoint/theme tokens пока не поддержаны.

## Layout

Layout, LayoutHeader, LayoutContent, LayoutFooter и LayoutSider соответствуют
Layout и его секциям Header/Content/Footer/Sider. Они сохраняют div/header/main/
footer/aside без дополнительных контейнеров. Children — Snippet, нативные props,
class/rootClassName/style и bind:nativeElement относятся к корню.

Layout.hasSider явно задаёт наличие sidebar; false отключает автоматическое
определение. На клиенте Sider регистрируется в ближайшем Layout; вложенные
Layout независимы. Snippet нельзя проинспектировать как React children до SSR,
поэтому автоматический SSR-ряд определяется CSS :has(> .ant-layout-sider),
а класс ant-layout-has-sider появляется после mount. Для серверного класса
передавайте hasSider=true. Это сохраняет геометрию до hydration и не вызывает
предварительного исполнения children. Явный false отключает CSS fallback.

Sider: width=200, collapsedWidth=80, defaultCollapsed=false, collapsible=false,
theme=dark. Число или числовая строка ширины получают px, другие CSS-строки
сохраняются. Calculated flex/max-width/min-width/width перекрывают style, как
в upstream; semantic styles.root идёт перед style, styles.body — на children.
ClassNames/styles принимают root/body, объект либо callback ({ props }).
Collapsed поддерживает binding; onCollapse(next, source) вызывается при клике
или responsive изменении с source=clickTrigger/responsive. Черновики/DOM children
сохраняются. Trigger — пассивный string/number/Snippet внутри нативной кнопки;
null скрывает кнопку. Для собственного интерактивного trigger используйте null
и внешний control, меняющий bind:collapsed. ReverseArrow меняет стрелку и сторону
zero-width trigger. CollapsedWidth=0 создаёт специальный переключатель; при
нулевой фактической ширине children становятся inert, фокус из них переносится
на trigger либо соседний доступный control. Это Svelte-адаптация доступности;
React Sider не блокирует невидимые focus targets через inert.

Breakpoint подписывает один MediaQueryList, сообщает начальное/изменённое
состояние через onBreakpoint и при необходимости вызывает onCollapse. Listener
очищается при смене breakpoint/unmount, запоздалые события игнорируются.
Порог берётся из Sider.tsx: xs=479.98, sm=575.98, md=767.98, lg=991.98,
xl=1199.98, xxl=1599.98, xxxl=1839.98px. Последнее значение отличается от
таблицы upstream docs (1920); эталоном оставлен код. Ни SSR, ни первый hydration
render не вычисляют media. Ручное раскрытие ниже порога сохраняется до следующего
media change. ComponentDisabled не отключает навигационный trigger.

Темы sidebar light/dark независимы от общей темы; light наследует container/text
токены текущего режима, dark сохраняет #001529. Compact использует меньшие control
tokens. Trigger поддерживает Enter/Space, aria-expanded/controls и locale.layout
expand/collapse, с expandLabel/collapseLabel override. Reduced motion отключает
переходы. Галерея — `/ant-design#layout`, фикстура — `?fixture=layout`; unit/SSR/
Chromium покрывают структуру, SSR без JS, callbacks, размеры, breakpoint/cleanup,
фокус, locale и темы. Рецепт layout извлекает 35 правил, включая Menu-интеграции.
PrefixCls и глобальный component config/tokens пока не поддержаны.

## Descriptions

Descriptions отображает items: массив { key?, label?, children?, span? }.
Label/children/title/extra принимают string, number или Snippet; 0 отображается,
пустые значения не создают соответствующий wrapper. React Descriptions.Item
служит только JSX sugar; в Svelte используется items без предварительного
исполнения snippets. Корень — div, затем view/table/tbody/tr и нативные th/td;
bind:nativeElement возвращает div, нативные attrs передаются корню.

Column — число либо responsive map xs–xxxl; по умолчанию xs=1, sm=2,
md/lg/xl/xxl=3, xxxl=4. Пользовательская map проверяется от большего активного
breakpoint к меньшему; затем используется default map. При SSR screens={}
и column=3; media подключаются после mount и очищаются при unmount.
Span — число, responsive map либо filled. Переполнение ограничивается остатком
строки; последняя ячейка неполной строки растягивается на свободные колонки.
Filled завершает текущую строку и занимает оставшуюся часть. Входные items не
мутируются. Как в upstream, responsive перестройка строк может пересоздать
содержимое ячейки, переместившейся между строками; state таких controls храните
снаружи в модели.

Layout=horizontal по умолчанию; vertical создаёт отдельные строки labels/content.
Bordered=false, colon=true. В horizontal bordered label получает th/span=1,
content — td/span=2*span-1; vertical сохраняет span на обеих строках. Colon
управляет псевдоэлементом label только без рамки. Без явного size/componentSize
используется размер large; medium/middle и small уменьшают отступы, default —
legacy alias без отдельного класса. ComponentDisabled не меняет read-only поля.

ClassNames/styles поддерживают root/header/title/extra/label/content, объект
либо callback ({ props }) с разрешёнными column/items/size. У items есть
class/style, classNames/styles.label/content и legacy labelStyle/contentStyle.
Приоритет label/content: root legacy style → root semantic style → item legacy
style → item semantic style. В bordered эти стили относятся к th/td и перекрывают
item.style; без рамки — к внутренним span. Style корня идёт после styles.root.
Вложенные таблицы сохраняют собственные bordered/size и не получают row-стили
внешней таблицы. Темы/RTL наследуются через ConfigProvider.

Галерея — `/ant-design#descriptions`, фикстура — `?fixture=descriptions`.
Unit/SSR/Chromium проверяют раскладку, media, приоритет стилей и вложенность.
Рецепт descriptions извлекает 40 правил без keyframes, включая две интеграции
Table expanded-row. PrefixCls, произвольные breakpoint/theme tokens и глобальный
component config пока не поддержаны и остаются в полном объёме миграции.

## Card

Card, CardGrid и CardMeta соответствуют Card/Grid/Meta эталона 6.6.8. Слоты
title/extra/cover/actions и Meta.avatar/title/description принимают text/number/
boolean/Snippet; 0 и true считаются присутствующими, но boolean не выводит текст.
Children Card/Grid — Snippet. Все три компонента поддерживают нативные attrs,
class/style и bind:nativeElement; Card дополнительно rootClassName.
Корни остаются div, actions — ul/li/span с равными долями ширины. Интерактивный
контент actions задавайте нативными buttons/links; hoverable не добавляет роль
button или клавиатурную активацию контейнеру.

Пустой Card не создаёт body. Loading заменяет только children на активный
Skeleton без title с четырьмя строками; header/cover/actions остаются. State
заменённого содержимого уничтожается, как в upstream. Если фокус был внутри
body, он паркуется на body (tabindex=-1, aria-busy); unmount передаёт его соседнему
control. Это доступная Svelte-адаптация поверх исходной разметки.

Variant=outlined; variant имеет приоритет над legacy bordered=false. Hoverable
по умолчанию false, type=inner меняет header/body. Small наследуется из явно
заданного ConfigProvider.componentSize; medium/middle/default/large используют
обычную геометрию. Small body/header padding остаётся фиксированным 12px;
остальные размеры/цвета используют theme/compact tokens.
ClassNames/styles Card принимают root/header/body/extra/title/actions/cover,
Meta — root/section/avatar/title/description, объект либо callback ({ props }).
Style корня перекрывает styles.root; styles.header/body перекрывают legacy
headStyle/bodyStyle. Meta root следует тому же приоритету.

CardGrid по умолчанию hoverable=true и width=33.33%; style переопределяет ширину.
Card определяет только прямые Grid внутри body. При SSR CSS :has сохраняет
геометрию до mount, затем direct-child MutationObserver обновляет класс
ant-card-contain-grid; listener очищается, отложенные callbacks игнорируются.
Для точного SSR-класса и начального loading с Grid задавайте containGrid=true;
false отключает auto detection. Это адаптация непрозрачного Snippet вместо
React children inspection. Флаг сохраняется во время загрузки уже показанного
Grid. Meta вне Card не подключает самостоятельные стили, как в upstream.

TabList задаёт заголовки Tabs, а body остаётся children Card; выбор поддерживает
bind:activeTabKey/onTabChange. DefaultActiveTabKey (включая пустую строку) имеет
приоритет над tabProps.defaultActiveKey. Label перекрывает legacy tab, включая
явные null/undefined. Размер вкладок large или small по размеру Card;
tabProps.size переопределяет его. Card переопределяет tabProps items/class/onChange/
tabBarExtraContent; остальные поддерживаемые Tabs props передаются. Верхний
activeTabKey имеет приоритет над tabProps.activeKey. TabBarExtraContent поддерживает
правый слот либо { left, right }. Клавиатура и fallback ключей следуют ранее
согласованному Svelte Tabs; полный React Tabs API пока не перенесён.

Галерея — `/ant-design#card`, фикстура — `?fixture=card`; unit/SSR/Chromium
проверяют стили, слоты, Grid, загрузку/фокус и вкладки. Рецепт card извлекает
59 правил без keyframes. PrefixCls, глобальный variant/component config/tokens
и отсутствующие возможности Tabs остаются в полном объёме миграции.

## Breadcrumb

Breadcrumb использует nav/ol/li и items: { key?, title?, href?, path?, menu? }.
Title/separator/dropdownIcon принимают string/number/boolean/Snippet. Snippet
title должен быть пассивным; для собственных интерактивных элементов используйте
itemRender. Default title=0 отображается как "0", true — как "true" после
строкового преобразования upstream; null/undefined/false/пустая строка пропускают
item без menu. Нативные props, class/rootClassName/style и bind:nativeElement
относятся к nav. Имя landmark задавайте через aria-label/aria-labelledby.

Path удаляет один начальный slash, подставляет каждый params[key] один раз и
добавляет сегмент к предыдущим path: href="#/" + paths.join('/'). Пустые сегменты
сохраняются; URL encoding не выполняется. Path перекрывает href только на самом
item с path; item с одним href не добавляет сегмент. Title подставляет все
совпадения :key, но falsy parameter оставляет исходный текст. Эти особенности
взяты из getPath/getBreadcrumbName 6.6.8. Items имеет приоритет над legacy routes,
включая пустой массив. Routes преобразует breadcrumbName и children в title/menu;
React children sugar Breadcrumb.Item/Separator заменён массивом items.

Separator по умолчанию "/", null также выбирает default, false/"" отключают
автоматический разделитель. { type:'separator', separator? } создаёт отдельный
aria-hidden li, даже при отключённых автоматических разделителях; его default
также "/". Как в исходнике, последний видимый item может сохранить разделитель,
если после него есть пустые items. Последний href не удаляется автоматически.
Aria/data атрибуты item и class передаются default a/span/button. OnClick без
href создаёт нативную кнопку type=button вместо clickable span upstream.

ItemRender — Snippet<[route, params, originalItemsOrRoutes, paths]>, который
полностью задаёт содержимое li. Paths содержит накопленный префикс текущего item.
Шаблон непрозрачен для родителя: пустой Snippet сохраняет li; React callback с
null мог удалить его. В custom menu template задайте свой нативный trigger.
ClassNames/styles поддерживают root/item/separator, объект либо callback ({ props });
style корня перекрывает styles.root, item/separator styles применяются на li.
Item.style в закреплённом BreadcrumbItem.tsx не применяется; сохранено поведение
кода, для стилей элемента используйте styles.item либо itemRender.

Menu.items принимает key/title/label/path/disabled/danger/onClick. Label имеет
приоритет над title; truthy path конкатенируется с разрешённым href родителя без
добавления slash. Raw menu.items.href сам по себе не создаёт ссылку в upstream
и здесь не используется; навигацию задаёт path. DropdownProps передаются текущему
Svelte Dropdown с placement=bottom по умолчанию; dropdownIcon=null/undefined
выбирает стрелку, false скрывает её. Нативные links меню сохраняют href и
поддерживают Enter/Space, callback/preventDefault, typeahead и disabled. Это
адаптация прежнего плоского Dropdown; произвольные React Menu options ещё не
поддержаны. Тема/compact/RTL наследуются через ConfigProvider.

Галерея — `/ant-design#breadcrumb`, фикстура — `?fixture=breadcrumb`.
Unit/SSR/Chromium покрывают маршруты, параметры, разделители, шаблон, стили,
меню, отмену перехода и production hydration. Рецепт breadcrumb извлекает 21
правило без keyframes. PrefixCls и глобальный component config/tokens остаются
в полном объёме миграции.

## Anchor / AnchorLink

`Anchor` содержит `items` с key/href/title/target/class, вложенными children,
replace и targetOffset; title принимает текст, число или Snippet. В horizontal
вложенные items не монтируются. Legacy-композиция использует `AnchorLink` и
children Snippet; массив items имеет приоритет. `items={undefined}` возвращает children
как адаптация optional prop Svelte; пустой массив скрывает children. Ссылки остаются
нативными a: Tab и Enter работают без дополнительного keyboard engine.

```svelte
<Anchor affix={false} showInkInFixed items={[
  { key: 'intro', href: '#intro', title: 'Введение' },
  { key: 'api', href: '#api', title: 'API', targetOffset: 48 }
]} />
```

По умолчанию Affix включён; `affix` принимает false/true или дополнительные
Affix props без offsetTop/target/children. getContainer возвращает окно
(по умолчанию) или HTMLElement и используется для scroll и Affix. `offsetTop`
задаёт закрепление; `targetOffset` переопределяет scroll offset, per-link
`targetOffset` имеет высший приоритет, включая 0. `bounds` по умолчанию 5px.
Выбирается наиболее близкий к границе уже достигнутый раздел; порядок items
не заменяет сравнение координат. Raw fragment после # не декодируется, пробелы
сохраняются; используется исходное регулярное выражение Ant Design.

`onClick(event,{title,href})` вызывается перед scroll. preventDefault отменяет
только изменение URL; выбор и анимация всё равно выполняются как в upstream.
Внутренние href используют history.pushState/replaceState (без :target эффекта),
HTTP(S) сохраняют нативный переход, при replace — location.replace.
Item.replace переопределяет общий replace; legacy AnchorLink принимает свой prop.
`getCurrentAnchor(rawHref)` меняет визуальное выделение; onChange получает
исходный href. Повторная прокрутка с тем же mapped highlight не дублирует callback,
выбор другой raw ссылки сохраняет callback даже при одинаковом highlight.

Прокрутка использует исходную cubic easing длительностью 450ms. Во время
анимации scroll tracking приостановлен; повторный выбор той же ссылки не
перезапускает анимацию, другая ссылка отменяет предыдущую. Удаление компонента
снимает scroll listener и отменяет RAF. SSR не читает getContainer/DOM,
не выбирает active link и не закрепляет контент. Фокус остаётся на ссылке.

`classNames`/`styles` — объект либо функция от {props}, слоты root/item/itemTitle/
indicator. Style корня имеет приоритет над styles.root; class/rootClassName и
bind:nativeElement относятся к wrapper. `showInkInFixed` сохраняет исходный
класс ant-anchor-fixed при false/affix=false. Тема и RTL наследуются; horizontal
indicator использует offsetLeft/clientWidth и раскрывает активную ссылку
в scrollable ancestors как upstream.

Для раскрытия ссылки сохранён framework-independent compute-scroll-into-view
3.0.2 (git 0c45c0afce9650b8cc96dd23ea8efdc90cbd32fe), удовлетворяющий ^3.0.2
делегата scroll-into-view-if-needed 3.1.0 (git
8ac397fc9119014eae13069615b16ef4e45b3d9f). Исходник находится в vendor,
единственное изменение алгоритмического файла — удаление неиспользуемого
catch binding; MIT-лицензии обоих пакетов сохранены рядом. Обёртка ограничена
опциями Anchor (if-needed/nearest и scroll margins); npm-зависимости не добавлены.
Сохранено ограничение делегата 3.0.2: отрицательный scrollLeft RTL-контейнера
не поддерживается при автоматическом раскрытии; нативная ручная прокрутка,
выбор и геометрия indicator доступны.
Глобальные component config/tokens, getTargetContainer и prefixCls ещё не перенесены.

Фикстура — `?fixture=anchor`, пример — `/ant-design#anchor`. Unit/SSR/Chromium
проверяют приоритеты offsets, callbacks/history, анимацию/cleanup, nested/legacy,
RTL/indicator и production hydration. CSS-рецепт anchor содержит 22 правила.

## Affix

`Affix` закрепляет содержимое относительно окна либо DOM-контейнера `target`.
`offsetTop`/`offsetBottom` — числа в px; без обоих используется top=0. При
одновременном выполнении обоих условий приоритет у top. Сравнения координат
округляются как в Ant Design 6.6.8. `onChange(affixed)` вызывается только при
переходе между fixed и обычным потоком, после начального измерения в браузере.

```svelte
<script lang="ts">
  import { Affix, Button } from '$lib/components/ant-design';
  let container = $state<HTMLDivElement>();
</script>
<div bind:this={container} style="height:200px;overflow:auto">
  <Affix target={() => container ?? null} offsetTop={8}>
    <Button>Действие</Button>
  </Affix>
  <div style="height:600px"></div>
</div>
```

`class`/`style` и нативные div-атрибуты относятся к внешнему узлу;
`rootClassName` применяется к внутреннему узлу только при закреплении.
`bind:nativeElement` возвращает внешний div. Через `bind:this` доступны
`updatePosition()` и `updatePosition.cancel()` — отмена очередного принудительного
измерения; scroll-очередь независима. ResizeObserver следит за внешним узлом
и непосредственными DOM-детьми контента. Обработчики слушают фактический target
и снимаются при смене target/удалении; очереди и наблюдатели также очищаются.

SSR не читает target/DOM и оставляет контент в потоке. При закреплении добавляется
пустой aria-hidden placeholder исходных размеров; контент не клонируется и не
перемонтируется, поля сохраняют value, focus и участие в FormData. Affix не
создаёт интерактивной роли и не перехватывает клавиатуру. Типографика, цвета
и RTL наследуются; z-index фиксированного узла берётся из CSS-переменной.

Сохранены ограничения upstream: горизонтальная прокрутка не компенсируется;
при custom target слушается сам контейнер, поэтому перемещение контейнера
внешней прокруткой требует явного updatePosition. Null target или полностью
нулевой скрытый root сохраняют последнее состояние до следующего измерения.
Глобальные affix config, prefixCls и ConfigProvider.getTargetContainer пока
отсутствуют; target задаётся prop. React ref заменён Svelte bind:this,
children — Snippet без React-клонирования.

Фикстура — `?fixture=affix`, пример — `/ant-design#affix`. Engine/DOM-тесты
проверяют округление, очереди, смену target и очистку; SSR/Chromium — нативный
контент, placeholder, размеры, callbacks и hydration. Vendor CSS воспроизводится
рецептом affix (6 правил) из закреплённого архива.

## Space

Space добавляет отдельный div.ant-space-item вокруг каждого элемента, а Flex
сохраняет children без wrappers. Для нескольких элементов используйте items:
readonly-массив string/number/Snippet либо { key, children }. Key сохраняет DOM
и state при перестановке. Children Snippet без items представляет одну группу;
его содержимое нельзя проинспектировать и разделить как React children.
Пустой items имеет приоритет над children и не создаёт root. Непустой массив
из одних пустых значений сохраняет пустой root, как исходник.

Boolean/null/undefined/пустые строки не создают item wrappers, 0 отображается.
Это учитывает React.Children, который нормализует оба boolean в null перед
rc-component/util.toArray. Snippet, ничего не отрисовавший, сохраняет wrapper,
скрытый CSS :empty; как React child component с null, он всё ещё участвует в
расчёте позиции разделителя. Separator ?? split задаёт span между renderable
entries, кроме последнего; falsy separator, включая 0, не создаёт span. Такой
separator не помечается aria-hidden автоматически: Snippet может содержать
собственный содержательный элемент.

Orientation имеет приоритет над явным vertical, затем legacy direction;
по умолчанию horizontal. Align=start/end/center/baseline, horizontal по умолчанию
center, vertical без align использует естественное stretch. Size=small
независимо от ConfigProvider.componentSize. Поддержаны small/medium/middle/large
либо число, tuple [horizontal, vertical]. Числовой 0 не создаёт inline gap,
NaN игнорируется. Wrap добавляет flex-wrap:wrap. Gap/wrap styles идут перед
styles.root и style: пользовательский inline style перекрывает также числовой
gap. Presets используют общие padding tokens, включая compact 4/8/16px.

Root — div с нативными attrs, class/rootClassName/style и bind:nativeElement.
ClassNames/styles root/item/separator принимают объект либо callback ({ props })
с разрешёнными size/orientation/align. Space не сбрасывает typography и наследует
тему/RTL. Галерея — `/ant-design#space`, фикстура — `?fixture=space`. Unit/SSR/
Chromium проверяют gaps, пустые значения, keyed DOM/фокус и production hydration.
Рецепт space извлекает 16 правил без Compact/Addon, reset и keyframes.
PrefixCls и глобальный space component config/tokens остаются в полном объёме
миграции.

### SpaceCompact и SpaceAddon

SpaceCompact соответствует Space.Compact: тот же items/children Snippet API,
один div без дополнительных item wrappers. Каждый item задаёт отдельный context
для первого/последнего элемента и размера. Для нескольких controls используйте
items; один children Snippet представляет одну позицию, как компонент React,
вернувший несколько узлов. Null/undefined/boolean удаляются из позиций, пустая
строка и 0 сохраняются, как rc-component/util.toArray без keepEmpty.

Size=small/medium/middle/large, по умолчанию явно заданный componentSize;
приоритет control.size → Compact.size → ConfigProvider.componentSize. Block
включает width=100% и display=flex, иначе inline-flex. Orientation/vertical/
legacy direction следуют приоритету Space. Нативные attrs, class/rootClassName/
style и bind:nativeElement относятся к root. Подключены Button, Input,
InputNumber и Select. Горизонтальные стыки используют логические углы и
перекрытие на lineWidth; vertical compact-стыки поддержаны для Button, как
в исходнике. Select сохраняет существующий внешний container: его радиусы
наследует внутренняя рамка. Keyed DOM и фокус сохраняются при перестановке.

Вложенный Compact получает крайние flags с учётом положения во внешней группе;
его собственный size снова разрешается из props/ConfigProvider, а не из размера
родительского Compact. Это соответствует Compact.tsx 6.6.8. Контекст остаётся
на Popup triggers, но сбрасывается внутри Modal/Drawer и содержимого Tooltip/
Popover/Dropdown. Общие ConfigProvider/Form contexts при этом не меняются.

SpaceAddon соответствует Space.Addon, использует div и children Snippet.
Variant=outlined/filled/borderless/underlined, default=outlined;
status=error/warning меняет границу/фон/текст. Disabled задаёт только внешний
вид: не наследуется из componentDisabled автоматически и не отключает children.
Размер берётся только из Compact context; вне Compact componentSize не меняет
Addon. Поддержаны нативные attrs, class/style и bind:nativeElement.

Фикстура — `?fixture=space-compact`, пример — `/ant-design#space`. Unit/SSR/
Chromium проверяют размеры, границы/RTL, вложенность, фокус, Popup isolation,
variants/status/disabled и hydration. Рецепты space-compact/space-addon/
input-number-compact извлекают 4/29/8 правил без keyframes. Compact-адаптеры
AutoComplete, Cascader, pickers, TreeSelect и Input.Search остаются до переноса
этих публичных API; отсутствие этих controls отдельно отмечено в реестре.

## InputNumber

InputNumber редактирует `number | null` через `bind:value` и
`onValueChange(value)`. Очистка возвращает null, а `0` остаётся числом.
`defaultValue` фиксируется при создании отдельного control. При использовании
привязки задайте начальное число или null у владельца без defaultValue.

```svelte
<script lang="ts">
  import { InputNumber } from '$lib/components/ant-design';

  let quantity = $state<number | null>(2);
</script>

<label for="quantity">Количество</label>
<InputNumber id="quantity" name="quantity" bind:value={quantity} min={0} max={99} step={1} precision={0} />
```

Компонент хранит редактируемый текст отдельно от числа. Промежуточные `-`,
`1.` и завершающие нули остаются в поле при наборе. Корректное число в пределах
min/max сразу обновляет модель; пустая строка обновляет её на null. Нечисловой
или выходящий за границы черновик не заменяет последнее принятое число.
Поддерживаются знак, десятичная точка и экспонента; запятая не является
десятичным разделителем этой версии. Составной ввод IME публикует число
после compositionend.

Blur и Enter завершают редактирование: числовой черновик ограничивается
min/max и округляется с precision, нечисловой возвращается к последнему числу.
Precision задаёт от 0 до 100 знаков после точки; равные половины округляются
от нуля, например `1.005` с precision=2 становится `1.01`. Округление остаётся
внутри границ. Отображение дополняется нулями до precision. Если диапазон
не содержит числа с указанной precision, значение не меняется. Это обычный
JavaScript number; precision не добавляет произвольную числовую точность.

По умолчанию min/max равны Number.MIN_SAFE_INTEGER/Number.MAX_SAFE_INTEGER,
step равен 1. Дробный положительный step поддерживается без хвостов вроде
`0.30000000000000004` при сложении десятичных шагов. Неположительный или
нечисловой step заменяется на 1, нечисловые границы — на defaults; некорректная
precision игнорируется. При min > max изменение числа блокируется, очистка
остаётся доступной. Внешние value и изменения min/max не вызывают callbacks
и не ограничивают число автоматически. Выход за границы виден в оформлении;
NaN и Infinity отображаются как пустое значение без callback.

ArrowUp/ArrowDown и кнопки меняют число на step, сохраняя фокус в поле.
На границе недоступно движение наружу. `keyboard={false}` отключает стрелки,
`controls={false}` скрывает кнопки; эти настройки независимы. Enter завершает
ввод и сохраняет нативную отправку формы. `onkeydown` вызывается до обработки
клавиш; preventDefault отменяет её. Колесо мыши число не меняет.
`oninput` и остальные нативные события получают DOM-текст; числовое значение
получайте через onValueChange.

Размеры small/middle/large, disabled и направление наследуются из
ConfigProvider. Явные props переопределяют наследование. Readonly задаётся
нативным `readonly`; disabled/readonly блокируют изменение числа и скрывают
кнопки. Status принимает error/warning и наследует ошибку FormItem.
Поддерживаются светлая/тёмная темы, основные цвета, компактный режим, RTL и
prefers-reduced-motion. Кнопки и сообщение нативной проверки локализуются
через `locale.inputNumber`; вложенный провайдер объединяет отдельные подписи.

Поле использует input с role=spinbutton и aria-valuenow/min/max. Доступное имя
задаётся label, FormItem либо aria-label/aria-labelledby; кнопки изменения
не добавляют остановки Tab. Нативные required и проверка числового черновика
работают в обычной HTML-форме. В Form правила модели управляют проверкой,
а FormItem передаёт id, name, required, статус, описание ошибки и blur/touched.
Передавайте `value={form.values.quantity}` и
`onValueChange={(value) => form.setFieldValue('quantity', value)}`.
Required считает `0` заданным значением, min/max сравнивают числа.

С name либо FormItem.name FormData содержит одно поле с канонической строкой
числа, например '1.2' для текста `1.20`, или '' для null. Disabled исключает
поле, readonly сохраняет его. Атрибут form связывает input и скрытое поле
с внешней формой. Нативный reset восстанавливает исходный defaultValue либо
null и обновляет привязку в следующей задаче без callback. Отменённый reset
сохраняет значение; удаление control отменяет ожидающую задачу. Reset модели
Form восстанавливает её initialValues и сбрасывает черновик, даже если число
осталось прежним.

Пример количества, цены и расчёта стоимости доступен на `/ant-design#input-number`.
Реализован вариант outlined с boolean controls. `stringMode`, formatter/parser,
другие варианты оформления, prefix/suffix и изменение колесом пока отсутствуют.

## Slider

Slider выбирает одно число через `bind:value` и `onValueChange(value)`.
`defaultValue` фиксируется при создании отдельного control и по умолчанию
равен 0. При привязке задавайте начальное число у владельца без defaultValue.
Значение Slider всегда числовое; пустое состояние и выбор диапазона в эту
версию не входят.

```svelte
<script lang="ts">
  import { Slider } from '$lib/components/ant-design';

  let volume = $state(40);
</script>

<label for="volume">Громкость</label>
<Slider id="volume" name="volume" bind:value={volume} min={0} max={100} step={5} />
```

Основой служит нативный input[type=range]. Нажатие на дорожку и перетаскивание
мышью или касанием меняют число сразу; выход указателя за границы ограничивает
значение. `onChangeComplete(value)` вызывается один раз после отпускания
указателя или завершения последовательности клавиш, если число изменилось.
Удержание клавиши может вызвать несколько onValueChange, но один
onChangeComplete при отпускании. Действие на уже достигнутой границе не
создаёт callbacks. Нативная пара input/change без pointer/key также
поддерживается. Для числовой модели используйте onValueChange, нативные
события остаются доступны через HTML props.

По умолчанию min=0, max=100, step=1. Число ограничивается границами и
выравнивается по ближайшему шагу от min; равные расстояния округляются
к большему значению. Дробные шаги вычисляются без накопления хвостов вроде
`0.30000000000000004`. Задавайте step так, чтобы он делил max - min.
Если деления нет, последняя достижимая ступень находится ниже max,
как у нативного range. Некорректный step заменяется на 1, нечисловые границы —
на defaults; max < min сворачивается в min. Равные границы дают фиксированное
значение без изменений и callbacks.

Внешние value и изменения границ не вызывают callbacks и не изменяют состояние
владельца. Для отображения и FormData используется нормализованное число.
NaN и Infinity отображаются как min. При пользовательском изменении владелец
получает новое допустимое число.

Стрелки меняют число на один шаг, Home/End выбирают первую/последнюю
достижимую ступень, PageUp/PageDown — два шага. `keyboard={false}` отключает
эти клавиши, сохраняя мышь и касание. Нативный onkeydown вызывается первым;
preventDefault отменяет обработку. PreventDefault в onpointerdown отменяет
начало перетаскивания. Имя задаётся label, FormItem или aria-label/aria-labelledby;
aria-valuetext позволяет описать единицу измерения. Фокус остаётся у input,
а видимый бегунок показывает кольцо клавиатурного фокуса.

Orientation принимает horizontal/vertical. Вертикальному Slider задайте высоту,
например `style="height: 160px"`; min по умолчанию находится снизу. Reverse
меняет направление. В RTL горизонтальный min находится справа; reverse
меняет это правило обратно. Вертикальное направление от RTL не меняется.
Стрелки следуют расположению: вправо двигает бегунок вправо, вверх — вверх;
в горизонтальном режиме вверх увеличивает число. Поддерживаются светлая/тёмная
темы, основные цвета, компактный режим и prefers-reduced-motion.

Disabled наследуется из Form/FormItem и ConfigProvider; disabled=false
переопределяет наследование. Disabled исключает input из Tab и FormData.
Смена владельца, диапазона или направления, отключение, потеря захвата,
blur и удаление control отменяют активное действие без позднего
onChangeComplete. Новое действие работает независимо от отменённого.
Слушатели и ожидающие reset освобождаются при удалении.

Для Form передавайте `value={form.values.volume}` и
`onValueChange={(value) => form.setFieldValue('volume', value)}`.
FormItem передаёт id, name, label, ошибку, описание и blur/touched.
Проверкой числа управляют правила Form: required принимает 0, min/max
сравнивают числа; нативный range всегда имеет значение. При ошибке Form
фокусирует input. Reset модели восстанавливает initialValues и отменяет
незавершённое действие, включая reset к прежнему числу.

Нативная FormData содержит одно поле с числом в строковом виде, включая '0'.
Атрибут form связывает control с внешней формой. Любой reset этой формы
отменяет активное действие. Если reset не отменён через preventDefault,
привязка получает исходный defaultValue с учётом текущих границ и шага
в следующей задаче, без callbacks. Отменённый reset сохраняет текущее число.

Галерея `/ant-design#slider` содержит Slider и InputNumber с одним владельцем
состояния. Числовое поле использует function binding; пустой ввод означает 0
и после blur отображается как 0. Применённая громкость обновляется после
завершения действия. Числовое поле не имеет name, поэтому FormData содержит
громкость один раз. Также показаны ориентация, reverse, disabled, проверка и reset.

Tooltip по умолчанию показывает число при наведении, фокусе и перетаскивании;
подсказка следует за видимым бегунком. `tooltip={{ formatter: (value) => value + '%' }}`
задаёт формат. `tooltip={false}`, `tooltip={{ open: false }}`, formatter=null
или результат formatter=null отключают подсказку и её описание. `open: true`
показывает её постоянно у доступного Slider. Также поддерживаются placement
и arrow. По умолчанию положение top, для вертикального Slider — right, в RTL — left.
Escape скрывает подсказку, сохраняя фокус и число; следующее действие открывает
её снова. Disabled скрывает подсказку. Текст дополняет aria-describedby поля,
сохраняя help/ошибку FormItem. Числовые callbacks от показа подсказки не вызываются.

Реализован один бегунок. Range, marks/dots, перетаскивание диапазона
и динамическое добавление бегунков пока отсутствуют.

## Tooltip

```svelte
<script lang="ts">
  import { Button, Tooltip } from '$lib/components/ant-design';

  let open = $state(false);
</script>

<Tooltip title="Сохранить изменения" bind:open placement="top">
  <Button>Сохранить</Button>
</Tooltip>
```

Title принимает строку, число, пассивный Snippet или null. Snippet рендерится
внутри изолированного popup-контекста; пустоту opaque Snippet компонент не
определяет заранее. Пустая строка, пробелы, undefined и null
отключают показ и связь описания; число 0 отображается. Текст экранируется.
Children — snippet с одним основным DOM-элементом, например Button, Input или
нативной кнопкой. Этот элемент служит anchor и получает aria-describedby.
Wrapper сохраняет обработчики дочернего элемента и не добавляет остановку Tab;
для клавиатурного доступа используйте фокусируемый дочерний элемент.
Hover работает и вокруг disabled Button; disabled ConfigProvider не отключает
объясняющую подсказку.

`bind:open` передаёт видимость владельцу; без привязки компонент хранит её сам.
DefaultOpen задаёт начальное состояние. `onOpenChange(open)` вызывается при
пользовательском открытии/закрытии; внешнее изменение open и начальное состояние
не вызывают callback. Как и другие bindable props модуля, open следует модели
Svelte; для синхронизации владельца используйте bind:open.

Trigger по умолчанию `['hover', 'focus']`; можно выбрать одно событие или
передать пустой массив для программного показа. MouseEnterDelay и mouseLeaveDelay
задаются в секундах, по умолчанию 0.1. Фокус открывает подсказку сразу. Pointer
с типом touch не имитирует hover. На подсказку можно перевести указатель, она
остаётся видимой; клик по ней сохраняет фокус. Escape и нажатие снаружи закрывают
её. После Escape она остаётся скрытой до нового наведения/фокуса. В Modal первый
Escape закрывает Tooltip, следующий — Modal.

Placement принимает top/bottom/left/right; arrow=false скрывает стрелку.
По умолчанию autoAdjustOverflow переворачивает подсказку, если с другой стороны
больше места, и удерживает её в видимой области. False отключает переворот и
сдвиг. Положение обновляется при прокрутке, resize и перемещении anchor, пока
подсказка открыта. Class и style относятся к wrapper.

Поверхность использует нативный `popover="manual"` в верхнем слое браузера,
без переноса DOM в body: overflow контейнера не обрезает её, контекст темы и
модальность dialog сохраняются. Нужен браузер с Popover API, как для фильтров Table.
Скрытый или находящийся за пределами viewport anchor скрывает поверхность;
при возвращении anchor внешний open сохраняется. В SSR поверхность скрыта,
позиционирование и aria-describedby подключаются после гидратации. Добавление
описания сохраняет существующие ID и отслеживает их изменения; cleanup удаляет
только ID Tooltip.

Галерея находится на `/ant-design#tooltip`. Первая версия поддерживает обычный
текст и четыре положения; rich snippets, click/contextMenu, именованные цвета,
corner placements и getPopupContainer пока отсутствуют.

## Popover

```svelte
<script lang="ts">
  import { Button, Popover } from '$lib/components/ant-design';

  let open = $state(false);
</script>

{#snippet content()}
  <p>Настройки сохранены.</p>
  <Button onclick={() => { open = false; }}>Закрыть</Button>
{/snippet}

<Popover title="Настройки" {content} trigger="click" bind:open>
  <Button>Открыть настройки</Button>
</Popover>
```

Title и content принимают строку, число или Svelte snippet; число 0 отображается,
строки экранируются. Children — snippet с одним основным DOM-элементом, например
Button или нативной кнопкой. Он служит anchor и получает aria-haspopup=dialog,
aria-controls и aria-expanded. Для клавиатурного доступа используйте фокусируемый
элемент. Карточка получает role=dialog и имя от title; при отсутствии заголовка
задайте aria-label. Она сохраняет немодальное поведение.

`bind:open`, defaultOpen и `onOpenChange(open)` следуют модели Svelte, как у
Tooltip. DefaultOpen учитывается один раз; внешнее изменение open и начальное
состояние не вызывают callback. Обработчики дочернего элемента сохраняются;
preventDefault в его onclick отменяет открытие по клику.

Trigger по умолчанию `['hover', 'focus']`. Поддерживаются click, hover, focus,
их массив и пустой массив для программного показа. MouseEnterDelay и
mouseLeaveDelay задаются в секундах, по умолчанию 0.1; фокус открывает карточку
сразу. Touch не имитирует hover. Наведение на карточку и фокус внутри неё
сохраняют видимость. При сочетании hover/focus с click первый клик закрепляет
открытую карточку, второй закрывает её.

Открытие кликом, Enter или Space переводит фокус на первый доступный control
в содержимом; для текстовой карточки фокусируется сама поверхность. Открытие
наведением, фокусом или внешним open сохраняет текущий фокус. Tab/Shift+Tab
следуют DOM-порядку между trigger, содержимым и соседними controls. Выход фокуса
за пределы карточки и trigger закрывает её, если нет активного наведения.
Escape закрывает карточку и возвращает фокус из содержимого к trigger;
нажатие снаружи сохраняет фокус на выбранном внешнем элементе. Закрытие через
bind:open возвращает фокус, если он находился внутри карточки.
Function binding может отклонить изменение open; отклонённое закрытие сохраняет
фокус и текущие способы удержания карточки открытой.

Placement принимает top/bottom/left/right, arrow=false скрывает стрелку.
AutoAdjustOverflow по умолчанию переворачивает и сдвигает поверхность у края
viewport; false сохраняет запрошенное положение. Позиция обновляется при
прокрутке, resize, перемещении anchor и изменении размеров содержимого.
Смена положения сохраняет текущий ввод, выделение и фокус. Class и style
относятся к wrapper. Поддерживаются темы ConfigProvider, compact, RTL и
prefers-reduced-motion.
PopupClass относится к самой поверхности. Aria-labelledby, aria-describedby
и aria-busy позволяют связать её с содержимым составного компонента;
aria-label имеет приоритет при выборе имени.

Popover использует нативный `popover="manual"` и требует Popover API.
Поверхность остаётся в исходном DOM-поддереве и показывается в верхнем слое:
overflow контейнера не обрезает её, темы и работа внутри Modal сохраняются.
Вложенный Tooltip обрабатывает Escape первым; затем закрывается Popover,
следующим Escape — Modal. Существующий aria-describedby trigger сохраняется.
Aria-controls объединяется с имеющимися ID; при отключении карточки её ID
удаляется, а aria-haspopup/aria-expanded восстанавливаются с учётом изменений
владельца. Позиционирование и связь с trigger подключаются после гидратации;
в SSR поверхность скрыта.

Пустые title и content отключают показ и ARIA-связь. Если один из них является
snippet, компонент считает содержимое доступным; условное отсутствие текста
внутри snippet контролирует его владелец. Закрытое содержимое остаётся
смонтированным и сохраняет состояние. Отложенные открытия отменяются при
удалении компонента, очистке содержимого и замене trigger.

Галерея `/ant-design#popover` содержит редактор профиля и информационную
карточку с кнопкой. Первая версия ограничена четырьмя положениями;
contextMenu, corner placements, destroyOnHidden, getPopupContainer и
произвольные цветовые варианты пока отсутствуют.

## Popconfirm

```svelte
<script lang="ts">
  import { Button, Popconfirm } from '$lib/components/ant-design';

  let open = $state(false);

  async function remove() {
    // Здесь владелец выполняет запрос и обновляет данные после успеха.
  }
</script>

<Popconfirm
  title="Удалить запись?"
  description="Запись исчезнет из списка."
  bind:open
  okText="Удалить"
  okButtonProps={{ danger: true }}
  onConfirm={remove}
>
  <Button danger>Удалить</Button>
</Popconfirm>
```

Title обязателен; title и description принимают строку, число или Svelte
snippet. Число 0 отображается, строки экранируются. Пустая строка title отключает
карточку; snippet должен содержать доступный заголовок. Icon — декоративный snippet;
по умолчанию показан знак предупреждения,
icon=null скрывает его. Children содержит один основной DOM-элемент, обычно
Button. Его атрибуты и обработчики сохраняются.

Popover обеспечивает открытие кликом, Enter/Space нативной кнопки, четыре
положения top/bottom/left/right, arrow и autoAdjustOverflow. В содержимом
сначала находится отмена, затем подтверждение; showCancel=false скрывает
отмену. При открытии фокусируется первый доступный control, для обычного
описания — кнопка отмены. Tab следует естественному порядку, Escape закрывает
карточку и возвращает фокус. Поддерживаются Modal, вложенный Tooltip, темы,
compact, RTL и prefers-reduced-motion. Требуется нативный Popover API.

`bind:open`, defaultOpen и `onOpenChange(open)` следуют модели Svelte.
DefaultOpen учитывается один раз; внешние изменения open не вызывают
onOpenChange. `onConfirm(event)` вызывается только кнопкой подтверждения.
Синхронное завершение и успешный Promise закрывают карточку; без onConfirm
подтверждение просто закрывает её. `onCancel(event)` вызывается только кнопкой
отмены. Escape, клик снаружи и повторный клик trigger меняют видимость через
onOpenChange и не вызывают onCancel.

Во время Promise подтверждение показывает loading, обе кнопки отключены;
повторный запуск, Escape, клик снаружи, повторный клик trigger и уход фокуса
не закрывают карточку. Внешнее open остаётся под контролем владельца.
Закрытие, повторное открытие, disabled и удаление компонента делают старый
результат неактуальным: он не закрывает новую карточку, не сбрасывает её
loading и не вызывает onError. Эта защита относится к состоянию Popconfirm;
отменой запроса и изменениями данных управляет владелец onConfirm.

Синхронный throw и отклонение Promise оставляют карточку открытой и показывают
безопасное сообщение с role=alert. `onError(error)` получает исходную ошибку
как unknown; её технический текст автоматически не выводится. Повторная
попытка очищает сообщение. Кнопки используют okText/cancelText или
locale.okText/cancelText; сообщение ошибки задаётся locale.confirmErrorText.
Поддерживаются ruRU и enUS, а частичная locale наследуется из ConfigProvider.

OkType задаёт тип подтверждения; okButtonProps/cancelButtonProps настраивают
размер, danger, disabled, атрибуты и события кнопок. Их onclick вызывается перед
внутренним действием: preventDefault отменяет подтверждение или отмену.
HtmlType всегда button, loading управляется Popconfirm. Disabled наследуется
из Form и ConfigProvider; disabled=false переопределяет наследование.
Disabled скрывает карточку и блокирует её действия, сохраняя open владельца;
исходный trigger не заменяется и сам по себе не отключается этим prop.

Карточка получает role=dialog, имя от title и описание от description.
Trigger сохраняет существующий aria-describedby и связан с карточкой через
aria-controls/aria-expanded. Во время ожидания выставляется aria-busy;
фокус из отключаемых кнопок сохраняется на содержимом. Class/style относятся
к wrapper trigger, как у Popover. Содержимое закрытой карточки остаётся
смонтированным, состояние ошибки сбрасывается для нового открытия.

Галерея `/ant-design#popconfirm` показывает удаление строки Table с задержкой,
отменой, ошибкой и повтором. После удаления trigger фокус переходит к кнопке
восстановления записей. Пример освобождает ожидающие таймеры при удалении.
Первая версия поддерживает открытие по клику и четыре положения;
hover/contextMenu, corner placements и getPopupContainer пока отсутствуют.

## Menu

Первый этап следует Ant Design 6.6.8 и @rc-component/menu 1.5.0
(диапазон upstream ~1.5.0). React/rc-menu runtime не устанавливается;
[MIT-лицензия rc-menu](./vendor/LICENSE.rc-menu) сохранена в пакете.

```svelte
<script lang="ts">
  import { Menu, type MenuItemType } from '$lib/components/ant-design';
  let selected = $state<string[]>(['overview']);
  let opened = $state<string[]>(['guides']);
  const items: MenuItemType[] = [
    { key: 'overview', label: overview },
    { key: 'guides', label: 'Руководства', children: [
      { key: 'setup', label: 'Подключение' },
      { key: 'forms', label: 'Формы' }
    ] }
  ];
</script>

{#snippet overview()}<a href="/overview">Обзор</a>{/snippet}
<Menu {items} mode="inline" selectedKeys={selected} openKeys={opened}
  onSelect={info => { selected = info.selectedKeys; }}
  onDeselect={info => { selected = info.selectedKeys; }}
  onOpenChange={keys => { opened = keys; }} aria-label="Навигация" />
```

Items принимает MenuItemType: обычный пункт, подменю с children,
`type='group'` с label/children, `type='divider'` с dashed либо null.
У пунктов и подменю обязательны стабильные key. Числовой key нормализуется в
строку для selection/open/events; исходное значение остаётся в itemData.
Label и extra пункта — string/number/Snippet, icon — Snippet. Поддержаны
item.disabled/danger/title, class/style; у подменю также theme/popupClassName
и onTitleClick. Группы не добавляют уровень отступа и не входят в keyPath.

SelectedKeys/openKeys задают controlled state; defaultSelectedKeys/defaultOpenKeys
читаются при создании для uncontrolled state. По умолчанию выбран один пункт,
selectable=true, multiple=false. OnClick пункта, его подменю от ближайшего к корню
и Menu вызываются до onSelect/onDeselect. Info содержит key, keyPath от листа
к корню, domEvent и itemData — поверхностную копию исходного пункта. Select info
добавляет selectedKeys. Устаревший React instance info.item отсутствует.
Повторная активация выбранного single-пункта сохраняет `[key]`, но вызывает
onDeselect: это поведение rc-menu 1.5.0. В multiple выбранный key удаляется.
Selectable=false сохраняет onClick и закрытие popup без изменения selection.

Mode по умолчанию vertical; поддержаны horizontal и inline. Hover открывает
popup-подменю; triggerSubMenuAction='click' переключает их по клику. Inline
раскрывается по клику независимо от этого prop. SubMenuOpenDelay и
subMenuCloseDelay — секунды, обе задержки по умолчанию 0.1, как runtime rc-menu
1.5.0 (таблица Ant Design указывает open delay=0). OnTitleClick относится к
клику заголовка; keyboard opening меняет openKeys без этого callback.
Single selection закрывает все popup-подменю, multiple сохраняет их.
Закрытие inline-подменю сохраняет descendant openKeys; закрытие popup удаляет их.

InlineIndent по умолчанию 24 px. InlineCollapsed переводит inline в vertical;
при отсутствии prop учитывается LayoutSider.collapsed. Возврат в inline
восстанавливает кэш uncontrolled openKeys. Controlled openKeys остаются у владельца:
если он принял `[]` при сворачивании, компонент не заменяет этот массив кэшем.
Первый уровень без icon сокращается до первого символа; доступное имя и native
подсказка title сохраняют текст. Полный Tooltip API для collapsed items пока отсутствует.

Закрытые подменю монтируются при первом открытии; forceSubMenuRender монтирует
их заранее. Inline скрывает сохранённый DOM через hidden, popup использует native
popover и общий механизм позиционирования. Боковое подменю выравнивается по верху
заголовка, horizontal popup — по нижнему левому краю, в RTL по правому; поверхность
переворачивается/сдвигается в пределах viewport. Outside click закрывает её;
Escape внутри popup закрывает текущий уровень и возвращает фокус к родителю.
Таймеры, listeners и animation frames очищаются при unmount.

Структура — ul/li с role=menu/menuitem/group/separator. Заголовки подменю используют
native button, a[href] в label остаётся настоящей ссылкой. Menu не перехватывает
переход, модификаторы, target/rel; native Enter на ссылке запускает callback
один раз через click вместо дублирования legacy React keydown/click.
Inline Up/Down обходят все видимые доступные пункты, Enter переключает подменю.
Horizontal Left/Right меняют пункты первого уровня с учётом RTL, Down/Enter входят
в popup. В popup Up/Down обходят текущий уровень, Left/Right входят/возвращаются
с учётом RTL. Home/End переходят к границам текущего списка; в inline — всего
видимого дерева. Disabled пропускается. Space не активирует пункты/подменю, как
upstream. Ref.focus(options) предпочитает ссылку в пункте; findItem({key}) возвращает
смонтированный элемент пункта/заголовка, bind:nativeElement — корневой ul.

Theme='light' по умолчанию независимо от алгоритма страницы; theme='dark' задаёт
тёмную палитру Menu с фоном #001529. Глобальные primary/compact/RTL наследуются.
Как Ant wrapper, Menu учитывает только свой disabled и disabled пунктов:
Form.disabled и ConfigProvider.componentDisabled не отключают навигацию.
Галерея — `/ant-design#menu`, изолированная фикстура — `?fixture=menu`.

Первый этап не включает responsive horizontal overflow/overflowedIndicator,
исходные popup/collapse motion, controlled activeKey/defaultActiveFirst,
component config/tokens, semantic classNames/styles, prefixCls, render hooks,
getPopupContainer/placements/offset и overrides expandIcon/itemIcon. Legacy
Menu.Item/SubMenu/ItemGroup/Divider children wrappers отсутствуют; данные задаются
items. Standalone Menu пока не расширяет существующий контракт Dropdown.

## Dropdown

```svelte
<script lang="ts">
  import { Button, Dropdown } from '$lib/components/ant-design';

  let open = $state(false);
  let lastAction = $state('');
</script>

<Dropdown
  bind:open
  trigger={['click']}
  menu={{
    items: [
      { key: 'details', label: 'Открыть карточку' },
      { key: 'export', label: 'Экспорт', disabled: true },
      { key: 'divider', type: 'divider' },
      { key: 'archive', label: 'В архив', danger: true }
    ],
    onClick: ({ key }) => { lastAction = key; }
  }}
>
  <Button>Действия</Button>
</Dropdown>
<output>{lastAction}</output>
```

`menu.items` принимает readonly-массив DropdownItem. Команда имеет строковый key,
label (строку или пассивный Snippet), необязательные icon, textValue, disabled,
danger и onClick. Разделитель имеет `{ key, type: 'divider' }`. Пустой строковый
ключ допустим; при повторении ключа используется первое вхождение. Icon декоративный.
Для snippet со сложным или нетекстовым содержимым задайте textValue: он служит
доступным именем команды и текстом поиска. В label не следует вкладывать кнопки,
ссылки и поля ввода. Пустой список показывает ConfigProvider.locale.emptyText.

Для навигации item поддерживает href/target/rel: вместо button создаётся a с
role=menuitem. Это Svelte-адаптация link label исходного Menu без вложения ссылки
в кнопку. Disabled link не получает href и имеет aria-disabled=true. Enter и
Space активируют его; preventDefault в callbacks отменяет и нативный переход,
и закрытие меню. Без href сохраняется прежняя нативная кнопка команды.

Open поддерживает bind:open; defaultOpen читается при создании компонента.
`onOpenChange(boolean)` сообщает запросы видимости от trigger, hover, Escape,
Tab и клика снаружи. Изменение open владельцем и закрытие из-за disabled
не вызывают callback. Как в Ant Design, выбор команды закрывает меню и обновляет
binding **без onOpenChange(false)**; для команды используйте menu.onClick.
Сначала вызывается onClick пункта, затем menu.onClick; оба получают
`{ key, domEvent: MouseEvent }`. PreventDefault в пункте отменяет следующий
обработчик и закрытие, в menu.onClick — закрытие. Асинхронные операции и их ошибки
обрабатывает владелец; Dropdown не показывает loading и не ожидает Promise.

По умолчанию trigger равен `['hover']`; допустимы `'hover'`, `'click'`, их массив
и `[]` для внешнего управления. MouseEnterDelay/MouseLeaveDelay задаются в
секундах, по умолчанию 0.1. Hover не перемещает фокус; click, Enter, Space и
ArrowDown фокусируют первую доступную команду, ArrowUp — последнюю. Стрелки
обходят команды по кругу, Home/End выбирают крайние, ввод букв ищет по префиксу.
Повтор буквы перебирает совпадения; пауза в секунду начинает новый поиск.
Disabled-пункты и разделители пропускаются. Если доступных команд нет, фокус
получает сам menu. Tab/ShiftTab закрывают меню и продолжают нативный порядок.
Escape и выбор команды возвращают фокус к trigger, если он оставался в меню.
При удалении trigger после действия новый фокус назначает владелец.

В children передавайте один нативный focusable control, обычно Button.
Dropdown связывает первый дочерний элемент с menu через aria-haspopup="menu",
aria-controls и aria-expanded, сохраняя исходные ARIA-атрибуты владельца.
`aria-label` именует меню; по умолчанию имя берётся от trigger. Class/style
относятся к wrapper trigger. Disabled наследуется от Form/ConfigProvider;
явное false переопределяет контекст. Нативный disabled trigger также не открывает меню.

Placement: top, topLeft, topRight, bottom, bottomLeft, bottomRight. По умолчанию
bottomLeft, в RTL — bottomRight. AutoAdjustOverflow по умолчанию true:
меню переворачивается и сдвигается в границах окна; false сохраняет запрошенное
положение. Минимальная ширина соответствует trigger, длинный список прокручивается.
Arrow по умолчанию false. Поверхность использует native popover, сохраняет
контекст темы и работает внутри Modal; закрытое меню остаётся смонтированным.

Галерея `/ant-design#dropdown` показывает действия строки Table: открытие Modal,
копирование и архивирование участника. Первая версия ограничена плоскими командами:
интеграция standalone Menu, подменю, selectable/checkable items, contextMenu,
Dropdown.Button, href, popupRender и getPopupContainer пока отсутствуют.

## Tabs

```svelte
<script lang="ts">
  import { Input, Tabs } from '$lib/components/ant-design';

  let activeKey = $state<string | undefined>('profile');
</script>

{#snippet profile()}
  <label>Имя<Input defaultValue="Анна" /></label>
{/snippet}
{#snippet history()}<p>Последние изменения профиля.</p>{/snippet}

<Tabs
  aria-label="Разделы участника"
  bind:activeKey
  items={[
    { key: 'profile', label: 'Профиль', children: profile },
    { key: 'access', label: 'Доступ', disabled: true },
    { key: 'history', label: 'История', children: history }
  ]}
/>
```

`items` принимает readonly-массив TabsItem: строковый key, label (строку, число,
boolean/null или пассивный Snippet), необязательные children (Snippet), icon, disabled,
forceRender и destroyOnHidden. Ключи идентифицируют панели при перестановке;
содержимое и его фокус сохраняются.
Пустой строковый ключ допустим; при повторении используется первое вхождение.
Icon декоративный. Label должен давать вкладке доступное имя; интерактивные
элементы внутри label не поддерживаются. `aria-label` или `aria-labelledby`
именует список вкладок. Id/class/style относятся к корневому контейнеру.

`bind:activeKey` хранит выбранный ключ. DefaultActiveKey читается при создании;
без ключа выбирается первая доступная вкладка. Для binding задавайте начальное
значение у владельца без defaultActiveKey. При неизвестном, удалённом или
отключённом ключе отображается первая доступная панель. Внешнее значение при
этом сохраняется: его восстановление снова выберет соответствующую вкладку.
Если доступных вкладок нет, ни одна панель не выбрана, а фокус может получить
сам tablist. Пустой items показывает ConfigProvider.locale.emptyText.

`onTabClick(key, MouseEvent)` вызывается и по клику, и при нативной активации
Enter/Space, включая уже выбранную вкладку. PreventDefault отменяет смену
панели. Затем обновляется binding и вызывается onChange(key), если выбранная
вкладка действительно изменилась. Обновления владельцем, изменение defaults,
fallback при удалении/disabled и перемещение фокуса не вызывают onChange.
После onTabClick доступность пункта проверяется повторно: обработчик может
удалить или отключить вкладку.

Клавиатура использует ручную активацию. Стрелки перемещают фокус по кругу,
пропуская disabled; Home/End выбирают первый/последний доступный заголовок.
В горизонтальном списке действуют Left/Right с учётом RTL, в вертикальном —
Up/Down. Enter и Space активируют сфокусированную вкладку. Список добавляет
одну остановку Tab; после выхода повторный вход возвращает фокус к выбранной
вкладке. Tab из списка переходит к именованной активной панели, затем к её
полям и кнопкам. При скрытии сфокусированной панели или удалении/disabled
сфокусированного заголовка фокус переходит на доступный заголовок либо tablist.
Изменения при фокусе снаружи Tabs не перемещают его внутрь.

Содержимое ленивое: впервые монтируется при активации и по умолчанию сохраняется
в скрытой панели, включая локальный state дочерних компонентов и DOM-черновики.
DestroyOnHidden=true удаляет содержимое при скрытии; следующий визит создаёт
новый экземпляр. После уничтожения отключение destroyOnHidden само по себе
не монтирует панель заново. Значение на отдельном item переопределяет общее,
включая явное false. ForceRender=true монтирует содержимое сразу и сохраняет
его даже вместе с destroyOnHidden. Удаление key всегда уничтожает панель.
Состояние, которое владелец хранит снаружи Tabs, уничтожение панели не сбрасывает.

Сохранённая скрытая панель остаётся в DOM; её таймеры и подписки продолжают
работать. Поля посещённых/forceRender-панелей участвуют в нативной FormData,
даже когда скрыты; ещё не смонтированных или уничтоженных полей в FormData нет.
Tabs не является полем формы и не наследует disabled от Form/ConfigProvider:
доступность навигации задаётся disabled отдельных items. Заголовки используют
button type=button и не отправляют окружающую форму.

Type поддерживает line и card, tabPlacement — top, bottom, start, end.
Start/end разрешаются относительно RTL. На экране шириной до 575px вертикальный
список переходит наверх. Переполнение прокручивается; навигация показывает
сфокусированный заголовок без прокрутки всей страницы. Size использует общий
ComponentSize: small/middle/large, по умолчанию ConfigProvider.componentSize.
Тема, compact, RTL и reduced motion применяются через существующие токены.

TabBarExtraContent задаёт правый слот либо { left, right }: string/number/boolean/
Snippet. Слоты находятся вне tablist и допускают нативные интерактивные controls;
они не участвуют в навигации стрелками. Как @rc-component/tabs 1.13.0, falsy extra
(включая 0) не создаёт wrapper; числовой label=0 при этом отображается.

Галерея `/ant-design#tabs` показывает профиль, настройки, историю Table,
сохранение черновиков, destroyOnHidden и Tabs внутри Modal. Первая версия
не поддерживает editable-card, добавление/закрытие пользователем, drag-and-drop,
меню переполнения more, renderTabBar и настройку indicator.

## Collapse

```svelte
<script lang="ts">
  import { Collapse, Input, type CollapseActiveKey } from '$lib/components/ant-design';

  let activeKey = $state<CollapseActiveKey>(['contacts']);
</script>

{#snippet contacts()}<label>Имя<Input defaultValue="Анна" /></label>{/snippet}
{#snippet preferences()}<p>Настройки участника.</p>{/snippet}

<Collapse
  aria-label="Анкета участника"
  bind:activeKey
  items={[
    { key: 'contacts', label: 'Контакты', children: contacts },
    { key: 'preferences', label: 'Настройки', children: preferences }
  ]}
/>
```

`items` принимает readonly-массив CollapseItem: строковый key, label (строку или
пассивный Snippet), необязательные children и extra (Snippet), collapsible,
showArrow, forceRender и destroyOnHidden. Пустой ключ допустим; при повторении
используется первое вхождение. Ключ сохраняет экземпляр панели и фокус при
перестановке. Интерактивные элементы размещаются в extra или children; label
должен давать кнопке доступное имя и не содержать других controls.
Extra находится рядом с заголовком, вне кнопки раскрытия: его действия не
переключают панель. Id/class/style относятся к корневому контейнеру;
aria-label или aria-labelledby именует группу.

`bind:activeKey` принимает строку или readonly-массив строк. Активация пользователем
сначала записывает в binding новый массив, затем вызывает onChange с отдельным
массивом; изменение массива callback не меняет значение владельца. Ключи
дедуплицируются с сохранением порядка активации. DefaultActiveKey читается при
создании; без начального значения все панели закрыты, в том числе в accordion.
Для binding задавайте начальное значение у владельца без defaultActiveKey.
Внешние изменения, defaults и переключение accordion не вызывают onChange.

Без accordion можно открыть несколько панелей. В accordion отображается только
первый запрошенный ключ; повторная активация закрывает его. Неизвестные ключи
сохраняются без подстановки другой панели и без перезаписи владельца. Отключение
accordion снова показывает остальные запрошенные панели. Удаление item не
удаляет его ключ из значения владельца. Пустой items показывает locale.emptyText.

Collapsible поддерживает header (вся кнопка заголовка), icon (только стрелка
для указателя) и disabled. Enter/Space активируют нативную кнопку и в режиме
icon. Значение item переопределяет общее, включая header поверх disabled.
ShowArrow=false скрывает стрелку; вместе с icon используется header, чтобы
сохранить доступную зону активации. Disabled запрещает переключение пользователем,
но не скрывает панель, открываемую владельцем. Collapse не наследует disabled
от Form/ConfigProvider; поля внутри получают собственный контекст.

Каждый заголовок содержит button type=button внутри heading. HeadingLevel
задаёт уровень 2–6 (по умолчанию 3); вложенному Collapse задавайте следующий
уровень. Aria-expanded/aria-controls связывают кнопку с содержимым. В accordion
и группах до шести items панели получают именованный role=region; в больших
группах без accordion лишние landmarks не создаются. Все доступные заголовки,
extra и поля обходятся обычным Tab; стрелки не перехватываются. Escape остаётся
содержащему Modal. При скрытии сфокусированного содержимого фокус возвращается
к его доступному заголовку. При удалении/disabled заголовка выбирается открытый
доступный заголовок, затем первый доступный либо сама группа. Изменения при
фокусе снаружи Collapse не перемещают его внутрь.

Содержимое впервые монтируется при открытии и по умолчанию сохраняет локальный
state и DOM-черновики в скрытой панели. DestroyOnHidden=true удаляет содержимое
при закрытии; отключение этой настройки не монтирует уже уничтоженную панель.
Значение item переопределяет общее, включая false. ForceRender=true монтирует
содержимое сразу и сохраняет его даже с destroyOnHidden. Удаление key уничтожает
панель; состояние вне неё сохраняется. Скрытые сохранённые панели остаются в DOM,
их таймеры и подписки продолжают работать. Поля посещённых/forceRender-панелей
участвуют в FormData даже при скрытии; ещё не смонтированных или уничтоженных
полей в FormData нет. Перед фокусом ошибки скрытой панели владелец формы должен
открыть её. Кнопки заголовков не отправляют окружающую форму.

Size использует small/middle/large и ConfigProvider.componentSize. Bordered=false
убирает внешнюю рамку, ghost — фон и разделители. ExpandIconPlacement задаёт
start/end относительно кнопки заголовка и направления RTL; extra остаётся
отдельным элементом после заголовка. Темы, compact и reduced motion используют
существующие токены. Высота содержимого меняется сразу; анимируется только
стрелка, с учётом reduced motion.

Галерея `/ant-design#collapse` показывает анкету, вложенные панели, сохранение
черновиков, destroyOnHidden и независимую кнопку сброса в extra. Сброс примера
пересоздаёт поля с исходными значениями, сохраняя открытые внешние панели.
Первая версия не поддерживает legacy Collapse.Panel, пользовательский expandIcon,
classNames/styles и React-анимацию высоты.

## Drawer

```svelte
<script lang="ts">
  import { Button, Drawer, Input } from '$lib/components/ant-design';

  let open = $state(false);
</script>

{#snippet footer()}<Button onclick={() => { open = false; }}>Закрыть</Button>{/snippet}

<Button onclick={() => { open = true; }}>Редактировать</Button>
<Drawer bind:open title="Карточка участника" {footer}>
  <label>Имя<Input defaultValue="Анна" /></label>
</Drawer>
```

Drawer v1 — модальная панель на нативном dialog. `bind:open` передаёт запрос
видимости владельцу; без binding компонент может закрываться самостоятельно.
Начальное open=true подготавливает содержимое в SSR и открывает настоящий
модальный dialog после гидратации. Атрибут open не выводится в SSR, чтобы
избежать промежуточного немодального окна.

Title принимает строку или пассивный Snippet, children/extra/footer — Snippet.
Заголовок использует h2; интерактивные действия размещайте в extra/footer.
Без footer нижняя область отсутствует. Без title именуйте dialog через
aria-label или aria-labelledby. Внешнее aria-labelledby имеет приоритет;
aria-label заменяет автоматически созданную связь с визуальным title.
Aria-describedby связывает внешнее описание. Id/class/style относятся к
корневому dialog; дополнительные semantic classNames/styles не поддерживаются.

Placement — физическая сторона top/right/bottom/left, по умолчанию right.
RTL меняет направление содержимого, сохраняя выбранную сторону. Size задаёт
ширину для left/right и высоту для top/bottom: default=378px, large=736px,
положительное число в px или корректную CSS-длину, например 50% или 30rem.
Размер ограничен viewport; пустая строка и неположительное/нефинитное число
используют default. Header и footer остаются на месте, длинное body прокручивается.

Closable=false убирает кнопку закрытия. Keyboard=false отключает закрытие по
Escape. Mask принимает объект с closable (по умолчанию true) и blur (false).
Закрытие по фону требует начала и конца основного pointer-действия на фоне;
перетаскивание из панели или в панель не закрывает её. Маска всегда включена,
фон страницы остаётся inert. Drawer не наследует disabled от Form/ConfigProvider;
его поля и пользовательские кнопки получают собственный контекст.

Пользовательское закрытие сначала записывает open=false в binding, затем
вызывает onClose(Event) один раз: click для кнопки, cancel для Escape,
pointerup для фона. Callback уведомляет о запросе и не отменяет его.
Изменение open владельцем, нативный dialog.close() и удаление компонента
не вызывают onClose. Нативное закрытие синхронизирует binding; позднее событие
старого закрытия не закрывает заново открытый dialog.

При открытии фокус получает первый доступный control; без controls — сам
dialog. Нативная модальность удерживает фон inert и ограничивает Tab;
после закрытия фокус возвращается к доступному opener. Select, Tooltip и
Popover потребляют свой Escape раньше Drawer. Поддерживается стек с Modal
и другими модальными Drawer без push. Прокрутка страницы заблокирована,
пока остаётся открытый модальный Drawer или Modal.

Содержимое ленивое и после первого открытия сохраняет локальный state и
DOM-черновики в закрытом dialog. ForceRender монтирует его сразу и сохраняет
даже при destroyOnHidden. DestroyOnHidden удаляет header/body/footer после
завершения ухода панели; отключение настройки не монтирует уничтоженное
содержимое заново. Удаление Drawer уничтожает его содержимое и освобождает
модальность. Состояние, хранимое снаружи, не сбрасывается.
Сохранённые скрытые поля остаются в DOM и нативной FormData своей формы;
их таймеры и подписки продолжают работать. Для фокуса ошибки закрытую панель
сначала должен открыть владелец формы.

Панель выдвигается от выбранной стороны, маска меняет прозрачность.
При запросе закрытия dialog сохраняет модальность до завершения анимации.
Повторное открытие прерывает уход без уничтожения черновика. Reduced motion
отключает анимацию; изменение этой настройки завершает текущую анимацию.
Темы и compact используют существующие глобальные токены Ant Design.

Галерея `/ant-design#drawer` редактирует строку Table через Form с валидацией,
Tabs и Collapse. Черновик сохраняется при закрытии той же карточки; переход
к другому участнику создаёт отдельный редактор. DestroyOnHidden пересоздаёт
редактор из сохранённой строки. Сохранение обновляет Table и закрывает панель.
Первая версия не поддерживает немодальный режим, mask=false, resizable, push,
getContainer/порталы, loading/Skeleton, focusable и afterOpenChange.

## Alert

```svelte
<script lang="ts">
  import { Alert, Button } from '$lib/components/ant-design';

  let revision = $state(0);
</script>

{#key revision}
  <Alert
    type="warning"
    title="Есть несохранённые изменения"
    description="Сохраните настройки перед выходом."
    showIcon
    closable
  />
{/key}
<Button onclick={() => { revision++; }}>Показать сообщение снова</Button>
```

Type поддерживает success/info/warning/error, по умолчанию info. Variant —
outlined или filled; filled сохраняет фон статуса и убирает видимую рамку.
Banner убирает рамку и скругления; без явно заданных type/showIcon использует
warning и видимую иконку. В обычном режиме showIcon=false.

Title и description принимают строку или Snippet, icon/action — Snippet.
Пустые строки title/description не создают соответствующую область. Snippet
считается присутствующим; условное отсутствие содержимого выражайте через
undefined у владельца. Description включает увеличенные отступы и иконку.
Icon декоративный и отображается только при showIcon, включая пользовательский
snippet. Для интерактивных controls используйте description/action;
icon и closable.closeIcon не должны содержать интерактивных элементов.
Действия не закрывают Alert и не вызывают callbacks закрытия.

Closable=false по умолчанию. True добавляет нативную кнопку type=button с
ConfigProvider.locale.closeText. Объект дополнительно поддерживает disabled,
closeIcon (строка или Snippet), aria-label/aria-labelledby/aria-describedby,
onClose(MouseEvent) и afterClose(). Пользовательский текст closeIcon остаётся
декоративным содержимым; доступное имя задаётся через aria-label или локаль.
Disabled запрещает закрытие, сохраняя действия. Alert не наследует disabled
от Form/ConfigProvider; вложенные controls используют собственный контекст.

Enter/Space и нажатие на кнопку запускают закрытие ровно один раз. OnClose
уведомляет о запросе и не отменяет его через preventDefault; callbacks
фиксируются на момент запроса. После onClose панель плавно сворачивается.
Во время ухода содержимое остаётся в DOM, но получает inert и aria-hidden.
AfterClose вызывается после удаления содержимого, включая при reduced motion.
Удаление или замена компонента отменяет анимацию и ожидающий afterClose.
При включении reduced motion текущий уход завершается сразу.

Закрытый экземпляр остаётся закрытым при изменении props. Для повторного показа
создайте новый экземпляр через условное монтирование или новый key; публичного
open/bind:open нет. Изменение типа и содержимого открытого сообщения сохраняет
его дочерние экземпляры. SSR показывает открытое сообщение без вызова callbacks;
анимация запускается только при пользовательском закрытии.

Role по умолчанию alert с неотложным объявлением, как в Ant Design. Для обычного
результата действия задавайте role=status с мягким объявлением. Aria-atomic=true
по умолчанию; aria-live и aria-atomic можно переопределить. Aria-label,
aria-labelledby и aria-describedby именуют и описывают корневой контейнер.
Id/class/style также относятся к корню. Появление и обновление не перемещают
фокус. При закрытии фокус из сообщения переходит к следующему доступному control
в DOM, затем к предыдущему либо содержащему нативному dialog. Поиск внутри
Modal/Drawer ограничен активным dialog. Фокус снаружи и фокус, выбранный onClose
у владельца, сохраняются. Иконки не добавляют остановок Tab. Кнопка закрытия
использует естественную клавиатуру и не отправляет окружающую форму;
тип пользовательских action-кнопок задаёт их владелец.

Темы, compact, RTL и цвета статусов используют существующие токены. На ширине
до 575px action переносится на отдельную строку, оставляя место длинному тексту.
Кнопка закрытия имеет зону не меньше 24px. Галерея `/ant-design#alert` показывает
настройки сообщения, действие и повторное создание закрытого экземпляра.
Ошибка загрузки `/ant-design#server-table` использует Alert с прежним retry:
текущая страница и query сохраняются.

Первая версия не поддерживает React ErrorBoundary, бегущую строку, semantic
classNames/styles и устаревшие message/onClose/afterClose/closeText/closeIcon
на верхнем уровне props. Используются title и объект closable из API 6.6.8.

## Message

Создавайте экземпляр у владельца, чтобы компоненты и SSR-запросы не разделяли
очередь. Один экземпляр поддерживает один смонтированный MessageHolder:

```svelte
<script lang="ts">
  import { Button, MessageHolder, createMessage } from '$lib/components/ant-design';

  const message = createMessage({ maxCount: 3 });

  async function save() {
    const close = message.loading({ key: 'save', content: 'Сохраняем…', duration: 0 });
    try {
      const response = await fetch('/api/settings', { method: 'POST' });
      if (!response.ok) throw new Error('Save failed');
      message.success({ key: 'save', content: 'Настройки сохранены.' });
    } catch {
      message.error({ key: 'save', content: 'Не удалось сохранить настройки.' });
    }
    // close() закроет обновлённое сообщение; await дождётся его удаления.
    const closed = await close;
    if (closed) console.log('Сообщение удалено');
  }
</script>

<MessageHolder {message} />
<Button onclick={save}>Сохранить</Button>
```

Open принимает MessageConfig с обязательным content. Методы info/success/warning/
error/loading принимают строку, пассивный Snippet или объект с content. После
первого аргумента можно передать duration и onClose, либо сразу onClose.
Типизированный метод задаёт свой type; open без type использует info.
Icon принимает декоративный Snippet; по умолчанию используются filled-иконки
статусов и вращающийся loading. Class/style относятся к отдельному сообщению.
Snippet содержимого и иконки должен обходиться без ссылок, кнопок и полей ввода.

Duration задаётся в секундах, по умолчанию 3; 0 отключает автоудаление.
CreateMessage фиксирует defaults duration, pauseOnHover=true и maxCount;
конфигурация сообщения может переопределить duration/pauseOnHover.
Невалидная duration использует default. MaxCount ограничивает активные сообщения
по FIFO, положительное конечное значение округляется вниз; без допустимого
значения ограничения нет. Уходящие сообщения остаются в DOM до конца анимации
и не занимают активные места. Hover сохраняет оставшееся время, уход указателя
возобновляет отсчёт. На touch hover-пауза не включается.

Key — string или number; 0 и пустая строка являются допустимыми ключами.
Повтор активного ключа обновляет содержимое на том же месте, перезапускает
duration и заменяет onClose. Все handles этого активного сообщения ждут одно
завершение. Уходящий ключ можно открыть заново: это отдельное сообщение,
старый handle его не закроет. Destroy(key) закрывает ключ, destroy() — всю
очередь экземпляра. Другие экземпляры независимы.

Возвращаемый MessageHandle можно вызвать для закрытия или ожидать через await/
then. OnClose вызывается один раз при запросе закрытия, включая timer и FIFO;
handle завершается true после анимации и фактического удаления DOM. Уходящий
контент получает inert/aria-hidden. При reduced motion уход завершается сразу,
включение этого режима завершает уже запущенную анимацию. Ошибка onClose не
мешает закрытию остальных сообщений destroy(), после обработки она передаётся
вызывающему коду.

До первого монтирования сообщения можно поставить в очередь: SSR выводит
скрытую поверхность без таймеров и callbacks. Отсчёт начинается после показа.
Удаление holder или замена его message отменяет таймеры/анимации, очищает очередь
без onClose и завершает ожидающие handles false. Поздние вызовы такого экземпляра
возвращают false без постановки в очередь; повторное монтирование разрешает
новые сообщения. Для последовательных действий проверяйте результат await,
чтобы не продолжать сценарий после удаления holder.

Holder наследует тему, compact и направление ближайшего ConfigProvider.
Нативный manual popover показывает обычный вертикальный список по центру сверху.
Top по умолчанию 8px: число задаёт px, строка — CSS-длину. Id/class/style
относятся к поверхности списка. Фокус и клавиши Tab/Escape остаются у страницы;
сообщение использует role=status, aria-atomic=true и декоративную иконку.
Для срочного объявления можно явно задать role=alert. ConfigProvider.disabled
не отключает обратную связь.

Внутри Modal/Drawer размещайте holder в содержимом нужного dialog. При закрытом,
скрытом или перекрытом другим модальным окном контексте поверхность скрыта,
таймеры приостановлены; после возврата продолжается оставшееся время.
При скрытии вкладки отсчёт также приостанавливается.
Фоновые holders также ждут закрытия верхнего dialog. Отдельный holder нужен
для сообщений другого контекста. Галерея `/ant-design#message` показывает
loading → success/error, повтор, последовательные сообщения и отмену при сбросе.

В первой версии нет глобального static API/config, getContainer, collapsing
stack, других положений, интерактивных действий и semantic classNames/styles.

## Notification

Создавайте экземпляр у владельца и размещайте один NotificationHolder в нужном
контексте ConfigProvider. Очереди компонентов и SSR-запросов независимы:

```svelte
<script lang="ts">
  import { Button, NotificationHolder, createNotification } from '$lib/components/ant-design';

  const notification = createNotification({ maxCount: 3 });
</script>

{#snippet actions()}
  <Button onclick={() => notification.destroy('report')}>Понятно</Button>
{/snippet}

<NotificationHolder {notification} />
<Button onclick={() => notification.success({
  key: 'report',
  title: 'Отчёт готов',
  description: 'Подготовлены две записи.',
  duration: 0,
  actions
})}>Показать результат экспорта</Button>
```

Open/success/info/warning/error принимают объект NotificationConfig и возвращают
void. Open без type не добавляет статусную иконку; типизированные методы задают
свой type. Title/description принимают строку или Snippet; пустые строки не
создают соответствующую область. Actions — интерактивный Snippet, действия не
закрывают уведомление автоматически. Icon и closeIcon декоративные; используйте
actions/description для кнопок, ссылок и полей ввода. Class/style относятся к
карточке. Корень поддерживает aria-label/aria-labelledby/aria-describedby;
по умолчанию доступное имя связано с title, описание — с description.

Duration задаётся в секундах, по умолчанию 4.5. Значения 0 и false отключают
автоудаление; отрицательные и неконечные значения используют default.
CreateNotification фиксирует defaults duration, pauseOnHover=true, placement и
maxCount. Конфигурация карточки переопределяет duration/pauseOnHover/placement.
Наведение сохраняет оставшееся время; pauseOnHover=false разрешает отсчёт при
наведении. Фокус внутри всегда приостанавливает таймер, включая переходы Tab
между действиями и обновление ключа. Отсчёт продолжается после ухода фокуса и,
если включена hover-пауза, указателя. Touch не включает hover-паузу.

Key — string или number, включая 0 и пустую строку. Повтор активного ключа
обновляет содержимое на прежнем месте, перезапускает duration и заменяет onClose.
В одном placement сохраняются экземпляры неизменённых snippets и их controls.
Изменение placement переносит карточку в другую группу и пересоздаёт snippets.
Уходящий ключ можно открыть заново: это отдельная карточка, позднее завершение
старой анимации её не удалит. Destroy(key) закрывает ключ, destroy() — всю
очередь экземпляра. MaxCount ограничивает активные уведомления суммарно во всех
положениях по FIFO; обновления ключа не меняют очередь. Положительное конечное
значение округляется вниз, без допустимого значения ограничения нет.

Closable=true по умолчанию. False убирает кнопку; объект поддерживает disabled,
closeIcon и aria-label/aria-labelledby/aria-describedby кнопки. CloseIcon также
можно задать на верхнем уровне; false/null скрывает кнопку. Доступное имя берётся
из locale.closeText либо closable.aria-label. Disabled запрещает только кнопку;
destroy и таймер продолжают действовать. ConfigProvider.disabled не отключает
закрытие уведомления, а вложенные компоненты действий наследуют свой контекст.

OnClose вызывается один раз при запросе закрытия: кнопкой, destroy, таймером или
FIFO. Уходящая карточка получает inert/aria-hidden и остаётся в DOM до конца
анимации. Ошибка callback не мешает обработать остальные карточки destroy(),
после обработки она передаётся вызывающему коду. При reduced motion анимация
пропускается; включение режима завершает уже запущенный уход.

Появление не захватывает фокус. Кнопки используют нативные Enter/Space и обычный
Tab; Escape остаётся у страницы или содержащего Modal/Drawer. При закрытии или
удалении сфокусированного action фокус переходит к следующему доступному control
в DOM, затем к предыдущему либо активному dialog. Фокус, выбранный onClose
снаружи карточки, сохраняется. Role по умолчанию alert, для обычного результата
используйте status; aria-atomic=true. Иконки не создают остановок Tab.

Placement поддерживает top/topLeft/topRight/bottom/bottomLeft/bottomRight,
по умолчанию topRight. Left/right задают физическую сторону и не меняются в RTL.
Карточки растут к середине viewport; список прокручивается при переполнении.
Top/bottom у holder задают отступ в px, по умолчанию 24; невалидные значения
используют 24. Id/class/style относятся к нативной popover-поверхности holder;
ширину карточек можно настроить CSS-переменной --ant-notification-width
(по умолчанию 384px). Ширина ограничивается viewport, длинный текст переносится.
Темы, compact, RTL и цвета статусов используют токены ConfigProvider.

До первого монтирования можно поставить уведомления в очередь. SSR выводит
закрытый popover без таймеров и callbacks; отсчёт начинается после показа.
Скрытый контекст, скрытая вкладка или верхний чужой dialog приостанавливают
очередь. Внутри Modal/Drawer размещайте holder в содержимом нужного dialog;
фоновые holders ждут его закрытия. Удаление holder или замена notification
очищает очередь и отменяет таймеры/анимации без onClose. Поздние вызовы такого
экземпляра игнорируются до повторного монтирования; новый holder начинает
пустую очередь. Общая модель очереди находится в notice-queue.model.svelte.ts,
DOM-видимость и фокус — в notice.dom.ts; ими также пользуются Message и Alert.

Галерея `/ant-design#notification` готовит CSV-отчёт, обновляет уведомление по
ключу, скачивает настоящий файл и предлагает повтор после ошибки. Сброс и
удаление примера отменяют ожидающий результат и освобождают download URL.
Подготовка показывает Progress с этапами 0 → 25 → 65 → 90 → 100 и кнопкой
отмены. Отмена сохраняет достигнутый процент; повтор начинает новую попытку с 0.

Первая версия не поддерживает collapsing stack, showProgress, getContainer,
глобальный static API/config, onClick на карточке и semantic classNames/styles.
Устаревшие message/btn заменены title/actions.

## Progress

Компонент отображает переданный percent и не запускает работу самостоятельно:

```svelte
<script lang="ts">
  import { Progress } from '$lib/components/ant-design';

  let percent = $state(42.5);
</script>

<Progress {percent} aria-label="Подготовка отчёта" />
<Progress type="circle" {percent} size={120} aria-label="Проверка файлов" />
```

Type по умолчанию line, также поддерживается circle. Percent по умолчанию 0;
конечные значения ограничиваются 0–100 без округления. Undefined, NaN и ±Infinity
заменяются на 0. Отображение, ширина/дуга и aria-valuenow используют одно
нормализованное значение. Percent не bindable; владелец операции передаёт
обновления через props. У Progress нет собственных таймеров и callbacks работы.

Status поддерживает normal/success/exception и active для line. Без явного
status значение 100 включает success, остальные значения — normal. Явный
normal/exception/success сохраняется при любом проценте. Active добавляет
декоративную анимацию полосы и не изменяет percent. Circle в TypeScript не
принимает active. Success/exception показывают декоративную иконку вместо
подписи, если не задан format. Цвета статусов используют токены темы.

ShowInfo=true по умолчанию. Format(percent) возвращает строку и получает
нормализованный процент; результат заменяет стандартные число/иконку и
используется в aria-valuetext. HTML в строке экранируется. При showInfo=false
подпись скрывается, доступные значения сохраняются. Длинная подпись сокращается
многоточием; полный текст остаётся в title и aria-valuetext.

Size по умолчанию medium. Для line medium/small задают высоту 8/6px; число
задаёт ширину и высоту в px. Пара [width, height] и объект { width?, height? }
настраивают line отдельно: ширина — число в px или CSS-строка, по умолчанию
100%, высота — положительное конечное число. Невалидные числовые размеры
заменяются defaults. Например, size={{ height: 4 }} сохраняет ширину 100%.
Доступная ширина контейнера ограничивает индикатор на узких экранах.

Для circle size принимает medium=120px, small=60px или положительный конечный
диаметр в px. Невалидный диаметр заменяется на 120px. SVG сохраняет пропорции
и помещается в контейнер. При диаметре ≤20px видимая подпись скрывается,
ARIA-значение сохраняется. StrokeWidth относится только к circle и задаётся
в процентах viewBox; default — не меньше 6% и 3px при заданном диаметре.
Невалидное значение использует default, чрезмерное ограничивается 99.9%, чтобы
радиус оставался положительным. Нулевой процент не рисует цветной дуги.

StrokeColor/railColor принимают CSS-цвета и переопределяют цвет заполнения/фона,
включая при success/exception. StrokeLinecap поддерживает round/butt/square;
у line butt/square убирают скругления, у circle задают SVG stroke-linecap.
Темы и compact используют существующие токены. RTL меняет начало заполнения
line на правое и направление active-анимации; circle сохраняет обход по часовой
стрелке. Reduced motion отключает active-анимацию и переходы значений/цвета.

Корень имеет role=progressbar и aria-valuemin=0/aria-valuemax=100. Доступное имя
по умолчанию берётся из locale.progress.label; задавайте aria-label либо
aria-labelledby для конкретной операции. Aria-describedby связывает пояснение.
Без format aria-valuetext содержит процент и локализованный success/exception;
явный aria-valuetext имеет приоритет. Locale.progress поддерживает label,
successText и exceptionText, включая частичные переопределения; отсутствующие
поля используют ruRU. Иконки, подпись и SVG декоративные.

Progress не создаёт live region, остановку Tab и обработчики клавиатуры, не
захватывает фокус и не блокирует Escape содержащего Modal/Drawer.
ConfigProvider.disabled не скрывает обратную связь. Id/class/style относятся
к корню. SSR сразу выводит корректные значения и SVG-геометрию без таймеров
и DOM-измерений; независимые экземпляры не разделяют состояние.

Галерея `/ant-design#progress` связывает line/circle со Slider и InputNumber,
показывает статусы, размеры и форматирование. `/ant-design#notification`
использует Progress для экспорта: модель notification-export.model.svelte.ts
владеет процентом и этапами, отменяет ожидающие callbacks при отмене/сбросе/
unmount и защищает повтор от результата предыдущей попытки. Скачиваемый CSV
и успешное завершение через 700ms сохранены.

В первой версии нет dashboard, steps, градиентов, отдельного success-сегмента,
percentPosition, semantic classNames/styles и автоматического Tooltip для
маленького circle. Подпись format принимает строку; snippets не поддерживаются.

## Spin

```svelte
<script lang="ts">
  import { Button, Input, Spin } from '$lib/components/ant-design';

  let loading = $state(false);
  let draft = $state<string | undefined>('Анна');
</script>

<Button onclick={() => { loading = !loading; }}>Переключить загрузку</Button>
<Spin spinning={loading} delay={200} description="Обновляем профиль…" aria-label="Профиль">
  <label for="profile-name">Имя</label>
  <Input id="profile-name" bind:value={draft} />
</Spin>
```

Без children Spin показывает отдельный индикатор; spinning по умолчанию true.
С children компонент сохраняет их DOM и локальное состояние между загрузками.
Запросами, результатом и отменой операции управляет владелец; Spin отображает
переданный spinning и не выполняет запросов.

Delay задаётся в миллисекундах и откладывает только индикатор. Busy-контент
сразу получает inert и aria-busy=true, даже когда индикатор ещё скрыт.
Положительная конечная задержка округляется вниз и ограничивается 2147483647;
отрицательные, NaN и Infinity означают 0. При короткой загрузке индикатор не
появляется. Изменение spinning или нормализованной delay отменяет старый таймер;
новая задержка отсчитывается заново, в том числе после показа индикатора.
Изменение содержимого, подписи или размера не перезапускает задержку.
Unmount отменяет таймер; SSR не создаёт таймеров и скрывает отложенный индикатор.

Size принимает small, medium и large с точками 14, 20 и 32px. Без size используется
ConfigProvider.componentSize; middle соответствует medium. Поддерживаются темы,
compact, primary, RTL и динамический prefers-reduced-motion. Стандартная анимация
и CSS-анимации/переходы внутри indicator отключаются при reduced motion;
таймерами, SVG/JavaScript-анимацией собственного snippet управляет его владелец.
Высота wrapper определяется содержимым.

Description принимает строку или пассивный Snippet; indicator — пассивный Snippet,
заменяющий четыре точки. Строки экранируются. Indicator декоративный, без controls
и остановок Tab. Id/class/style относятся к корню. Отдельный индикатор можно
сделать декоративным через aria-hidden, когда текстовый статус уже есть рядом.

Видимый индикатор использует role=status, polite и atomic. Wrapper — именованная
group; её status находится рядом с busy-контентом, вне inert. Объявление не
охватывает форму. Имя задаётся aria-label/aria-labelledby; без них используется
строковая description или Locale.spin.loadingText. Для snippet-description
нужно содержательное доступное имя. ruRU/enUS включают «Загрузка…»/«Loading…»;
частичная locale.spin использует ruRU для отсутствующих полей.

Если фокус был внутри блокируемых children, он временно переходит на wrapper
с tabindex=-1, вне обычного Tab. После загрузки он возвращается в прежний
доступный control, затем в доступный control внутри children или соседний control
текущего dialog/документа. Если пользователь уже перевёл фокус наружу, Spin
его не возвращает. При unmount сфокусированного wrapper используются сохранённые
доступные соседи. Escape остаётся у содержащего Modal/Drawer.
ConfigProvider.disabled не скрывает обратную связь.

Table использует отдельный декоративный Spin в существующей строке загрузки.
Текстовый status, aria-busy таблицы, блокировка её controls и данные сохранены;
таблица не оборачивается в Spin.

Галерея `/ant-design#spin` показывает размеры, задержку, быстрый/медленный ответ,
сохранение имени, checkbox и счётчика, ошибку с Alert/retry, отмену и сброс.
При retry фокус переходит с удаляемой кнопки Alert на карточку профиля.
Её [модель](../../presentation/ant-design/spin-load.model.svelte.ts) отменяет
ожидающий результат при cancel/reset/unmount и защищает новую попытку от старой.

В первой версии нет fullscreen, percent/auto, глобального setDefaultIndicator,
semantic classNames/styles и устаревших tip/default-size.

## Skeleton

```svelte
<script lang="ts">
  import { Skeleton } from '$lib/components/ant-design';

  let loading = $state(true);
</script>

<Skeleton {loading} active avatar paragraph={{ rows: 3 }} aria-label="Профиль участника">
  <p>Анна — разработчик.</p>
</Skeleton>
```

Skeleton показывает структуру будущего содержимого при первой загрузке.
Loading по умолчанию true; active и round — false, avatar — false,
title и paragraph — true. При loading=true children не монтируются;
при переходе к false монтируется Snippet children. Повторный переход к true
размонтирует содержимое и уничтожает его локальное состояние и нативные черновики.
Данные, которые должны переживать такую замену, хранит владелец. Для обновления
уже показанной формы используйте Spin с сохранёнными children.

Avatar принимает boolean или объект с shape=circle/square и size=small/medium/
large либо числом в px. По умолчанию составной Skeleton использует large:
40px, compact — 36px. Small/medium соответствуют control-height-sm/control-height;
ConfigProvider.componentSize не меняет выбранный размер. Без paragraph, но с
title автоматическая форма square, в остальных случаях circle. Числовой размер
0 допустим; отрицательный или неконечный размер использует large.

Title принимает boolean или { width }; paragraph — boolean или { rows, width }.
Ширина — неотрицательное число в px или CSS-строка. Для title по умолчанию
используется 38% без avatar и 50% с avatar при наличии paragraph; без paragraph
заголовок занимает полную ширину. Paragraph по умолчанию содержит три строки
без avatar при наличии title, в остальных сочетаниях — две.
Скалярная ширина задаёт последнюю строку; массив задаёт ширину каждой строки.
Пропущенные элементы массива используют обычные CSS-правила, включая стандартные
61% для последней строки из трёх и более. Без avatar или title последняя строка
также получает 61%. Rows округляется вниз и ограничивается 1000; 0 допустим,
отрицательные/NaN/Infinity используют рассчитанное число строк по умолчанию.
Пустые строки и некорректные числовые ширины используют значения по умолчанию.

Round скругляет title и строки paragraph. Active включает CSS-анимацию;
prefers-reduced-motion отключает её динамически. Каркас наследует цвета,
плотность и направление из ConfigProvider. Аватар сохраняет пропорцию 1:1;
большие размеры и ширины ограничены доступным контейнером. Компонент не
выполняет запросов, не создаёт таймеров и не измеряет DOM для разметки.
SSR сразу выводит каркас или готовое содержимое согласно loading.

Корень — постоянная именованная group; id/class/style и aria-label/labelledby/
describedby относятся к ней. Busy-контейнер получает aria-busy; отдельный
status вне него объявляет Locale.skeleton.loadingText с polite/atomic.
Плейсхолдеры декоративные, без доступных заголовков, controls и остановок Tab.
Ru/en-тексты — «Загрузка…»/«Loading…»; отсутствующие поля locale.skeleton
используют ruRU. Для статического превью aria-hidden скрывает всю группу и
подавляет status. ConfigProvider.disabled не скрывает обратную связь.

Если loading удаляет сфокусированные children, фокус предварительно переходит
на постоянную group с tabindex=-1. Он остаётся там после завершения; Tab входит
в новое содержимое. Skeleton не фокусирует новые controls автоматически и не
меняет фокус, выбранный снаружи. При unmount припаркованный фокус переходит к
доступному сохранённому соседу в текущем dialog/документе. Escape остаётся
у содержащего Modal/Drawer.

Галерея `/ant-design#skeleton` настраивает каркас и показывает первую загрузку,
быстрый ответ, ошибки с Alert/retry, отмену и сброс. После получения данных
обновления используют Spin и сохраняют имя, checkbox, счётчик и DOM карточки.
Примеры Skeleton и Spin используют одну
[модель загрузки](../../presentation/ant-design/spin-load.model.svelte.ts),
которая отменяет ожидание при cancel/reset/unmount и защищает новую попытку
от старого результата. При retry фокус переходит на постоянную группу карточки.

В первой версии нет отдельных SkeletonAvatar/Button/Input/Image/Node,
semantic classNames/styles, prefixCls и устаревшего size=default.

## Empty

```svelte
<script lang="ts">
  import { Button, Empty } from '$lib/components/ant-design';

  let hasRecords = $state(false);
</script>

<Button onclick={() => { hasRecords = false; }}>Очистить список</Button>
{#if hasRecords}
  <p>Первый участник создан.</p>
{:else}
  <Empty image="simple" description="Участников пока нет.">
    <Button type="primary" onclick={() => { hasRecords = true; }}>Создать участника</Button>
  </Empty>
{/if}
```

Empty показывает отсутствие данных и предлагает действие через Snippet children.
Данными, фильтром и результатом действия управляет владелец; компонент не
выполняет запросов и не создаёт таймеров.

Image принимает default (по умолчанию), simple, собственный Snippet или false.
False удаляет изображение вместе с контейнером. Встроенные иллюстрации — SVG
Ant Design 6.6.8. Их цвета используют текущие CSS-токены; SVG-паттерны совмещают
полупрозрачный fill с colorBgContainer, сохраняя непрозрачную заливку при
перекрытии частей. Идентификаторы уникальны для каждого экземпляра и стабильны
между SSR и гидратацией. URL картинки передавайте через нативный img внутри
Snippet. Контейнер изображения декоративный: aria-hidden и inert исключают
его содержимое из accessibility tree, Tab и взаимодействий.

Description принимает строку, Snippet или false. Undefined использует
Locale.empty.description: ruRU — «Нет данных», enUS — «No data»; отсутствующие
поля используют ruRU. False и пустая строка убирают описание без fallback.
Строки экранируются. Generic locale.emptyText для Select и других компонентов
сохраняет прежний смысл и значения.

Children выводится в footer с обычными controls и Tab-навигацией. Изменение
image/description не пересоздаёт сохранённые действия. Без явного aria-label
или aria-labelledby корень остаётся обычным div; с ними — именованная group.
Id/class/style и aria-describedby относятся к корню. Empty не создаёт live-region,
не добавляет остановку Tab и не переносит фокус при показе. Объявление результата
операции и выбор конкретного control после неё остаются у владельца.

При удалении сфокусированного действия внутри сохранённого Empty фокус
переходит к доступному control внутри него, затем к соседу снаружи. При удалении
всего Empty используются сохранённые соседи текущего dialog/документа: сначала
следующий, затем предыдущий, затем сам dialog. Проверка после tick сохраняет
фокус, уже выбранный владельцем. Выбор снаружи также сохраняется. Ресурсы
focusin/MutationObserver освобождаются при unmount; SSR не обращается к DOM.
Escape остаётся у содержащего Modal/Drawer.

Компонент наследует темы, compact и RTL из ConfigProvider. Высота изображения
default — 2.5 controlHeightLG, simple — controlHeightLG; compact уменьшает их
с 100/40 до 90/36px. Изображения ограничены контейнером, длинное описание
переносится, действия footer переходят на следующую строку. Встроенной анимации
нет; reduced motion не требует таймеров или переходов. ConfigProvider.disabled
не скрывает описание и иллюстрацию; disabled controls задаёт их владелец.

Table использует simple Empty в прежней единственной ячейке пустой строки.
Colspan и нативная семантика таблицы сохранены. Description получает
Locale.table.emptyText, включая существующие переопределения. Snippet empty
имеет приоритет; во время loading оба варианта пустого состояния не выводятся.

Галерея `/ant-design#empty` настраивает изображение, описание и действия.
Пример списка создаёт первую запись, показывает пустой результат поиска,
восстанавливает записи при сбросе фильтра и очищает список. Владелец выбирает
стабильный region таблицы после создания/сброса поиска и поле имени после очистки.

В первой версии нет глобального ConfigProvider.renderEmpty, интеграции с Select,
semantic classNames/styles, prefixCls/rootClassName и устаревшего imageStyle.
React-константам PRESENTED_IMAGE_DEFAULT/SIMPLE соответствуют строковые значения
image. Собственный image Snippet отвечает за свои ресурсы и анимацию.

## Result

```svelte
<script lang="ts">
  import { Button, Result } from '$lib/components/ant-design';
  let { edit }: { edit: () => void } = $props();
</script>

<Result status="success" title="Заявка отправлена"
  subTitle="Данные сохранены." headingLevel={2}>
  {#snippet extra()}<Button onclick={edit}>Изменить заявку</Button>{/snippet}
  <p>Номер заявки: 42.</p>
</Result>
```

Обработчик edit принадлежит владельцу формы. Result показывает итог операции;
встроенных запросов, таймеров и управления данными в компоненте нет.
Status: success/error/info/warning и 403/404/500 в строковой или числовой форме.
По умолчанию — info. У первых четырёх статусов официальные filled-иконки;
у 403/404/500 — отдельные иллюстрации Ant Design с исходной палитрой.
Эти варианты не меняют маршруты и HTTP-статусы приложения.

Title и subTitle принимают string или Snippet; отсутствующие/пустые строки
не создают текстовых контейнеров. Строки экранируются. Title — нативный
заголовок: headingLevel от 1 до 6, по умолчанию 2. Владелец выбирает уровень
под структуру страницы и передаёт текстовое содержимое без вложенного заголовка.
Extra — Snippet действий; children — Snippet подробностей. Порядок чтения:
иконка, заголовок, описание, действия, подробности. Действия остаются обычными
controls с естественным Tab/Shift+Tab и своей клавиатурной семантикой.

Icon — декоративный Snippet или false для скрытия обычной иконки.
Как в исходном Ant Design, иллюстрации 403/404/500 имеют приоритет над icon,
включая false. Контейнер изображения aria-hidden/inert: иконка не дублирует
заголовок и не создаёт остановок фокуса. Собственный icon отвечает за ресурсы
и анимацию; интерактивные элементы следует передавать в extra/children.

Id/class/style и aria-describedby относятся к корню. Aria-label или
aria-labelledby создают именованную group. Собственных live-region,
автофокуса и перехвата Tab нет. Владелец решает, нужно ли объявление результата
или явный перенос фокуса после отправки. Если сфокусированное действие исчезает,
фокус восстанавливается на доступном control внутри Result или рядом с ним.
При unmount используются сохранённые соседи текущего dialog/документа;
явный выбор фокуса владельцем сохраняется. Механизм общий с Empty.

ConfigProvider передаёт тему, compact и direction. Цвета обычных иконок,
текст и фон подробностей используют токены; иллюстрации сохраняют исходные
цвета. Текст и действия переносятся, SVG уменьшается на узком экране.
Встроенного текста нет: переводы заголовков, описания и действий задаёт владелец.

Галерея `/ant-design#result` переключает все статусы и показывает Form →
success/error → редактирование/retry без потери полей. После отправки владелец
фокусирует область итога, при редактировании — поле имени. Отдельная модель
имитирует ответ, отклоняет повторный старт и отменяет ожидание при reset/unmount,
поэтому позднее завершение не заменяет новый экран. Это локальный пример без API.

В первой версии нет semantic classNames/styles, prefixCls/rootClassName,
React-констант PRESENTED_IMAGE_403/404/500 и инфраструктуры страниц ошибок.

## Steps

```svelte
<script lang="ts">
  import { Steps } from '$lib/components/ant-design';
  let current = $state(0);
</script>

<Steps {current} onChange={index => { current = index; }} items={[
  { key: 'data', title: 'Данные', content: 'Заполните форму' },
  { key: 'review', title: 'Проверка', subTitle: 'Перед отправкой' },
  { key: 'send', title: 'Отправка', disabled: true }
]} />
```

Steps показывает этапы процесса. Current управляется владельцем и отсчитывается
от нуля; onChange сообщает запрошенный индекс, не меняя current самостоятельно.
Владелец может проверить поля перед принятием перехода. Повторный выбор текущего
шага, disabled и внешние обновления не вызывают callback. Без onChange список
пассивный и не создаёт остановок Tab. Привязка bind:current не используется.

Существующий тип StepsItem сохраняет стабильные строковые key и title.
StepsDataItem дополнительно принимает необязательные/numeric key и title;
для отсутствующих ключей используются позиции. При повторении string key
остаётся первое вхождение; индексы относятся к этому нормализованному списку.
Пустой список допустим. Конечное current округляется вниз и ограничивается
диапазоном 0..items.length; NaN/Infinity дают 0. Current=items.length отмечает
все автоматические шаги завершёнными без aria-current. Нормализация не
перезаписывает значение владельца и не генерирует callbacks.

Автоматические статусы: finish до current, process на current, wait после него.
Status меняет состояние текущего шага на wait/process/finish/error;
items.status имеет приоритет над вычисленным состоянием. Disabled ограничивает
выбор и не меняет статус или current. Корневой disabled наследует
ConfigProvider.componentDisabled; false явно снимает его, сохраняя items.disabled.

Существующий StepsItem принимает string или Snippet в title/subTitle/content;
новый StepsDataItem также принимает number/boolean/null. Ноль отображается,
boolean не создаёт текст. Icon может быть текстом, числом или декоративным Snippet.
Строки экранируются. Заголовок и подзаголовок находятся в нативной кнопке выбора
и должны содержать только текст/phrasing-разметку без вложенных controls.
Content находится отдельно и допускает блочную разметку; панели с полями
и действиями остаются у владельца. Иконки и линии
aria-hidden; icon также inert. Check/close используют существующий Icon.
Выбранный шаг помечен aria-current="step"; доступное описание кнопки содержит
локализованный статус и content. Собственных live-region и автофокуса нет.

Список использует ol/list, кнопки — естественные Tab/Shift+Tab, Enter и Space.
Это не tablist: содержимое и переходы принадлежат владельцу. При удалении или
отключении сфокусированного шага фокус переходит на следующий доступный шаг,
затем предыдущий. Keyed-перестановка сохраняет сфокусированную кнопку.
Если шагов/кнопок больше нет или Steps размонтирован, выбирается доступный
сосед текущего dialog/документа. Явный выбор владельца сохраняется.

Orientation: horizontal/vertical, по умолчанию horizontal. Responsive=true
переключает горизонтальный список в вертикальный при ширине viewport меньше
532px; SSR до гидратации не измеряет viewport и использует orientation.
При responsive=false сохраняется горизонтальная ориентация с внутренней
прокруткой при нехватке места. Size: medium/small; отсутствующий size наследует
small из ConfigProvider, остальные общие размеры дают medium.
Темы, compact, primary и RTL используют токены. Reduced motion отключает
встроенные transitions. Id/class/style и aria-describedby относятся к ol;
aria-label/aria-labelledby задают имя, по умолчанию locale.steps.label.

Locale.steps содержит label/wait/process/finish/error. RuRU и enUS предоставляют
все строки; вложенные частичные переводы сохраняют значения родительского
ConfigProvider. Отсутствующие значения дополняются ruRU. Тексты items задаёт владелец.

Галерея `/ant-design#steps` показывает независимый предпросмотр и многошаговую
заявку: данные → проверка → отправка → Result. Form проверяет поля, владелец
открывает следующие шаги и фокусирует панель/ошибочное поле. Возврат и retry
сохраняют данные; reset/unmount отменяют ожидание и игнорируют поздние результаты.
Модель отправки общая с примером Result. Сетевых запросов и сохранения в storage нет.

Type поддерживает default/dot/inline/navigation/panel, variant — filled/outlined.
Panel всегда горизонтальный. Dot/inline используют вертикальные заголовки в
горизонтальном списке; navigation сохраняет горизонтальные заголовки. Явный
orientation имеет приоритет над legacy direction; titlePlacement — над
labelPlacement. ProgressDot включает dot только без другого явного type.
Inline скрывает content в строке и показывает его в Tooltip по hover/focus;
Snippet title сохраняет rich content, Escape закрывает tooltip без смены фокуса.
Wrapper Tooltip находится внутри li, сохраняя нативную ol/li-семантику.

Initial сдвигает нумерацию, current и onChange в исходное пространство индексов;
согласованная нормализация current и first-wins keys сохранена. MaxCount>=3
ограничивает число реальных видимых шагов: первый, последний, текущий и ближайшие
соседи по исходному приоритету. Разрывы заменяются disabled ellipsis; сами ellipsis
не входят в maxCount. Номер и callback относятся к исходному item. Status ellipsis
сохраняет error скрытого диапазона либо finish/wait по current. Ellipsis=true
отдельно включает CSS-обрезку текста; offset задаёт начальную inline flex-cell.

Percent добавляет SVG progressbar к process-номеру, с исходной формулой dasharray;
в inline percent игнорируется. Progressbar доступен assistive technology,
декоративные иконки и стрелки panel скрыты. Новая ellipsis-иконка — точный SVG
@ant-design/icons-svg 4.6.0 (git 7f2516ac91226d2b41f93b35cb5197c8d94f7189),
MIT-лицензия уже включена в vendor/LICENSE.ant-design-icons.

ClassNames/styles принимают объект или функцию от {props}; root и item* слоты
совпадают с upstream. Item classNames/styles используют root/wrapper/icon/section/
header/title/subtitle/content/rail; локальные слои перекрывают общие, item.style
перекрывает styles.root. Root style имеет приоритет над styles.root. Стрелки navigation наследуют
colorTextDisabled активной темы; прямой --ant-steps-nav-arrow-color имеет приоритет.
Item.onClick вызывается перед onChange, включая повторный выбор current;
в disabled оба callback подавлены. Description служит fallback для content.

IconRender — Snippet<[originalIcon, info]>, где info содержит index/active/item/
components.Icon. Можно отрендерить исходный Snippet или использовать переданный
Svelte Icon-компонент. Legacy progressDot принимает аналогичный Snippet с
index/status/title/content/description; iconRender имеет приоритет.
Bind:nativeElement возвращает ol; rootClassName добавляется к его class.

Сохранены согласованные отличия v1 от React: нативные кнопки внутри именованного
списка, keyed focus recovery, clamp current, responsive-порог 532px (исходный
useBreakpoint версии 6.6.8 использует xs), componentDisabled и locale.steps.
Произвольные prefixCls/component config/tokens и Wave ещё не перенесены.
Новые сценарии находятся в ?fixture=steps-variants и втором примере #steps;
unit/SSR/Chromium проверяют layouts, collapse/index mapping, render Snippets,
rich tooltip и доступность процента.

## DatePicker

DatePicker переносит single date/showTime из Ant Design 6.6.8 и rc-picker 1.12.2.
Public value — Dayjs или null при очистке; undefined включает внутреннее состояние
с defaultValue. OnChange(value, dateString) получает объект даты и отображаемую
строку. Это не контракт ISO/timestamp. Day.js 1.11.23 установлен в стенде; пакет
компонентов объявляет peer dayjs ^1.11.11 наряду со Svelte. React/rc-picker runtime
не устанавливаются. CSS-рецепт извлекает 262 правила из
[закреплённого npm-архива](https://registry.npmjs.org/antd/-/antd-6.6.8.tgz);
глобальный Calendar CSS исключён, корни DatePicker ограничены собственным marker. Чистый GenerateConfig и Day.js adapter перенесены отдельно;
лицензия rc-picker сохранена в vendor/LICENSE.rc-picker.

```svelte
<script lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import { DatePicker } from '$lib/components/ant-design';
  let value = $state<Dayjs | null>(dayjs('2026-10-29T10:30:15'));
</script>
<label for="when">Дата и время</label>
<DatePicker id="when" name="when" {value} showTime onChange={next => { value = next; }} />
```

Value/open/pickerValue — controlled props с callbacks: владелец может отклонить
изменение; component сам не переписывает переданный value. Без value/open
используются defaultValue/defaultOpen и внутреннее состояние. DefaultPickerValue
задаёт исходный месяц при каждом открытии. Навигация date/month/year/decade
относится к выбору одной даты; отдельные picker="month" и другие режимы ещё не
перенесены. NativeElement с bind указывает на root div; bind:this даёт методы
focus({preventScroll,cursor:'start'|'end'|'all'}) и blur().

Format принимает строку, массив допустимых форматов или display callback; input
с callback-only format автоматически readonly. По умолчанию дата YYYY-MM-DD,
showTime — YYYY-MM-DD HH:mm:ss. Разбор строгий: переполнения и неверные високосные
дни не нормализуются. Невалидный текст не меняет value и при blur восстанавливается;
preserveInvalidOnBlur сохраняет его. InputReadOnly блокирует текстовый ввод, но
сохраняет календарь и очистку. AllowClear=true по умолчанию.

ShowTime=true или объект добавляет time columns. Поддержаны format, видимость
units, шаги, use12Hours, hideDisabledOptions, defaultOpenValue и disabled time
callbacks. NeedConfirm по умолчанию true для datetime и false для date. Выбор
с подтверждением меняет draft/onCalendarChange; OK меняет value/onChange и вызывает
onOk. Escape/внешний клик отменяют неподтверждённый draft. Now использует исходный
путь preset submit и сразу применяет допустимое текущее время.

Точность повторяет rc-picker: panel selection выравнивает все time units, даже
скрытые; default millisecondStep=100, ближайшее разрешённое значение слева либо
первое разрешённое. ShowTime.format задаёт формат time panel; формат input
задаётся DatePicker.format либо locale.lang.fieldDateTimeFormat, как в upstream.
Для миллисекундного шага задайте showTime={{millisecondStep:1}}.
Ручной ввод через format с SSS использует строгий parser и не округляется этим
panel helper. Адаптер не навязывает timezone: календарные операции сохраняют
режим входного Dayjs, parser использует обычный dayjs(text,format), getNow учитывает
подключённый потребителем timezone plugin как upstream. UTC/timezone плагины не
включаются библиотекой автоматически.

MinDate/maxDate и disabledDate ограничивают календарь; disabledTime возвращает
запрещённые часы/минуты/секунды/миллисекунды. Size, status, variant, disabled,
Compact, RTL, тема, locale.lang и ConfigProvider.locale.datePicker наследуют
существующие контексты. Встроены исходные RU/EN строки. Input использует native
name/id/required: FormData содержит отображаемый текст, без скрытой ISO-копии.
FormItem контекст даёт id/name/status/disabled. Form model хранит immutable Dayjs
напрямую: value={form.values.when}, onChange={next => form.setFieldValue('when', next)}.
OnFinish получает объект Dayjs, resetFields восстанавливает исходное значение;
преобразование в wire-формат остаётся у потребителя, как в upstream.

Клавиатура: Enter открывает/применяет корректный ввод, ArrowDown переводит фокус
в календарь; стрелки/PageUp/PageDown/Home/End перемещаются по grid; Escape закрывает
popup с возвратом фокуса. Время доступно через native buttons и стрелки в колонках.
Поверхность использует существующий native popover lifecycle библиотеки, включая
изоляцию Compact, закрытие снаружи и поддержку dialog top layer.

Остальные picker/multiple modes, generatePicker factory, single presets,
cellRender/panelRender, mask format, hover preview, полный semantic/component config
и rc-trigger/motion/container API ещё не перенесены. Реестр перечисляет эти пробелы
отдельно; данный этап не заявляет полноту семейства DatePicker.

## RangePicker (DatePicker.RangePicker)

Отдельный экспорт RangePicker использует общий Day.js adapter, календарь, time
panel и извлечённый CSS DatePicker. Переходы выбора перенесены из
useRangeValueChange rc-picker 1.12.2: calendar draft, подтверждённые границы и
принятое владельцем value хранятся отдельно.

```svelte
<script lang="ts">
  import dayjs from 'dayjs';
  import { RangePicker, type RangePickerValue } from '$lib/components/ant-design';
  let period = $state<RangePickerValue | null>([dayjs('2026-10-10'), dayjs('2026-10-20')]);
</script>
<label for="period-start">Начало</label><label for="period-end">Конец</label>
<RangePicker id={{start:'period-start',end:'period-end'}} name="period"
  value={period} onChange={next => { period = next; }} />
```

Value/defaultValue — пара Dayjs|null|undefined; отсутствующие границы внутри
нормализуются в null. Value=null очищает обе границы, undefined включает внутреннее
состояние. OnChange получает пару Dayjs|null либо null при полной очистке.
Второй аргумент — пара отображаемых строк либо null при полной очистке: это
фактическое поведение rc-picker 1.12.2, хотя его declaration обещает только tuple.
OnCalendarChange всегда получает пару значений, пару строк и {range:'start'|'end'}
для первой изменённой границы. OnOk получает текущую календарную пару после
подтверждения каждой границы; первое подтверждение ещё не означает onChange.

Date показывает два соседних календаря, showTime — календарь и время активной
границы. Переход к следующему полю, Tab, Enter, OK, Escape и закрытие снаружи
различаются как в исходной машине переходов. NeedConfirm по умолчанию включён
для datetime. Неподтверждённые изменения отменяются; controlled value/open могут
отклонить предложение компонента. DefaultPickerValue/pickerValue принимают дату
или пару дат панели; onPickerValueChange сообщает range/source/mode.

Order=true сортирует отправляемую пару, если обе границы доступны. Order=false
сохраняет позиции. Disabled принимает boolean либо [start,end], allowEmpty —
boolean либо [start,end]. Очистка сохраняет заблокированную границу. DisabledDate
получает {type,from}, disabledTime — (date,'start'|'end',{from}); from зависит от
порядка посещения полей, как в rc-picker. Проверяются границы диапазона:
запрещённая дата внутри него сама по себе не запрещает диапазон. MinDate/maxDate
ограничивают выбор и навигацию. Presets принимают пару либо фабрику, previewValue
по умолчанию 'hover'; false отключает предварительный просмотр. ShowNow/showToday
по умолчанию выключены для диапазона; явное включение подтверждает текущую границу.

Format, showTime units/steps/defaultOpenValue, inputReadOnly,
preserveInvalidOnBlur, size/status/variant/Compact, локали, тема и RTL используют
общие механизмы DatePicker. ShowTime.defaultOpenValue принимает пару дат времени.
Календарные операции сохраняют режим входного Dayjs; UTC и wire-сериализация не
навязываются. Native FormData.getAll(name) содержит две отображаемые строки под
одним name. Form хранит пару объектов Dayjs, копирует tuple при snapshot и
восстанавливает исходные даты при reset. Id-строка относится к первому полю,
id={{start,end}} задаёт оба. Bind:nativeElement/startInput/endInput возвращают DOM;
bind:this даёт focus({index:0|1,preventScroll,cursor}) и blur(). Native onfocus/onblur
относятся к input; полный semantic event API upstream ещё не перенесён.

Подтверждены SSR без browser APIs, ввод/ошибки/очистка, переходы фокуса,
подтверждение времени, ограничения/from, nullable границы, controlled rejection,
Form/нативная отправка и UTC в разных browser zones. Остальные picker modes,
mask, render hooks, полный semantic/config/motion/container API остаются пробелами
семейства; наличие RangePicker не означает полного покрытия React DatePicker.

## TreeSelect

TreeSelect переносит первый объём Ant Design 6.6.8 / rc-tree-select 1.16.1.
Панель использует существующий Tree; checkbox conduction считается по полному
дереву, а display values и фильтрованная панель вычисляются отдельно.
React-зависимости не устанавливаются. Лицензия сохранена в
vendor/LICENSE.rc-tree-select. Рецепт CSS извлекает 92 правила dropdown/checkbox/RTL;
внутренний prefix .ant-select-tree нормализован к общему .ant-tree. Selector
использует существующие стили Select и theme aliases.

```svelte
<script lang="ts">
  import { TreeSelect } from '$lib/components/ant-design';
  const data = [{value:'docs',title:'Документы',children:[{value:'intro',title:'Введение'}]}];
  let value = $state<string[]>([]);
</script>
<TreeSelect treeData={data} {value} treeCheckable treeDefaultExpandAll
  showSearch={{treeNodeFilterProp:'title'}} onChange={next => { value = next; }} />
```

Узел содержит уникальный value (string/number), title/label, children,
disabled/disableCheckbox/checkable/selectable/isLeaf. Внутренняя идентичность —
value, как в upstream fieldNames; key можно не задавать. Значения должны быть
уникальны также после String(value). Title/label могут быть string/number/Snippet.
TreeTitleRender принимает snippet с исходным TreeSelectNode и задаёт заголовки
панели и выбранных значений.

Value/defaultValue принимают scalar, массив или {value,label?,halfChecked?}.
Null очищает; undefined включает внутреннее состояние. Value/open/searchValue —
controlled props с callbacks, без автоматического переписывания владельца.
Multiple включает массивы. TreeCheckable включает checkbox и multiple;
treeCheckStrictly также включает checkbox/multiple и принудительно labelInValue.
Параметр типа TreeSelectProps<ValueType> сохраняет конкретный тип callback value;
режим и переданный тип должны соответствовать друг другу, как в upstream.

OnChange(value,labels,extra) получает scalar либо массив; при labelInValue/strict
это объекты с value/label/halfChecked/disabled, а labels=null. При полной очистке
single возвращается undefined, multiple — []; labels=[] в raw mode. Extra включает
preValue (массив исходных full values), triggerValue и checked либо selected.
OnSelect/onDeselect(value,node) вызываются для конкретного узла; clear вызывает
onClear/onChange без onDeselect для каждого тега. Deprecated React getters
triggerNode/allCheckedNodes и wrappers node.props не входят в этот этап.

В checkbox-режиме исходная conduction уважает disabled/disableCheckbox/checkable
границы. ShowCheckedStrategy по умолчанию SHOW_CHILD; отдельные экспорты
TREE_SELECT_SHOW_CHILD/SHOW_PARENT/SHOW_ALL соответствуют константам React TreeSelect.
Стратегия влияет и на теги, и на onChange при conduction. Внутренние полные отметки
сохраняются отдельно: снятие потомка или удаление тега корректирует родителей.
Без treeCheckable стратегия равна SHOW_ALL, включая independent strict mode.
HalfChecked объекты в strict value не показываются отдельными тегами, но
сохраняются в callback до явной отметки этого значения.

Missing values не удаляются при смене treeData. Подпись отсутствующего узла
сохраняется из labeled value либо внутреннего labeled состояния; raw controlled
value без подписи отображается самим значением. Индивидуальный тег disabled узла
не удаляется, но clear очищает весь набор, как в upstream.

ShowSearch по умолчанию false для single и true для multiple. Объект showSearch
поддерживает searchValue/onSearch, autoClearSearchValue, filterTreeNode и
treeNodeFilterProp; его поля имеют приоритет над одноимёнными top-level props.
Default filter prop — value, не title. Поиск без учёта регистра сохраняет предков
совпадения и всех потомков совпавшего родителя. FilterTreeNode=false сохраняет
всё дерево; callback задаёт predicate. Отметка фильтрованного родителя всё равно
считается по полному дереву. AutoClearSearchValue=true очищает внутренний search
после выбора; controlled search очищает владелец. Само автоматическое очищение
не вызывает onSearch. Загрузка узлов во время поиска отключена.

LoadData(node), treeLoadedKeys/onTreeLoad и treeExpandedKeys/onTreeExpand
используют механизмы Tree; children добавляет потребитель. TreeDefaultExpandAll
и treeDefaultExpandedKeys задают начальное раскрытие. В TreeSelect раскрытие
панели хранится снаружи Tree: после load rejection раскрытая ветка может повторять
загрузку до исходного лимита Tree. Отдельного error callback/слота нет. Закрытый
popup не начинает новых загрузок; уже начатый Promise может завершиться и вызвать
onTreeLoad. После unmount результаты игнорируются.

Native combobox удерживает фокус при действиях в панели. Arrows перемещаются/
раскрывают дерево через его keyboard engine; Enter выбирает активный узел, а не
переключает раскрытие. Escape/Tab закрывают popup; Backspace удаляет последний
доступный тег при пустом search. Single закрывает popup после выбора, multiple
оставляет его открытым. Popup использует существующий native popover lifecycle;
listHeight ограничивает viewport, onPopupScroll получает его scroll event.
PopupMatchSelectWidth, placement, size/status/variant, treeLine/treeIcon/switcherIcon,
notFoundContent/loading, RTL, темы, Compact и ConfigProvider/Form disabled поддержаны.
Bind:nativeElement/inputElement дают DOM; bind:this — focus(options)/blur().

Name/FormItem создают hidden inputs с raw values для native FormData. Form model
хранит raw scalar/массивы, поддерживает required/submit/reset; библиотека не меняет
объектный контракт labelInValue ради ограничений Form v1. Его общий object store
остаётся отдельным этапом. SSR не запускает loadData, popover или browser APIs.

Virtual/scrollTo, fieldNames/simple mode, TreeNode children, maxCount/maxTagCount,
tag/popup render hooks, treeExpandAction, полный semantic/config/token/ref API,
legacy React extras и исходные motion/container API ещё не перенесены.

## Tree

Tree переносит Ant Design 6.6.8 и @rc-component/tree 1.4.0. Чистые engines отвечают
за flatten/родителей, исходную checkbox conduction и async load lifecycle.
React/rc-tree runtime не устанавливаются; лицензия сохранена в vendor/LICENSE.rc-tree.
CSS-рецепт извлекает 98 правил из закреплённого antd.css, исключая TreeSelect и
collapse motion. Иконки соответствуют @ant-design/icons-svg 4.6.0.

```svelte
<script lang="ts">
  import { Tree, type TreeKey, type TreeCheckedKeys } from '$lib/components/ant-design';
  const nodes = [{key:'docs',title:'Документы',children:[{key:'intro',title:'Введение'}]}];
  let expanded = $state<TreeKey[]>(['docs']);
  let checked = $state<TreeKey[] | TreeCheckedKeys>([]);
</script>
<Tree treeData={nodes} aria-label="Документы" checkable expandedKeys={expanded}
  checkedKeys={checked} onExpand={keys => { expanded = keys; }}
  onCheck={keys => { checked = keys; }} />
```

TreeData — массив узлов со стабильным уникальным key (string/number/bigint), title
(string/number/Snippet<[TreeDataNode]>) и children. Ключи должны быть уникальны и
после String(key), как в upstream entity index. Поддержаны disabled,
disableCheckbox, checkable, selectable, isLeaf, icon и локальные class/style.
ExpandedKeys/selectedKeys/checkedKeys/loadedKeys — controlled props; default-пары
инициализируют внутреннее состояние. Владелец может отклонить callback. Массивы
ключей и treeData обновляются новым значением, как в исходном controlled API.

DefaultExpandParent=true раскрывает родителей начальных expanded keys до disabled
границы. AutoExpandParent=false по умолчанию; true повторяет раскрытие родителей
при изменении controlled keys. Чтобы разрешить сворачивание предка при сохранённом
ключе потомка, отключите autoExpandParent. DefaultExpandAll применяется только
при инициализации к узлам с детьми; данные, поступившие позже, сами по себе не
расширяют этот начальный набор.

Выбор строки независим от checkbox. Multiple переключает отдельные ключи без
обязательного Ctrl и не добавляет range selection. Selectable=false переводит
клик заголовка на отметку. Node.selectable перекрывает tree selectable. В обычном
checkable-режиме отметки распространяются вниз и вверх; disabled,
disableCheckbox и checkable=false останавливают conduction. Disabled-потомки
не мешают полноте отметки разрешённого родителя. Снятие отметки использует исходный
fill/clean algorithm; дети, добавленные в отмеченного родителя, получают отметку.
CheckStrictly=true разрывает связи и onCheck возвращает {checked,halfChecked}.
Без него onCheck возвращает массив и info.halfCheckedKeys/checkedNodesPositions.
CheckedKeys в strict режиме принимает также объект с halfChecked.

OnExpand(keys,{expanded,node,nativeEvent}), onSelect(keys,{event,selected,node,
selectedNodes,nativeEvent}), onCheck(keys,{event,checked,node,checkedNodes,...})
сохраняют отдельные события. Node включает исходные данные, pos и flags
expanded/selected/checked/halfChecked/loaded/loading/active. Mouse callback содержит
нативный event; keyboard callbacks соответствуют внутреннему пути rc-tree и могут
не иметь nativeEvent. Дополнительно поддержаны onClick/onDoubleClick/onRightClick
и onActiveChange. Состояние node в callback относится к узлу до действия.

LoadData(node) возвращает PromiseLike. Дети добавляются потребителем в treeData;
компонент их не выдумывает. Loading дедуплицируется по ключу; pointer switcher ждёт завершения загрузки,
но клавиатура позволяет свернуть pending-ветку. OnLoad(keys,{event:'load',
node}) вызывается до внутреннего обновления loadedKeys. При controlled loadedKeys
владелец принимает новый набор сам. Загрузка запускается и для изначально раскрытой
видимой незагруженной ветки. Узел с уже имеющимися детьми не загружается повторно;
isLeaf=true запрещает загрузку, isLeaf=false сохраняет switcher даже у пустой
загруженной ветки. Rejection снимает loading и сворачивает uncontrolled ветку,
не вызывая onLoad; повторное раскрытие позволяет retry. После 10 неудачных попыток
загрузка прекращается, ключ помечается загруженным без успешного onLoad. Отдельного
onError/публичного error-state в исходном Tree нет: обработка ошибки остаётся в
loadData потребителя. Результаты после unmount не меняют состояние и callbacks.

Клавиатура использует один tab stop на role=tree и aria-activedescendant. Up/Down
перемещаются циклически по видимым строкам, Home/End — к краям. Left сворачивает
либо переходит к родителю, Right раскрывает либо переходит к первому ребёнку;
эти действия не инвертируются в RTL, как в rc-tree. Enter раскрывает ветку либо
однократно выбирает/отмечает лист; Space переключает отметку, а без checkable —
выбор. Disabled-строки остаются в навигации. Disabled блокирует выбор/отметки,
но switcher допускает раскрытие мышью, как upstream; global disabled отключает
клавиатурную обработку. Native buttons имеют tabindex=-1; роли treeitem/checkbox
и level/posinset/setsize отражают логическое дерево. Bind:nativeElement даёт root;
bind:this предоставляет focus(options)/blur().

BlockNode, showLine и showLine={{showLeafIcon:true}}, showIcon, icon,
switcherIcon/switcherLoadingIcon, titleRender и filterTreeNode поддержаны.
Иконки и заголовки задаются snippets с node-аргументом; filterTreeNode подсвечивает
узел и не удаляет его из дерева. RU/EN подписи switcher берутся из Locale.tree;
темы, compact, RTL, ConfigProvider/Form disabled наследуют существующие контексты.
Height ограничивает native scroll viewport; виртуализация пока не применяется.
SSR рендерит видимые строки без загрузки и browser APIs.

DirectoryTree, drag/drop, virtual/scrollTo, expandAction, fieldNames, полный generic
node API, TreeNode children API, per-node switcherIcon, showLeafIcon snippet,
semantic/config/token API и collapse/appear анимации ещё не перенесены. Реестр
отделяет этот объём от полного React API Tree.

## Upload / UploadDragger

Upload переносит Ant Design 6.6.8 и AjaxUploader/request из @rc-component/upload
1.1.1. UploadDragger соответствует Upload.Dragger; UPLOAD_LIST_IGNORE — отдельный
экспорт аналога Upload.LIST_IGNORE. React и rc-upload runtime не устанавливаются.
Лицензия rc-upload сохранена в vendor/LICENSE.rc-upload; CSS-рецепт извлекает
82 правила из закреплённого antd.css, исключая неиспользуемые motion selectors.
Иконки взяты из закреплённого @ant-design/icons-svg 4.6.0 с существующей лицензией.

```svelte
<script lang="ts">
  import { Upload, Button, UPLOAD_LIST_IGNORE, type UploadFile } from '$lib/components/ant-design';
  let files = $state.raw<UploadFile[]>([]);
</script>
<Upload fileList={files} multiple action="/api/upload" name="attachment"
  beforeUpload={file => file.size > 10_000_000 ? UPLOAD_LIST_IGNORE : true}
  onChange={info => { files = info.fileList; }}>
  <Button>Выбрать файлы</Button>
</Upload>
```

FileList — controlled prop с onChange; defaultFileList задаёт внутренний список.
Элемент UploadFile имеет стабильный uid, name, optional status/percent/url/thumbUrl,
originFileObj/response/error/xhr. Статусы — uploading/done/error/removed. API типов
параметризован типом ответа: UploadProps<T>, UploadFile<T>, UploadRequestOptions<T>.
Передавайте uid для каждого элемента списка. Callback onChange({file,fileList,event?})
предлагает полный новый список; владелец может отклонить изменение. Progress/success/error
файла, уже исключённого владельцем из списка, не вызывают onChange.

BeforeUpload(file,batch) может быть асинхронным. Возврат false или rejected promise
останавливает отправку, но сохраняет файл без uploading-статуса. UPLOAD_LIST_IGNORE
исключает его и из списка. Blob/File заменяет отправляемое содержимое с исходным
uid; action/data получают исходный файл. Batch стартует после обработки всех
beforeUpload/action/data. Для совместимости с upstream onChange.file при false —
нативный File с uid, а элемент fileList содержит originFileObj; тип callback отражает
это различие. MaxCount=1 сохраняет последний файл; большее значение — первые N.
MaxCount ограничивает список и callbacks, но сам по себе не отменяет запросы.

Стандартный транспорт использует XHR и multipart FormData: name='file', method='post',
action='' по умолчанию; data может быть объектом или async callback, массивы
добавляются как key[]. Поддержаны headers/withCredentials и async action. Заголовок
X-Requested-With=XMLHttpRequest можно отключить значением null. 2xx означает успех,
JSON-ответ разбирается; HTTP/network errors передаются в состояние файла.
CustomRequest(options,{defaultRequest}) получает file/action/data/name как filename,
method/headers/withCredentials и onProgress/onSuccess/onError. Он может вызвать
предоставленный defaultRequest и вернуть {abort()}. Bind:this.abort(file|uid) либо
abort() отменяет активные запросы; unmount отменяет их автоматически.

Ручной запуск устроен как в upstream: beforeUpload={() => false}, контролируемый
список и отдельная кнопка потребителя, которая отправляет originFileObj через
свой транспорт и обновляет fileList. Компонент не добавляет прикладных endpoints,
очередей или нового метода submit. Галерея показывает локальную демонстрацию
такого сценария без сетевой отправки файлов.

OnRemove может вернуть false/Promise<false> для запрета удаления; после разрешения
запрос отменяется, onChange получает status='removed'. Preview/download доступны
через onPreview/onDownload; без callbacks ссылки открывают url. Disabled скрывает
remove по умолчанию и блокирует его даже при showRemoveIcon=true; preview/download
остаются доступны как в upstream. ShowUploadList принимает false или объект
showRemoveIcon/showDownloadIcon/showPreviewIcon (boolean либо predicate), extra —
Snippet<[UploadFile]>. ListType: text, picture, picture-card, picture-circle;
previewFile/isImageUrl настраивают thumbnail. По умолчанию thumbnails повторяют
исходный 200px canvas preview, включая GIF/SVG. Progress появляется через 300 ms.

UploadDragger принимает height и по умолчанию hasControlInside=false: его trigger
имеет role=button и открывает chooser клавиатурой. Обычный Upload по умолчанию
ожидает native control внутри children snippet; локальный disabled нужно передавать
и этому control. Form.disabled и ConfigProvider.componentDisabled наследуются компонентом;
явный disabled перекрывает контекст.
OpenFileDialogOnClick=false оставляет drop без открытия chooser. Multiple/accept/capture
передаются скрытому native input; native выбор обычно фильтрует сам браузер, drop
использует accept. Поддержан accept={format,filter:'native'|predicate}. В rc-upload
1.1.1 single drop выбирает первый исходный файл, не применяя accept-фильтр;
это поведение сохранено. Input сбрасывается после выбора для повторного файла.
Id удаляется при disabled/отсутствии children, чтобы label не открывал диалог.
Bind:nativeElement/inputElement дают DOM-элементы, без запуска транспорта при SSR.

Locale/upload из ConfigProvider, собственный locale, RU/EN, RTL и theme variables
поддержаны. Directory/pastable, itemRender/iconRender/custom action icons,
progress customization, linkProps, полный ref/config/semantic API и исходные
appear/exit/collapse анимации остаются отдельными пробелами реестра. Данный этап
не заявляет полного покрытия React Upload.

## TextArea (Input.TextArea)

Отдельный экспорт TextArea соответствует React Input.TextArea. Минимальный объём
включает bind:value/string, defaultValue, name, rows, cols, maxlength, minlength,
required, disabled, readonly, placeholder, autocomplete и остальные native
атрибуты textarea. Значение не обрезается программно до maxlength: как upstream,
ограничение применяется браузером при пользовательском вводе, но управляемое
значение может превышать его. DefaultValue фиксируется при создании, value имеет
приоритет; после редактирования value=undefined очищает поле, как у местного Input.

OnValueChange получает строку на каждом input, затем вызывается native oninput.
Onchange остаётся native change (при завершении редактирования), onselect,
onbeforeinput, composition и keyboard events передаются textarea. OnPressEnter
вызывается перед onkeydown, кроме Enter с isComposing=true; стандартная вставка
переноса строки сохраняется, если callback не вызвал preventDefault().
Bind:nativeElement даёт HTMLTextAreaElement для focus/blur/select/setSelectionRange
и чтения selectionStart/selectionEnd/selectionDirection.

Size и status=error|warning, Compact, RTL, темы, Form/FormItem disabled, name/id,
required, aria-invalid и описания ошибок наследуются из существующих контекстов.
Явные props имеют приоритет. Form.resetFields восстанавливает привязанное поле
через модель формы. Поле остаётся одним native textarea без wrapper.

```svelte
<script lang="ts">
  import { TextArea } from '$lib/components/ant-design';
  let description = $state('');
</script>
<label for="description">Описание</label>
<TextArea id="description" name="description" rows={4} maxlength={2000} required bind:value={description} />
```

AutoSize, allowClear, showCount/count, произвольные variants, semantic slots и
ConfigProvider.textArea пока не перенесены. Стили native textarea уже присутствуют
в закреплённом vendor/antd.css; новые зависимости и CSS overrides не добавлены.

## FloatButton, FloatButtonGroup и FloatButtonBackTop

FloatButton сохраняет native Button/href, type=default|primary, shape=circle|square,
icon, content и deprecated description (content ?? description). Текст, число,
boolean и Snippet заменяют ReactNode; число 0 не включает default icon. Без
renderable content/icon используется FileTextOutlined из закреплённого icons-svg.
Кнопка имеет размер 40px и fixed-положение: inline-end 24px, bottom 48px.
Размер стандартной иконки — fontSizeIcon × 1.5 = 18px. Shape группы имеет
приоритет над shape детей. Native htmlType/disabled/события сохраняют Button API.

Tooltip принимает scalar/Snippet либо props существующего Tooltip; 0 показывает
подсказку. Badge принимает props существующего Badge без status/text/title/children;
этот набор исключается и в runtime. Semantic classNames/styles root/icon/content
принимают объект или callback { props }, включая undefined result. Group context
сливается перед локальными slots, style кнопки имеет последний приоритет.

FloatButtonGroup принимает children Snippet либо items=[{ key, children: Snippet }].
Items создают отдельные Compact slots и имеют приоритет над children. Для opaque
Snippet геометрия квадратных краёв определяется CSS siblings, без точного
воспроизведения Compact edge classes. Circle использует Flex, square — Compact.
Trigger click/hover включает меню; без trigger показывается список без trigger.
Placement top/bottom/left/right остаётся физическим и при RTL. Open + onOpenChange
дают controlled mode: владелец может отклонить запрос; без open состояние внутреннее.
Disabled блокирует переключение меню, но сам по себе не отключает детей.
Клик вне группы закрывает меню, клик элемента сохраняет его открытым.
CloseIcon и semantic slots root/list/item/itemIcon/itemContent/trigger/triggerIcon/
triggerContent доступны локально и через ConfigProvider.floatButtonGroup.

FloatButtonBackTop принимает target={() => window|document|element|null},
visibilityHeight (400), duration (450ms), showProgress. На SSR виден только при
visibilityHeight=0, target не вызывается. После mount scroll обновляет видимость
и progress; resize обновляет только progress. Click запускает cubic scroll к 0
перед пользовательским callback. При reduced motion прокрутка мгновенная;
собственные RAF/listeners отменяются при unmount. NativeElement с bind доступен
у кнопки/BackTop, у Group указывает на div группы.

ConfigProvider.floatButton.backTopIcon задаёт BackTop icon. Как в исходной 6.6.8,
FloatButton не потребляет объявленные в глобальном floatButton config class/style/
semantic slots; локальные props работают. Config вложенного provider наследуется
при undefined и заменяется целиком при заданном объекте. Сохраняются прежние
ограничения Button/Badge/Tooltip; произвольные prefix/component tokens, Wave и
общий React z-index context ещё не перенесены. CSS-рецепт воспроизводит 42 правила;
глобальный fade адаптирован через WAAPI с исходными длительностями и reduced motion.

```svelte
<FloatButton tooltip="Помощь" aria-label="Помощь" onclick={showHelp} />
<FloatButtonGroup shape="square" trigger="click" aria-label="Действия">
  <FloatButton content="?" aria-label="Поддержка" />
  <FloatButtonBackTop visibilityHeight={0} aria-label="К началу" />
</FloatButtonGroup>
```

## Timeline

Timeline использует общий renderer Steps с type=dot, как Ant Design 6.6.8.
По умолчанию orientation=vertical, variant=outlined, mode=start. Корень —
пассивный ol/li без кнопок выбора, current-step ARIA и локализованных статусов
Steps. Class/rootClassName, нативные атрибуты и bind:nativeElement относятся к ol.
Title и content допускают блоковые Snippet; input/links внутри content сохраняют
нативную клавиатуру. При keyed reverse сохраняются тот же DOM, value и фокус;
при unmount активный control освобождает фокус к соседнему доступному элементу.

```svelte
<Timeline titleSpan="80px" items={[
  { key: 'created', title: '09:00', content: 'Создано', color: 'green' },
  { key: 'processing', title: '09:30', content: 'Обработка', loading: true }
]} pending="Ожидается подтверждение" />
```

Items поддерживают key/title/content/icon/loading/color/placement, class/style и
локальные semantic classNames/styles. Title/content/icon принимают текст, число,
boolean или Snippet. Ноль отображается; boolean создаёт присутствующий пустой
контент. Legacy label/children/dot/position служат fallback через ??, поэтому
явные 0/false имеют приоритет. React Timeline.Item был только JSX sugar без
собственного runtime; в Svelte данные задаются items, отдельный пустой компонент
не экспортируется. Для контроля сохранения state используйте стабильные key.

Mode=start/end/alternate; left/right нормализуются в start/end. Item.placement
переопределяет position и mode; legacy item.position сохраняется буквально как
в исходнике. Alternate назначает сторону до reverse. Даже при mode=start/end
vertical использует двухколоночный layout, если есть хотя бы один truthy title;
число 0 само по себе этот layout не включает. TitleSpan — число долей из 24 либо
строка CSS (100px/25%); в mode=alternate игнорируется. Его вычисленная переменная
имеет приоритет над тем же ключом в styles.root/style, как в upstream.

Loading задаёт process и добавляет spinner только при falsy icon/dot;
остальные элементы имеют finish. Pending добавляется только для truthy значения,
pendingDot использует nullish fallback; reverse разворачивает и pending.
В reverse линия наследует статус предыдущего события, иначе — следующего.
SVG LoadingOutlined перенесён точно из @ant-design/icons-svg 4.6.0 под уже
включённой MIT-лицензией; React-зависимости не добавлены.

Preset colors — blue/red/green/gray; произвольный CSS color задаёт переменную
item icon, item.style перекрывает её. ClassNames/styles имеют root/item/itemWrapper/
itemIcon/itemSection/itemHeader/itemTitle/itemContent/itemRail; принимают объект
или функцию от {props} с преобразованными items. Локальные item.classNames/styles
используют имена root/wrapper/icon/section/header/title/content/rail. Общие стили
перекрываются локальными, item.style — последний; корневой style перекрывает
styles.root до применения titleSpan. Tail/dot/spacing связаны с токенами темы,
включая dark/compact и RTL.

Horizontal сохраняет поведение исходных Steps: ниже xs=576 он получает класс
ant-steps-vertical, но явный ant-timeline-horizontal остаётся. Это отличается от
согласованного v1-порога самостоятельного Steps (532px); базовые Steps не меняются.
SSR не измеряет DOM/viewport и оставляет объявленную ориентацию. Произвольные
prefixCls и глобальный timeline component config/tokens ещё не перенесены.

Фикстура — ?fixture=timeline, пример — /ant-design#timeline. Engine/SSR/Chromium
проверяют aliases, порядок/статусы, геометрию titleSpan, темы/RTL, сохранение поля
и фокуса, а также production hydration. Рецепт timeline воспроизводит 43 правила
из того же закреплённого CSS-архива; общие Steps не дублируются.

## Tag и CheckableTag

```svelte
<script lang="ts">
  import { CheckableTag, Tag } from '$lib/components/ant-design';
  let checked = $state(false);
</script>

<Tag color="success" variant="outlined">Готово</Tag>
<Tag closeIcon closeLabel="Удалить обязательную метку"
  onClose={event => event.preventDefault()}>Обязательная метка</Tag>
<CheckableTag {checked} onChange={value => { checked = value; }}>
  Показывать готовые задачи
</CheckableTag>
```

Tag показывает метку с обязательным children Snippet. Icon и пользовательский
closeIcon также принимают Snippet. Содержимое — короткая phrasing-разметка
без вложенных controls. Иконки декоративные, aria-hidden/inert.
Сам Tag не создаёт остановок Tab или live-region. Именование через aria-label/
aria-labelledby добавляет корневому span роль group; id/class/style и
aria-describedby относятся к этому корню.

Variant: filled (по умолчанию), outlined, solid. Color по умолчанию default;
статусы — success/processing/error/default/warning. Предустановленные цвета:
blue/purple/cyan/green/magenta/pink/red/orange/yellow/volcano/geekblue/lime/gold.
Pink и magenta используют соответствующие токены Ant Design. Статусный цвет не добавляет
role=status и не запускает анимацию/объявление. TagColor, TagPresetColor,
TagStatusColor и TagVariant экспортируются через index.ts.

CloseIcon=false/undefined скрывает закрытие; true показывает существующий Icon
close, Snippet заменяет его изображение внутри той же нативной кнопки.
CloseLabel задаёт имя кнопки, по умолчанию locale.closeText. Описание кнопки
ссылается на содержимое метки, поэтому одинаковое «Закрыть» сохраняет контекст.
Disabled наследует ConfigProvider.componentDisabled; false явно снимает его.
Disabled запрещает закрытие и callbacks, не удаляя содержимое.

OnClose получает нативный MouseEvent; event.preventDefault() синхронно отменяет
закрытие. Возвращаемое значение и Promise не ожидаются. Повторный вход из callback
не вызывает onClose ещё раз. Прямой DOM listener останавливает всплытие клика;
Enter и Space работают через нативную кнопку type=button
и не отправляют форму. Callback может удалить весь компонент или выбрать фокус.

После принятого закрытия содержимое удаляется из DOM. Изменение props не
открывает тот же экземпляр заново: для восстановления нужен новый экземпляр/key.
Tag не изменяет коллекцию владельца; при удалении записи или отмене onClose
владелец синхронизирует свою модель. Фокус из закрытой/удалённой кнопки переходит
на следующий доступный control текущего dialog/документа, затем предыдущий.
При скрытии closeIcon механизм также восстанавливает фокус. Явный выбор
владельца сохраняется; закрытие не создаёт дополнительных объявлений.

CheckableTag — отдельный export с обязательным children и декоративным icon.
Это нативный button type=button с aria-pressed, а не поле формы. Checked по
умолчанию false и полностью управляется владельцем. OnChange сообщает !checked;
компонент не присваивает checked и не поддерживает bind:checked/defaultChecked.
Внешнее обновление checked не вызывает callback. При disabled остаются значение
и содержимое, но кнопка исключается из Tab и не меняет состояние.

CheckableTag поддерживает Enter/Space и естественный Tab; при удалении кнопки
фокус восстанавливается рядом, сохраняя выбор владельца. Id/class/style и
aria-label/aria-labelledby/aria-describedby относятся к кнопке. Выбранные
фильтры, их объединение и связь с Form/Table принадлежат владельцу; скрытых
полей FormData и автоматической интеграции с FormItem нет.

Компоненты наследуют тему, primary, compact и RTL. Для тёмной темы Tag связывает
обычный цвет текста с токенами и адаптирует фон/границу preset/status меток
через color-mix и локальные токены палитры. Solid сохраняет исходный цвет;
обычный solid в тёмной теме использует светлый фон и тёмный текст.
Текст переносится на узком экране; close control не сжимается. Reduced motion
отключает встроенные transitions; ресурсы пользовательского Snippet принадлежат
его владельцу. Новая локаль не нужна: closeText уже входит в ruRU/enUS.

Галерея `/ant-design#tag` переключает цвета и варианты, показывает отмену
закрытия и восстановление экземпляра. Модель меток обрезает пробелы, проверяет
дубликаты без учёта регистра и защищает обязательную метку. Повторное добавление
удалённой метки получает новый key. CheckableTag фильтрует отдельную Table по
объединению выбранных статусов; пустой выбор показывает все строки. Ядро Table
не изменяется. Введённые значения выводятся обычными Svelte bindings.

В первой версии нет пользовательских CSS-цветов, ссылок/target,
CheckableTagGroup, drag-and-drop, внешней анимации, semantic classNames/styles,
prefixCls/rootClassName и устаревших bordered/closable/color-inverse aliases.

## Badge

```svelte
<script lang="ts">
  import { Badge, Button } from '$lib/components/ant-design';

  let unread = $state(120);
</script>

<Badge count={unread}>
  {#snippet children({ descriptionId })}
    <Button aria-describedby={descriptionId}>Уведомления</Button>
  {/snippet}
</Badge>
<Badge count={0} showZero size="small" />
<Badge status="processing" text="Сервис работает" />
```

Badge принимает числовой count и необязательный children Snippet. Без children
индикатор остаётся в потоке. По умолчанию overflowCount=99, showZero=false,
dot=false и size=medium; размер не наследуется от componentSize. Значение выше
предела отображается как `99+`. Конечные отрицательные и дробные числа сохраняются;
NaN/Infinity считаются отсутствующим count. Отрицательный или нечисловой предел
заменяется на 99; конечный неотрицательный overflowCount, включая 0, допустим.
Входные значения владельца компонент не изменяет.

Нулевой count скрыт, пока не включён showZero. Как в Ant Design 6.6.8,
dot с count=0 скрыт, а с showZero отображается число 0; без count dot виден.
Самостоятельный status виден и без count, и при скрытом нуле. При наличии
children для статусной точки нужен dot или отображаемый count/text. Видимый
числовой count имеет приоритет над оформлением status. Строка text='0' участвует
в правиле нуля; Snippet считается содержимым независимо от его результата.

Поддерживаются success, processing, default, error, warning и 13 preset цветов:
blue, purple, cyan, green, magenta, pink, red, orange, yellow, volcano, geekblue,
lime, gold. Text принимает строку или Snippet; preset color имеет приоритет над
цветом status. Offset — readonly-пара чисел [x, y]: y задаёт margin-top,
положительный x сдвигает от логического конца наружу, в RTL направление зеркально.
Неконечная координата заменяется на 0 независимо от второй координаты.
Компонент наследует тему и RTL; compact сохраняет собственные размеры Badge.

Визуальный индикатор скрыт от screen reader. Рядом расположен обычный скрытый
текст с полным значением, в том числе при `99+` и dot. Children получает
BadgeContext с нормализованным count и descriptionId, которым владелец может
описать кнопку, ссылку или другой control. При скрытии индикатора descriptionId
становится undefined. Children остаётся в DOM при изменении count: его фокус,
состояние и нативные события сохраняются. Сам Badge не создаёт остановок Tab,
live-region или автоматических объявлений. Aria-label/aria-labelledby именуют
необязательную группу; aria-describedby относится к корню. Подписи полного
значения/статусов переводятся через locale.badge с частичным наследованием.
Title по умолчанию содержит полный count; false/null убирают нативную подсказку,
строка заменяет её. Class/style относятся к корню, offset — к индикатору;
для самостоятельного статуса offset применяется к корню, как в исходнике.

Галерея `/ant-design#badge` показывает варианты и локальный список уведомлений
в Drawer. Непрочитанное количество вычисляется из сообщений. Чтение сохраняет
записи; фокус переходит на прочитанное сообщение или список после «Прочитать все».
После закрытия Drawer фокус возвращается к прежней кнопке даже при count=0.
Сброс создаёт исходные сообщения с новыми ключами. Сеть и persistence отсутствуют.

В первой версии нет Ribbon, строкового/Snippet count, произвольных CSS-цветов,
анимации прокрутки цифр, появления/исчезновения, semantic classNames/styles,
prefixCls/rootClassName и устаревших aliases. Processing использует исходную
CSS-пульсацию, которая отключается при reduced motion. Экспортируются BadgeProps,
BadgeStatus, BadgeColor, BadgeSize, BadgeText, BadgeContext и BadgeLocale.

## Avatar

```svelte
<script lang="ts">
  import { Avatar, Badge } from '$lib/components/ant-design';
</script>

<Avatar src="/anna.jpg" alt="Анна Новикова">АН</Avatar>
<Avatar shape="square" size={48} alt="Дмитрий Орлов">ДО</Avatar>
<Badge count={3}><Avatar alt="Вера Смирнова" size="large">ВС</Avatar></Badge>
```

Avatar — пассивное представление участника. Src принимает строку; пустой или
отсутствующий src выбирает fallback. Изображение имеет приоритет над icon
Snippet, затем children Snippet. При ошибке загрузки onError вызывается один раз
для текущего изображения; false сохраняет его и отменяет fallback. Остальные
результаты выбирают icon или children. Смена src/srcSet разрешает новую загрузку,
в том числе возврат к ранее ошибочному адресу. Изменение только обработчика
ошибки не повторяет загрузку. SrcSet сам по себе не включает режим изображения.
Поддерживаются нативные draggable и crossOrigin.

Ошибка привязана к версии пары src/srcSet. Позднее событие старого изображения
игнорируется; обработчик может синхронно заменить src, и новый источник
сохраняется. После гидратации также проверяется уже завершившаяся ошибочная
загрузка, чтобы fallback работал с изображениями из SSR. Listeners удаляются
при замене изображения и unmount. Компонент не загружает изображения вручную
и не вводит таймеров или повторных сетевых запросов поверх нативного img.

Shape по умолчанию circle; доступен square. Размер наследуется от
ConfigProvider.componentSize: middle соответствует medium. Именованные размеры
small/medium/large равны 24/32/40 px. Явный size переопределяет контекст;
числовой size принимает положительное конечное число, включая дробное.
Неположительное/неконечное число заменяется размером из контекста. Для числового
размера шрифт текста равен 18 px, иконки — size/2, как в исходнике.
Class/style относятся к корню; style имеет приоритет над числовыми размерами.
Темы и RTL наследуются, compact сохраняет собственные размеры Avatar.

Gap задаёт свободное место по краям текста, по умолчанию 4 px. Конечное
неотрицательное значение сохраняется, иначе используется 4. Длинный текст
уменьшается через transform без изменения содержимого; короткий не увеличивается.
Если gap занимает всю ширину или элемент скрыт, scale остаётся 1 до следующего
измерения. ResizeObserver следит за корнем и текстом: изменение размера,
шрифта, children и появление скрытого элемента пересчитывают масштаб. При замене
fallback или unmount observer отключается. На SSR инициалы видимы без измерения;
подгонка выполняется после mount. Собственной анимации нет.

Alt, aria-label или aria-labelledby задают полное имя корню с role=img;
оно сохраняется при смене изображения на fallback. Aria-describedby описывает
этот корень. Внутренние изображения и snippets скрыты от screen reader, а
snippets также inert: Avatar не содержит интерактивных действий. Без имени или
с aria-hidden=true весь Avatar декоративный. Для действия оберните Avatar
нативной кнопкой/ссылкой, задайте ей имя и при необходимости скройте повторяющий
его Avatar. Остановок Tab, live-region, автоматического фокуса и root onclick
компонент не добавляет. Title задаёт нативную подсказку.

Галерея `/ant-design#avatar` переключает содержимое, форму, размер, gap и отмену
fallback. Отдельный список участников сочетает Avatar с Badge и профилем в
Drawer. Выбор фото/инициалов/ошибочного источника сохраняется после закрытия
профиля; сброс восстанавливает участников и не меняет предпросмотр. Пример
использует локальные data URL без внешней сети и persistence.

AvatarProps, AvatarShape и AvatarSize экспортируются через index.ts.
Размеры по breakpoint, src Snippet, Image-интеграция, semantic classNames/styles
и prefixCls/rootClassName в первую версию не входят.

## AvatarGroup

```svelte
<script lang="ts">
  import { AvatarGroup, type AvatarGroupItem } from '$lib/components/ant-design';

  const members: AvatarGroupItem[] = [
    { key: 'anna', label: 'Анна Новикова', text: 'АН', src: '/anna.jpg' },
    { key: 'dmitry', label: 'Дмитрий Орлов', text: 'ДО' },
    { key: 'vera', label: 'Вера Смирнова', text: 'ВС', size: 'small' }
  ];
</script>

<AvatarGroup items={members} size="large" max={{ count: 2 }}
  aria-label="Команда проекта" />
```

AvatarGroup — отдельный Svelte export для Avatar.Group. Items принимает readonly
массив AvatarGroupItem с обязательными key и label. Key — строка или число;
первый повтор ключа сохраняется, следующие исключаются до применения лимита.
Число 0 и строка '0' различаются. Порядок владельца сохраняется, входной массив
и элементы не изменяются. Внутри видимой части и открытого списка элементы
сохраняют DOM и состояние Avatar при перестановке по key.

Item поддерживает props Avatar и необязательный text для строковых инициалов.
Children Snippet имеет приоритет над text; затем действуют правила Avatar:
изображение → icon → содержимое. Label даёт Avatar полное имя по умолчанию
через alt; явные alt/ARIA props сохраняются. Size/shape элемента переопределяют
значения группы, затем используются defaults Avatar/ConfigProvider. Строковые
и числовые размеры, fallback и подгонка текста работают как у Avatar.

Max.count ограничивает число видимых участников, а кнопка +N добавляется
отдельно: count=2 при пяти участниках даёт два Avatar и +3. Без лимита, при 0,
отрицательном или неконечном значении видны все. Положительная дробь усекается
до целого, но не ниже 1. При лимите не меньше числа уникальных участников
кнопка отсутствует. Max.style задаёт style Avatar внутри кнопки +N.

Max.popover принимает trigger, placement, arrow, autoAdjustOverflow и задержки
mouseEnterDelay/mouseLeaveDelay существующего Popover. По умолчанию используются
hover/click и top: нативная кнопка открывается кликом, Enter/Space или наведением.
Для клавиатуры при собственном trigger используйте click или focus. Popover
показывает именованный список скрытых участников с полными label; аватары
в этом списке декоративные. Они создаются только при открытии и удаляются при
закрытии. Переход элемента между видимой частью и Popover создаёт новый Avatar.

Корень — именованная группа, собственных остановок Tab и live-region у неё нет.
Кнопка +N имеет type=button, доступное имя с полным количеством и ARIA-связь с
Popover после mount. Escape возвращает фокус кнопке. Если лимит/список убирает
кнопку или группа удалена, фокус восстанавливается на доступном соседнем control
в текущем dialog или документе. Явный выбор фокуса владельцем сохраняется.
Повторное появление overflow создаёт закрытый Popover. Кнопка раскрытия
не блокируется через componentDisabled, поскольку показывает информацию.

Подписи группы, списка и кнопки берутся из locale.avatarGroup с частичным
наследованием. Aria-label/aria-labelledby переопределяют имя группы,
aria-describedby описывает корень; id/class/style также относятся к корню.
Группа наследует темы, compact и RTL, сохраняет логическое перекрытие 8 px,
подбирает обводку под фон темы и переносит аватары на узком экране.
Нативный Popover требует Popover API; собственных анимаций группа не добавляет.

Галерея `/ant-design#avatar-group` показывает добавление, удаление, перестановку,
лимит, размеры и форму команды. Имена выводятся обычными bindings; пустое имя
не добавляется. Новые и сброшенные участники получают свежие ключи. Фокус
сохраняется при перестановке и переходит к соседу после удаления. Внешней сети
и persistence нет. Экспортируются AvatarGroupProps, AvatarGroupItem,
AvatarGroupKey, AvatarGroupMax и AvatarGroupLocale. Responsive-размеры по
breakpoint, произвольные компоненты вместо Avatar и устаревшие maxCount/
maxStyle/maxPopoverPlacement/maxPopoverTrigger в эту версию не входят.

## Select

Без mode компонент сохраняет одиночный выбор и скалярный value. В
`mode="multiple"` value и callback используют массивы; варианты выбираются
из options, а выбранные элементы показываются с кнопками удаления.
`SelectProps<Value>` описывает прежний одиночный API,
`SelectProps<Value, 'multiple'>` — множественный. При использовании компонента
типы значений и callback выводятся из options и mode.

```svelte
<script lang="ts">
  import { Select } from '$lib/components/ant-design';

  const options = [
    { value: 0, label: 'Разработка' },
    { value: 1, label: 'Дизайн' },
    { value: 2, label: 'Архив', disabled: true }
  ];
  let teams = $state<number[]>([0]);
</script>

<label for="teams">Команды</label>
<Select id="teams" mode="multiple" {options} bind:value={teams} name="teams" allowClear />
```

Поиск по умолчанию выключен в одиночном режиме и включён в multiple;
`showSearch` переопределяет это. Нажатие варианта во множественном режиме
добавляет или удаляет его, очищает поисковый текст и сохраняет открытый список
и фокус в поле. Дубликаты выбранных значений убираются при отображении,
порядок первого появления и типы сохраняются: числовой `0` и строковый `"0"`
различаются. Массив владельца при этом не переписывается.

Удаление кнопкой или Backspace при пустом поиске снимает доступное выбранное
значение; Backspace выбирает последнее доступное. Disabled options нельзя
выбрать или удалить отдельно, включая уже выбранные. `allowClear` показывает
общую очистку всех значений. После пользовательского изменения callback
получает новый массив; изменение этого массива не меняет привязку. Внешние
обновления value/options не вызывают onValueChange. Если выбранный option
временно отсутствует, сохраняются последнее известное имя и disabled-состояние
в single и multiple. При появлении option берутся актуальные label/disabled. Для
значения, которого ещё не было в options, показывается String(value). Кэш содержит
только выбранные значения; он очищается при снятии выбора.

Для отдельного control `defaultValue` принимает readonly-массив и копируется
один раз. При привязке задавайте начальное значение у владельца, без defaultValue;
для очистки передавайте `[]`. Нативный reset формы в multiple восстанавливает
defaultValue, а при его отсутствии — пустой массив, обновляет привязку и закрывает
список без callbacks. Связь с внешней формой через атрибут form тоже учитывается.
Отменённый reset не изменяет Select; Form модели сбрасывает значения через
resetFields. Одиночный режим сохраняет прежнее управление сбросом владельцем.

С name или FormItem.name каждое выбранное значение создаёт отдельное поле
FormData под тем же именем. Используйте `new FormData(form).getAll('teams')`:
результат содержит строки, например `['0', '1']`. Пустой выбор даёт `[]`,
disabled control не передаёт значения. Поисковый текст в FormData не попадает.
Нативный required в multiple проверяет наличие выбранных значений, включая 0,
и не требует текста в поиске. Подпись удаления задаёт `locale.removeText`,
сообщение нативного required — `locale.selectRequiredText`.

В Form передавайте `value={form.values.teams}` и
`onValueChange={(value) => form.setFieldValue('teams', value)}`. Задайте тип
массива явно, например `createForm<{ teams: number[] }>({ initialValues: { teams: [] } })`.
`required` отклоняет пустой массив, min/max ограничивают количество элементов.
Галерея `/ant-design` содержит форму выбора от одной до трёх команд с отправкой
и сбросом. Режим tags пока не поддерживается.

### Удалённый поиск

Select принимает searchValue, onSearch, filterOption, loading, notFoundContent и
onPopupScroll. Вариант Ant Design 6.6.8 showSearch={{ searchValue, onSearch,
filterOption }} также поддержан; поля объекта имеют приоритет над одноимёнными
верхними props. Boolean showSearch сохраняет прежнее поведение. FilterOption=false
полностью отключает локальную фильтрацию, true сохраняет прежний поиск по label;
callback (search, option) позволяет собственную фильтрацию непустого запроса.

SearchValue управляет текстом поиска, onSearch получает пользовательский ввод.
Владелец может отклонить запрос, оставив searchValue прежним; внешняя замена текста
не вызывает onSearch. Без searchValue используется внутренний текст. Выбор,
закрытие и reset очищают внутренний поиск без onSearch; при управляемом поиске
владелец сам очищает searchValue, если это нужно. Поисковый текст не попадает в
FormData и не меняет выбранные value. OnSearch не имеет встроенного debounce.

Loading показывает spinner и aria-busy, сохраняя доступность уже выданных options.
При пустой выдаче по умолчанию выводится локализованный текст loading/empty;
notFoundContent заменяет его строкой, числом или Snippet, null убирает содержимое.
Ошибка не является отдельным upstream prop: используйте status="error" и
notFoundContent, при необходимости внешний alert и кнопку повтора. Для кнопки
внутри popup предотвращайте pointerdown default, чтобы сохранять фокус поля;
дублируйте действие вне popup для последовательной клавиатурной навигации.
OnPopupScroll получает native scroll event с currentTarget=listbox; решение о
следующей странице и объединение options остаются у потребителя.

```svelte
<Select options={remote.options} bind:value
  showSearch={{ searchValue: remote.searchValue, onSearch: remote.search, filterOption: false }}
  loading={remote.loading} notFoundContent={emptyState}
  onPopupScroll={event => {
    const list = event.currentTarget;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 16) remote.more();
  }} />
```

Галерея /ant-design#select-remote использует отдельную
[presentation model](../../presentation/ant-design/remote-select.model.svelte.ts)
с debounce, AbortSignal, защитой от поздних ответов
уже во время debounce, стабильным объединением страниц по value и повтором
последнего неудачного cursor. Dispose отменяет таймер/запрос. Источник демонстрационный,
сетевые API, таймеры и server-specific ошибки не входят в библиотечный Select.
Пока не перенесены остальные поля showSearch config, labelInValue, tags,
виртуализация, произвольный popupRender и общий полный rc-select API.

## Checkbox

```svelte
<script lang="ts">
  import { Checkbox } from '$lib/components/ant-design';

  let checked = $state(false);
  let indeterminate = $state(true);
</script>

<Checkbox bind:checked bind:indeterminate name="notifications" value="enabled">
  Получать уведомления
</Checkbox>
```

`checked` поддерживает привязку и callback `onCheckedChange(checked)`.
Для отдельного control можно задать `defaultChecked`; с привязкой задавайте
начальное значение у владельца. Нативный reset формы возвращает `defaultChecked`
и обновляет привязку. Сброс и внешние обновления props не вызывают
`onCheckedChange`; нативный `onchange` также доступен.

`indeterminate` задаёт смешанное состояние, поддерживает привязку и сбрасывается
при пользовательском переключении. Оно не меняет `checked` и значение FormData.
Отмеченный checkbox передаёт `name=value` (по умолчанию value равен `on`),
неотмеченный или disabled checkbox не включается в FormData.

В FormItem передавайте `checked={form.values.accepted}` и
`onCheckedChange={(value) => form.setFieldValue('accepted', value)}`. Для модели
с boolean задайте тип явно: `createForm<{ accepted: boolean }>(...)`.
Чтобы требовать именно `true`, используйте
`validator: (value) => value === true ? undefined : 'Подтвердите согласие.'`.
Встроенное правило `required` проверяет наличие значения, и `false` считается
заданным значением. `form.resetFields()` возвращает значение из `initialValues`.

## CheckboxGroup

CheckboxGroup переносит выбор нескольких флажков в одно поле с массивом.
`CheckboxGroupProps<Value>` и `CheckboxGroupOption<Value>` поддерживают
string, number и boolean. Options принимает примитивы или объекты
`{ value, label, disabled? }`; подпись примитива получается через String.

```svelte
<script lang="ts">
  import { CheckboxGroup } from '$lib/components/ant-design';

  const options = [
    { value: 'read', label: 'Просмотр' },
    { value: 'edit', label: 'Редактирование' },
    { value: 'archive', label: 'Архив', disabled: true }
  ];
  let permissions = $state<string[]>(['read']);
</script>

<CheckboxGroup {options} bind:value={permissions} name="permissions" aria-label="Права доступа" />
```

Каждое пользовательское переключение обновляет bind:value и вызывает
`onValueChange(values)` с новым массивом в порядке options. Массив callback
не разделяется с привязкой. Повторяющиеся options показываются один раз;
первая подпись и disabled-состояние сохраняются. Числовой 0 и строковый "0",
boolean false и строковый "false" остаются разными значениями.

Внешние обновления value/options не переписывают массив владельца и не вызывают
callback. Временно отсутствующие варианты скрываются, а возвращённые снова
отображают выбранное состояние. При следующем пользовательском переключении
массив содержит только текущие options, без повторов, в их текущем порядке.

Группа наследует disabled из Form/FormItem и ConfigProvider; явный
`disabled={false}` переопределяет наследование. Disabled группы блокирует все
варианты, disabled option блокирует только соответствующий checkbox.
Уже выбранный disabled-вариант сохраняется в массиве.

Для отдельной группы defaultValue принимает readonly-массив и копируется один
раз. С bind:value задавайте начальное значение у владельца без defaultValue.
Нативный reset формы восстанавливает defaultValue или пустой массив, включая
привязку, без callbacks. Массив обновляется в следующей задаче после события
reset, чтобы учесть отмену события; отменённый reset сохраняет текущий выбор.
Внешняя форма через атрибут form поддерживается. В Form сбросом управляет
модель через resetFields.

Группа содержит нативные checkbox: Tab перемещает фокус, Space и нажатие подписи
переключают вариант. С name или FormItem.name отмеченные доступные варианты
попадают в FormData под одним именем. Читайте их через
`new FormData(form).getAll('permissions')`. Результат содержит строки в порядке
options; disabled, отсутствующие и невыбранные варианты исключаются.
Например, выбранные числовой 0 и boolean false передаются как `['0', 'false']`.

В Form используйте `value={form.values.permissions}` и
`onValueChange={(value) => form.setFieldValue('permissions', value)}`.
Правила required/min/max проверяют массив целиком. Required не назначается
каждому input, поэтому выбор всех вариантов не становится обязательным.
Имя поля, описание и ошибки передаются из FormItem; группа использует fieldset
и получает доступное имя из label FormItem либо aria-label/aria-labelledby.
При ошибке или нажатии подписи FormItem фокус переходит к первому доступному
варианту; пустая группа может получить фокус сама, без дополнительного шага Tab.

Галерея `/ant-design#checkbox` показывает форму выбора прав с общим флажком
«Все права», промежуточным состоянием, проверкой количества, отправкой и сбросом.
Общий выбор управляется владельцем через массив, как и в примере Ant Design.
Группа пока строится через options; вложенные Checkbox и snippets для вариантов
не поддерживаются.

## Radio и RadioGroup

Radio использует нативный input[type=radio], поддерживает bind:checked,
defaultChecked и `onCheckedChange(checked)`. Содержимое передаётся snippet,
как у Checkbox. Варианты с одинаковым непустым name в одной форме и одном
DOM-корне образуют нативную группу. Выбор одного снимает соседний; bind:checked
соседа тоже обновляется. Его callback при этом не вызывается: нативный change
получает выбранный radio. Внешнее обновление checked синхронизирует соседей без
callbacks. Нативный onchange также доступен. Без name отдельные Radio независимы.

Для общего типизированного значения используйте RadioGroup.
`RadioGroupProps<Value>` и `RadioOption<Value>` принимают string, number и
boolean. Options содержит примитивы или `{ value, label, disabled? }`.
Повторяющиеся значения отображаются один раз, с первой подписью и disabled.

```svelte
<script lang="ts">
  import { RadioGroup } from '$lib/components/ant-design';

  const options = [
    { value: 0, label: 'Базовый' },
    { value: 1, label: 'Командный' },
    { value: 2, label: 'Архивный', disabled: true }
  ];
  let plan = $state<number | undefined>(0);
</script>

<RadioGroup {options} bind:value={plan} name="plan" aria-label="Тариф" orientation="vertical" />
```

Пользовательский выбор обновляет bind:value и вызывает onValueChange(value)
один раз, только при смене значения. Числовой 0 и boolean false остаются
полноценными выбранными значениями и отличаются от строк "0" и "false".
Для внешней очистки присвойте undefined. Изменение props не вызывает callbacks
и не переписывает значение владельца. Если выбранный вариант исчезает,
в группе нет отмеченного input; после возвращения option выбор восстанавливается.

Без name и FormItem.name RadioGroup назначает уникальное нативное имя,
чтобы соседние группы не снимали выбор друг друга. Это имя также используется
в FormData; для стабильного имени поля задавайте name явно. Одинаковое имя
в разных формах не объединяет варианты. Внутри одной формы для независимых
групп используйте разные имена.

Стрелки переключают нативный выбор и фокус, пропуская disabled options;
Space выбирает сфокусированный вариант, Tab выходит из группы. Orientation
по умолчанию horizontal; vertical располагает варианты столбцом. Группа
наследует disabled из Form/FormItem и ConfigProvider. Явный disabled=false
переопределяет наследование, disabled группы блокирует все options.

Для отдельного Radio defaultChecked, а для RadioGroup defaultValue
фиксируются при создании. С привязкой задавайте начальное значение у владельца
без defaults. Нативный reset восстанавливает начальные значения и обновляет
привязки в следующей задаче после события, без callbacks. Отменённый reset
сохраняет текущий выбор. Атрибут form связывает controls с внешней формой.
Form сбрасывает значения через модель resetFields.

Выбранный доступный radio передаёт в FormData строку под своим name.
`new FormData(form).get('plan')` возвращает, например, '0' или 'false';
при отсутствии выбранного доступного варианта — null.
Required использует нативное правило группы: нужен один
выбранный вариант среди её input. Для пустого списка options используйте
правила Form, поскольку нативного input в такой группе нет.

В Form передавайте `value={form.values.plan}` и
`onValueChange={(value) => form.setFieldValue('plan', value)}`. Правило required
проверяет значение поля и принимает 0/false. Для отдельного Radio с boolean
используйте checked/onCheckedChange; если требуется именно true, задайте
custom validator, как в примере Checkbox.

RadioGroup получает из FormItem имя, подпись, required и описание ошибки.
Fieldset с ролью radiogroup сообщает required/invalid; отдельные Radio связаны
с описанием ошибки. Нажатие подписи FormItem и ошибка формы переводят фокус
к выбранному доступному варианту либо первому доступному. Пустая группа может
получить фокус сама, без дополнительного шага Tab.

Галерея `/ant-design#radio` показывает отдельные Radio для расположения
вариантов и форму с числовым тарифом, boolean-публикацией, отправкой и сбросом.
RadioGroup пока строится через options; вложенные Radio и Radio.Button
не поддерживаются.

## Switch

Switch переключает boolean-состояние через `bind:checked` и
`onCheckedChange(checked)`. Отдельному control можно задать defaultChecked;
он фиксируется при создании. С привязкой задавайте начальное значение у
владельца без defaultChecked. Внешние изменения checked не вызывают callback.

```svelte
<script lang="ts">
  import { Switch } from '$lib/components/ant-design';

  let notifications = $state(false);
</script>

<Switch id="notifications" bind:checked={notifications} name="notifications">
  {#snippet checkedChildren()}Вкл{/snippet}
  {#snippet unCheckedChildren()}Выкл{/snippet}
</Switch>
<label for="notifications">Уведомления</label>
```

Компонент использует button с type=button, role=switch и aria-checked.
Space, Enter, нажатие control или связанной подписи меняют состояние один раз
и не отправляют форму. Нативный onclick доступен; preventDefault в этом
обработчике отменяет переключение. Доступное имя задаётся через label,
FormItem или aria-label/aria-labelledby. Snippets checkedChildren и
unCheckedChildren предназначены для коротких подписей и декоративных иконок.
Они скрыты от accessibility tree, поэтому имя control не меняется вместе
с текстом состояния.

Размеры — middle и small. По умолчанию наследуется componentSize;
small включает малый размер, middle/large провайдера используют обычный.
Явный size переопределяет наследование. Disabled наследуется из Form/FormItem
и ConfigProvider, disabled=false переопределяет его. Loading показывает
индикатор, выставляет aria-busy и блокирует действия даже с disabled=false.
Существующее checked-состояние при блокировке сохраняется. Стили поддерживают
светлую/тёмную тему, основные цвета, RTL и prefers-reduced-motion.

С name или FormItem.name включённый доступный Switch передаёт `name=on` в
нативную FormData, как Checkbox. `new FormData(form).get('notifications')`
возвращает 'on' либо null; false, disabled и loading исключают поле.
Модель Form при этом хранит boolean, включая false. Атрибут form связывает
control с внешней формой. Нативный reset восстанавливает defaultChecked
и обновляет привязку в следующей задаче после события, без callbacks.
Отменённый reset сохраняет текущее состояние. При удалении Switch ожидающий
reset отменяется.

Для Form передавайте `checked={form.values.notifications}` и
`onCheckedChange={(value) => form.setFieldValue('notifications', value)}`.
FormItem передаёт id, имя, required, ошибки и описание кнопке. Ошибка формы
переводит фокус на Switch; blur отмечает поле touched. Reset формы использует
resetFields модели. Правило required считает false заданным значением;
для обязательного включения задайте custom validator:
`validator: (value) => value === true ? undefined : 'Включите настройку.'`.
Проверкой значения управляют правила Form.

Сохранение и ошибки остаются у владельца: Switch сообщает новое состояние,
а владелец задаёт checked и loading. Галерея `/ant-design#switch` содержит
пример асинхронного сохранения с [моделью состояния](../../presentation/ant-design/switch-setting.model.svelte.ts):
ожидание блокирует повторные запросы, успех подтверждает значение, ошибка
возвращает последнее сохранённое состояние, следующая попытка очищает ошибку.
При удалении примера запрос отменяется, поздний результат игнорируется.
Флажок ошибки в примере влияет только на следующее сохранение. Ниже показан
малый Switch с проверкой и сбросом Form. API использует checked/defaultChecked;
React-алиасы value/defaultValue пока не поддерживаются.

## Pagination

```svelte
<script lang="ts">
  import { Pagination } from '$lib/components/ant-design';

  let current = $state(1);
  let pageSize = $state(10);
</script>

<Pagination total={137} bind:current bind:pageSize>
  {#snippet showTotal(total, range)}{range[0]}–{range[1]} из {total}{/snippet}
</Pagination>
```

`total` по умолчанию равен 0. `current` и `pageSize` поддерживают привязку;
для отдельных controls доступны `defaultCurrent=1` и `defaultPageSize=10`.
Начальные значения читаются один раз. При привязке задавайте их у владельца.

Переход вызывает `onChange(page, pageSize)`. Повторное нажатие текущей страницы
не вызывает событие. Смена размера сначала вызывает
`onShowSizeChange(previousCurrent, pageSize)`, затем
`onChange(clampedCurrent, pageSize)`, сохраняя номер страницы в допустимых пределах.
Callback получает номера с учётом отображаемого диапазона.

Отображаемая страница ограничена диапазоном `1…ceil(total / pageSize)`.
Изменение props, включая уменьшение `total`, само не записывает исправленное
значение владельцу и не вызывает callbacks. Для пустой коллекции отображается
страница 1 и диапазон `[0, 0]`; `hideOnSinglePage` скрывает навигацию.
Дробные значения округляются вниз, total ограничен снизу нулём, current и
pageSize — единицей, все значения — сверху `Number.MAX_SAFE_INTEGER`.
Для NaN и бесконечных значений используются defaults 0, 1 и 10.
Список номеров и переходов содержит не более девяти элементов независимо от total.

Выбор размера автоматически показывается при `total > 50`; это меняется через
`showSizeChanger`. `pageSizeOptions` по умолчанию равен `[10, 20, 50, 100]`.
Допустимы положительные целые безопасные числа; дубликаты удаляются, варианты
сортируются, текущий размер добавляется в список. `showTotal` получает
нормализованный total и диапазон записей с нумерацией от 1.
На узком экране элементы переносятся на следующую строку, а выбор размера
остаётся доступным.

## Table

```svelte
<script lang="ts">
  import { Table, type TableColumn, type TableKey, type TableSorter } from '$lib/components/ant-design';

  interface Person { id: number; name: string; score: number }

  const people: Person[] = [
    { id: 0, name: 'Анна', score: 30 },
    { id: 1, name: 'Борис', score: 10 }
  ];
  const columns: TableColumn<Person>[] = [
    { key: 'name', title: 'Имя', render: personName },
    { key: 'score', title: 'Баллы', dataIndex: 'score', sorter: (left, right) => left.score - right.score }
  ];
  let current = $state(1);
  let pageSize = $state(10);
  let sorter = $state<TableSorter | null>(null);
  let selectedRowKeys = $state<TableKey[]>([]);
</script>

{#snippet personName(person: Person)}<strong>{person.name}</strong>{/snippet}

<Table
  dataSource={people}
  {columns}
  rowKey="id"
  caption="Участники"
  bind:current
  bind:pageSize
  bind:sorter
  bind:selectedRowKeys
  rowSelection
  scroll={{ x: 600 }}
/>
```

По умолчанию используется `mode="client"`: фильтрация, сортировка и разбиение
на страницы выполняются локально; переданный `total` в этом режиме игнорируется.
`dataSource` и `columns` принимают readonly-массивы. Каждая колонка имеет
уникальный строковый `key` и текстовый `title`. `dataIndex` выбирает одно поле
`keyof Row`; null/undefined отображаются пустой строкой, остальные значения —
через безопасное текстовое преобразование. `render(record, index)` заменяет
содержимое ячейки типизированным snippet; index начинается с 0 на текущей
странице. Колонка также принимает `width` и `align`.

`rowKey` задаёт поле или функцию получения ключа, по умолчанию используется
поле `key`. Ключ должен быть уникальной строкой или конечным числом; `0`
поддерживается. Отсутствующие/повторные ключи строк, повторные ключи колонок и
пустой список колонок вызывают явную ошибку. Позиции строк не используются как
идентификаторы выбора.

Сортировка задаётся через `sorter: { columnKey, order } | null` и поддерживает
привязку. Компаратор принадлежит `column.sorter`. Нажатие заголовка переключает
`ascend → descend → null`. Равные значения сохраняют порядок исходных записей
в обоих направлениях; входной массив не изменяется. После фильтрации сортируется
весь прошедший набор, затем выбирается текущая страница. Номер страницы при сортировке
сохраняется. Если колонка удалена или не имеет компаратора, отображается исходный
порядок прошедших фильтр записей без изменения состояния владельца.

Пагинация включена по умолчанию: `current=1`, `pageSize=10`; оба props
поддерживают привязку. `pagination={false}` показывает все записи.
Объект `pagination` передаёт настройки `showSizeChanger`, `pageSizeOptions`,
`hideOnSinglePage`, `showTotal` и `aria-label` существующему Pagination. В клиентском
режиме total равен количеству записей после фильтрации. При уменьшении набора отображаемая страница
ограничивается допустимым диапазоном; props владельца не переписываются.

`rowSelection` включает Checkbox-колонку; объект
`{ getCheckboxProps: (record) => ({ disabled, 'aria-label': ... }) }` позволяет
отключить отдельные строки и изменить их доступное имя. `selectedRowKeys`
поддерживает привязку. Выбор всех строк затрагивает только доступные строки
текущей страницы и сохраняет ключи с других страниц. Заголовок игнорирует
disabled-строки при расчёте checked/indeterminate и отключается, если доступных
строк нет. При выключенной пагинации выбор всех относится ко всему набору.
Выбранные ключи сохраняются после замены или удаления записей, пока владелец
или пользователь не изменит выбор.

`onChange({ action, pagination, sorter, currentDataSource, filters })` вызывается
при пользовательской сортировке, фильтрации или смене страницы/размера.
`action` равен `sort`, `filter` или `paginate`, pagination содержит
`{ current, pageSize, total }`, а currentDataSource в клиентском режиме — весь отфильтрованный и
отсортированный набор до разбиения на страницы. Filters передаётся при наличии
фильтруемых колонок.
`onSelectionChange(keys, records, { type })` вызывается отдельно; type равен
`single` или `all`. Records идут в порядке выбранных ключей и содержат только
записи, присутствующие в текущем dataSource, включая скрытые фильтром;
отсутствующие записи не кэшируются.
Внешние изменения props, данных и колонок не вызывают эти callbacks.

Для отдельных таблиц доступны начальные `defaultCurrent`, `defaultPageSize`,
`defaultSorter`, `defaultSelectedRowKeys`, которые читаются один раз. При
привязке задавайте начальные значения у владельца. Для сброса присвойте
`sorter=null`, `selectedRowKeys=[]` и нужную страницу.

`loading` выставляет aria-busy, показывает статус загрузки и блокирует
сортировку, выбор и пагинацию. `disabled` наследуется из ConfigProvider и может
быть явно переопределён. Интерактивное содержимое собственных snippets
отключает владелец. `empty` заменяет текст пустого состояния snippet.
Размер наследуется из `componentSize`; доступны `bordered`, `caption`,
`aria-label`, `class` и `style`. `scroll.x` задаёт минимальную ширину таблицы:
горизонтальная прокрутка остаётся внутри фокусируемого контейнера.

### Раскрываемые строки

`expandable` добавляет перед колонкой выбора отдельную колонку с кнопками
раскрытия. `expandedRowRender(record, index)` — типизированный snippet с
подробностями; index начинается с 0 среди строк данных текущей страницы.
`rowExpandable(record)` позволяет скрыть кнопку и подробности отдельных строк.
По умолчанию раскрытие доступно для каждой переданной записи.

```svelte
<script lang="ts">
  import { Button, Table, type TableColumn, type TableKey } from '$lib/components/ant-design';

  interface Person { key: number; name: string; email: string; active: boolean }
  const people: Person[] = [
    { key: 0, name: 'Анна', email: 'anna@example.com', active: true },
    { key: 1, name: 'Борис', email: 'boris@example.com', active: false }
  ];
  const columns: TableColumn<Person>[] = [{ key: 'name', title: 'Имя', dataIndex: 'name', width: 200 }];
  let expanded = $state<TableKey[]>([0]);
</script>

{#snippet details(person: Person, index: number)}<p>{index + 1}. {person.name}: {person.email}</p>{/snippet}
<Button onclick={() => { expanded = []; }}>Свернуть все</Button>
<Table dataSource={people} {columns} caption="Участники"
  expandable={{ expandedRowRender: details, rowExpandable: (person) => person.active, fixed: true }}
  bind:expandedRowKeys={expanded} />
```

`expandedRowKeys` поддерживает привязку. Для отдельной таблицы доступны
`defaultExpandedRowKeys`, которые читаются один раз. `[]` сворачивает все строки.
Раскрытие использует тот же rowKey, что и выбор; числовой `0` и строковый `"0"`
различаются. Ключи сохраняются при сортировке, фильтрации, смене страниц,
замене/удалении данных, выключении expandable и изменении rowExpandable.
Подробности отображаются только для доступных строк текущего dataSource и страницы;
кэша записей нет. Возвращённая запись с сохранённым ключом снова раскрывается.

Пользовательское переключение сначала обновляет привязку, затем вызывает
`onExpand(expanded, record)` и `onExpandedRowsChange(keys)` в этом порядке.
Keys содержит все раскрытые ключи, включая отсутствующие на текущей странице.
Внешние изменения props не вызывают эти callbacks. Раскрытие не меняет выбор
или пагинацию и не вызывает общий onChange. currentDataSource и total считают
только записи, строки подробностей в них не входят.

`expandable.columnWidth` принимает число или CSS-ширину, по умолчанию 48px.
`columnTitle` задаёт видимый заголовок; по умолчанию он только доступен скринридеру.
`fixed: true` закрепляет колонку у начала строки, включая RTL. Смещения и colspan
учитывают раскрытие, выбор и данные. При горизонтальной прокрутке содержимое
подробностей остаётся в ширине видимой области. Ширины колонок данных сохраняются.

Кнопка имеет type=button и aria-expanded; в раскрытом состоянии aria-controls
ссылается на существующий блок подробностей с уникальным ID. Enter и Space
переключают состояние и сохраняют фокус на кнопке. Loading и disabled блокируют
переключение, disabled наследуется из ConfigProvider. Подписи задаются через
`locale.table.expandColumn`, `expandRow`, `collapseRow`.

Snippet создаётся только для видимой раскрытой строки. Сворачивание, скрытие
фильтром, уход со страницы или запрет rowExpandable удаляют его из DOM и
сбрасывают локальное состояние controls. Данные, которые нужно сохранить,
держите у владельца. SSR сразу отображает переданные раскрытые строки.
Раскрытие нажатием на всю строку, forceRender и иерархические данные пока не
поддерживаются. Живой пример карточек участников доступен на `/ant-design`.

### Закрепление заголовка и колонок

`scroll.y` задаёт максимальную высоту прокручиваемой области вместе с caption
и заголовком. Число означает пиксели, строка — CSS-длину, например `"20rem"` или
`"calc(100vh - 240px)"`. Заголовок остаётся сверху при вертикальной прокрутке;
Pagination находится снаружи этой области. Без scroll.y высота не ограничена
и заголовок прокручивается вместе с таблицей.

`column.fixed` принимает `true` (то же, что `"start"`), `"start"`, `"end"` или
`false`. Start закрепляет колонку у начала строки, end — у конца; в RTL стороны
меняются автоматически. `rowSelection={{ fixed: true }}` закрепляет колонку
выбора у начала строки. По умолчанию колонки не закреплены.

```svelte
<script lang="ts">
  import { Table, type TableColumn } from '$lib/components/ant-design';

  interface Person { key: number; name: string; team: string; tasks: number }
  const people: Person[] = Array.from({ length: 30 }, (_, index) => ({
    key: index, name: `Участник ${index + 1}`, team: 'Разработка', tasks: index
  }));
  const columns: TableColumn<Person>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name', width: 200, fixed: true },
    { key: 'team', title: 'Команда', dataIndex: 'team', width: '24rem' },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', width: 100, fixed: 'end' }
  ];
</script>

<Table dataSource={people} {columns} caption="Участники"
  rowSelection={{ fixed: true }} scroll={{ x: 1000, y: 320 }} pagination={false} />
```

Несколько колонок с одной стороны получают смещения по фактической ширине
ячеек, включая закреплённую колонку выбора. Ширина пересчитывается при resize,
изменении содержимого и состава колонок. Можно использовать числовые и CSS-ширины;
для предсказуемого макета задавайте width и scroll.x. Если суммарная ширина
закреплённых колонок не меньше ширины области, горизонтальное закрепление
временно отключается. Все колонки доступны через прокрутку, заголовок остаётся
закреплённым. При расширении области закрепление восстанавливается.

Используется одна нативная таблица с CSS sticky. Порядок фокуса и snippets
сохраняется; отступы прокрутки учитывают закреплённые области. Фильтры используют
верхний слой popover и обновляют положение при прокрутке и изменении ширин.
Закреплённые ячейки имеют непрозрачный фон с учётом темы, сортировки и выбора.
ResizeObserver отключается при изменении конфигурации и unmount.

SSR сохраняет полную разметку, данные и CSS-закрепление заголовка. Горизонтальное
закрепление активируется после измерения ширин в браузере; до гидратации
колонки доступны обычной прокруткой. Изменения layout не вызывают onChange или
onSelectionChange. Фильтрация, сортировка, выбор и пагинация сохраняют поведение
в обоих режимах данных. В галерее `/ant-design` переключатель находится в примере
Table с API.

### Фильтры колонок

В клиентском режиме в колонке задаются плоский список `filters: [{ text, value }]` и предикат
`onFilter(value, record)`. Значения — string, number или boolean; числовой `0`
и `false` сохраняют тип. Несколько выбранных значений одной колонки объединяются
через OR, фильтры разных колонок — через AND.

```svelte
<script lang="ts">
  import { Table, type TableColumn, type TableFilters } from '$lib/components/ant-design';

  interface Person { key: number; name: string; active: boolean }

  const people: Person[] = [
    { key: 0, name: 'Анна', active: true },
    { key: 1, name: 'Борис', active: false }
  ];
  const columns: TableColumn<Person>[] = [
    { key: 'name', title: 'Имя', dataIndex: 'name' },
    {
      key: 'active', title: 'Статус', dataIndex: 'active', filterMultiple: false,
      filters: [{ text: 'Активен', value: true }, { text: 'Приостановлен', value: false }],
      onFilter: (value, person) => person.active === value
    }
  ];
  let filters = $state<TableFilters>({});
</script>

<Table dataSource={people} {columns} bind:filters caption="Участники" />
```

`filters` таблицы — объект, где ключ соответствует `column.key`, а значение
содержит массив выбранных значений. Для отдельной таблицы доступен `defaultFilters`,
который читается один раз; при привязке задавайте начальное состояние у владельца.
`filterMultiple` по умолчанию равен true и использует Checkbox; false включает
одиночный выбор нативными radio.

Пункты меню меняют черновик. «Применить» подтверждает его и закрывает меню;
«Сбросить» очищает черновик, после чего нужно нажать «Применить». Escape,
нажатие снаружи и уход фокуса отменяют неподтверждённые изменения. Повторное
открытие начинает с применённого состояния. Изменение применённых значений колонки,
вариантов, режима выбора, disabled/loading или удаление колонки закрывают
устаревшее меню.

Пользовательское применение изменившегося фильтра задаёт `current=1` и вызывает
один `onChange` с `action='filter'`. Неизменившийся набор значений не вызывает
callback и не сбрасывает страницу. Если настроены фильтруемые колонки,
`onChange` также получает `filters` с нормализованными активными критериями;
без таких колонок формат прежних событий сохраняется. В типе TableChange
поле filters опционально. В клиентском режиме `currentDataSource` содержит отфильтрованный и
отсортированный набор до пагинации, pagination.total — его длину.

Внешние изменения filters, dataSource и columns не вызывают callbacks и не
переписывают страницу владельца. Дубликаты значений удаляются; неизвестные
варианты, удалённые колонки и колонки без списка/предиката в клиентском режиме игнорируются при
отображении. В одиночном режиме используется первое допустимое значение.
Состояние владельца сохраняется, поэтому возвращённая колонка может снова
применить свой фильтр. Выбранные строки сохраняют ключи при скрытии фильтром;
«выбрать всё» затрагивает только доступные строки видимой страницы.

Меню использует нативный popover поверх прокручиваемой таблицы. Tab перемещает
фокус между controls, Space переключает Checkbox, стрелки меняют radio,
Enter на пункте подтверждает фильтр, Escape закрывает меню с возвратом к кнопке.
Меню остаётся в границах viewport и наследует тему, RTL и `locale.table`:
`filterTitle`, `filterApply`, `filterReset`.

### Серверный режим

`mode="server"` показывает переданную страницу `dataSource` целиком и в исходном
порядке. Table не фильтрует, не сортирует и не разрезает её повторно, даже если
переданы локальные `sorter`/`onFilter` или число строк отличается от pageSize.
Передавайте `total` из ответа API: он определяет диапазон Pagination. Если total
не указан, используется длина dataSource. Его нормализация совпадает с Pagination.
`pagination={false}` скрывает навигацию и сохраняет все переданные строки.

Для удалённой сортировки задавайте `column.sorter: true`; для фильтра достаточно
`column.filters` без `onFilter`. Значение `sorter: true` используется только в
серверном режиме; компаратор поддерживается в обоих режимах, но исполняется только
в клиентском. Правила нормализации фильтров, одиночного выбора и цикл сортировки
сохраняются. Сортировка сохраняет страницу, применение изменившегося фильтра
задаёт страницу 1.

`onChange` получает текущие `pagination`, `sorter`, `filters` и причину действия.
В серверном режиме `currentDataSource` содержит только переданную страницу,
а `pagination.total` — внешний total. Строки остаются прежними до замены
dataSource владельцем. Внешние обновления props не вызывают callback и не
переписывают состояние владельца, включая current при уменьшении total.
Владелец должен запросить допустимую страницу, если текущая больше нового
диапазона; Table сам запросов не выполняет.

`selectedRowKeys` сохраняет ключи между заменами страниц. `onSelectionChange`
передаёт все выбранные ключи, но records содержит только выбранные записи,
присутствующие в текущем dataSource. Кэш записей других страниц отсутствует.
Выбор всех действует на доступные строки загруженной страницы.

В приложении [RemoteTableExample.svelte](../../presentation/ant-design/RemoteTableExample.svelte)
показывает полную связку. [Модель загрузки](../../presentation/ant-design/remote-table.model.svelte.ts)
принадлежит presentation и не входит в пакет UI. Её loader получает
`{ current, pageSize, sorter, filters }` и `AbortSignal`, возвращает
`Promise<{ rows, total }>`. Модель отменяет предыдущий запрос и игнорирует его
поздний ответ, даже если источник не поддерживает отмену. Во время загрузки строки
очищаются; ошибка доступна отдельно, retry повторяет последний запрос. При
уменьшении total модель запрашивает исправленную страницу перед публикацией строк.
На unmount вызывается dispose для отмены и блокировки поздних обновлений.

Минимальное подключение модели в этом приложении:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Table, type TableColumn } from '$lib/components/ant-design';
  import { createRemoteTable } from '$lib/presentation/ant-design/remote-table.model.svelte';
  import { createMemberSource, type RemoteMember } from '$lib/presentation/ant-design/remote-members';

  const remote = createRemoteTable(createMemberSource().load);
  const columns: TableColumn<RemoteMember>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name', sorter: true },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', sorter: true }
  ];
  onMount(() => { void remote.load(); return remote.dispose; });
</script>

{#if remote.error}<p role="alert">{remote.error}</p><Button onclick={remote.retry}>Повторить</Button>{/if}
<Table mode="server" {columns} dataSource={remote.rows} total={remote.total}
  bind:current={remote.current} bind:pageSize={remote.pageSize}
  bind:sorter={remote.sorter} bind:filters={remote.filters}
  loading={remote.loading} onChange={remote.change} caption="Удалённые участники" />
```

Источник примера имитирует API в памяти с задержкой и управляемой ошибкой;
реального endpoint в проекте нет. Для своего API замените loader, передавайте
signal в fetch и возвращайте строки страницы вместе с общим количеством.
В примере загрузка начинается на onMount; SSR отображает пустую таблицу без запросов.

## Темы и локализация

ConfigProvider принимает `theme={{ mode, primary, compact }}`, где `mode` равен
`light` или `dark`, а `primary` — `blue`, `purple` или `green`.
`componentSize` равен `small`, `middle` или `large`. Вложенный провайдер наследует
неуказанные настройки родителя. `componentDisabled` можно переопределить на
отдельном control.

Тёмная тема и компактный режим реализованы локальными CSS-переопределениями.
Spacing использует size map 6.6.8: compact size/SM=8, XS/XXS=4, LG/MD=16,
MS=12, XL=32, XXL=48px с padding/margin/content aliases. Каждый provider
разрешает aliases в собственном scope; явный compact=false восстанавливает
обычные интервалы, inline CSS variables сохраняют приоритет. Проверки геометрии
Card/Flex/Divider и вложенных provider — `e2e/theme.spec.ts`, `?fixture=theme`.
Произвольные seed tokens, component tokens и алгоритмы тем оригинального
ConfigProvider пока не перенесены.

По умолчанию используется `ruRU`; `enUS` также экспортируется. `locale` принимает
частичное переопределение подписей кнопок и служебных сообщений. Вложенная группа
`locale.pagination`, `locale.table` и `locale.inputNumber` также объединяются с настройками родителя по отдельным
подписям. Тексты правил валидации задаются в `message` или возвращаются из validator.

## Формы и валидация

Создавайте модель в scope компонента или presentation model, чтобы разные формы
и SSR-запросы не разделяли состояние:

```svelte
<script lang="ts">
  import { Button, ConfigProvider, Form, FormItem, Input, createForm } from '$lib/components/ant-design';

  const form = createForm({
    initialValues: { email: '' },
    rules: {
      email: [
        { required: true, message: 'Введите email.' },
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Проверьте email.' }
      ]
    }
  });
</script>

<ConfigProvider>
  <Form {form} onFinish={(values) => console.log(values.email)}>
    <FormItem name="email" label="Email">
      <Input
        type="email"
        value={form.values.email}
        onValueChange={(value) => form.setFieldValue('email', value)}
      />
    </FormItem>
    <Button type="primary" htmlType="submit" loading={form.isSubmitting}>Отправить</Button>
    <Button htmlType="reset">Сбросить</Button>
  </Form>
</ConfigProvider>
```

FormItem предоставляет label, status, required, description и обработчик blur.
Расположение подписи наследуется из `Form.layout`: `vertical` размещает её
над control, `horizontal` — рядом с ним на широком экране.
Значением владеет модель: обновляйте его явно через `setFieldValue` или
`setFieldsValue`. Имя FormItem должно присутствовать в `initialValues`.
Состояние `values` и ошибки предназначены для чтения.

Поддерживаются плоские поля со значениями string, number, boolean, null,
undefined, immutable Dayjs и массивами string/number/boolean. Правила включают required, min/max, pattern и синхронный либо
асинхронный `validator(value, values)`. Для строк min/max считают Unicode
code points, для чисел сравнивают значение, для массивов считают элементы.
Пустой массив считается пустым значением; массивы с 0 или false — непустыми.
Pattern проверяет скалярные значения; для проверки содержимого массива
используйте custom validator. Пустые необязательные значения
пропускают встроенные проверки, но передаются в custom validator.

Массивы копируются при создании модели, установке полей, в snapshot проверки
и при каждом reset. Defaults, snapshot и аргументы владельца не разделяют
изменяемые массивы. Значения модели, включая массивы, изменяйте через setters.
Dayjs|null также поддержан: immutable экземпляр сохраняется без proxy, coercion
или сериализации; заменяйте его новым значением через setter.

`validateFields()` возвращает snapshot значений или отклоняется с
FormValidationError. Ошибка содержит `errors`, `values` и `outOfDate`.
Устаревшие результаты не перезаписывают состояние после изменения или сброса
формы. После blur поле считается touched; изменение любого поля повторно
проверяет touched-поля, включая зависимые validators.

`form.submit(onFinish)` блокирует повторную отправку и возвращает результат
`success`, `invalid`, `failed` или `busy`. Изменение значений во время проверки
делает результат устаревшим и предотвращает вызов onFinish. Уже начавшуюся
операцию onFinish модель не отменяет.

Компонент Form вызывает onFinish только после успешной проверки. Ошибки полей
передаются в onFinishFailed, ошибки onFinish — в onError и показываются общим
сообщением. Нативная браузерная проверка отключена через novalidate, чтобы
использовать единый набор правил. Серверная проверка данных остаётся
ответственностью приложения.

## Клавиатура и фокус

Checkbox использует нативный input: нажатие подписи и Space переключают его,
смешанное состояние доступно через `aria-checked="mixed"`. FormItem передаёт
id, name, required, ошибки и описание самому input.
CheckboxGroup объединяет нативные input в именованный fieldset; FormItem
передаёт имя группы, описание и ошибки, а required проверяется правилом массива.
RadioGroup использует нативную группу input[type=radio], именованный radiogroup,
стрелки и Space. Tab сохраняет нативный порядок; FormItem направляет фокус к
выбранному доступному варианту или первому доступному.
Switch использует нативную кнопку с role=switch: Space и Enter переключают
состояние, disabled/loading исключают кнопку из Tab. Имя остаётся постоянным,
а checked-состояние передаёт aria-checked.
InputNumber использует input с role=spinbutton: стрелки меняют число, Enter
завершает черновик. Кнопки увеличения и уменьшения сохраняют фокус в input.
Slider использует нативный range: стрелки, Home/End и PageUp/PageDown,
label и видимый фокус бегунка. Tab не добавляет отдельную остановку на дорожке.
Tooltip использует role=tooltip и aria-describedby основного дочернего control.
Поверхность не перехватывает фокус; Escape сохраняет текущий control.
Popover предоставляет именованный немодальный dialog с доступными кнопками и
полями. Trigger связан через aria-controls/aria-expanded; Escape возвращает
фокус из содержимого, Tab продолжает естественную навигацию.
Popconfirm использует тот же dialog с именем и описанием подтверждения.
Кнопки не отправляют окружающую форму. Во время Promise aria-busy сообщает
ожидание, а Escape потребляется до содержащего Modal без закрытия подтверждения.
Dropdown использует role=menu и нативные button/a с role=menuitem, один активный
tabindex и разделители. Стрелки и typeahead обходят доступные команды;
Escape закрывает меню раньше Modal, Tab сохраняет естественную навигацию.
Menu использует ul/li с role=menu/menuitem, native button для заголовков и
настоящие ссылки в label. Стрелки/Home/End обходят доступные пункты по режиму;
Enter раскрывает подменю, Escape возвращает фокус к родителю popup.
Tabs использует tablist, нативные button с role=tab и связанные tabpanel.
Aria-selected сообщает выбор; стрелки двигают фокус без активации. Скрытые
панели недоступны для Tab. Escape остаётся доступен содержащему Modal.
Collapse использует нативные кнопки внутри headings, aria-expanded/aria-controls
и обычную последовательность Tab. Extra отделён от кнопки заголовка, скрытое
содержимое недоступно для Tab. Именованные regions ограничены небольшими группами
и accordion; при скрытии или удалении сфокусированной панели фокус восстанавливается.
Drawer использует именованный модальный dialog, нативную кнопку закрытия и
естественный Tab. Фон inert, Escape закрывает верхнюю поверхность, закрытие
возвращает фокус opener. Во время анимации ухода модальность сохраняется.
Alert предоставляет alert/status, атомарное объявление и декоративные иконки.
Закрытие доступно нативной кнопкой, уход скрыт от accessibility tree;
фокус из удаляемого сообщения переходит к доступному соседнему control.
Message использует пассивные status/alert без остановок Tab и переноса фокуса.
Закрытие host dialog остаётся у Modal/Drawer; скрытые контексты приостанавливают
очередь и её таймеры.
Notification поддерживает интерактивные действия с обычным Tab и нативной
кнопкой закрытия. Фокус внутри приостанавливает таймер; при удалении controls
фокус восстанавливается в доступном соседнем control текущего контекста.
Progress предоставляет именованный progressbar со значением и локализованным
статусом. Он не меняет Tab/focus order и не создаёт собственные live-объявления.
Spin объявляет отдельный status и немедленно блокирует children через inert
и aria-busy. Временная парковка фокуса на wrapper не добавляет остановку Tab;
возврат учитывает замену controls, unmount и выбор пользователя.
Skeleton заменяет children декоративным каркасом и объявляет отдельный status.
Фокус из удаляемого содержимого остаётся на постоянной группе; после загрузки
Tab входит в новые controls. Автоматического фокуса в новые children нет.
Empty использует декоративное inert-изображение и обычные controls footer.
Live-region и автофокус отсутствуют; удаление сфокусированных действий
восстанавливает доступный фокус и сохраняет выбор владельца.
Result предоставляет нативный заголовок выбранного уровня, декоративную иконку
и обычные controls действий/подробностей. Он не объявляет итог автоматически;
восстановление фокуса при удалении действий использует общий механизм с Empty.
Steps использует именованный упорядоченный список и нативные кнопки выбора.
Aria-current обозначает текущий шаг, описание кнопки сообщает статус и content.
Фокус сохраняется при перестановке и восстанавливается при удалении/отключении;
live-region отсутствует, переходами и фокусом панели управляет владелец процесса.
Tag использует обычный текст и описанную нативную кнопку закрытия. OnClose может
отменить действие; удаление сохраняет доступный фокус. CheckableTag — управляемая
toggle-кнопка с aria-pressed и нативной клавиатурой. Оба компонента скрывают
декоративные иконки и не создают собственных live-region.
Badge сохраняет интерактивные children при изменениях и скрытии индикатора.
Полное значение доступно обычным текстом; descriptionId связывает его с control
владельца. Автоматических объявлений и дополнительных остановок Tab нет.
Avatar сохраняет полное имя при fallback и подгонке текста. Без имени он
декоративный; icon/children inert и не добавляют controls в порядок Tab.
AvatarGroup раскрывает скрытых участников нативной кнопкой в именованный
Popover. Удаление overflow/группы сохраняет доступный фокус и выбор владельца.

Pagination использует nav со списком нативных кнопок и `aria-current="page"`.
Tab перемещает фокус, Enter и Space выбирают страницу; недоступные переходы
пропускаются. При исчезновении сфокусированной кнопки перехода фокус возвращается
текущей странице. Имя навигации можно задать через `aria-label`.

Table сохраняет нативные table/thead/tbody/th/td и `scope="col"`. Имя задаётся
через caption или aria-label. Сортируемые заголовки содержат нативные кнопки;
Enter/Space меняют порядок, `aria-sort` сообщает активное направление.
Контейнер прокрутки доступен по Tab и прокручивается стрелками.

Select предоставляет combobox/listbox. Стрелки перемещают активный пункт,
пропуская disabled options; Home/End выбирают начало и конец открытого списка,
Enter подтверждает, Escape закрывает, Tab продолжает обычную навигацию.
В одиночном режиме без поиска поддерживаются набор текста и очистка клавишами
Backspace/Delete. В multiple Backspace при пустом поиске удаляет последний
доступный элемент; редактирование текста и IME сохраняют стандартное поведение.
Список получает aria-multiselectable; кнопки удаления доступны по Tab и Enter.
Метка задаётся через label с соответствующим id, FormItem или
aria-label. Нажатие на поле, стрелку или отступы открывает список. Popup
располагается под control в том же DOM-контейнере.

Modal открывается через `dialog.showModal()` после mount. Браузер управляет
модальностью, фокусом и inert-состоянием остальной страницы. Escape, фон и кнопка
закрытия вызывают onCancel и сбрасывают bind:open; confirmLoading блокирует
пользовательское закрытие. Если onOk задан, он управляет подтверждением и
закрытием; без onOk кнопка подтверждения закрывает окно. В SSR dialog остаётся
скрытым до гидратации. Для асинхронного подтверждения владелец управляет
confirmLoading, обрабатывает ошибки и сбрасывает open после успеха.

## Проверки и границы версии

Тесты рядом с модулем проверяют выбор и поиск, расчёт страниц и диапазонов,
порядок сортировки и выбора строк, правила валидации, конкурирующие
проверки, повторную отправку, сброс, изоляцию состояния и SSR реальных
компонентов. Из корня репозитория выполняются `npm run lint`,
`npm exec -- svelte-kit sync`,
`npm exec -- svelte-check --tsconfig ./tsconfig.json --tsgo`, `npm test`
и `npm run build`.

`npm run test:e2e` запускает Chromium-проверки галереи и отдельного стенда
компонентов из `e2e/fixtures`. Перед первым прогоном установите браузер командой
`npm exec -- playwright install chromium`. Типы тестов и стенда проверяются
отдельно через `npm exec -- svelte-check --tsconfig ./e2e/tsconfig.json --tsgo`.

Браузерные тесты проверяют внешние изменения значений, смешанное состояние и
нативный reset Checkbox, boolean-поля Form, переходы и смену размера Pagination,
CheckboxGroup, типы значений, порядок options, повторяющиеся поля FormData,
отмену reset, фокус группы и выбор всех прав,
Radio/RadioGroup, нативное снятие соседнего radio, независимые имена,
числовой ноль и boolean false, required, отмену reset, ориентацию и фокус ошибок,
Switch, snippets, loading, keyboard, FormData, reset, сохранение с откатом,
повторную попытку, поздние ответы после удаления и reduced motion,
InputNumber, промежуточный текст, курсор, IME, дробный шаг, precision, null/zero,
числовую валидацию, нативный reset, reset модели и FormData,
Slider, мышь и касание через протокол браузера, завершение и отмену действий,
дробный шаг, reverse/RTL, ориентацию, фокус, FormData, reset и связь с InputNumber,
сочетания фильтров, сортировки, страниц и выбора Table, loading и замену данных,
серверный total, сохранение ключей между страницами, отмену запросов, поздние ответы,
ошибки/retry и повторную загрузку допустимой страницы при уменьшении total,
геометрию закреплённых заголовков и колонок, resize, клавиатурный фокус и узкий экран,
раскрываемые строки, callbacks, сохранение ключей, жизненный цикл snippets и colspan,
клавиатуру Select, множественный выбор, повторяющиеся поля FormData, native reset,
массивы Form, snapshots и устаревшие результаты async validation,
очистку и числовой ноль, фокус и закрытие Modal, async validation, повторную
отправку, ошибки и reset Form, оба layout, темы, размеры, RTL, локаль, мобильный
viewport, SSR и гидратацию. Галерея проверяется на свежей production-сборке.
Console warnings/errors и необработанные ошибки браузера делают тест неуспешным.
Снимки светлой, тёмной и мобильной страницы сохраняются для визуального
просмотра; автоматического сравнения с эталонными изображениями пока нет.

Tooltip проверяется на задержки и отмену ожидающего показа, hover/focus, Escape
внутри Modal, сохранение описаний, четыре положения, переворот, обрезающие
контейнеры, прокрутку, resize, темы, RTL и узкий экран. Проверяются форматирование
подсказки Slider, слежение за бегунком и отсутствие числовых callbacks от закрытия.
Popover проверяется на ввод и действия в snippets, способы открытия и их
сочетания, естественный порядок Tab, возврат фокуса, изменения владельца,
сохранение ARIA, положения и переворот, прокрутку/resize, вложенный Tooltip,
Modal, темы/RTL, touch и узкий экран. Галерея проверяет сохранение и отмену
редактирования профиля.
Popconfirm проверяется на подтверждение/отмену и их callbacks, Promise/loading,
ошибки и повтор, внешнее закрытие, повторное открытие, disabled, удаление и
поздние результаты, события дочерних кнопок, Form, Modal, Tooltip, темы,
локаль, RTL, четыре положения и touch. Модель подтверждения проверяется
отдельно с управляемыми Promise; галерея удаляет и восстанавливает строку Table.
Dropdown проверяется на команды и порядок callbacks, клавиатуру/typeahead,
Tab/Escape, hover-задержки, defaults и внешнее управление, disabled, обновление
списка и восстановление фокуса, замену trigger и ARIA-атрибуты владельца.
Chromium проверяет шесть положений, переворот, clipping, прокрутку, Modal,
темы/RTL/reduced motion, touch и длинные подписи; галерея выполняет команды Table.
Tabs проверяется на выбор/defaults и callbacks, ручную клавиатурную активацию,
ленивое монтирование, сохранение локального state, forceRender, destroyOnHidden
и переопределения item. Browser-проверки покрывают ARIA-связи, фокус при
изменении items, четыре положения line/card, размеры, RTL, индикатор, прокрутку,
темы/reduced motion, touch, Modal и сохранение профиля в галерее.
Collapse проверяется на независимое раскрытие и accordion, порядок binding/callback,
defaults, неизвестные ключи, header/icon/disabled и переопределения item.
Unit/SSR/Chromium-проверки покрывают ленивое монтирование, сохранение state,
forceRender/destroyOnHidden, FormData, вложенность, ARIA, Enter/Space/Tab,
восстановление фокуса, перестановку items, Modal, размеры, RTL, темы, reduced motion,
мобильные длинные подписи и сохранение/сброс анкеты в галерее.
Drawer проверяется на binding/callbacks, четыре стороны и размеры, закрытие
кнопкой/Escape/фоном, pointer-drag, модальность и возврат фокуса, прокрутку,
ленивое содержимое, forceRender/destroyOnHidden и повторное открытие при уходе.
SSR/Chromium-проверки покрывают удаление, RTL/локаль, темы, reduced motion,
Select/Popover/Tooltip, Tabs/Collapse, стек с Modal и мобильное длинное содержимое.
Галерея проверяет валидацию, сохранение черновика, обновление строки Table и сброс.
Alert проверяется на типы, banner/defaults, outlined/filled, snippets и иконки,
callbacks и фактическое удаление DOM, disabled, Enter/Space/Tab, порядок фокуса,
отмену анимации при unmount/замене, reduced motion, локаль, RTL, темы, Modal/Drawer
и мобильные длинные сообщения. SSR защищает defaults, escaping, атрибуты
доступности и прежние outline-иконки. Галерея проверяет действие, закрытие,
повторный показ и сохранение query при retry удалённой Table.
Message проверяется на независимость экземпляров и SSR-запросов, пять типов,
ключи/обновления, duration, FIFO, callbacks, await и stale handles. Unit-проверки
управляют часами на границе holder; Chromium проверяет реальную видимость,
hover, удаление DOM после анимации, detach/замену, Modal/Drawer и вложенные
контексты, сохранение фокуса, темы/compact/RTL/reduced motion и мобильный перенос.
Галерея проверяет loading → success/error, повтор и отмену при сбросе.
Notification проверяется на четыре статуса и нейтральный open, snippets/actions,
изолированные очереди, ключи, defaults, duration=0/false, глобальный FIFO и
hover/focus-паузы. SSR защищает закрытый popover, escaping, шесть положений,
кнопку закрытия и доступные имена. Chromium проверяет геометрию и рост списков,
сохранение черновика при обновлении, фокус/клавиатуру, callbacks, unmount/замену,
анимации/reduced motion, темы/compact/RTL/локаль, Modal/Drawer и мобильный перенос.
Пример галереи проверяет реальное содержимое скачанного CSV, ошибки/retry и
отмену ожидающего экспорта при сбросе.
Progress проверяется на нормализацию, явные/автоматические статусы, размеры,
SVG-геометрию, форматирование/escaping и SSR без таймеров. Chromium проверяет
реальную дугу, цвета, RTL, локаль, reduced motion, фокус и независимые экземпляры,
Modal/Drawer, мобильное переполнение и SSR до гидратации. Модель экспорта
проверяет этапы, отмену, retry, сброс и unmount; галерея проверяет общие controls
line/circle, промежуточные проценты, отмену без позднего результата и CSV.
Spin проверяется на нормализацию delay, короткую загрузку, смену запроса,
отмену таймеров и SSR без них. Chromium проверяет немедленную блокировку,
сохранение DOM/черновика/локального состояния, парковку и возврат фокуса,
замену поля и unmount, snippets, размеры, локаль/темы/RTL/reduced motion,
Modal/Drawer и мобильный перенос. Галерея проверяет быстрый/медленный ответ,
ошибку/retry, отмену, сброс и SSR до гидратации; Table сохраняет прежний status.
Skeleton проверяется на расчёт конфигураций, нулевые/дробные/некорректные
размеры и ширины, число строк, SSR и отсутствие таймеров. Chromium проверяет
реальную геометрию, размонтирование/новое состояние children, парковку фокуса,
Tab, выбор снаружи, unmount, Modal/Drawer, темы/локаль/RTL/reduced motion и
мобильные ограничения. Галерея проверяет первую загрузку, обновление через Spin
с сохранением DOM и черновика, ошибку/retry, отмену, сброс и SSR до гидратации.
Empty проверяется на SSR default/simple, скрытые части, escaping, snippets,
footer и локальные ссылки SVG-паттернов. Chromium проверяет уникальность ID,
геометрию, локаль/темы/compact/RTL, inert custom image, сохранение действий,
unmount и замену controls, выбор владельца, Modal/Drawer и мобильный перенос.
Галерея проверяет создание первой записи, пустой поиск, сброс фильтра,
очистку и SSR до гидратации. Проверки Table защищают colspan, точное имя
пустой ячейки, локальные переводы, приоритет empty snippet и loading.
Result проверяется на SSR всех статусов, string/number исключения, приоритет
иллюстраций, snippets, escaping, уровень заголовка и отсутствие live-region.
Chromium проверяет иконки, Tab, inert, сохранение controls/черновика,
удаление действий/unmount, выбор владельца, Modal/Drawer, темы/compact/RTL
и мобильный перенос. Галерея проверяет валидацию, успех, ошибку, редактирование,
retry без потери полей, reset/unmount во время отправки и SSR до гидратации. Модель проверяется
с управляемыми таймерами на snapshot, duplicate start и отмену позднего ответа.
Steps проверяется на нормализацию индексов/ключей, приоритет статусов и SSR без
DOM/таймеров. Chromium проверяет управляемый выбор, нативную клавиатуру, passive
режим, status/snippets, disabled, удаление/перестановку/unmount, Modal/Drawer,
локаль/темы/compact/RTL/reduced motion и responsive/внутреннюю прокрутку.
Галерея проверяет валидацию переходов, сохранение полей, отправку/Result/retry,
reset/unmount, мобильную компоновку и SSR до гидратации. Модель проверяет
отмену pending validation/submission и защиту от позднего завершения.
Tag/CheckableTag проверяются на SSR snippets, ARIA, disabled, состояния и
отсутствие DOM/таймеров/callbacks. Chromium проверяет палитры/варианты, отмену,
защиту от повторного входа, остановку нативного всплытия, клавиатуру, unmount,
выбор владельца, locale/темы/RTL/reduced motion, Modal/Drawer и узкий экран.
Галерея проверяет добавление/дубликаты/защиту/удаление и повторное создание меток,
фильтры таблицы, сохранение фокуса, reset и SSR. Модель проверяет нормализацию,
стабильность и обновление key, повторное удаление и изоляцию экземпляров.
Badge проверяется на границы счётчика, ноль/dot, приоритет статусов, offsets и SSR.
Chromium проверяет полные описания, отсутствие live-region, стабильность DOM/фокуса,
нативную отправку формы, палитры, locale/темы/RTL/reduced motion и узкий экран.
Галерея проверяет Drawer, чтение без удаления, overflow, reset и SSR;
модель — вычисление количества, повторное чтение, новые ключи и изоляцию экземпляров.
Avatar проверяется на размеры/gap, масштаб текста, SSR snippets и доступное имя.
Chromium проверяет загрузку/fallback/onError, смену src/srcSet, поздние события,
подгонку после скрытия/изменения шрифта и размеров, очистку настоящего
ResizeObserver, нативную кнопку владельца, темы/compact/RTL и Modal/Drawer.
Галерея проверяет начальное ошибочное изображение из SSR, профили участников,
сохранение/сброс, узкий экран и рендеринг до гидратации; модель — изоляцию и
обновление только выбранного участника.
AvatarGroup проверяется на ключи/лимиты и SSR без скрытых изображений и таймеров.
Chromium проверяет Enter/Space/Escape, hover/focus/click, ленивое содержимое,
сохранение DOM/ошибки изображения при перестановке, удаление overflow/unmount,
восстановление и выбор фокуса, наследование размеров/локали, темы/RTL и перенос.
Галерея проверяет управление командой, границы перемещения, reset, мобильный
Popover и SSR; модель — нормализацию имён, Unicode-инициалы и свежие ключи.

Эта версия покрывает перечисленное ядро. Simple/quick jumper
и произвольный itemRender Pagination, древовидные/поисковые фильтры Table,
расширенные режимы DatePicker,
расширения Tree/TreeSelect/Upload/Menu, Select tags, Form.List, вложенные name paths,
порталы, виртуализация и статические методы Modal пока отсутствуют. Совместимость
всего React API и визуальная идентичность всех состояний не заявлены.

## Локальные исходники Ant Design

[Реестр покрытия и инструменты переноса](../../../../docs/reference/ant-design-porting/readme.md)
содержат сводку возможностей, рецепты CSS и отдельные маршруты браузерных фикстур.

Официальный React-репозиторий используется как эталон при переносе:
`.upstream/ant-design` от корня проекта. Это отдельный Git-клон, исключённый
из Git проекта через корневой `.gitignore`. Рабочая копия закреплена на
[Ant Design 6.6.8](https://github.com/ant-design/ant-design/tree/984592267de88fbf9cdaecc96a56629e721c709d),
commit `984592267de88fbf9cdaecc96a56629e721c709d`.

Для восстановления копии из корня проекта:

```sh
mkdir -p .upstream
git clone --depth 1 --single-branch --branch 6.6.8 https://github.com/ant-design/ant-design.git .upstream/ant-design
git -C .upstream/ant-design rev-parse HEAD
```

Клон содержит файлы релиза с сокращённой Git-историей. Для чтения исходников
установка зависимостей не требуется. Новую целевую версию выбираем отдельно
от переноса очередного компонента.

В `components/<component>/` доступны реализация и типы, `style/`, `demo/`,
`__tests__/` и документация `index.en-US.md`. Например, у Button основной файл —
`components/button/Button.tsx`, у Avatar — `components/avatar/Avatar.tsx`.
Общие механизмы находятся в `components/_util/`, токены и алгоритмы тем —
в `components/theme/`, переводы — в `components/locale/`.

Поиск в исключённой рабочей копии выполняется явно:

```sh
rg --files --hidden --no-ignore .upstream/ant-design/components/avatar
```

Перед переносом сверяем исходник, props, демо и граничные случаи в тестах;
затем реализуем Svelte API, документируем поддержанный объём и проверяем его
в наших unit/SSR/Chromium-тестах. Часть логики Ant Design делегирует пакетам
`@rc-component/*`; для неё также нужны исходники соответствующей версии пакета.
Стили в `vendor/` по-прежнему происходят из опубликованного npm-архива,
описанного ниже; checkout дополняет его исходниками и тестами.

## Источник и лицензия

Стили взяты из `dist/antd.css` официального
[пакета antd 6.6.8](https://registry.npmjs.org/antd/-/antd-6.6.8.tgz).
В [vendor/antd.css](./vendor/antd.css) оставлены правила Button, Input, Select,
Checkbox, Pagination, Table, Modal, Form и связанные animations; глобальные токены
сохранены. В [vendor/radio.css](./vendor/radio.css) добавлены обычные Radio и
RadioGroup из того же архива; [vendor/switch.css](./vendor/switch.css) содержит
Switch вместе с правилами reduced motion.
InputNumber outlined находится в [vendor/input-number.css](./vendor/input-number.css),
адаптация тем и reduced motion — в theme.css и InputNumber.svelte.
[vendor/slider.css](./vendor/slider.css) содержит Slider с одним бегунком из
того же архива; нативный control и reduced motion адаптированы в Slider.svelte.
[vendor/tooltip.css](./vendor/tooltip.css) содержит базовые Tooltip и стрелку
из того же архива. Native popover, позиционирование и reduced motion реализованы
в TooltipPopup.svelte и popup.dom.ts; тёмная тема адаптирована в theme.css.
[vendor/popover.css](./vendor/popover.css) содержит базовые Popover и стрелку
из того же архива. Общая DOM-логика поверхностей находится в popup.dom.ts;
расчёт положения переиспользует tooltip.engine.ts. Popover.svelte и popover.dom.ts
добавляют интерактивное содержимое, ARIA-связь и управление фокусом.
[vendor/popconfirm.css](./vendor/popconfirm.css) содержит Popconfirm из того же
архива. Popconfirm.svelte использует Popover для поверхности и фокуса,
а popconfirm.model.svelte.ts связывает результат действия с текущим открытием.
[vendor/menu.css](./vendor/menu.css) содержит 201 правило Menu из того же архива:
items, группы, подменю, три режима, light/dark/RTL и токены; collapse/slide/zoom
motion исключены. Рецепт menu воспроизводит файл; корни ограничены
:where(.ant-menu-css-var). Menu/MenuList/MenuSubMenu адаптируют Svelte snippets,
native buttons/links/popover и refs, menu.engine.ts — key paths/selection/навигацию.
Theme.css связывает цвета и геометрию с общей темой и compact.
[vendor/dropdown.css](./vendor/dropdown.css) содержит базовое меню Dropdown,
команды, разделитель, danger/disabled, стрелку и токены из того же архива.
Dropdown.svelte добавляет нативные menu buttons и управление фокусом;
dropdown.engine.ts — навигацию и typeahead, popup.dom.ts — поверхность и выравнивание.
Корневые селекторы Dropdown ограничены :where(.ant-dropdown-css-var), чтобы
не менять существующие popover-фильтры Table с классом ant-dropdown.
[vendor/tabs.css](./vendor/tabs.css) содержит line/card, расположения, индикатор
и токены Tabs из того же архива. Селекторы корня ограничены
:where(.ant-tabs-css-var), группы с общими declarations сохранены.
Tabs.svelte и tabs.engine.ts управляют выбором и фокусом, TabsPanel.svelte —
временем жизни содержимого; tabs.dom.ts измеряет индикатор и прокручивает заголовки.
[vendor/collapse.css](./vendor/collapse.css) содержит 49 правил Collapse и его
токены из того же архива. Корневые селекторы ограничены
:where(.ant-collapse-css-var); React motion и правила ColorPicker исключены.
Collapse.svelte адаптирует заголовки к нативным кнопкам и управляет DOM-фокусом,
collapse.engine.ts — ключами и выбором доступного заголовка,
CollapsePanel.svelte — временем жизни содержимого. Темы и отступы кнопок
адаптированы в theme.css и scoped-стилях компонента.
[vendor/drawer.css](./vendor/drawer.css) содержит 32 правила модального Drawer
и его токены из того же архива. Корневые селекторы ограничены
:where(.ant-drawer-css-var); React motion, resizable, skeleton и inline/pure
исключены. Drawer.svelte адаптирует нативный dialog и жизненный цикл содержимого;
drawer.dom.ts управляет модальностью и отменяемой Web Animations API-анимацией,
drawer.engine.ts — размерами, направлением ухода и длительностью.
[vendor/alert.css](./vendor/alert.css) содержит 37 правил Alert из того же
архива: четыре статуса, outlined/filled, banner и токены. Корневые селекторы
ограничены :where(.ant-alert-css-var); React motion исключён. Alert.svelte
управляет закрытием, alert.dom.ts — отменяемой анимацией, notice.dom.ts — фокусом.
Scoped-стили адаптируют мобильные действия и размер кнопки закрытия.
[vendor/message.css](./vendor/message.css) содержит 21 правило Message из того
же архива: базовую поверхность, верхнее положение, пять статусов и токены.
Корневые селекторы ограничены :where(.ant-message-css-var); React motion,
collapsing stack и остальные положения исключены. MessageHolder.svelte и
MessageNotice.svelte адаптируют нативный popover и обычный поток списка;
message.dom.ts предоставляет общий механизм notice.dom.ts для видимости
контекста и отменяемой Web Animations API-анимации. Theme.css связывает фон с
темой, иконки переиспользуют Icon.svelte.
[vendor/notification.css](./vendor/notification.css) содержит 45 правил из того
же архива: шесть положений, статусы, описание, actions, кнопку закрытия и токены.
Корневые селекторы ограничены :where(.ant-notification-list); React motion,
stack, progress и pure-panel исключены. NotificationHolder.svelte и
NotificationNotice.svelte адаптируют нативную поверхность и обычный поток списков;
notice.dom.ts управляет видимостью, фокусом и анимацией. Иконки переиспользуют
существующий Icon.svelte и status-icons.ts.
[vendor/progress.css](./vendor/progress.css) содержит 26 правил line/circle и
active keyframes из того же архива. Корневые селекторы ограничены
:where(.ant-progress-css-var); steps, success-сегмент и percentPosition исключены.
Progress.svelte адаптирует SVG, доступность, переполнение, RTL-анимацию и reduced
motion; progress.engine.ts нормализует значения/размеры и рассчитывает дугу.
Theme.css связывает цвет, фон и текст с токенами темы. Иконки переиспользуют
существующий Icon.svelte и лицензированные status-icons.ts.
[vendor/spin.css](./vendor/spin.css) содержит 27 правил и два keyframes из того
же архива: standalone/embedded Spin, четыре точки, размеры и токены.
Корневые селекторы ограничены :where(.ant-spin-css-var); правила List,
fullscreen и percent исключены. Spin.svelte адаптирует доступность, inert,
перенос текста и reduced motion, spin.model.svelte.ts управляет ожиданием,
spin.dom.ts — парковкой/возвратом фокуса. Новые иконки и лицензии не добавлены.
[vendor/skeleton.css](./vendor/skeleton.css) содержит 22 правила и один keyframes
из того же архива: составной Skeleton, avatar/title/paragraph, active и round.
Корневые селекторы ограничены :where(.ant-skeleton-css-var); отдельные элементы
и block исключены, active ограничен тремя используемыми частями.
Skeleton.svelte использует декоративный div для title, постоянную группу,
отдельный status, адаптивный flex-layout, пропорции аватара и reduced motion.
skeleton.engine.ts рассчитывает конфигурацию; skeleton.dom.ts сохраняет фокус
при замене children. Theme.css связывает градиент с fill-токенами темы.
Новые иконки и лицензии не добавлены.
[vendor/empty.css](./vendor/empty.css) содержит 13 правил default/simple из того
же архива. Корневые селекторы ограничены :where(.ant-empty-css-var); small исключён.
Empty.svelte адаптирует snippets, локаль, inert-изображение, перенос текста и footer.
EmptyImage.svelte переносит геометрию es/empty/empty.js и es/empty/simple.js:
paths, ellipse, circle, viewBox и transforms сохранены, декоративный SVG не
дублирует описание через title. Native SVG patterns заменяют getAsSolidColor,
накладывая fill-токен на colorBgContainer с уникальными $props.id().
feedback.dom.ts управляет общим для Empty/Result focusin/MutationObserver
и восстановлением после tick.
SVG включены в исходники и покрываются существующей MIT-лицензией Ant Design.
[vendor/result.css](./vendor/result.css) содержит все 20 правил Result из того
же архива; корни ограничены :where(.ant-result-css-var). Result.svelte добавляет
нативный заголовок, snippets, перенос текста/действий и мобильные ограничения.
ResultImage.svelte переносит геометрию и цвета es/result/unauthorized.js,
noFound.js и serverError.js: добавлены viewBox и декоративная семантика,
удалены SVG title. Новая лицензия для этих SVG не требуется.
[vendor/steps.css](./vendor/steps.css) содержит все 147 правил Steps
из того же архива; воспроизводится рецептом steps. Варианты сохранены;
корни ограничены :where(.ant-steps-css-var), role-button selectors адаптированы
к классу интерактивного шага. Declarations сохранены. Steps.svelte адаптирует
структуру es/steps и нативные кнопки, локаль, responsive и reduced motion;
steps.dom.ts восстанавливает фокус шагов и использует общий feedback.dom.ts
при unmount. React/@rc-component зависимости не добавлены; ellipsis SVG
использует существующую MIT-лицензию icons.
[vendor/tag.css](./vendor/tag.css) содержит 85 правил Tag/CheckableTag из того
же архива: ссылки, группа и селектор DatePicker исключены; корни ограничены
:where(.ant-tag-css-var). Declarations сохранены. Tag.svelte и CheckableTag.svelte
добавляют нативные buttons, snippets, перенос текста, тёмную тему, reduced motion
и восстановление фокуса через feedback.dom.ts. Listener закрытия использует
Svelte attachment с cleanup. Используется существующий Icon close; новые
зависимости, иконки и лицензии не добавлены.
[vendor/badge.css](./vendor/badge.css) содержит 52 правила Badge и keyframes
antStatusProcessing из того же архива. Селекторы Radio/Space, ссылок и анимации
цифр/появления исключены; корни ограничены :where(.ant-badge-css-var), declarations
сохранены. Badge.svelte добавляет standalone-позиционирование без ScrollNumber,
описания, логические offsets, обводку под фон темы и reduced motion.
Новые зависимости, иконки и лицензии не добавлены.
[vendor/avatar.css](./vendor/avatar.css) содержит 16 правил Avatar из того же
архива: Group и интеграции с Image/anticon исключены, declarations сохранены.
Корни ограничены :where(.ant-avatar-css-var), исходный класс токенов заменён
на .ant-avatar-css-var. Avatar.svelte добавляет Svelte snippets, доступное имя,
версию источника изображения и нативные listeners с cleanup; avatar.dom.ts
подгоняет текст через ResizeObserver без React/@rc-component зависимостей.
Существующая MIT-лицензия сохранена; новые зависимости и сторонние иконки не добавлены.
[vendor/avatar-group.css](./vendor/avatar-group.css) содержит три исходных правила
Avatar.Group из того же архива: display, обводку и перекрытие. Declarations
сохранены. AvatarGroup.svelte адаптирует перенос и фон обводки; отдельный
AvatarGroupOverflow.svelte использует существующий Popover и ленивый список
с полными именами. Восстановление фокуса использует feedback.dom.ts.
Avatar сохраняет версию src/srcSet при обновлении spread props с теми же
значениями, Popover игнорирует blur после destroy. Новые зависимости не добавлены.
Пять filled-иконок в [status-icons.ts](./status-icons.ts) скопированы из
[Ant Design Icons](https://github.com/ant-design/ant-design-icons/tree/7f2516ac91226d2b41f93b35cb5197c8d94f7189/packages/icons-svg/svg/filled)
и подключены к существующему Icon.svelte с сохранением outline-иконок.
Их отдельная [MIT-лицензия](./vendor/LICENSE.ant-design-icons) включена в пакет.
Селекторы
`.css-var-_R_0_` заменены на `:root`/`.ant-svelte-theme` и классы компонентов.
SHA-256 исходного архива записан в заголовке файла.

Компоненты и модели реализованы на Svelte. [theme.css](./theme.css) связывает
статические токены компонентов с переключаемыми темами. Текст исходной
[лицензии MIT](./vendor/LICENSE.ant-design) сохранён в пакете. Официальная
React-реализация развивается в [ant-design/ant-design](https://github.com/ant-design/ant-design).
