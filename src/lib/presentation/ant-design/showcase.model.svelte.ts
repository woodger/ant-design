import { createForm, type ComponentSize, type ThemeConfig } from '$lib/components/ant-design';

export function createShowcase() {
  let mode = $state<'light' | 'dark'>('light');
  let primary = $state<'blue' | 'purple' | 'green'>('blue');
  let compact = $state(false);
  let size = $state<ComponentSize>('middle');
  let input = $state('Svelte 5');
  let selected = $state<string | undefined>('svelte');
  let modalOpen = $state(false);
  let action = $state('Попробуйте компоненты — результат появится здесь.');
  let formResult = $state('');
  let permissions = $state(['read']);
  let page = $state(1);
  let pageSize = $state(10);
  const permissionOptions = [
    { value: 'read', label: 'Просмотр' },
    { value: 'edit', label: 'Редактирование' },
    { value: 'export', label: 'Экспорт' }
  ];

  const form = createForm({
    initialValues: { name: '', email: '', role: 'developer', password: '', confirmPassword: '' },
    rules: {
      name: [{ required: true, message: 'Введите имя участника.' }],
      email: [
        { required: true, message: 'Введите email.' },
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Укажите email в формате name@example.com.' }
      ],
      role: [{ required: true, message: 'Выберите роль.' }],
      password: [{ required: true, min: 8, message: 'Введите пароль длиной от 8 символов.' }],
      confirmPassword: [
        { required: true, message: 'Повторите пароль.' },
        { validator: (value, values) => value === values.password ? undefined : 'Пароли должны совпадать.' }
      ]
    }
  });

  return {
    form,
    get theme(): ThemeConfig { return { mode, primary, compact }; },
    get size() { return size; },
    get input() { return input; },
    set input(value: string) { input = value; },
    get selected() { return selected; },
    set selected(value: string | undefined) { selected = value; },
    get modalOpen() { return modalOpen; },
    set modalOpen(value: boolean) { modalOpen = value; },
    get action() { return action; },
    get formResult() { return formResult; },
    permissionOptions,
    get permissions() { return permissions; },
    get allPermissions() { return permissions.length === permissionOptions.length; },
    get somePermissions() { return permissions.length > 0 && permissions.length < permissionOptions.length; },
    selectAllPermissions(checked: boolean) { permissions = checked ? permissionOptions.map((option) => option.value) : []; },
    setPermission(value: string, checked: boolean) {
      permissions = checked ? [...permissions, value] : permissions.filter((item) => item !== value);
    },
    get page() { return page; },
    set page(value: number) { page = value; },
    get pageSize() { return pageSize; },
    set pageSize(value: number) { pageSize = value; },
    toggleTheme() { mode = mode === 'light' ? 'dark' : 'light'; },
    setPrimary(value: 'blue' | 'purple' | 'green') { primary = value; },
    toggleCompact() { compact = !compact; },
    setSize(value: ComponentSize) { size = value; },
    showAction(value: string) { action = value; },
    confirmModal() {
      modalOpen = false;
      action = 'Действие подтверждено в модальном окне.';
    },
    finishForm(values: typeof form.values) {
      formResult = `Проверка пройдена: ${values.name}, ${values.email}.`;
    },
    resetForm() {
      form.resetFields();
      formResult = '';
    }
  };
}
