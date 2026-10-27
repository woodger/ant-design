import { createForm, type ComponentSize, type TableFilters, type TableKey, type TableSorter, type ThemeConfig } from '$lib/components/ant-design';

export interface ShowcaseMember {
  key: number;
  name: string;
  team: string;
  tasks: number;
  active: boolean;
}

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
  let permissionResult = $state('');
  let page = $state(1);
  let pageSize = $state(10);
  let tablePage = $state(1);
  let tablePageSize = $state(5);
  let tableSorter = $state<TableSorter | null>(null);
  let tableFilters = $state<TableFilters>({});
  let tableSelection = $state<TableKey[]>([]);
  let tableLoading = $state(false);
  let tableEmpty = $state(false);
  const members: ShowcaseMember[] = [
    { key: 1, name: 'Анна Иванова', team: 'Разработка', tasks: 24, active: true },
    { key: 2, name: 'Борис Соколов', team: 'Дизайн', tasks: 12, active: false },
    { key: 3, name: 'Вера Петрова', team: 'Разработка', tasks: 18, active: true },
    { key: 4, name: 'Глеб Волков', team: 'Поддержка', tasks: 31, active: true },
    { key: 5, name: 'Дарья Орлова', team: 'Дизайн', tasks: 9, active: true },
    { key: 6, name: 'Егор Смирнов', team: 'Разработка', tasks: 27, active: true },
    { key: 7, name: 'Жанна Белова', team: 'Поддержка', tasks: 15, active: true },
    { key: 8, name: 'Иван Козлов', team: 'Разработка', tasks: 18, active: true },
    { key: 9, name: 'Кира Морозова', team: 'Дизайн', tasks: 22, active: true },
    { key: 10, name: 'Лев Попов', team: 'Поддержка', tasks: 11, active: true },
    { key: 11, name: 'Мария Новикова', team: 'Разработка', tasks: 35, active: true },
    { key: 12, name: 'Никита Фёдоров', team: 'Дизайн', tasks: 16, active: true }
  ];
  const permissionOptions = [
    { value: 'read', label: 'Просмотр' },
    { value: 'edit', label: 'Редактирование' },
    { value: 'export', label: 'Экспорт' }
  ];
  const permissionForm = createForm<{ permissions: string[] }>({
    initialValues: { permissions: ['read'] },
    rules: { permissions: [
      { required: true, message: 'Выберите хотя бы одно право.' },
      { max: 2, message: 'Выберите не более двух прав.' }
    ] }
  });

  function setPermissions(values: string[]) {
    permissionForm.setFieldValue('permissions', values);
    permissionResult = '';
  }

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
    permissionForm,
    permissionGroupOptions: [...permissionOptions, { value: 'unavailable', label: 'Недоступное право', disabled: true }],
    get permissionResult() { return permissionResult; },
    get permissions() { return permissionForm.values.permissions; },
    get allPermissions() { return permissionForm.values.permissions.length === permissionOptions.length; },
    get somePermissions() { return permissionForm.values.permissions.length > 0 && permissionForm.values.permissions.length < permissionOptions.length; },
    selectAllPermissions(checked: boolean) { setPermissions(checked ? permissionOptions.map((option) => option.value) : []); },
    setPermissions,
    finishPermissions(values: { permissions: string[] }) {
      permissionResult = `Сохранены права: ${values.permissions.map((value) => permissionOptions.find((option) => option.value === value)?.label).join(', ')}.`;
    },
    resetPermissions() {
      permissionForm.resetFields();
      permissionResult = '';
    },
    get page() { return page; },
    set page(value: number) { page = value; },
    get pageSize() { return pageSize; },
    set pageSize(value: number) { pageSize = value; },
    get members() { return tableEmpty ? [] : members; },
    get tablePage() { return tablePage; },
    set tablePage(value: number) { tablePage = value; },
    get tablePageSize() { return tablePageSize; },
    set tablePageSize(value: number) { tablePageSize = value; },
    get tableSorter() { return tableSorter; },
    set tableSorter(value: TableSorter | null) { tableSorter = value; },
    get tableFilters() { return tableFilters; },
    set tableFilters(value: TableFilters) { tableFilters = value; },
    get tableSelection() { return tableSelection; },
    set tableSelection(value: TableKey[]) { tableSelection = value; },
    get tableLoading() { return tableLoading; },
    set tableLoading(value: boolean) { tableLoading = value; },
    get tableEmpty() { return tableEmpty; },
    set tableEmpty(value: boolean) { tableEmpty = value; },
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
