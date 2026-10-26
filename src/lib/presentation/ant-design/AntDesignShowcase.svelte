<script lang="ts">
  import { Button, Checkbox, ConfigProvider, Form, FormItem, Input, Modal, Pagination, Select } from '$lib/components/ant-design';
  import { createShowcase } from './showcase.model.svelte';

  const demo = createShowcase();
  const navigation = [
    ['overview', 'Обзор'],
    ['buttons', 'Button'],
    ['inputs', 'Input'],
    ['select', 'Select'],
    ['checkbox', 'Checkbox'],
    ['form', 'Form'],
    ['pagination', 'Pagination'],
    ['modal', 'Modal']
  ];
  const frameworks = [
    { value: 'svelte', label: 'Svelte 5' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular', disabled: true }
  ];
  const roles = [
    { value: 'developer', label: 'Разработчик' },
    { value: 'designer', label: 'Дизайнер' },
    { value: 'manager', label: 'Менеджер' }
  ];
  const buttonExample = `<script lang="ts">\n  import { Button, ConfigProvider } from '$lib/components/ant-design';\n${'</'}script>\n\n<ConfigProvider>\n  <Button type="primary" onclick={() => console.log('click')}>\n    Сохранить\n  </Button>\n</ConfigProvider>`;
</script>

<style>
  :global(body:has(.ant-design-showcase)) { margin: 0; }
  .shell { min-height: 100dvh; background: var(--ant-color-bg-layout); }
  .topbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; gap: 24px; height: 72px; padding: 0 32px; border-bottom: 1px solid var(--ant-color-border-secondary); background: var(--ant-color-bg-container); }
  .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ant-color-text); font-weight: 650; font-size: 19px; letter-spacing: -0.4px; }
  .brand-mark { display: grid; width: 32px; height: 32px; place-items: center; border: 2px solid var(--ant-color-primary); border-radius: 7px; color: var(--ant-color-primary); font-size: 20px; transform: rotate(-10deg); }
  .brand small { align-self: start; padding: 2px 6px; border: 1px solid var(--ant-color-border-secondary); border-radius: 4px; color: var(--ant-color-text-tertiary); font-size: 10px; font-weight: 500; letter-spacing: 0; }
  .topbar-actions, .controls, .row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
  .topbar-actions a { color: var(--ant-color-text-secondary); text-decoration: none; font-size: 13px; }
  .layout { display: grid; grid-template-columns: 224px minmax(0, 1fr); max-width: 1600px; margin: 0 auto; }
  .sidebar { position: sticky; top: 72px; align-self: start; padding: 36px 16px 24px 24px; }
  .nav-label { margin: 0 12px 12px; color: var(--ant-color-text-tertiary); font-size: 11px; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; }
  .sidebar nav { display: grid; gap: 5px; }
  .sidebar a { padding: 10px 14px; border-radius: 6px; color: var(--ant-color-text-secondary); font-size: 14px; text-decoration: none; }
  .sidebar a:hover, .sidebar a:focus-visible { background: var(--ant-color-primary-bg); color: var(--ant-color-primary); }
  .sidebar a:first-child { color: var(--ant-color-primary); background: var(--ant-color-primary-bg); font-weight: 600; }
  .sidebar-note { margin: 36px 12px 0; padding-top: 18px; border-top: 1px solid var(--ant-color-border-secondary); color: var(--ant-color-text-tertiary); font-size: 12px; line-height: 1.7; }
  .content { min-width: 0; max-width: 1080px; padding: 42px 40px 64px; }
  section { scroll-margin-top: 96px; }
  .eyebrow { color: var(--ant-color-primary); font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  h1 { margin: 10px 0 16px; color: var(--ant-color-text-heading); font-size: clamp(28px, 4vw, 42px); line-height: 1.2; font-weight: 650; letter-spacing: -1.5px; }
  .lead { max-width: 660px; margin: 0 0 22px; color: var(--ant-color-text-secondary); font-size: 16px; line-height: 1.7; }
  .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
  .badge { padding: 3px 9px; border: 1px solid var(--ant-color-border-secondary); border-radius: 5px; background: var(--ant-color-bg-container); color: var(--ant-color-text-secondary); font-size: 12px; }
  .badge.blue { border-color: var(--ant-color-primary-border); background: var(--ant-color-primary-bg); color: var(--ant-color-primary); }
  .settings { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 38px; padding: 20px 22px; border: 1px solid var(--ant-color-border-secondary); border-radius: 8px; background: var(--ant-color-bg-container); }
  .setting-label { margin-bottom: 9px; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .swatches { display: flex; gap: 10px; }
  .swatch { width: 25px; height: 25px; padding: 0; border: 3px solid var(--ant-color-bg-container); border-radius: 50%; cursor: pointer; outline: 1px solid var(--ant-color-border-secondary); }
  .swatch[aria-pressed='true'] { outline: 2px solid var(--ant-color-text); outline-offset: 2px; }
  .swatch:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 3px; }
  .blue-swatch { background: #1677ff; } .purple-swatch { background: #722ed1; } .green-swatch { background: #52c41a; }
  .section-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin: 32px 0 14px; }
  h2 { margin: 0; color: var(--ant-color-text-heading); font-size: 22px; line-height: 1.4; font-weight: 600; letter-spacing: -0.4px; }
  .section-count { color: var(--ant-color-text-quaternary); font-family: var(--ant-font-family-code); font-size: 12px; }
  .section-description { margin: 0 0 20px; color: var(--ant-color-text-secondary); }
  .panel { padding: 26px; border: 1px solid var(--ant-color-border-secondary); border-radius: 8px; background: var(--ant-color-bg-container); }
  .example-label { margin: 0 0 16px; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .example-divider { margin: 24px 0; border: 0; border-top: 1px dashed var(--ant-color-border-secondary); }
  .code { margin: 0; padding: 22px 24px; overflow: auto; border: 1px solid var(--ant-color-border-secondary); border-top: 0; border-radius: 0 0 8px 8px; background: var(--ant-color-fill-quaternary); color: var(--ant-color-text-secondary); font: 12px/1.8 var(--ant-font-family-code); }
  .with-code { border-radius: 8px 8px 0 0; }
  .input-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 24px; }
  .field-example { display: grid; gap: 8px; color: var(--ant-color-text-secondary); font-size: 12px; }
  .field-example > span { padding-bottom: 2px; }
  .output { margin: 16px 0 0; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .form-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.8fr); gap: 24px; align-items: start; }
  h3 { margin: 0 0 5px; font-size: 16px; color: var(--ant-color-text-heading); font-weight: 600; }
  .form-description { margin: 0 0 24px; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .form-note { padding: 24px; border: 1px solid var(--ant-color-primary-border); border-radius: 8px; background: var(--ant-color-primary-bg); }
  .form-note h3 { color: var(--ant-color-primary); }
  .form-note ul { padding-inline-start: 18px; margin: 16px 0 0; color: var(--ant-color-text-secondary); font-size: 13px; line-height: 1.9; }
  .result { margin: 18px 0 0; padding: 12px; border-radius: 6px; background: var(--ant-color-primary-bg); color: var(--ant-color-primary); font-size: 13px; }
  .status-line { margin-top: 28px; padding: 16px 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: 8px; background: var(--ant-color-bg-container); color: var(--ant-color-text-secondary); font-size: 13px; }
  .status-dot { display: inline-block; width: 6px; height: 6px; margin-inline-end: 8px; border-radius: 50%; background: var(--ant-color-success); }
  .footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--ant-color-border-secondary); color: var(--ant-color-text-tertiary); font-size: 12px; }
  .footer a { color: var(--ant-color-primary); text-decoration: none; }
  a:focus-visible { outline: 2px solid var(--ant-color-primary); outline-offset: 3px; }
  @media (max-width: 1050px) { .content { padding: 32px 24px; } .layout { grid-template-columns: 180px minmax(0, 1fr); } .form-grid { grid-template-columns: 1fr; } }
  @media (max-width: 720px) { .topbar { height: auto; min-height: 68px; padding: 12px 18px; gap: 12px; flex-wrap: wrap; } .topbar-actions { gap: 12px; } .topbar-actions a { display: none; } .layout { display: block; } .sidebar { position: static; padding: 16px 18px 0; } .sidebar nav { display: flex; overflow-x: auto; } .sidebar a { flex: none; padding: 7px 12px; } .sidebar-note, .nav-label { display: none; } .content { padding: 28px 18px 40px; } .panel { padding: 20px; } .input-grid { grid-template-columns: 1fr; } .settings { padding: 18px; } h1 { letter-spacing: -0.8px; } }
