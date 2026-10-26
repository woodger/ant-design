import type { TableColumn, TableKey, TableRowKey, TableSorter } from './table.types';

export interface TableRow<Row extends object> {
  key: TableKey;
  record: Row;
  sourceIndex: number;
}

export function getTableData<Row extends object>(
  dataSource: readonly Row[],
  columns: readonly TableColumn<Row>[],
  rowKey?: TableRowKey<Row>,
  sorter?: TableSorter | null
): { rows: TableRow<Row>[]; sorter: TableSorter | null } {
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
  const rows = dataSource.map((record, sourceIndex) => {
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
  const column = columns.find((item) => item.key === sorter?.columnKey && item.sorter);

  if (!column?.sorter || !sorter || (sorter.order !== 'ascend' && sorter.order !== 'descend')) {
    return { rows, sorter: null };
  }

  const compare = column.sorter;
  const direction = sorter.order === 'ascend' ? 1 : -1;
  rows.sort((left, right) => (compare(left.record, right.record) * direction || left.sourceIndex - right.sourceIndex));

  return { rows, sorter: { columnKey: column.key, order: sorter.order } };
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
