<script lang="ts">
  import { Button, Checkbox, CheckableTag, Input, Select, Table, Tag, type TableColumn, type TagColor, type TagStatusColor, type TagVariant } from '$lib/components/ant-design';
  import { createTagLabels, type TagLabel } from './tag-labels.model.svelte';

  interface Task { key: number; name: string; status: TagStatusColor; }
  const model = createTagLabels();
  const presets: TagColor[] = ['blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold'];
  const statuses: { value: TagStatusColor; label: string }[] = [{ value: 'success', label: 'Готово' }, { value: 'processing', label: 'В работе' }, { value: 'warning', label: 'Требует проверки' }, { value: 'error', label: 'Ошибка' }];
  const tasks: Task[] = [{ key: 1, name: 'Подготовить релиз', status: 'success' }, { key: 2, name: 'Обновить документацию', status: 'processing' }, { key: 3, name: 'Проверить доступность', status: 'warning' }, { key: 4, name: 'Повторить сборку', status: 'error' }];
  const columns: TableColumn<Task>[] = [{ key: 'name', title: 'Задача', dataIndex: 'name' }, { key: 'status', title: 'Статус', render: taskStatus }];
  let color = $state<TagColor>('blue');
  let variant = $state<TagVariant>('filled');
  let close = $state(true);
  let icon = $state(false);
  let disabled = $state(false);
  let protectPreview = $state(false);
  let previewVersion = $state(0);
  let draft = $state<string | undefined>('');
  let selected = $state<TagStatusColor[]>([]);
  let message = $state('Добавьте метку или выберите статус задачи.');
  let visible = $derived(tasks.filter(task => !selected.length || selected.includes(task.status)));

  function focusInput() { document.getElementById('tag-example-label')?.focus({ preventScroll: true }); }
  function add(event: SubmitEvent) {
    event.preventDefault();
    const result = model.add(draft ?? '');
    message = result === 'added' ? 'Метка добавлена.' : result === 'duplicate' ? 'Такая метка уже есть.' : 'Введите название метки.';
    if (result === 'added') draft = '';
    focusInput();
  }
  function remove(event: MouseEvent, label: TagLabel) {
    if (!model.remove(label.key)) { event.preventDefault(); message = `Метка ${label.text} обязательна.`; return; }

    message = `Метка ${label.text} удалена.`;
    if (model.labels.length === 1) focusInput();
  }
  function toggle(value: TagStatusColor, checked: boolean) { selected = checked ? [...selected, value] : selected.filter(item => item !== value); }
  function reset() {
    model.reset(); selected = []; draft = ''; color = 'blue'; variant = 'filled'; close = true; icon = false; disabled = false; protectPreview = false; previewVersion++;
    message = 'Начальные метки восстановлены.';
  }
</script>

<style>
  .controls, .tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }
  .controls { gap: 12px; }
  .field { width: 180px; max-width: 100%; }
  .wide { width: 260px; max-width: 100%; }
  .preview { margin-block: 24px; padding: 20px; border: 1px solid var(--ant-color-border-secondary); border-radius: var(--ant-border-radius-lg); }
  .tags, .table { margin-block: 16px; }
  .controls :global(.ant-btn) { max-width: 100%; height: auto; min-height: var(--ant-control-height); white-space: normal; }
  output { display: block; margin-top: 16px; color: var(--ant-color-text-secondary); }
</style>

{#snippet previewIcon()}<svg width="16" height="16" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2" /></svg>{/snippet}
{#snippet taskStatus(task: Task)}<Tag color={task.status}>{statuses.find(item => item.value === task.status)?.label}</Tag>{/snippet}

<div class="controls"><div class="field"><Select aria-label="Цвет Tag" bind:value={color} options={[...presets, 'default', 'success', 'processing', 'error', 'warning'].map(value => ({ value: value as TagColor, label: value }))} /></div><div class="field"><Select aria-label="Вариант Tag" bind:value={variant} options={['filled', 'outlined', 'solid'].map(value => ({ value: value as TagVariant, label: value }))} /></div><Checkbox bind:checked={close}>Закрытие Tag</Checkbox><Checkbox bind:checked={icon}>Иконка Tag</Checkbox><Checkbox bind:checked={disabled}>Отключить Tag</Checkbox><Checkbox bind:checked={protectPreview}>Отменять закрытие Tag</Checkbox></div>
<div class="preview"><div class="tags">{#key previewVersion}<Tag {color} {variant} {disabled} icon={icon ? previewIcon : undefined} closeIcon={close} closeLabel="Закрыть метку предпросмотра" onClose={event => { if (protectPreview) event.preventDefault(); message = protectPreview ? 'Закрытие отменено.' : 'Метка предпросмотра закрыта.'; }}>Предпросмотр Tag</Tag>{/key}<Button onclick={() => { previewVersion++; }}>Восстановить Tag</Button></div><div class="tags" aria-label="Предустановленные цвета Tag">{#each presets as value}<Tag color={value} {variant}>{value}</Tag>{/each}</div><div class="tags" aria-label="Статусные цвета Tag">{#each statuses as item}<Tag color={item.value} {variant}>{item.label}</Tag>{/each}</div></div>
<h3>Метки проекта</h3>
<form class="controls" aria-label="Добавление меток" onsubmit={add}><div class="wide"><label for="tag-example-label">Новая метка проекта</label><Input id="tag-example-label" bind:value={draft} /></div><Button type="primary" htmlType="submit">Добавить метку</Button><Button onclick={reset}>Сбросить пример Tag</Button></form>
<div class="tags" role="group" aria-label="Метки проекта">{#each model.labels as label (label.key)}<Tag color={label.protected ? 'blue' : 'default'} closeIcon closeLabel={`Удалить метку ${label.text}`} onClose={event => remove(event, label)}>{label.text}</Tag>{/each}</div>
<h3>Фильтрация задач</h3>
<div class="tags" role="group" aria-label="Фильтр задач по статусу">{#each statuses as item}<CheckableTag checked={selected.includes(item.value)} onChange={checked => toggle(item.value, checked)}>{item.label}</CheckableTag>{/each}</div>
<div class="table"><Table dataSource={visible} {columns} caption="Задачи с метками статуса" pagination={false} /></div>
<output aria-label="Результат примера Tag">{message} Показано задач: {visible.length}.</output>
