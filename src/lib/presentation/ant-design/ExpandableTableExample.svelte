<script lang="ts">
  import { Button, Table, type TableColumn, type TableKey } from '$lib/components/ant-design';

  interface Member { key: number; name: string; team: string; email: string; tasks: number; active: boolean }

  const members: Member[] = [
    { key: 1, name: 'Марина Белова', team: 'Разработка', email: 'marina@example.com', tasks: 18, active: true },
    { key: 2, name: 'Павел Громов', team: 'Дизайн', email: 'pavel@example.com', tasks: 9, active: true },
    { key: 3, name: 'Нина Романова', team: 'Поддержка', email: 'nina@example.com', tasks: 0, active: false },
    { key: 4, name: 'Олег Крылов', team: 'Разработка', email: 'oleg@example.com', tasks: 24, active: true },
    { key: 5, name: 'Светлана Морозова', team: 'Дизайн', email: 'svetlana@example.com', tasks: 12, active: true },
    { key: 6, name: 'Тимур Зайцев', team: 'Поддержка', email: 'timur@example.com', tasks: 15, active: true }
  ];
  const columns: TableColumn<Member>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name', width: 220, fixed: true },
    { key: 'team', title: 'Команда', dataIndex: 'team', width: 360 },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', width: 120, align: 'right', fixed: 'end' }
  ];
  let expanded = $state<TableKey[]>([1]);
  let selected = $state<TableKey[]>([]);
  let current = $state(1);
  let pageSize = $state(3);
</script>

<style>
  .actions { margin-bottom: 20px; }
  .details { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin: 0; }
  .details > div { min-width: 0; }
  dt { margin-bottom: 4px; color: var(--ant-color-text-tertiary); font-size: 12px; }
  dd { margin: 0; }
  .state { margin: 16px 0 0; color: var(--ant-color-text-tertiary); font-size: 12px; }
</style>

{#snippet details(member: Member)}
  <dl class="details" aria-label={`Сведения об участнике ${member.key}`}>
    <div><dt>Участник</dt><dd>{member.name}</dd></div>
    <div><dt>Email</dt><dd>{member.email}</dd></div>
    <div><dt>Команда</dt><dd>{member.team}</dd></div>
    <div><dt>Открытые задачи</dt><dd>{member.tasks}</dd></div>
  </dl>
{/snippet}

<div class="actions"><Button onclick={() => { expanded = []; }} disabled={!expanded.length}>Свернуть все подробности</Button></div>
<Table dataSource={members} {columns} caption="Карточки участников"
  expandable={{ expandedRowRender: details, rowExpandable: (member) => member.active, fixed: true }} bind:expandedRowKeys={expanded}
  rowSelection={{ fixed: true, getCheckboxProps: (member) => ({ disabled: !member.active, 'aria-label': `Выбрать карточку ${member.key}` }) }} bind:selectedRowKeys={selected}
  bind:current bind:pageSize pagination={{ 'aria-label': 'Страницы карточек участников', showSizeChanger: true, pageSizeOptions: [3, 6] }}
  scroll={{ x: 1000, y: 380 }} />
<p class="state" role="status" aria-label="Раскрытие карточек">Раскрыто: {expanded.length}. Выбрано: {selected.length}.</p>
