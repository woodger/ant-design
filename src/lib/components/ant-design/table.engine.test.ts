import { describe, expect, it } from 'vitest';
import { changeTableSelection, getNextTableSorter, getTableData, getTableSelection } from './table.engine';
import type { TableColumn } from './table.types';

interface RecordRow { id: number; name: string; score: number }

const columns: TableColumn<RecordRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'score', title: 'Score', dataIndex: 'score', sorter: (left, right) => left.score - right.score }
];
const records = Object.freeze([
  Object.freeze({ id: 0, name: 'Anna', score: 30 }),
  Object.freeze({ id: 1, name: 'Boris', score: 10 }),
  Object.freeze({ id: 2, name: 'Clara', score: 30 }),
  Object.freeze({ id: 3, name: 'David', score: 20 })
]);

describe('getTableData', () => {
  it('preserves numeric zero and defaults to the record key', () => {
    const result = getTableData([{ key: 0, name: 'Anna' }], [{ key: 'name', title: 'Name', dataIndex: 'name' }]);

    expect(result.rows).toEqual([{ key: 0, sourceIndex: 0, record: { key: 0, name: 'Anna' } }]);
    expect(result.sorter).toBeNull();
  });

  it('resolves keys from a property or a callback without using array positions', () => {
    expect(getTableData(records, columns, 'id').rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
    expect(getTableData(records, columns, (row) => `person-${row.id}`).rows.map((row) => row.key)).toEqual(['person-0', 'person-1', 'person-2', 'person-3']);
  });

  it('sorts ascending without mutating records and preserves ties in source order', () => {
    const result = getTableData(records, columns, 'id', { columnKey: 'score', order: 'ascend' });

    expect(result.rows.map((row) => row.key)).toEqual([1, 3, 0, 2]);
    expect(result.rows.map((row) => row.sourceIndex)).toEqual([1, 3, 0, 2]);
    expect(records.map((row) => row.id)).toEqual([0, 1, 2, 3]);
    expect(result.sorter).toEqual({ columnKey: 'score', order: 'ascend' });
  });

  it('preserves ties in source order when sorting descending', () => {
    const result = getTableData(records, columns, 'id', { columnKey: 'score', order: 'descend' });

    expect(result.rows.map((row) => row.key)).toEqual([0, 2, 3, 1]);
  });

  it('uses source order after clearing sorting or removing its column', () => {
    expect(getTableData(records, columns, 'id', null).rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
    const result = getTableData(records, columns.slice(0, 1), 'id', { columnKey: 'score', order: 'ascend' });

    expect(result.sorter).toBeNull();
    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
  });

  it('ignores sorting for a column without a comparator', () => {
    const result = getTableData(records, columns, 'id', { columnKey: 'name', order: 'ascend' });

    expect(result.sorter).toBeNull();
    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
  });

  it('keeps source order when a comparator returns NaN', () => {
    const result = getTableData(records, [{ key: 'score', title: 'Score', sorter: () => Number.NaN }], 'id', { columnKey: 'score', order: 'ascend' });

    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
  });

  it('accepts an empty collection with declared columns', () => {
    expect(getTableData([], columns, 'id')).toEqual({ rows: [], sorter: null });
  });

  it('rejects missing or non-finite keys instead of assigning positional identities', () => {
    expect(() => getTableData(records, columns)).toThrow('Table rowKey must resolve');
    expect(() => getTableData(records, columns, () => Number.NaN)).toThrow('Table rowKey must resolve');
  });

  it('rejects duplicate row keys while distinguishing numeric and string keys', () => {
    expect(() => getTableData(records, columns, () => 'duplicate')).toThrow('Table row key "duplicate" is not unique');
    const result = getTableData([{ key: 1 }, { key: '1' }], [{ key: 'key', title: 'Key', dataIndex: 'key' }]);

    expect(result.rows.map((row) => row.key)).toEqual([1, '1']);
  });

  it('requires a nonempty set of uniquely keyed columns', () => {
    expect(() => getTableData(records, [], 'id')).toThrow('Table requires at least one column');
    expect(() => getTableData(records, [columns[0], columns[0]], 'id')).toThrow('Table column key "name" is not unique');
  });
});

describe('getNextTableSorter', () => {
  it('cycles ascending, descending and unsorted and starts a new column ascending', () => {
    expect(getNextTableSorter('score', null)).toEqual({ columnKey: 'score', order: 'ascend' });
    expect(getNextTableSorter('score', { columnKey: 'score', order: 'ascend' })).toEqual({ columnKey: 'score', order: 'descend' });
    expect(getNextTableSorter('score', { columnKey: 'score', order: 'descend' })).toBeNull();
    expect(getNextTableSorter('name', { columnKey: 'score', order: 'descend' })).toEqual({ columnKey: 'name', order: 'ascend' });
  });
});

describe('getTableSelection', () => {
  it('disables select-all when the page has no selectable rows', () => {
    expect(getTableSelection([], [1])).toEqual({ all: false, some: false, disabled: true });
  });

  it('computes mixed state only from selectable keys on the current page', () => {
    expect(getTableSelection([0, 1], [0, 5])).toEqual({ all: false, some: true, disabled: false });
    expect(getTableSelection([0, 1], [5])).toEqual({ all: false, some: false, disabled: false });
  });

  it('checks select-all when every selectable page key is selected', () => {
    expect(getTableSelection([0, 1], [0, 1, 5])).toEqual({ all: true, some: false, disabled: false });
  });
});

describe('changeTableSelection', () => {
  it('adds page keys without losing off-page selection or duplicating keys', () => {
    const selected = Object.freeze([0, 'retained']);

    expect(changeTableSelection(selected, [0, 2, 3], true)).toEqual([0, 'retained', 2, 3]);
    expect(selected).toEqual([0, 'retained']);
  });

  it('clears only the changed keys and retains disabled or off-page keys', () => {
    expect(changeTableSelection([0, 1, 2, 5], [0, 2], false)).toEqual([1, 5]);
    expect(changeTableSelection([0, 0, '0'], [], true)).toEqual([0, '0']);
  });
});
