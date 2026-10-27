<script lang="ts" generics="Row extends object">
  import { untrack } from 'svelte';
  import { useConfig } from './config-context';
  import { getPaginationState } from './pagination.engine';
  import { getTableFixedOffsets } from './table-layout.engine';
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
    expandable,
    expandedRowKeys = $bindable(),
    defaultExpandedRowKeys = [],
    onExpand,
    onExpandedRowsChange,
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
  const id = $props.id();
  const initialSorter = untrack(() => defaultSorter ? { ...defaultSorter } : null);
  const initialCurrent = untrack(() => defaultCurrent);
  const initialSize = untrack(() => defaultPageSize);
  const initialSelection = untrack(() => [...defaultSelectedRowKeys]);
  const initialExpansion = untrack(() => [...defaultExpandedRowKeys]);
  const initialFilters: TableFilters = untrack(() => Object.fromEntries(Object.entries(defaultFilters).map(([key, values]) => [key, [...values]])));
  let tableData = $derived(getTableData(dataSource, columns, rowKey, sorter === undefined ? initialSorter : sorter, filters ?? initialFilters, mode));
  let hasFilters = $derived(columns.some((column) => column.filters?.length && (mode === 'server' || column.onFilter)));
  let paging = $derived(getPaginationState(mode === 'server' ? total ?? dataSource.length : tableData.rows.length, current ?? initialCurrent, pageSize ?? initialSize));
  let pageRows = $derived(mode === 'server' || pagination === false ? tableData.rows : tableData.rows.slice((paging.current - 1) * paging.pageSize, paging.current * paging.pageSize));
  let selectionOptions = $derived(typeof rowSelection === 'object' ? rowSelection : undefined);
  let visibleRows = $derived(pageRows.map((row) => ({ ...row, checkbox: selectionOptions?.getCheckboxProps?.(row.record) ?? {}, canExpand: expandable ? expandable.rowExpandable?.(row.record) ?? true : false })));
  let changeableKeys = $derived(visibleRows.filter((row) => !row.checkbox.disabled).map((row) => row.key));
  let selectedKeys = $derived(new Set(selectedRowKeys ?? initialSelection));
  let selection = $derived(getTableSelection(changeableKeys, [...selectedKeys]));
  let expandedKeys = $derived(new Set(expandedRowKeys ?? initialExpansion));
  let resolvedDisabled = $derived((disabled ?? config.componentDisabled) || loading);
  let resolvedSize = $derived(size ?? config.componentSize);
  let strings = $derived({ ...ruRU.table, ...config.locale.table });
  let content = $state<HTMLDivElement>();
  let table = $state<HTMLTableElement>();
  let expansionOffset = $derived(expandable ? 1 : 0);
  let dataOffset = $derived(expansionOffset + (rowSelection ? 1 : 0));
  let fixedColumns = $derived([...(expandable ? [expandable.fixed ?? false] : []), ...(rowSelection ? [selectionOptions?.fixed ?? false] : []), ...columns.map((column) => column.fixed)]);
  let fixedCells = $derived(fixedColumns.map((fixed, index) => ({
    side: fixed === true ? 'start' : fixed || undefined,
    offset: `var(--ant-table-fixed-${index}, auto)`
  })));

  $effect(() => {
    const element = table;
    const viewport = content;
    const fixed = fixedColumns;
    const hasHeader = scroll?.y !== undefined;
    const hasExpansion = Boolean(expandable);

    if (!element || !viewport || (!fixed.some(Boolean) && !hasHeader && !hasExpansion)) {
      return;
    }

    const cells = Array.from(element.tHead?.rows[0]?.cells ?? []);

    const measure = () => {
      const widths = cells.map((cell) => cell.getBoundingClientRect().width);
      const offsets = getTableFixedOffsets(fixed, widths);
      const pinnedWidth = widths.reduce((sum, width, index) => sum + (fixed[index] ? width : 0), 0);
      const enabled = cells.length === fixed.length && pinnedWidth < viewport.clientWidth;
      let startWidth = 0;
      let endWidth = 0;

      offsets.forEach((offset, index) => {
        const property = `--ant-table-fixed-${index}`;

        if (enabled && offset !== undefined) {
          element.style.setProperty(property, `${offset}px`);

          if (fixed[index] === 'end') endWidth += widths[index];
          else startWidth += widths[index];
        } else {
          element.style.removeProperty(property);
        }
      });
      element.style.setProperty('--ant-table-fixed-position', enabled ? 'sticky' : 'relative');
      viewport.style.setProperty('--ant-table-fixed-start-width', `${startWidth}px`);
      viewport.style.setProperty('--ant-table-fixed-end-width', `${endWidth}px`);
      viewport.style.setProperty('--ant-table-header-height', `${hasHeader ? element.tHead?.getBoundingClientRect().height ?? 0 : 0}px`);
      viewport.style.setProperty('--ant-table-viewport-width', `${viewport.clientWidth}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    cells.forEach((cell) => observer.observe(cell));

    return () => {
      observer.disconnect();
      fixed.forEach((_, index) => element.style.removeProperty(`--ant-table-fixed-${index}`));
      element.style.removeProperty('--ant-table-fixed-position');
      ['--ant-table-fixed-start-width', '--ant-table-fixed-end-width', '--ant-table-header-height', '--ant-table-viewport-width'].forEach((property) => viewport.style.removeProperty(property));
    };
  });

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

  function changeExpansion(record: Row, key: TableKey) {
    if (resolvedDisabled || !expandable || expandable.rowExpandable?.(record) === false) {
      return;
    }

    const next = new Set(expandedKeys);
    const expanded = !next.has(key);

    if (expanded) next.add(key);
    else next.delete(key);

    expandedRowKeys = [...next];
    onExpand?.(expanded, record);
    onExpandedRowsChange?.([...next]);
  }

  function expansionId(key: TableKey): string {
    const value = `${typeof key}:${key}`;

    return `ant-table-details-${id}-${Array.from({ length: value.length }, (_, index) => value.charCodeAt(index).toString(16)).join('-')}`;
  }

  function cellValue(record: Row, key: keyof Row | undefined): string {
    const value = key === undefined ? undefined : record[key];

    return value === null || value === undefined ? '' : String(value);
  }
</script>

<style>
  .ant-table-wrapper { min-width: 0; max-width: 100%; }
  .ant-table-content { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; }
  .table-sticky { isolation: isolate; scroll-padding-inline: var(--ant-table-fixed-start-width, 0px) var(--ant-table-fixed-end-width, 0px); }
  .table-scroll-y { overflow-y: auto; overscroll-behavior-y: contain; scroll-padding-top: var(--ant-table-header-height, 0px); }
  .ant-table-wrapper .ant-table-cell.table-fixed-cell { position: var(--ant-table-fixed-position, relative); background: var(--ant-color-bg-container); }
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th { position: sticky; top: 0; z-index: 2; }
  /* Непрозрачная подложка нужна и для токенов темы с alpha. */
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th,
  .ant-table-wrapper .ant-table-thead > tr > .table-fixed-cell { background: linear-gradient(var(--ant-table-header-bg), var(--ant-table-header-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th.ant-table-column-sort,
  .ant-table-wrapper .ant-table-thead > tr > .table-fixed-cell.ant-table-column-sort { background: linear-gradient(var(--ant-table-header-sort-active-bg), var(--ant-table-header-sort-active-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .table-scroll-y .ant-table-thead > tr > th.ant-table-column-has-sorters:hover,
  .ant-table-wrapper .ant-table-thead > tr > .table-fixed-cell.ant-table-column-has-sorters:hover { background: linear-gradient(var(--ant-table-header-sort-hover-bg), var(--ant-table-header-sort-hover-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .ant-table-tbody > tr > .table-fixed-cell.ant-table-column-sort { background: linear-gradient(var(--ant-table-body-sort-bg), var(--ant-table-body-sort-bg)) var(--ant-color-bg-container); }
  .ant-table-wrapper .ant-table-tbody > tr.ant-table-row-selected > .table-fixed-cell { background: linear-gradient(var(--ant-table-row-selected-bg), var(--ant-table-row-selected-bg)) var(--ant-color-bg-container); }
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
  .ant-table-wrapper .ant-table-row-expand-icon:disabled { color: var(--ant-color-text-disabled); border-color: var(--ant-table-border-color); cursor: not-allowed; }
  .ant-table-wrapper .ant-table .ant-table-tbody > tr.ant-table-expanded-row > td.ant-table-cell { padding: 0; }
  .expanded-content { position: sticky; inset-inline-start: 0; box-sizing: border-box; width: var(--ant-table-viewport-width, 100%); max-width: 100%; padding: var(--ant-table-cell-padding-block) var(--ant-table-cell-padding-inline); overflow-wrap: anywhere; }
  .ant-table-medium .expanded-content { padding: var(--ant-table-cell-padding-block-md) var(--ant-table-cell-padding-inline-md); }
  .ant-table-small .expanded-content { padding: var(--ant-table-cell-padding-block-sm) var(--ant-table-cell-padding-inline-sm); }
</style>

<div class={['ant-table-wrapper ant-table-css-var', config.direction === 'rtl' && 'ant-table-wrapper-rtl', className]} dir={config.direction} {style}>
  {#if loading}<div class="loading-state" role="status"><Icon name="loading" />{strings.loadingText}</div>{/if}
  <div class={['ant-table', `ant-table-${resolvedSize === 'middle' ? 'medium' : resolvedSize}`, bordered && 'ant-table-bordered', !visibleRows.length && 'ant-table-empty']}>
    <div class="ant-table-container">
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Фокус нужен для прокрутки таблицы с клавиатуры.) -->
      <div bind:this={content} class={['ant-table-content', (scroll?.y !== undefined || fixedColumns.some(Boolean)) && 'table-sticky', scroll?.y !== undefined && 'table-scroll-y']} style:max-height={typeof scroll?.y === 'number' ? `${scroll.y}px` : scroll?.y} role="region" aria-label={caption ?? ariaLabel ?? strings.label} tabindex="0">
        <table bind:this={table} aria-label={ariaLabel ?? (caption ? undefined : strings.label)} aria-busy={loading || undefined} style:min-width={typeof scroll?.x === 'number' ? `${scroll.x}px` : scroll?.x}>
          {#if caption}<caption>{caption}</caption>{/if}
          <colgroup>
            {#if expandable}<col style:width={typeof expandable.columnWidth === 'number' ? `${expandable.columnWidth}px` : expandable.columnWidth ?? '48px'} />{/if}
            {#if rowSelection}<col style="width: 48px" />{/if}
            {#each columns as column (column.key)}<col style:width={typeof column.width === 'number' ? `${column.width}px` : column.width} />{/each}
          </colgroup>
          <thead class="ant-table-thead">
            <tr>
              {#if expandable}
                <th scope="col" aria-label={expandable.columnTitle ?? strings.expandColumn} class={['ant-table-cell ant-table-row-expand-icon-cell', expandable.fixed && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start']} style:inset-inline-start={expandable.fixed ? fixedCells[0].offset : undefined} style:z-index={expandable.fixed ? 3 : undefined}>{expandable.columnTitle ?? ''}</th>
              {/if}
              {#if rowSelection}
                <th scope="col" class={['ant-table-cell ant-table-selection-column', selectionOptions?.fixed && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start']} style:inset-inline-start={selectionOptions?.fixed ? fixedCells[expansionOffset].offset : undefined} style:z-index={selectionOptions?.fixed ? 3 : undefined}>
                  <Checkbox checked={selection.all} indeterminate={selection.some} disabled={resolvedDisabled || selection.disabled} aria-label={strings.selectAll} onCheckedChange={(checked) => changeSelection(changeableKeys, checked, 'all')} />
                </th>
              {/if}
              {#each columns as column, columnIndex (column.key)}
                {@const sortable = typeof column.sorter === 'function' || (mode === 'server' && column.sorter === true)}
                {@const order = tableData.sorter?.columnKey === column.key ? tableData.sorter.order : undefined}
                {@const fixed = fixedCells[columnIndex + dataOffset]}
                <th scope="col" class={['ant-table-cell', fixed.side && `table-fixed-cell ant-table-cell-fix ant-table-cell-fix-${fixed.side}`, sortable && 'ant-table-column-has-sorters', order && 'ant-table-column-sort']} style:inset-inline-start={fixed.side === 'start' ? fixed.offset : undefined} style:inset-inline-end={fixed.side === 'end' ? fixed.offset : undefined} style:z-index={fixed.side ? 3 : undefined} style:text-align={column.align} aria-sort={order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : undefined}>
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
              {@const expanded = row.canExpand && expandedKeys.has(row.key)}
              <tr class={['ant-table-row', rowSelection && selectedKeys.has(row.key) && 'ant-table-row-selected']}>
                {#if expandable}
                  <td class={['ant-table-cell ant-table-row-expand-icon-cell', expandable.fixed && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start']} style:inset-inline-start={expandable.fixed ? fixedCells[0].offset : undefined} style:z-index={expandable.fixed ? 1 : undefined}>
                    {#if row.canExpand}
                      <button type="button" class={['ant-table-row-expand-icon', expanded ? 'ant-table-row-expand-icon-expanded' : 'ant-table-row-expand-icon-collapsed']} disabled={resolvedDisabled} aria-label={`${expanded ? strings.collapseRow : strings.expandRow} ${row.key}`} aria-expanded={expanded} aria-controls={expanded ? expansionId(row.key) : undefined} onclick={() => changeExpansion(row.record, row.key)}></button>
                    {/if}
                  </td>
                {/if}
                {#if rowSelection}
                  <td class={['ant-table-cell ant-table-selection-column', selectionOptions?.fixed && 'table-fixed-cell ant-table-cell-fix ant-table-cell-fix-start']} style:inset-inline-start={selectionOptions?.fixed ? fixedCells[expansionOffset].offset : undefined} style:z-index={selectionOptions?.fixed ? 1 : undefined}>
                    <Checkbox checked={selectedKeys.has(row.key)} disabled={resolvedDisabled || row.checkbox.disabled} aria-label={row.checkbox['aria-label'] ?? `${strings.selectRow} ${row.key}`} onCheckedChange={(checked) => changeSelection([row.key], checked, 'single')} />
                  </td>
                {/if}
                {#each columns as column, columnIndex (column.key)}
                  {@const fixed = fixedCells[columnIndex + dataOffset]}
                  <td class={['ant-table-cell', fixed.side && `table-fixed-cell ant-table-cell-fix ant-table-cell-fix-${fixed.side}`, tableData.sorter?.columnKey === column.key && 'ant-table-column-sort']} style:inset-inline-start={fixed.side === 'start' ? fixed.offset : undefined} style:inset-inline-end={fixed.side === 'end' ? fixed.offset : undefined} style:z-index={fixed.side ? 1 : undefined} style:text-align={column.align}>
                    {#if column.render}{@render column.render(row.record, index)}{:else}{cellValue(row.record, column.dataIndex)}{/if}
                  </td>
                {/each}
              </tr>
              {#if expanded && expandable}
                <tr class="ant-table-expanded-row"><td class="ant-table-cell" colspan={columns.length + dataOffset}><div class="expanded-content" id={expansionId(row.key)}>{@render expandable.expandedRowRender(row.record, index)}</div></td></tr>
              {/if}
            {:else}
              <tr class="ant-table-placeholder"><td class="ant-table-cell" colspan={columns.length + dataOffset}>{#if !loading}{#if empty}{@render empty()}{:else}{strings.emptyText}{/if}{:else}&nbsp;{/if}</td></tr>
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
