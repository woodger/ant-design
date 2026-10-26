<script lang="ts" generics="Row extends object">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { getPaginationState } from './pagination.engine';
  import { areTableFiltersEqual, changeTableSelection, getNextTableSorter, getTableData, getTableFilters, getTableSelection } from './table.engine';
  import type { TableChange, TableFilters, TableFilterValue, TableKey, TableProps, TableSorter } from './table.types';
  import { ruRU } from './types';
  import Checkbox from './Checkbox.svelte';
  import Icon from './Icon.svelte';
  import Pagination from './Pagination.svelte';
  import TableFilter from './TableFilter.svelte';

  let {
    mode = 'client',
    total,
    dataSource,
    columns,
    rowKey,
    sorter = $bindable(),
    defaultSorter = null,
    filters = $bindable(),
    defaultFilters = {},
    current = $bindable(),
    defaultCurrent = 1,
    pageSize = $bindable(),
    defaultPageSize = 10,
    pagination,
    rowSelection = false,
    selectedRowKeys = $bindable(),
    defaultSelectedRowKeys = [],
    onChange,
    onSelectionChange,
    loading = false,
    disabled,
    bordered = false,
    size,
    caption,
    empty,
    scroll,
    'aria-label': ariaLabel,
    class: className = '',
    style
  }: TableProps<Row> = $props();

  const config = useConfig();
  const initialSorter = untrack(() => defaultSorter ? { ...defaultSorter } : null);
  const initialCurrent = untrack(() => defaultCurrent);
  const initialSize = untrack(() => defaultPageSize);
  const initialSelection = untrack(() => [...defaultSelectedRowKeys]);
  const initialFilters: TableFilters = untrack(() => Object.fromEntries(Object.entries(defaultFilters).map(([key, values]) => [key, [...values]])));
  let tableData = $derived(getTableData(dataSource, columns, rowKey, sorter === undefined ? initialSorter : sorter, filters ?? initialFilters, mode));
  let hasFilters = $derived(columns.some((column) => column.filters?.length && (mode === 'server' || column.onFilter)));
  let paging = $derived(getPaginationState(mode === 'server' ? total ?? dataSource.length : tableData.rows.length, current ?? initialCurrent, pageSize ?? initialSize));
  let pageRows = $derived(mode === 'server' || pagination === false ? tableData.rows : tableData.rows.slice((paging.current - 1) * paging.pageSize, paging.current * paging.pageSize));
  let selectionOptions = $derived(typeof rowSelection === 'object' ? rowSelection : undefined);
  let visibleRows = $derived(pageRows.map((row) => ({ ...row, checkbox: selectionOptions?.getCheckboxProps?.(row.record) ?? {} })));
  let changeableKeys = $derived(visibleRows.filter((row) => !row.checkbox.disabled).map((row) => row.key));
  let selectedKeys = $derived(new Set(selectedRowKeys ?? initialSelection));
  let selection = $derived(getTableSelection(changeableKeys, [...selectedKeys]));
  let resolvedDisabled = $derived((disabled ?? config.componentDisabled) || loading);
  let resolvedSize = $derived(size ?? config.componentSize);
  let strings = $derived({ ...ruRU.table, ...config.locale.table });

  function notifyChange(action: TableChange<Row>['action']) {
    onChange?.({
      action,
      pagination: { current: paging.current, pageSize: paging.pageSize, total: paging.total },
      sorter: tableData.sorter ? { ...tableData.sorter } : null,
      ...(hasFilters ? { filters: getTableFilters(columns, tableData.filters, mode) } : {}),
      currentDataSource: tableData.rows.map((row) => row.record)
    });
  }

  function changeSort(columnKey: string) {
    if (resolvedDisabled) {
      return;
    }

    sorter = getNextTableSorter(columnKey, tableData.sorter);
    notifyChange('sort');
  }

  function changePage(page: number, size: number) {
    if (resolvedDisabled) {
      return;
    }

    current = page;
    pageSize = size;
    notifyChange('paginate');
  }

  function changeFilter(columnKey: string, values: TableFilterValue[]) {
    if (resolvedDisabled) {
      return;
    }

    const next = { ...(filters ?? initialFilters), [columnKey]: [...values] };
    const active = getTableFilters(columns, next, mode);

    if (areTableFiltersEqual(active, tableData.filters)) {
      return;
    }

    if (Object.hasOwn(active, columnKey)) {
      next[columnKey] = active[columnKey];
    } else {
      delete next[columnKey];
    }

    filters = next;
    current = 1;
    notifyChange('filter');
  }

  function changeSelection(keys: TableKey[], checked: boolean, type: 'single' | 'all') {
    if (resolvedDisabled) {
      return;
    }

    const next = changeTableSelection([...selectedKeys], keys, checked);
    selectedRowKeys = next;
    const records = new Map(tableData.allRows.map((row) => [row.key, row.record]));
    const rows = next.flatMap((key) => {
      const record = records.get(key);

      return record ? [record] : [];
    });
    onSelectionChange?.([...next], rows, { type });
  }

  function sortDescription(columnKey: string, active: TableSorter | null): string {
    const next = getNextTableSorter(columnKey, active);

    return next?.order === 'ascend' ? strings.sortAscending : next?.order === 'descend' ? strings.sortDescending : strings.cancelSort;
  }

  function cellValue(record: Row, key: keyof Row | undefined): string {
    const value = key === undefined ? undefined : record[key];

    return value === null || value === undefined ? '' : String(value);
  }
</script>

