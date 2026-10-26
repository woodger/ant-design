<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Table, type TableColumn } from '../../src/lib/components/ant-design';
  import { createQueuedTable, createServerControls, type ServerPerson } from './server-table.model.svelte';

  const controls = createServerControls();
  const queued = createQueuedTable();
  const columns: TableColumn<ServerPerson>[] = [
    { key: 'name', title: 'Remote name', dataIndex: 'name', sorter: (left, right) => left.name.localeCompare(right.name, 'en') },
    { key: 'team', title: 'Remote team', dataIndex: 'team', filters: [{ text: 'Team A', value: 'A' }, { text: 'Team B', value: 'B' }] },
    { key: 'score', title: 'Remote score', dataIndex: 'score', sorter: true }
  ];

  onDestroy(queued.cleanup);
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

<section id="server-table-fixture" aria-label="Server table fixture">
  <label><input type="checkbox" bind:checked={controls.client} /> Use client table mode</label>
  <label><input type="checkbox" bind:checked={controls.loading} /> Server table loading</label>
  <label><input type="checkbox" bind:checked={controls.noPagination} /> Disable server pagination</label>
  <Table
    mode={controls.client ? 'client' : 'server'}
    total={controls.total}
    dataSource={controls.rows}
    {columns}
    caption="Supplied server page"
    bind:current={controls.current}
    bind:pageSize={controls.pageSize}
    bind:sorter={controls.sorter}
    bind:filters={controls.filters}
    bind:selectedRowKeys={controls.selected}
    rowSelection={{ getCheckboxProps: (row) => ({ disabled: row.locked, 'aria-label': `Select remote ${row.name}` }) }}
    pagination={controls.noPagination ? false : { 'aria-label': 'Supplied server pages', showSizeChanger: true, pageSizeOptions: [2, 5, 10] }}
    loading={controls.loading}
    onChange={controls.change}
    onSelectionChange={controls.select}
    scroll={{ x: 640 }}
  />
  <output aria-label="Server owner">{controls.owner}</output>
  <output aria-label="Server events">{controls.events}</output>
  <output aria-label="Server selected keys">{JSON.stringify(controls.selected)}</output>
  <output aria-label="Server selections">{controls.selections}</output>
  <div class="actions">
    <button onclick={controls.replacePage}>Replace server page</button>
    <button onclick={controls.restorePage}>Restore server page</button>
    <button onclick={controls.shrinkTotal}>Shrink server total</button>
    <button onclick={controls.emptyPage}>Empty server page</button>
  </div>
</section>

<section id="queued-table-fixture" aria-label="Queued server fixture">
  <div class="actions">
    <button onclick={queued.start}>Request remote page</button>
    <button onclick={queued.lastPage}>Request remote page eight</button>
    <button onclick={queued.remote.retry}>Retry remote page</button>
    <button onclick={queued.dispose}>Dispose remote table</button>
  </div>
  {#if queued.remote.error}<p role="alert">{queued.remote.error}</p>{/if}
  {#if queued.active}
    <Table mode="server" total={queued.remote.total} dataSource={queued.remote.rows} {columns} caption="Queued server page" bind:current={queued.remote.current} bind:pageSize={queued.remote.pageSize} bind:sorter={queued.remote.sorter} bind:filters={queued.remote.filters} loading={queued.remote.loading} onChange={queued.remote.change} pagination={{ 'aria-label': 'Queued server pages', showSizeChanger: false }} />
  {/if}
  <output aria-label="Queued requests">{JSON.stringify(queued.requests)}</output>
  <output aria-label="Queued state">{JSON.stringify({ ...queued.remote.query, total: queued.remote.total, loading: queued.remote.loading, names: queued.remote.rows.map((row) => row.name) })}</output>
  {#each queued.requests as request (request.id)}
    {#if !request.done}
      <div class="actions">
        <button onclick={() => queued.finish(request.id, 'success')}>Complete response {request.id}</button>
        <button onclick={() => queued.finish(request.id, 'shrink')}>Shrink response {request.id}</button>
        <button onclick={() => queued.finish(request.id, 'failure')}>Fail response {request.id}</button>
      </div>
    {/if}
  {/each}
</section>
