<script lang="ts">
  import { onMount } from 'svelte';
  import { Alert, Button, Checkbox, Table, type TableColumn, type TableKey } from '$lib/components/ant-design';
  import { createRemoteTable } from './remote-table.model.svelte';
  import { createMemberSource, remoteTeams, type RemoteMember } from './remote-members';

  const source = createMemberSource();
  const remote = createRemoteTable(source.load);
  let selected = $state<TableKey[]>([]);
  let fixed = $state(true);
  let columns = $derived<TableColumn<RemoteMember>[]>([
    { key: 'name', title: 'Участник', dataIndex: 'name', sorter: true, width: 200, fixed },
    { key: 'team', title: 'Команда', dataIndex: 'team', width: 220, filters: remoteTeams.map((team) => ({ text: team, value: team })) },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', align: 'right', width: 160, sorter: true },
    { key: 'active', title: 'Статус', render: memberStatus, width: 160, fixed: fixed ? 'end' : false, filterMultiple: false, filters: [{ text: 'Активен', value: true }, { text: 'Приостановлен', value: false }] }
  ]);

  onMount(() => {
    void remote.load();
    return remote.dispose;
  });

  function showError() {
    source.failNextRequest();
    void remote.load();
  }
</script>

<style>
  .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .remote-status { margin: 16px 0 0; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .error { margin-bottom: 16px; }
  .active { color: var(--ant-color-success); }
</style>

{#snippet memberStatus(member: RemoteMember)}<span class:active={member.active}>{member.active ? 'Активен' : 'Приостановлен'}</span>{/snippet}
{#snippet retry()}<Button type="primary" onclick={remote.retry}>Повторить загрузку</Button>{/snippet}

<div class="actions"><Button onclick={() => { void remote.load(); }}>Обновить данные</Button><Button onclick={showError}>Пример ошибки загрузки</Button><Checkbox bind:checked={fixed}>Закрепить заголовок и колонки</Checkbox></div>
{#if remote.error}<div class="error"><Alert type="error" title={remote.error} action={retry} showIcon /></div>{/if}
<Table
  mode="server"
  total={remote.total}
  dataSource={remote.rows}
  {columns}
  caption="Удалённые участники"
  bind:current={remote.current}
  bind:pageSize={remote.pageSize}
  bind:sorter={remote.sorter}
  bind:filters={remote.filters}
  bind:selectedRowKeys={selected}
  rowSelection={{ fixed, getCheckboxProps: (member) => ({ disabled: !member.active, 'aria-label': `Выбрать удалённого участника ${member.key}` }) }}
  loading={remote.loading}
  onChange={remote.change}
  pagination={{ showSizeChanger: true, pageSizeOptions: [5, 10, 20], 'aria-label': 'Страницы удалённых участников' }}
  scroll={{ x: 900, y: fixed ? 300 : undefined }}
/>
<p class="remote-status" role="status" aria-label="Результат удалённой загрузки">Всего: {remote.total}. Страница: {remote.current}. Выбрано: {selected.length}.</p>