</style>

<ConfigProvider theme={demo.theme} componentSize={demo.size}>
  <div class="shell ant-design-showcase">
    <header class="topbar">
      <a class="brand" href="/ant-design"><span class="brand-mark" aria-hidden="true">A</span> Ant Design <small>SVELTE</small></a>
      <div class="topbar-actions">
        <a href="https://ant.design/components/overview/">Оригинальная библиотека ↗</a>
        <Button type="text" onclick={demo.toggleTheme} aria-pressed={demo.theme.mode === 'dark'}>
          {demo.theme.mode === 'dark' ? '☀ Светлая тема' : '◐ Тёмная тема'}
        </Button>
      </div>
    </header>

    <div class="layout">
      <aside class="sidebar" aria-label="Навигация по компонентам">
        <p class="nav-label">Компоненты</p>
        <nav>{#each navigation as [id, label]}<a href={`#${id}`}>{label}</a>{/each}</nav>
        <p class="sidebar-note">Community-перенос<br />на Svelte 5 + TypeScript.<br /><br />Стили Ant Design 6.6.8<br />Лицензия MIT</p>
      </aside>

      <div class="content">
        <section id="overview">
          <span class="eyebrow">Знакомый дизайн. Новый runtime.</span>
          <h1>Ant Design для Svelte</h1>
          <p class="lead">Базовые компоненты Ant Design на Svelte 5. Типизированные свойства, реактивные формы и переключение тем — попробуйте всё прямо здесь.</p>
          <div class="badges"><span class="badge blue">Первая версия</span><span class="badge">Svelte 5</span><span class="badge">TypeScript</span><span class="badge">Ant Design 6.6.8</span><span class="badge">9 компонентов</span></div>

          <div class="settings">
            <div><div class="setting-label">Основной цвет</div><div class="swatches" role="group" aria-label="Основной цвет">
              <button class="swatch blue-swatch" aria-label="Синий" aria-pressed={demo.theme.primary === 'blue'} onclick={() => demo.setPrimary('blue')}></button>
              <button class="swatch purple-swatch" aria-label="Фиолетовый" aria-pressed={demo.theme.primary === 'purple'} onclick={() => demo.setPrimary('purple')}></button>
              <button class="swatch green-swatch" aria-label="Зелёный" aria-pressed={demo.theme.primary === 'green'} onclick={() => demo.setPrimary('green')}></button>
            </div></div>
            <div><div class="setting-label">Размер компонентов</div><div class="controls" role="group" aria-label="Размер компонентов">
              <Button size="small" type={demo.size === 'small' ? 'primary' : 'default'} aria-pressed={demo.size === 'small'} onclick={() => demo.setSize('small')}>S</Button>
              <Button size="small" type={demo.size === 'middle' ? 'primary' : 'default'} aria-pressed={demo.size === 'middle'} onclick={() => demo.setSize('middle')}>M</Button>
              <Button size="small" type={demo.size === 'large' ? 'primary' : 'default'} aria-pressed={demo.size === 'large'} onclick={() => demo.setSize('large')}>L</Button>
            </div></div>
            <div><div class="setting-label">Плотность интерфейса</div><Button size="small" aria-pressed={demo.theme.compact} onclick={demo.toggleCompact}>{demo.theme.compact ? 'Компактная' : 'Обычная'}</Button></div>
          </div>
        </section>

        <section id="buttons">
          <div class="section-heading"><h2>Button</h2><span class="section-count">01 / 07</span></div>
          <p class="section-description">Действия, варианты оформления и состояния кнопок.</p>
          <div class="panel with-code">
            <p class="example-label">Варианты</p>
            <div class="row">
              <Button type="primary" onclick={() => demo.showAction('Нажата основная кнопка.')}>Основная</Button>
              <Button onclick={() => demo.showAction('Нажата обычная кнопка.')}>Обычная</Button>
              <Button type="dashed" onclick={() => demo.showAction('Нажата пунктирная кнопка.')}>Пунктирная</Button>
              <Button type="text" onclick={() => demo.showAction('Нажата текстовая кнопка.')}>Текстовая</Button>
              <Button type="link" onclick={() => demo.showAction('Нажата кнопка-ссылка.')}>Ссылка</Button>
            </div>
            <hr class="example-divider" />
            <p class="example-label">Состояния</p>
            <div class="row"><Button type="primary" loading>Загрузка</Button><Button disabled>Недоступна</Button><Button danger onclick={() => demo.showAction('Нажата кнопка опасного действия.')}>Удалить</Button><Button type="primary" shape="round" onclick={() => demo.showAction('Нажата скруглённая кнопка.')}>Скруглённая</Button></div>
          </div>
          <pre class="code"><code>{buttonExample}</code></pre>
        </section>

        <section id="inputs">
          <div class="section-heading"><h2>Input</h2><span class="section-count">02 / 07</span></div>
          <p class="section-description">Нативные поля ввода с двусторонней привязкой значения.</p>
          <div class="panel">
            <div class="input-grid">
              <label class="field-example"><span>Редактируемое значение</span><Input bind:value={demo.input} placeholder="Введите текст" /></label>
              <label class="field-example"><span>Пустое поле</span><Input placeholder="Например, название проекта" /></label>
              <label class="field-example"><span>Состояние ошибки</span><Input status="error" defaultValue="Проверьте значение" /></label>
              <label class="field-example"><span>Недоступное поле</span><Input disabled defaultValue="Только для просмотра" /></label>
            </div>
            <p class="output">Текущее значение: <strong>{demo.input || '—'}</strong></p>
          </div>
        </section>

        <section id="select">
          <div class="section-heading"><h2>Select</h2><span class="section-count">03 / 07</span></div>
          <p class="section-description">Выбор с поиском, очисткой и управлением с клавиатуры.</p>
          <div class="panel">
            <div class="input-grid">
              <div class="field-example"><label for="framework-select">Фреймворк · поиск включён</label><Select id="framework-select" options={frameworks} bind:value={demo.selected} showSearch allowClear placeholder="Выберите фреймворк" /></div>
              <div class="field-example"><label for="disabled-select">Недоступный выбор</label><Select id="disabled-select" options={frameworks} defaultValue="svelte" disabled /></div>
            </div>
            <p class="output">Выбрано: <strong>{demo.selected ?? 'ничего'}</strong>. Используйте ↑ ↓, Enter и Escape.</p>
          </div>
        </section>

        <section id="checkbox">
          <div class="section-heading"><h2>Checkbox</h2><span class="section-count">04 / 07</span></div>
          <p class="section-description">Выбор нескольких прав и смешанное состояние «выбрать всё».</p>
          <div class="panel">
            <Checkbox checked={demo.allPermissions} indeterminate={demo.somePermissions} onCheckedChange={demo.selectAllPermissions}>Все права</Checkbox>
            <hr class="example-divider" />
            <div class="row">
              {#each demo.permissionOptions as option (option.value)}
                <Checkbox checked={demo.permissions.includes(option.value)} onCheckedChange={(checked) => demo.setPermission(option.value, checked)}>{option.label}</Checkbox>
              {/each}
              <Checkbox disabled>Недоступное право</Checkbox>
            </div>
            <p class="output">Выбрано прав: <strong>{demo.permissions.length}</strong> из {demo.permissionOptions.length}.</p>
          </div>
        </section>

        <section id="form">
          <div class="section-heading"><h2>Form</h2><span class="section-count">05 / 07</span></div>
          <p class="section-description">Типизированная модель формы, валидация и зависимые поля.</p>
          <div class="form-grid">
            <div class="panel">
              <h3>Новый участник</h3><p class="form-description">Пример проверки формы. Данные остаются на этой странице.</p>
              <Form form={demo.form} onFinish={demo.finishForm}>
                <FormItem name="name" label="Имя"><Input value={demo.form.values.name} onValueChange={(value) => demo.form.setFieldValue('name', value)} placeholder="Анна Иванова" autocomplete="name" /></FormItem>
                <FormItem name="email" label="Email"><Input value={demo.form.values.email} onValueChange={(value) => demo.form.setFieldValue('email', value)} placeholder="anna@example.com" type="email" autocomplete="email" /></FormItem>
                <FormItem name="role" label="Роль"><Select options={roles} value={demo.form.values.role} onValueChange={(value) => demo.form.setFieldValue('role', value ?? '')} /></FormItem>
                <FormItem name="password" label="Пароль" help="Не менее 8 символов."><Input value={demo.form.values.password} onValueChange={(value) => demo.form.setFieldValue('password', value)} type="password" autocomplete="new-password" placeholder="Придумайте пароль" /></FormItem>
                <FormItem name="confirmPassword" label="Подтверждение пароля"><Input value={demo.form.values.confirmPassword} onValueChange={(value) => demo.form.setFieldValue('confirmPassword', value)} type="password" autocomplete="new-password" placeholder="Повторите пароль" /></FormItem>
                <div class="row"><Button type="primary" htmlType="submit" loading={demo.form.isSubmitting}>Проверить форму</Button><Button onclick={demo.resetForm}>Сбросить</Button></div>
              </Form>
              {#if demo.formResult}<p class="result" role="status">{demo.formResult}</p>{/if}
            </div>
            <aside class="form-note">
              <h3>Попробуйте валидацию</h3>
              <ul><li>Отправьте пустую форму.</li><li>Введите email без домена.</li><li>Задайте разные пароли.</li><li>Исправьте данные: ошибки обновятся.</li><li>Сбросьте форму к начальным значениям.</li></ul>
            </aside>
          </div>
        </section>

        <section id="pagination">
          <div class="section-heading"><h2>Pagination</h2><span class="section-count">06 / 07</span></div>
          <p class="section-description">Переходы по страницам и выбор количества записей.</p>
          <div class="panel">
            <Pagination total={137} bind:current={demo.page} bind:pageSize={demo.pageSize} aria-label="Пример пагинации">
              {#snippet showTotal(total, range)}{range[0]}–{range[1]} из {total}{/snippet}
            </Pagination>
            <p class="output">Страница: <strong>{demo.page}</strong>. Записей на странице: <strong>{demo.pageSize}</strong>.</p>
          </div>
        </section>

        <section id="modal">
          <div class="section-heading"><h2>Modal</h2><span class="section-count">07 / 07</span></div>
          <p class="section-description">Модальное окно с удержанием фокуса и возвратом к кнопке открытия.</p>
          <div class="panel"><div class="row"><Button type="primary" onclick={() => { demo.modalOpen = true; }}>Открыть модальное окно</Button><span class="output">Escape или нажатие на фон закрывают окно.</span></div></div>
          <Modal bind:open={demo.modalOpen} title="Всё готово к работе" onOk={demo.confirmModal}>
            <p>Это компонент Modal на Svelte 5. Перемещайтесь между кнопками клавишей Tab — фокус остаётся внутри окна.</p>
            <p>Подтвердите действие или вернитесь к примерам.</p>
          </Modal>
        </section>

        <div class="status-line" role="status"><span class="status-dot" aria-hidden="true"></span>{demo.action}</div>
        <footer class="footer"><span>Community-реализация · Svelte 5 + TypeScript</span><a href="https://github.com/ant-design/ant-design">Исходный Ant Design ↗</a></footer>
      </div>
    </div>
  </div>
</ConfigProvider>
