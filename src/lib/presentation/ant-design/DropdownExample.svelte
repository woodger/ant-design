<script lang="ts">
  import { Button, Checkbox, Dropdown, Modal, Table, type DropdownPlacement, type TableColumn } from '$lib/components/ant-design';

  interface Member { key: number; name: string; role: string; archived: boolean; }
  const initialMembers: Member[] = [{ key: 1, name: 'Анна', role: 'Разработчик', archived: false }, { key: 2, name: 'Михаил', role: 'Дизайнер', archived: false }];
  let members = $state(initialMembers.map((member) => ({ ...member })));
  let nextKey = 3;
  let selected = $state<Member>();
  let modalOpen = $state(false);
  let hover = $state(false);
  let arrow = $state(true);
  let placement = $state<DropdownPlacement>('bottomRight');
  let result = $state('Выберите действие в строке участника.');
  const columns: TableColumn<Member>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name' },
    { key: 'role', title: 'Роль', dataIndex: 'role' },
    { key: 'status', title: 'Статус', render: status },
    { key: 'actions', title: 'Действия', render: actions }
  ];

  function choose(key: string, member: Member) {
    if (key === 'details') { selected = member; modalOpen = true; }
    if (key === 'copy') { members = [...members, { ...member, key: nextKey++, name: `${member.name} (копия)` }]; result = `${member.name}: создана копия.`; }
    if (key === 'archive') { members = members.map((item) => item.key === member.key ? { ...item, archived: true } : item); result = `${member.name}: перемещён в архив.`; }
  }
</script>

<style>
  .settings { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
  .settings label { display: flex; align-items: center; gap: 8px; }
  select { padding: 4px 8px; color: var(--ant-color-text); background: var(--ant-color-bg-container); border: 1px solid var(--ant-color-border); border-radius: 6px; font: inherit; }
  .footer { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 20px; }
  output { color: var(--ant-color-text-secondary); }
</style>

{#snippet detailsIcon()}<span>↗</span>{/snippet}
{#snippet status(member: Member)}<span>{member.archived ? 'В архиве' : 'Активен'}</span>{/snippet}
{#snippet actions(member: Member)}
  <Dropdown aria-label={`Действия: ${member.name}`} trigger={hover ? ['hover', 'click'] : ['click']} {placement} {arrow} menu={{ items: [
    { key: 'details', label: 'Открыть карточку', icon: detailsIcon },
    { key: 'copy', label: 'Создать копию' },
    { key: 'divider', type: 'divider' },
    { key: 'archive', label: 'В архив', danger: true, disabled: member.archived }
  ], onClick: ({ key }) => choose(key, member) }}>
    <Button size="small" aria-label={`Действия: ${member.name}`}>Действия <span aria-hidden="true">⌄</span></Button>
  </Dropdown>
{/snippet}

<div class="settings">
  <Checkbox bind:checked={hover}>Открывать при наведении</Checkbox>
  <Checkbox bind:checked={arrow}>Показывать стрелку</Checkbox>
  <label>Положение меню <select bind:value={placement}><option value="bottomLeft">Снизу слева</option><option value="bottom">Снизу по центру</option><option value="bottomRight">Снизу справа</option><option value="topLeft">Сверху слева</option><option value="top">Сверху по центру</option><option value="topRight">Сверху справа</option></select></label>
</div>
<Table dataSource={members} {columns} pagination={false} caption="Участники с меню действий" scroll={{ x: 620 }} />
<div class="footer">
  <Button onclick={() => { members = initialMembers.map((member) => ({ ...member })); nextKey = 3; result = 'Список участников восстановлен.'; }}>Восстановить участников</Button>
  <output aria-label="Результат действия меню">{result}</output>
</div>
<Modal bind:open={modalOpen} title={selected ? `Карточка: ${selected.name}` : 'Карточка участника'}><p>{selected?.role}</p><p>{selected?.archived ? 'Участник находится в архиве.' : 'Участник активен.'}</p></Modal>
