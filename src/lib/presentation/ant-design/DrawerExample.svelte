<script lang="ts">
  import { untrack } from 'svelte';
  import { Button, Checkbox, Drawer, Table, type DrawerPlacement, type DrawerSize, type TableColumn } from '$lib/components/ant-design';
  import DrawerEditor from './DrawerEditor.svelte';

  interface Member { key: number; name: string; role: string; note: string; news: boolean; }
  let members = $state<Member[]>([{ key: 1, name: 'Анна', role: 'developer', note: 'Ведёт библиотеку компонентов', news: true }, { key: 2, name: 'Михаил', role: 'designer', note: 'Отвечает за дизайн', news: false }]);
  let selected = $state<Member>(untrack(() => members[0]));
  let open = $state(false);
  let placement = $state<DrawerPlacement>('right');
  let size = $state<DrawerSize>('default');
  let destroyOnHidden = $state(false);
  let result = $state('Откройте карточку участника. При закрытии несохранённый черновик останется в панели.');
  const columns: TableColumn<Member>[] = [{ key: 'name', title: 'Участник', dataIndex: 'name' }, { key: 'role', title: 'Роль', render: roleCell }, { key: 'action', title: 'Карточка', render: actions }];
  let formId = $derived(`drawer-member-form-${selected.key}`);

  function save(values: Omit<Member, 'key'>) {
    members = members.map((member) => member.key === selected.key ? { key: member.key, ...values } : member);
    result = `Участник сохранён: ${values.name}.`;
    open = false;
  }
</script>

<style>
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .footer { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
  output { display: block; margin-top: 20px; color: var(--ant-color-text-secondary); }
  .record { color: var(--ant-color-text-secondary); font-size: 12px; }
</style>

{#snippet roleCell(member: Member)}{({ developer: 'Разработчик', designer: 'Дизайнер', manager: 'Менеджер' } as Record<string, string>)[member.role]}{/snippet}
{#snippet actions(member: Member)}<Button size="small" aria-label={`Редактировать: ${member.name}`} onclick={() => { selected = member; open = true; }}>Редактировать</Button>{/snippet}
{#snippet extra()}<span class="record">№{selected.key}</span>{/snippet}
{#snippet footer()}<div class="footer"><Button onclick={() => { open = false; }}>Закрыть карточку</Button><Button type="primary" htmlType="submit" form={formId}>Сохранить участника</Button></div>{/snippet}

<div class="settings">
  <label>Сторона панели <select bind:value={placement}><option value="right">Справа</option><option value="left">Слева</option><option value="top">Сверху</option><option value="bottom">Снизу</option></select></label>
  <label>Размер панели <select bind:value={size}><option value="default">Обычный</option><option value="large">Большой</option><option value="50%">Половина экрана</option></select></label>
  <Checkbox bind:checked={destroyOnHidden}>Сбрасывать карточку при закрытии</Checkbox>
</div>
<Table dataSource={members} {columns} caption="Участники с выдвижной карточкой" pagination={false} scroll={{ x: 460 }} />
<output aria-label="Результат карточки участника">{result}</output>
<Drawer bind:open title={`Участник: ${selected.name}`} {placement} {size} {destroyOnHidden} {extra} {footer}>
  {#key selected.key}<DrawerEditor name={selected.name} role={selected.role} note={selected.note} news={selected.news} {formId} onSave={save} />{/key}
</Drawer>
