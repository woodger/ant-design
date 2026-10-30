import type { TableColumn, TableFilters, TableFilterValue, TableKey, TableMode, TableRowKey, TableSorter } from './table.types';

export interface TableRow<Row extends object> {
  key: TableKey;
  record: Row;
  sourceIndex: number;
}

export function getTableData<Row extends object>(
  dataSource: readonly Row[],
  columns: readonly TableColumn<Row>[],
  rowKey?: TableRowKey<Row>,
  sorter?: TableSorter | null,
  filters?: Readonly<Record<string, readonly TableFilterValue[]>>,
  mode: TableMode = 'client'
): { rows: TableRow<Row>[]; allRows: TableRow<Row>[]; sorter: TableSorter | null; filters: TableFilters } {
  if (!columns.length) {
    throw new Error('Table requires at least one column');
  }

  const columnKeys = new Set<string>();

  for (const column of columns) {
    if (columnKeys.has(column.key)) {
      throw new Error(`Table column key "${column.key}" is not unique`);
    }

    columnKeys.add(column.key);
  }

  const keys = new Set<TableKey>();
  const allRows = dataSource.map((record, sourceIndex) => {
    const key: unknown = typeof rowKey === 'function' ? rowKey(record) : Reflect.get(record, rowKey ?? 'key');

    if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isFinite(key))) {
      throw new Error('Table rowKey must resolve to a string or finite number for every record');
    }

    if (keys.has(key)) {
      throw new Error(`Table row key "${key}" is not unique`);
    }

    keys.add(key);

    return { key, record, sourceIndex };
  });
  const activeFilters = getTableFilters(columns, filters, mode);
  const column = columns.find((item) => item.key === sorter?.columnKey && (typeof item.sorter === 'function' || (mode === 'server' && item.sorter === true)));
  const activeSorter = column && sorter && (sorter.order === 'ascend' || sorter.order === 'descend')
    ? { columnKey: column.key, order: sorter.order }
    : null;

  if (mode === 'server') {
    return { rows: allRows, allRows, sorter: activeSorter, filters: activeFilters };
  }

  const filteredColumns = columns.filter((item) => Object.hasOwn(activeFilters, item.key));
  const rows = allRows.filter((row) => filteredColumns.every((item) => activeFilters[item.key].some((value) => item.onFilter?.(value, row.record))));

  if (typeof column?.sorter !== 'function' || !activeSorter) {
    return { rows, allRows, sorter: null, filters: activeFilters };
  }

  const compare = column.sorter;
  const direction = activeSorter.order === 'ascend' ? 1 : -1;
  rows.sort((left, right) => (compare(left.record, right.record) * direction || left.sourceIndex - right.sourceIndex));

  return { rows, allRows, sorter: activeSorter, filters: activeFilters };
}

export function getTableFilters<Row extends object>(columns: readonly TableColumn<Row>[], filters: Readonly<Record<string, readonly TableFilterValue[]>> = {}, mode: TableMode = 'client'): TableFilters {
  const entries: [string, TableFilterValue[]][] = [];

  for (const column of columns) {
    if (!column.filters?.length || (mode === 'client' && !column.onFilter)) {
      continue;
    }

    const available = new Set(column.filters.map((option) => option.value));
    const configured = Object.hasOwn(filters, column.key) ? filters[column.key] : [];
    const selected = [...new Set(configured ?? [])].filter((value) => available.has(value));
    const values = column.filterMultiple === false ? selected.slice(0, 1) : selected;

    if (values.length) {
      entries.push([column.key, values]);
    }
  }

  return Object.fromEntries(entries);
}

export function areTableFiltersEqual(left: TableFilters, right: TableFilters): boolean {
  const keys = Object.keys(left);

  return keys.length === Object.keys(right).length && keys.every((key) => {
    if (!Object.hasOwn(right, key)) {
      return false;
    }

    const first = new Set(left[key]);
    const second = new Set(right[key]);

    return first.size === second.size && [...first].every((value) => second.has(value));
  });
}

export function getNextTableSorter(columnKey: string, sorter: TableSorter | null): TableSorter | null {
  if (sorter?.columnKey !== columnKey) {
    return { columnKey, order: 'ascend' };
  }

  return sorter.order === 'ascend' ? { columnKey, order: 'descend' } : null;
}

export function getTableSelection(pageKeys: readonly TableKey[], selectedKeys: readonly TableKey[]) {
  const selected = new Set(selectedKeys);
  const count = pageKeys.filter((key) => selected.has(key)).length;

  return {
    all: pageKeys.length > 0 && count === pageKeys.length,
    some: count > 0 && count < pageKeys.length,
    disabled: pageKeys.length === 0
  };
}

export function changeTableSelection(selectedKeys: readonly TableKey[], changedKeys: readonly TableKey[], checked: boolean): TableKey[] {
  const selected = new Set(selectedKeys);

  for (const key of changedKeys) {
    if (checked) {
      selected.add(key);
    } else {
      selected.delete(key);
    }
  }

  return [...selected];
}
