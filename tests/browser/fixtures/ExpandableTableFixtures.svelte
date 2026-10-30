<script lang="ts">
  import { Button, ConfigProvider, Table, type TableColumn } from 'antd-svelte';
  import { createExpansionControls, type ExpandedPerson } from './expandable-table.model.svelte';

  const controls = createExpansionControls();
  let columns = $derived<TableColumn<ExpandedPerson>[]>([
    { key: 'name', title: 'Expansion name', dataIndex: 'name', width: 180, fixed: controls.fixed },
    {
      key: 'team',
      title: 'Expansion team',
      dataIndex: 'team',
      width: 620,
      filters: [{ text: 'Core', value: 'Core' }, { text: 'Support', value: 'Support' }],
      onFilter: (value, row) => row.team === value
    },
    {
      key: 'score',
      title: 'Expansion score',
      dataIndex: 'score',
      width: 120,
      fixed: controls.fixed ? 'end' : false,
      sorter: (left, right) => left.score - right.score
    }
  ]);
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
  .detail { display: grid; gap: 12px; }
  .detail p { margin: 0; }
</style>

{#snippet details(person: ExpandedPerson, index: number)}
  <div class="detail" aria-label={`Details ${person.key}`}>
    <p>Details {person.name}:{index}</p>
    <label>Note for {person.key}<input name="detailNote" value={`Initial ${person.name}`} /></label>
    <Button size="small" onclick={() => controls.inspect(person.key)}>Inspect detail {person.key}</Button>
  </div>
{/snippet}

<section id="expandable-table-fixture" aria-label="Expandable table fixture">
  <label><input type="checkbox" bind:checked={controls.enabled} /> Enable row expansion</label>
  <label><input type="checkbox" bind:checked={controls.locked} /> Block zero expansion</label>
  <label><input type="checkbox" bind:checked={controls.loading} /> Expandable table loading</label>
  <label><input type="checkbox" bind:checked={controls.selection} /> Show expandable selection</label>
  <label><input type="checkbox" bind:checked={controls.fixed} /> Pin expandable columns</label>
  <label><input type="checkbox" bind:checked={controls.noPagination} /> Disable expandable pagination</label>
  <label><input type="checkbox" bind:checked={controls.dark} /> Dark expandable table</label>
  <label><input type="checkbox" bind:checked={controls.compact} /> Compact expandable table</label>
  <ConfigProvider theme={{ mode: controls.dark ? 'dark' : 'light', compact: controls.compact }}>
    <form onsubmit={controls.submit}>
      <Table
        dataSource={controls.rows}
        {columns}
        caption="Expandable people"
        mode={controls.server ? 'server' : 'client'}
        total={30}
        expandable={controls.enabled
          ? {
            expandedRowRender: details,
            rowExpandable: (row) => row.key !== 1 && !(controls.locked && row.key === 0),
            fixed: controls.fixed,
            columnWidth: '3rem'
          }
          : undefined}
        bind:expandedRowKeys={controls.expanded}
        onExpand={controls.expand}
        onExpandedRowsChange={controls.changeKeys}
        rowSelection={controls.selection
          ? {
            fixed: controls.fixed,
            getCheckboxProps: (row) => ({ 'aria-label': `Select expansion ${row.key}` })
          }
          : false}
        bind:selectedRowKeys={controls.selected}
        onSelectionChange={controls.select}
        bind:current={controls.current}
        defaultPageSize={3}
        bind:sorter={controls.sorter}
        bind:filters={controls.filters}
        pagination={controls.noPagination
          ? false
          : { 'aria-label': 'Expandable people pages', showSizeChanger: false }}
        onChange={controls.change}
        loading={controls.loading}
        scroll={{ x: 1100, y: 360 }}
        bordered
      />
    </form>
  </ConfigProvider>
  <output aria-label="Expanded owner keys">{JSON.stringify(controls.expanded)}</output>
  <output aria-label="Expansion events">{controls.events}</output>
  <output aria-label="Expansion data events">{controls.dataEvents}</output>
  <output aria-label="Expansion selection events">{controls.selections}</output>
  <output aria-label="Expansion selected keys">{JSON.stringify(controls.selected)}</output>
  <output aria-label="Expansion submissions">{controls.submissions}</output>
  <output aria-label="Expansion inspected">{controls.inspected}</output>
  <div class="actions">
    <button onclick={controls.openExternal}>Set expanded keys externally</button>
    <button onclick={controls.clearExternal}>Clear expanded keys externally</button>
    <button onclick={controls.replaceZero}>Replace expanded record</button>
    <button onclick={controls.emptyRows}>Empty expandable data</button>
    <button onclick={controls.restoreRows}>Restore expandable data</button>
    <button onclick={controls.serverPage}>Load another server page</button>
  </div>
</section>

<section id="default-expandable-fixture" aria-label="Default expandable fixture">
  <Table
    dataSource={controls.defaults}
    {columns}
    caption="Initial expansion"
    expandable={{ expandedRowRender: details }}
    defaultExpandedRowKeys={[0]}
    pagination={false}
    disabled={false}
  />
</section>
