<script lang="ts">
  import { untrack } from 'svelte';
  import { Checkbox, Collapse, Form, FormItem, Input, Select, Tabs, createForm, type SelectOption } from '$lib/components/ant-design';

  let { name, role, note, news, formId, onSave }: { name: string; role: string; note: string; news: boolean; formId: string; onSave: (values: { name: string; role: string; note: string; news: boolean }) => void } = $props();
  const roles: SelectOption<string>[] = [{ value: 'developer', label: 'Разработчик' }, { value: 'designer', label: 'Дизайнер' }, { value: 'manager', label: 'Менеджер' }];
  const form = createForm<{ name: string; role: string; note: string; news: boolean }>({
    initialValues: untrack(() => ({ name, role, note, news })),
    rules: { name: [{ required: true, message: 'Введите имя участника.' }] }
  });
</script>

{#snippet preferences()}
  <Checkbox checked={form.values.news} onCheckedChange={(value) => form.setFieldValue('news', value)}>Новости для участника</Checkbox>
{/snippet}
{#snippet notes()}
  <Collapse aria-label="Заметки карточки" defaultActiveKey="note" items={[{ key: 'note', label: 'Комментарий об участнике', children: noteField }]} />
{/snippet}
{#snippet noteField()}
  <FormItem name="note" label="Заметка в карточке"><Input value={form.values.note} onValueChange={(value) => form.setFieldValue('note', value)} /></FormItem>
{/snippet}

<Form {form} id={formId} onFinish={onSave}>
  <FormItem name="name" label="Имя в карточке"><Input value={form.values.name} onValueChange={(value) => form.setFieldValue('name', value)} /></FormItem>
  <FormItem name="role" label="Роль в карточке"><Select value={form.values.role} onValueChange={(value) => form.setFieldValue('role', value ?? 'developer')} options={roles} /></FormItem>
  <Tabs aria-label="Разделы карточки участника" items={[{ key: 'preferences', label: 'Уведомления карточки', children: preferences }, { key: 'notes', label: 'Заметки карточки', children: notes }]} />
</Form>
