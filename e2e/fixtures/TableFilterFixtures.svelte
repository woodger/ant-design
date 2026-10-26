<script lang="ts">
  import { ConfigProvider, Modal, Table, type TableColumn } from '../../src/lib/components/ant-design';
  import { createTableFilterControls, type FilterPerson } from './table-filter.model.svelte';

  const controls = createTableFilterControls();
  const baseColumns: TableColumn<FilterPerson>[] = [
    { key: 'name', title: 'Person', dataIndex: 'name' },
    { key: 'team', title: 'Team', dataIndex: 'team', filters: ['Core', 'Design', 'Support'].map((team) => ({ text: team, value: team })), onFilter: (value, row) => row.team === value },
    { key: 'score', title: 'Points', dataIndex: 'score', sorter: (left, right) => left.score - right.score, filters: [{ text: 'Zero points', value: 0 }, { text: 'At least thirty', value: 30 }], onFilter: (value, row) => value === 0 ? row.score === 0 : row.score >= Number(value) },
    { key: 'active', title: 'State', render: stateCell, filters: [{ text: 'Active', value: true }, { text: 'Inactive', value: false }], filterMultiple: false, onFilter: (value, row) => row.active === value }
  ];
  let columns = $derived(baseColumns.filter((column) => !controls.hideTeam || column.key !== 'team').map((column) => column.key === 'team' && controls.limitedTeams ? { ...column, filters: [{ text: 'Design', value: 'Design' }] } : column));
</script>

<style>
  section { padding: 20px 0; border-bottom: 1px solid #ddd; }
  label, output { display: block; margin-block: 8px; }
  output { overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block: 12px; }
</style>

{#snippet stateCell(person: FilterPerson)}{person.active ? 'Active' : 'Inactive'}{/snippet}

<svelte:window onkeydown={(event) => { if (['F3', 'F4', 'F5'].includes(event.key)) event.preventDefault(); if (event.key === 'F3') controls.toggleLoading(); if (event.key === 'F4') controls.setExternalFilters(); if (event.key === 'F5') controls.removeTeam(); }} />

<section id="table-filter-fixture" aria-label="Table filter fixture">
  <label><input type="checkbox" bind:checked={controls.dark} /> Dark filter theme</label>
  <label><input type="checkbox" bind:checked={controls.purple} /> Purple filter theme</label>
  <div class="actions">
    <button onclick={controls.setPage}>Set last filtered page</button>
    <button onclick={controls.setExternalFilters}>Set filters from parent (F4)</button>
    <button onclick={controls.clearFilters}>Clear filters from parent</button>
    <button onclick={controls.toggleLoading}>Toggle filtered loading (F3)</button>
    <button onclick={controls.removeTeam}>Remove filter column (F5)</button>
    <button onclick={controls.restoreTeam}>Restore filter column</button>
    <button onclick={controls.limitTeams}>Limit filter options</button>
    <button onclick={controls.replaceRows}>Replace filtered records</button>
    <button onclick={controls.openModal}>Open filter modal</button>
  </div>
  <ConfigProvider theme={{ mode: controls.dark ? 'dark' : 'light', primary: controls.purple ? 'purple' : 'blue' }}>
    <form onsubmit={controls.submit}>
      <Table dataSource={controls.rows} {columns} caption="Filtered people" bind:current={controls.current} bind:pageSize={controls.pageSize} bind:sorter={controls.sorter} bind:filters={controls.filters} bind:selectedRowKeys={controls.selected} rowSelection={{ getCheckboxProps: (row) => ({ disabled: !row.active, 'aria-label': `Choose ${row.name}` }) }} onChange={controls.change} onSelectionChange={controls.changeSelection} loading={controls.loading} pagination={{ 'aria-label': 'Filtered pages', showSizeChanger: true, pageSizeOptions: [2, 4, 10] }} scroll={{ x: 720 }} />
    </form>
    <Modal bind:open={controls.modal} title="Filter modal"><Table dataSource={controls.people} {columns} caption="Modal filtered people" pagination={false} /></Modal>
  </ConfigProvider>
  <output aria-label="Filter owner">{JSON.stringify(controls.filters)}</output>
  <output aria-label="Filter paging">{controls.current}:{controls.pageSize}</output>
  <output aria-label="Filter selected">{JSON.stringify(controls.selected)}</output>
  <output aria-label="Filter events">{controls.events}</output>
  <output aria-label="Filter selection events">{controls.selections}</output>
  <output aria-label="Filter submissions">{controls.submissions}</output>
</section>

<section id="default-filter-fixture" aria-label="Default filter fixture">
  <Table dataSource={controls.people} columns={baseColumns} caption="Default filtered people" defaultFilters={{ team: ['Core'] }} defaultPageSize={10} pagination={false} />
</section>
