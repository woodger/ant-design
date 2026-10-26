<script lang="ts">
  import { Button, ConfigProvider, Table, type TableColumn } from '../../src/lib/components/ant-design';
  import { createTableControls, type FixturePerson } from './table.model.svelte';

  const controls = createTableControls();
  const columns: TableColumn<FixturePerson>[] = [
    { key: 'name', title: 'Name', dataIndex: 'name', width: 220, sorter: (left, right) => left.name.localeCompare(right.name, 'en') },
    { key: 'score', title: 'Score', dataIndex: 'score', align: 'right', sorter: (left, right) => left.score - right.score },
    { key: 'action', title: 'Action', render: actionCell }
  ];
  let visibleColumns = $derived(controls.hideScore ? columns.filter((column) => column.key !== 'score') : columns);
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

{#snippet actionCell(person: FixturePerson, index: number)}<Button size="small" onclick={() => controls.inspect(person, index)}>Inspect {person.name}</Button>{/snippet}

<section id="table-fixture" aria-label="Table fixture">
  <label><input type="checkbox" bind:checked={controls.loading} /> Table loading</label>
  <label><input type="checkbox" bind:checked={controls.noPagination} /> Disable table pagination</label>
  <label><input type="checkbox" bind:checked={controls.allRowsLocked} /> Disable every row selection</label>
  <label><input type="checkbox" bind:checked={controls.dark} /> Dark table theme</label>
  <label><input type="checkbox" bind:checked={controls.purple} /> Purple table theme</label>
  <label><input type="checkbox" bind:checked={controls.compact} /> Compact table theme</label>
  <label for="table-size">Table size</label>
  <select id="table-size" bind:value={controls.size}><option value="small">Small</option><option value="middle">Middle</option><option value="large">Large</option></select>
  <ConfigProvider theme={{ mode: controls.dark ? 'dark' : 'light', primary: controls.purple ? 'purple' : 'blue', compact: controls.compact }} componentSize={controls.size}>
    <form onsubmit={controls.submit}>
      <Table
        dataSource={controls.rows}
        columns={visibleColumns}
        rowKey="id"
        caption="People"
        bind:current={controls.current}
        bind:pageSize={controls.pageSize}
        bind:sorter={controls.sorter}
        bind:selectedRowKeys={controls.selected}
        rowSelection={{ getCheckboxProps: (row) => ({ disabled: row.locked || controls.allRowsLocked, 'aria-label': `Select ${row.name}` }) }}
        pagination={controls.noPagination ? false : { showSizeChanger: true, pageSizeOptions: [3, 5, 10], 'aria-label': 'People pages' }}
        loading={controls.loading}
        onChange={controls.change}
        onSelectionChange={controls.changeSelection}
        scroll={{ x: 640 }}
        bordered
      />
    </form>
  </ConfigProvider>
  <output aria-label="Table owner">{controls.current}:{controls.pageSize}:{controls.sorter ? `${controls.sorter.columnKey}:${controls.sorter.order}` : 'none'}</output>
  <output aria-label="Table selected keys">{JSON.stringify(controls.selected)}</output>
  <output aria-label="Table changes">{controls.events}</output>
  <output aria-label="Table selection changes">{controls.selectionEvents}</output>
  <output aria-label="Table action">{controls.action}</output>
  <output aria-label="Table submissions">{controls.submissions}</output>
  <div class="actions">
    <button onclick={controls.setExternalState}>Set table state from parent</button>
    <button onclick={controls.setLastPage}>Set last table page</button>
    <button onclick={controls.clearSelection}>Clear table selection</button>
    <button onclick={controls.shrinkRows}>Shrink table data</button>
    <button onclick={controls.emptyRows}>Empty table data</button>
    <button onclick={controls.restoreRows}>Restore table data</button>
    <button onclick={controls.replaceSelectedRecord}>Replace selected record</button>
    <button onclick={controls.removeSortColumn}>Remove sorted column</button>
  </div>
</section>

<section id="default-table-fixture" aria-label="Default table fixture">
  <Table dataSource={controls.defaults} {columns} rowKey="id" caption="Default people" defaultCurrent={2} defaultPageSize={2} defaultSorter={{ columnKey: 'score', order: 'descend' }} defaultSelectedRowKeys={[3]} rowSelection disabled={false} pagination={{ 'aria-label': 'Default people pages', showSizeChanger: false }} />
</section>

<section id="empty-table-fixture" aria-label="Empty table fixture">
  <ConfigProvider locale={{ table: { emptyText: 'Custom empty table' } }}>
    <Table dataSource={[]} {columns} pagination={false} caption="Custom empty people" />
    <Table dataSource={[]} {columns} pagination={false} caption="Empty snippet people">{#snippet empty()}<a href="#table-fixture">Create a person</a>{/snippet}</Table>
  </ConfigProvider>
</section>
