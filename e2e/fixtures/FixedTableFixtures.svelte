<script lang="ts">
  import { Button, ConfigProvider, Table, type TableColumn } from '../../src/lib/components/ant-design';
  import { createFixedTableControls, type FixedPerson } from './fixed-table.model.svelte';

  const controls = createFixedTableControls();
  let columns = $derived<TableColumn<FixedPerson>[]>([
    ...(!controls.hideName ? [{ key: 'name', title: 'Pinned name', dataIndex: 'name' as const, width: controls.nameWidth, fixed: controls.pinned }] : []),
    { key: 'team', title: 'Pinned team', dataIndex: 'team', width: 140, fixed: controls.pinned && controls.pinTeam, filters: [{ text: 'East', value: 'East' }, { text: 'West', value: 'West' }], onFilter: (value, row) => row.team === value },
    { key: 'notes', title: 'Scrolling notes', render: notesCell, width: 440 },
    { key: 'score', title: 'Pinned score', dataIndex: 'score', width: 100, fixed: controls.pinned ? 'end' : false, sorter: (left, right) => left.score - right.score },
    { key: 'action', title: 'Pinned action', render: actionCell, width: 120, fixed: controls.pinned ? 'end' : false }
  ]);
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

{#snippet actionCell(person: FixedPerson)}<Button size="small" onclick={() => controls.inspect(person.key)}>Inspect {person.key}</Button>{/snippet}
{#snippet notesCell(person: FixedPerson)}{person.notes} <Button size="small" onclick={() => controls.inspect(person.key)}>Edit {person.key}</Button>{/snippet}

<section id="fixed-table-fixture" aria-label="Fixed table fixture">
  <label><input type="checkbox" bind:checked={controls.pinned} /> Pin data columns</label>
  <label><input type="checkbox" bind:checked={controls.selectionFixed} /> Pin selection column</label>
  <label><input type="checkbox" bind:checked={controls.pinTeam} /> Pin team column</label>
  <label><input type="checkbox" bind:checked={controls.header} /> Pin table header</label>
  <label><input type="checkbox" bind:checked={controls.mounted} /> Mount fixed table</label>
  <label><input type="checkbox" bind:checked={controls.empty} /> Empty fixed table</label>
  <label><input type="checkbox" bind:checked={controls.loading} /> Fixed table loading</label>
  <label><input type="checkbox" bind:checked={controls.server} /> Fixed table server mode</label>
  <label><input type="checkbox" bind:checked={controls.paginated} /> Paginate fixed table</label>
  <label><input type="checkbox" bind:checked={controls.hideName} /> Hide pinned name</label>
  <label><input type="checkbox" bind:checked={controls.dark} /> Dark pinned table</label>
  <div class="actions"><button onclick={controls.widenName}>Widen pinned name</button></div>
  {#if controls.mounted}
    <ConfigProvider theme={{ mode: controls.dark ? 'dark' : 'light' }}>
    <Table dataSource={controls.empty ? [] : controls.rows} {columns} caption="Pinned people" mode={controls.server ? 'server' : 'client'} total={120} loading={controls.loading}
      scroll={{ x: 1200, y: controls.header ? '260px' : undefined }} rowSelection={{ fixed: controls.selectionFixed, getCheckboxProps: (row) => ({ 'aria-label': `Select pinned ${row.key}` }) }}
      pagination={controls.paginated ? { 'aria-label': 'Pinned people pages', showSizeChanger: false } : false} defaultPageSize={6} bind:current={controls.current}
      bind:sorter={controls.sorter} bind:selectedRowKeys={controls.selected} onChange={controls.change} onSelectionChange={controls.select} bordered />
    </ConfigProvider>
  {/if}
  <output aria-label="Fixed table events">{controls.events}</output>
  <output aria-label="Fixed table selections">{controls.selections}</output>
  <output aria-label="Fixed selected keys">{JSON.stringify(controls.selected)}</output>
  <output aria-label="Fixed inspected key">{controls.inspected}</output>
</section>
