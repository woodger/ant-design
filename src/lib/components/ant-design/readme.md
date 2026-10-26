# Ant Design для Svelte 5

> Type: Reference. Первая версия community-переноса компонентов Ant Design
> 6.6.8 на Svelte 5 и TypeScript.

Модуль содержит ConfigProvider, Button, Input, Select, Modal, Form и FormItem.
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
частичное переопределение подписей кнопок и служебных сообщений. Тексты правил
валидации задаются в `message` или возвращаются из validator.

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

Select предоставляет combobox/listbox. Стрелки перемещают активный пункт,
пропуская disabled options; Home/End выбирают начало и конец открытого списка,
Enter подтверждает, Escape закрывает, Tab продолжает обычную навигацию.
В режиме без поиска поддерживаются набор текста и очистка клавишами
Backspace/Delete. Метка задаётся через label с соответствующим id, FormItem или
aria-label. Popup располагается под control в том же DOM-контейнере.

Modal открывается через `dialog.showModal()` после mount. Браузер управляет
модальностью, фокусом и inert-состоянием остальной страницы. Escape, фон и кнопка
закрытия вызывают onCancel и сбрасывают bind:open; confirmLoading блокирует
пользовательское закрытие. Если onOk задан, он управляет подтверждением и
закрытием; без onOk кнопка подтверждения закрывает окно. В SSR dialog остаётся
скрытым до гидратации. Для асинхронного подтверждения владелец управляет
confirmLoading, обрабатывает ошибки и сбрасывает open после успеха.

## Проверки и границы версии

Тесты рядом с модулем проверяют выбор и поиск, правила валидации, конкурирующие
проверки, повторную отправку, сброс, изоляцию состояния и SSR реальных
компонентов. Из корня репозитория выполняются `npm run lint`,
`npm exec -- svelte-kit sync`,
`npm exec -- svelte-check --tsconfig ./tsconfig.json --tsgo`, `npm test`
и `npm run build`.

Для браузерной проверки откройте `/ant-design`: переключите темы и размеры,
пройдите Select клавиатурой, проверьте открытие и закрытие Modal с возвратом
фокуса, отправьте пустую и заполненную форму, измените подтверждённый пароль,
сбросьте значения и проверьте узкий viewport. Node-тесты не подтверждают
браузерные focus, hydration и visual behavior.

Эта версия покрывает перечисленное ядро. Table, DatePicker/RangePicker,
Tree/TreeSelect, Upload, множественный Select, Form.List, вложенные name paths,
порталы, виртуализация и статические методы Modal пока отсутствуют. Совместимость
всего React API и визуальная идентичность всех состояний не заявлены.

## Источник и лицензия

Стили взяты из `dist/antd.css` официального
[пакета antd 6.6.8](https://registry.npmjs.org/antd/-/antd-6.6.8.tgz).
В [vendor/antd.css](./vendor/antd.css) оставлены правила Button, Input, Select,
Modal, Form и связанные animations; глобальные токены сохранены. Селекторы
`.css-var-_R_0_` заменены на `:root`/`.ant-svelte-theme` и классы компонентов.
SHA-256 исходного архива записан в заголовке файла.

Компоненты и модели реализованы на Svelte. [theme.css](./theme.css) связывает
статические токены компонентов с переключаемыми темами. Текст исходной
[лицензии MIT](./vendor/LICENSE.ant-design) сохранён в пакете. Официальная
React-реализация развивается в [ant-design/ant-design](https://github.com/ant-design/ant-design).
