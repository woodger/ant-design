# Ant Design для Svelte 5

> Type: Reference. Первая версия community-переноса компонентов Ant Design
> 6.6.8 на Svelte 5 и TypeScript.

Модуль содержит ConfigProvider, Button, Input, Select, Checkbox, Pagination,
Modal, Form и FormItem.
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
| Select | Один строковый или числовой value; options, поиск, очистка, disabled options, клавиатура и значение для FormData |
| Checkbox | Checked/defaultChecked, смешанное состояние, нативные события и FormData, интеграция с FormItem |
| Pagination | Страницы, переходы по пять страниц, выбор pageSize, диапазон записей, размеры, RTL и локаль |
| Modal | Нативный dialog, заголовок, footer snippet, закрытие, confirmLoading и callbacks |
| Form | Типизированная модель, валидация, submit, reset и обработка ошибок |
| FormItem | Label, required, help, ошибки и контекст доступности одного control |

Input и Select поддерживают `bind:value` и `onValueChange`. Очистка Select
возвращает `undefined`; числовой `0` остаётся допустимым значением. `defaultValue`
используется как начальное значение отдельного control. Для control с
`bind:value` задавайте начальное значение у владельца и не передавайте
`defaultValue`. Для сброса привязанного значения изменяйте состояние владельца.

Button `type` задаёт оформление, `htmlType` задаёт нативный тип кнопки и по
умолчанию равен `button`. Вариант `link` остаётся кнопкой действия; для навигации
используйте нативную ссылку. Кнопка loading недоступна для повторного нажатия.

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
`locale.pagination` также объединяется с настройками родителя по отдельным
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

Поддерживаются плоские поля со значениями string, number, boolean, null и
undefined. Правила включают required, min/max, pattern и синхронный либо
асинхронный `validator(value, values)`. Для строк min/max считают Unicode
code points, для чисел сравнивают значение. Пустые необязательные значения
пропускают встроенные проверки, но передаются в custom validator.

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

Pagination использует nav со списком нативных кнопок и `aria-current="page"`.
Tab перемещает фокус, Enter и Space выбирают страницу; недоступные переходы
пропускаются. При исчезновении сфокусированной кнопки перехода фокус возвращается
текущей странице. Имя навигации можно задать через `aria-label`.

Select предоставляет combobox/listbox. Стрелки перемещают активный пункт,
пропуская disabled options; Home/End выбирают начало и конец открытого списка,
Enter подтверждает, Escape закрывает, Tab продолжает обычную навигацию.
В режиме без поиска поддерживаются набор текста и очистка клавишами
Backspace/Delete. Метка задаётся через label с соответствующим id, FormItem или
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
правила валидации, конкурирующие
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
клавиатуру Select,
очистку и числовой ноль, фокус и закрытие Modal, async validation, повторную
отправку, ошибки и reset Form, оба layout, темы, размеры, RTL, локаль, мобильный
viewport, SSR и гидратацию. Галерея проверяется на свежей production-сборке.
Console warnings/errors и необработанные ошибки браузера делают тест неуспешным.
Снимки светлой, тёмной и мобильной страницы сохраняются для визуального
просмотра; автоматического сравнения с эталонными изображениями пока нет.

Эта версия покрывает перечисленное ядро. Checkbox.Group, simple/quick jumper
и произвольный itemRender Pagination, Table, DatePicker/RangePicker,
Tree/TreeSelect, Upload, множественный Select, Form.List, вложенные name paths,
порталы, виртуализация и статические методы Modal пока отсутствуют. Совместимость
всего React API и визуальная идентичность всех состояний не заявлены.

## Источник и лицензия

Стили взяты из `dist/antd.css` официального
[пакета antd 6.6.8](https://registry.npmjs.org/antd/-/antd-6.6.8.tgz).
В [vendor/antd.css](./vendor/antd.css) оставлены правила Button, Input, Select,
Checkbox, Pagination, Modal, Form и связанные animations; глобальные токены
сохранены. Селекторы
`.css-var-_R_0_` заменены на `:root`/`.ant-svelte-theme` и классы компонентов.
SHA-256 исходного архива записан в заголовке файла.

Компоненты и модели реализованы на Svelte. [theme.css](./theme.css) связывает
статические токены компонентов с переключаемыми темами. Текст исходной
[лицензии MIT](./vendor/LICENSE.ant-design) сохранён в пакете. Официальная
React-реализация развивается в [ant-design/ant-design](https://github.com/ant-design/ant-design).
