<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Table, type TableColumn, type TableKey } from '$lib/components/ant-design';
  import { createRemoteTable } from './remote-table.model.svelte';
  import { createMemberSource, remoteTeams, type RemoteMember } from './remote-members';

  const source = createMemberSource();
  const remote = createRemoteTable(source.load);
  let selected = $state<TableKey[]>([]);
  const columns: TableColumn<RemoteMember>[] = [
    { key: 'name', title: 'Участник', dataIndex: 'name', sorter: true },
    { key: 'team', title: 'Команда', dataIndex: 'team', filters: remoteTeams.map((team) => ({ text: team, value: team })) },
    { key: 'tasks', title: 'Задачи', dataIndex: 'tasks', align: 'right', sorter: true },
    { key: 'active', title: 'Статус', render: memberStatus, filterMultiple: false, filters: [{ text: 'Активен', value: true }, { text: 'Приостановлен', value: false }] }
  ];

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
  .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .remote-status { margin: 16px 0 0; color: var(--ant-color-text-tertiary); font-size: 12px; }
  .error { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; color: var(--ant-color-error); }
  .active { color: var(--ant-color-success); }
</style>

{#snippet memberStatus(member: RemoteMember)}<span class:active={member.active}>{member.active ? 'Активен' : 'Приостановлен'}</span>{/snippet}

<div class="actions"><Button onclick={() => { void remote.load(); }}>Обновить данные</Button><Button onclick={showError}>Пример ошибки загрузки</Button></div>
{#if remote.error}<div class="error" role="alert"><span>{remote.error}</span><Button type="primary" onclick={remote.retry}>Повторить загрузку</Button></div>{/if}
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
  rowSelection={{ getCheckboxProps: (member) => ({ disabled: !member.active, 'aria-label': `Выбрать удалённого участника ${member.key}` }) }}
  loading={remote.loading}
  onChange={remote.change}
  pagination={{ showSizeChanger: true, pageSizeOptions: [5, 10, 20], 'aria-label': 'Страницы удалённых участников' }}
  scroll={{ x: 640 }}
/>
<p class="remote-status" role="status" aria-label="Результат удалённой загрузки">Всего: {remote.total}. Страница: {remote.current}. Выбрано: {selected.length}.</p>
