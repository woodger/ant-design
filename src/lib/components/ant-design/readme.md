# Ant Design для Svelte 5

> Type: Reference. Первая версия community-переноса компонентов Ant Design
> 6.6.8 на Svelte 5 и TypeScript.

Модуль содержит ConfigProvider, Button, Input, InputNumber, Slider, Select, Checkbox, CheckboxGroup,
Radio, RadioGroup, Switch, Pagination, Table,
Modal, Tooltip, Form и FormItem.
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
Пакет имеет статус private и не публикуется в npm этим workflow.

## Компоненты

Точные типы props принадлежат определениям рядом с компонентами и экспортируются
через [index.ts](./index.ts).

| Компонент | Поддерживаемое поведение |
| --- | --- |
| ConfigProvider | Светлая и тёмная темы, три основных цвета, компактная плотность, размеры, disabled, направление и локаль |
| Button | Default, primary, dashed, text, link; loading, danger, block, shape; snippets для содержимого и иконки |
| Input | Текст, email, пароль, поиск, телефон и URL; размеры, error/warning, нативные атрибуты и события |
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
| Form | Типизированная модель, валидация, submit, reset и обработка ошибок |
| FormItem | Label, required, help, ошибки и контекст доступности одного control |

Input и Select поддерживают `bind:value` и `onValueChange`. Очистка одиночного
Select возвращает `undefined`, множественного — `[]`; числовой `0` остаётся допустимым значением. `defaultValue`
используется как начальное значение отдельного control. Для control с
`bind:value` задавайте начальное значение у владельца и не передавайте
`defaultValue`. Для сброса привязанного значения изменяйте состояние владельца.

Button `type` задаёт оформление, `htmlType` задаёт нативный тип кнопки и по
умолчанию равен `button`. Вариант `link` остаётся кнопкой действия; для навигации
используйте нативную ссылку. Кнопка loading недоступна для повторного нажатия.

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

Title принимает строку, число или null. Пустая строка, пробелы, undefined и null
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
временно отсутствует, значение сохраняется и показывается текстом; возвращённый
option восстанавливает подпись и disabled-состояние.

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
и сбросом. Режим tags и удалённый поиск пока не поддерживаются.

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
undefined и массивами string/number/boolean. Правила включают required, min/max, pattern и синхронный либо
асинхронный `validator(value, values)`. Для строк min/max считают Unicode
code points, для чисел сравнивают значение, для массивов считают элементы.
Пустой массив считается пустым значением; массивы с 0 или false — непустыми.
Pattern проверяет скалярные значения; для проверки содержимого массива
используйте custom validator. Пустые необязательные значения
пропускают встроенные проверки, но передаются в custom validator.

Массивы копируются при создании модели, установке полей, в snapshot проверки
и при каждом reset. Defaults, snapshot и аргументы владельца не разделяют
изменяемые массивы. Значения модели, включая массивы, изменяйте через setters.

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

Эта версия покрывает перечисленное ядро. Simple/quick jumper
и произвольный itemRender Pagination, древовидные/поисковые фильтры Table,
DatePicker/RangePicker,
Tree/TreeSelect, Upload, Select tags, Form.List, вложенные name paths,
порталы, виртуализация и статические методы Modal пока отсутствуют. Совместимость
всего React API и визуальная идентичность всех состояний не заявлены.

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
в TooltipPopup.svelte и tooltip.dom.ts; тёмная тема адаптирована в theme.css.
Селекторы
`.css-var-_R_0_` заменены на `:root`/`.ant-svelte-theme` и классы компонентов.
SHA-256 исходного архива записан в заголовке файла.

Компоненты и модели реализованы на Svelte. [theme.css](./theme.css) связывает
статические токены компонентов с переключаемыми темами. Текст исходной
[лицензии MIT](./vendor/LICENSE.ant-design) сохранён в пакете. Официальная
React-реализация развивается в [ant-design/ant-design](https://github.com/ant-design/ant-design).