<style>
  .ant-table-wrapper { min-width: 0; max-width: 100%; }
  .ant-table-content { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; }
  .ant-table-content:focus-visible, .sort-button:focus-visible { outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border); outline-offset: 2px; }
  caption { padding: var(--ant-padding-sm); color: var(--ant-color-text-heading); text-align: start; font-weight: 600; }
  .sort-button { width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; cursor: pointer; }
  .sort-button:disabled { cursor: not-allowed; }
  .sort-button::after { content: none; }
  .column-heading { display: flex; align-items: center; gap: var(--ant-margin-xxs); }
  .column-heading > :first-child { flex: 1; }
  .sort-arrow { display: block; width: 0; height: 0; border-inline: 4px solid transparent; }
  .sort-arrow.active { color: var(--ant-color-primary); }
  .sort-up { margin-bottom: 2px; border-bottom: 5px solid currentColor; }
  .sort-down { border-top: 5px solid currentColor; }
  .loading-state { display: flex; align-items: center; gap: var(--ant-margin-xs); padding: var(--ant-padding-sm); color: var(--ant-color-primary); }
</style>

<div class={['ant-table-wrapper ant-table-css-var', config.direction === 'rtl' && 'ant-table-wrapper-rtl', className]} dir={config.direction} {style}>
  {#if loading}<div class="loading-state" role="status"><Icon name="loading" />{strings.loadingText}</div>{/if}
  <div class={['ant-table', `ant-table-${resolvedSize === 'middle' ? 'medium' : resolvedSize}`, bordered && 'ant-table-bordered', !visibleRows.length && 'ant-table-empty']}>
    <div class="ant-table-container">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Фокус нужен для прокрутки таблицы с клавиатуры.) -->
      <div class="ant-table-content" role="region" aria-label={caption ?? ariaLabel ?? strings.label} tabindex="0">
        <table aria-label={ariaLabel ?? (caption ? undefined : strings.label)} aria-busy={loading || undefined} style:min-width={typeof scroll?.x === 'number' ? `${scroll.x}px` : scroll?.x}>
          {#if caption}<caption>{caption}</caption>{/if}
          <colgroup>
            {#if rowSelection}<col style="width: 48px" />{/if}
            {#each columns as column (column.key)}<col style:width={typeof column.width === 'number' ? `${column.width}px` : column.width} />{/each}
          </colgroup>
          <thead class="ant-table-thead">
            <tr>
              {#if rowSelection}
                <th scope="col" class="ant-table-cell ant-table-selection-column">
                  <Checkbox checked={selection.all} indeterminate={selection.some} disabled={resolvedDisabled || selection.disabled} aria-label={strings.selectAll} onCheckedChange={(checked) => changeSelection(changeableKeys, checked, 'all')} />
                </th>
              {/if}
              {#each columns as column (column.key)}
                {@const sortable = typeof column.sorter === 'function' || (mode === 'server' && column.sorter === true)}
                {@const order = tableData.sorter?.columnKey === column.key ? tableData.sorter.order : undefined}
                <th scope="col" class={['ant-table-cell', sortable && 'ant-table-column-has-sorters', order && 'ant-table-column-sort']} style:text-align={column.align} aria-sort={order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : undefined}>
                  <div class="column-heading">
                    {#if sortable}
                      <button type="button" class="sort-button ant-table-column-sorters" disabled={resolvedDisabled} title={sortDescription(column.key, tableData.sorter)} onclick={() => changeSort(column.key)}>
                        <span class="ant-table-column-title">{column.title}</span>
                        <span class="ant-table-column-sorter" aria-hidden="true"><span class="ant-table-column-sorter-inner"><span class={['sort-arrow sort-up', order === 'ascend' && 'active']}></span><span class={['sort-arrow sort-down', order === 'descend' && 'active']}></span></span></span>
                      </button>
                    {:else}<span>{column.title}</span>{/if}
                    {#if column.filters?.length && (mode === 'server' || column.onFilter)}
                      <TableFilter title={column.title} options={column.filters} value={Object.hasOwn(tableData.filters, column.key) ? tableData.filters[column.key] : []} multiple={column.filterMultiple !== false} disabled={resolvedDisabled} onApply={(values) => changeFilter(column.key, values)} />
                    {/if}
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="ant-table-tbody">
            {#each visibleRows as row, index (row.key)}
              <tr class={['ant-table-row', rowSelection && selectedKeys.has(row.key) && 'ant-table-row-selected']}>
                {#if rowSelection}
                  <td class="ant-table-cell ant-table-selection-column">
                    <Checkbox checked={selectedKeys.has(row.key)} disabled={resolvedDisabled || row.checkbox.disabled} aria-label={row.checkbox['aria-label'] ?? `${strings.selectRow} ${row.key}`} onCheckedChange={(checked) => changeSelection([row.key], checked, 'single')} />
                  </td>
                {/if}
                {#each columns as column (column.key)}
                  <td class={['ant-table-cell', tableData.sorter?.columnKey === column.key && 'ant-table-column-sort']} style:text-align={column.align}>
                    {#if column.render}{@render column.render(row.record, index)}{:else}{cellValue(row.record, column.dataIndex)}{/if}
                  </td>
                {/each}
              </tr>
            {:else}
              <tr class="ant-table-placeholder"><td class="ant-table-cell" colspan={columns.length + (rowSelection ? 1 : 0)}>{#if !loading}{#if empty}{@render empty()}{:else}{strings.emptyText}{/if}{:else}&nbsp;{/if}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  {#if pagination !== false}
    <Pagination {...pagination} total={paging.total} current={paging.current} pageSize={paging.pageSize} disabled={resolvedDisabled} size={resolvedSize} class="ant-table-pagination ant-table-pagination-end" onChange={changePage} />
  {/if}
</div>
