import { describe, expect, it } from 'vitest';
import {
  areTableFiltersEqual,
  changeTableSelection,
  getNextTableSorter,
  getTableData,
  getTableFilters,
  getTableSelection
} from './table.engine';
import type { TableColumn } from './table.types';

interface RecordRow {
  id: number;
  name: string;
  score: number;
}

const columns: TableColumn<RecordRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  {
    key: 'score',
    title: 'Score',
    dataIndex: 'score',
    sorter: (left, right) => left.score - right.score
  }
];
const records = Object.freeze([
  Object.freeze({ id: 0, name: 'Anna', score: 30 }),
  Object.freeze({ id: 1, name: 'Boris', score: 10 }),
  Object.freeze({ id: 2, name: 'Clara', score: 30 }),
  Object.freeze({ id: 3, name: 'David', score: 20 })
]);

describe('getTableData', () => {
  it('preserves numeric zero and defaults to the record key', () => {
    const result = getTableData(
      [{ key: 0, name: 'Anna' }],
      [{ key: 'name', title: 'Name', dataIndex: 'name' }]
    );

    expect(result.rows).toEqual([{ key: 0, sourceIndex: 0, record: { key: 0, name: 'Anna' } }]);
    expect(result.sorter).toBeNull();
  });

  it('resolves keys from a property or a callback without using array positions', () => {
    expect(getTableData(records, columns, 'id').rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
    expect(
      getTableData(records, columns, (row) => `person-${row.id}`).rows.map((row) => row.key)
    )
      .toEqual(
        ['person-0', 'person-1', 'person-2', 'person-3']
      );
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
    expect(getTableData(records, columns, 'id', null).rows.map((row) => row.key)).toEqual(
      [0, 1, 2, 3]
    );
    const result = getTableData(
      records,
      columns.slice(0, 1),
      'id',
      { columnKey: 'score', order: 'ascend' }
    );

    expect(result.sorter).toBeNull();
    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
  });

  it('ignores sorting for a column without a comparator', () => {
    const result = getTableData(records, columns, 'id', { columnKey: 'name', order: 'ascend' });

    expect(result.sorter).toBeNull();
    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
  });

  it('keeps source order when a comparator returns NaN', () => {
    const result = getTableData(
      records,
      [{ key: 'score', title: 'Score', sorter: () => Number.NaN }],
      'id',
      { columnKey: 'score', order: 'ascend' }
    );

    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
  });

  it('accepts an empty collection with declared columns', () => {
    expect(getTableData([], columns, 'id')).toEqual(
      { rows: [], allRows: [], sorter: null, filters: {} }
    );
  });

  it('rejects missing or non-finite keys instead of assigning positional identities', () => {
    expect(() => getTableData(records, columns)).toThrow('Table rowKey must resolve');
    expect(() => getTableData(records, columns, () => Number.NaN)).toThrow(
      'Table rowKey must resolve'
    );
  });

  it('rejects duplicate row keys while distinguishing numeric and string keys', () => {
    expect(() => getTableData(records, columns, () => 'duplicate')).toThrow(
      'Table row key "duplicate" is not unique'
    );
    const result = getTableData(
      [{ key: 1 }, { key: '1' }],
      [{ key: 'key', title: 'Key', dataIndex: 'key' }]
    );

    expect(result.rows.map((row) => row.key)).toEqual([1, '1']);
  });

  it('requires a nonempty set of uniquely keyed columns', () => {
    expect(() => getTableData(records, [], 'id')).toThrow('Table requires at least one column');
    expect(() => getTableData(records, [columns[0], columns[0]], 'id')).toThrow(
      'Table column key "name" is not unique'
    );
  });
});

describe('Table filtering', () => {
  const filterColumns: TableColumn<RecordRow>[] = [
    {
      ...columns[0],
      filters: [{ text: 'Anna', value: 'Anna' }, { text: 'Clara', value: 'Clara' }],
      onFilter: (value, row) => row.name === value
    },
    {
      ...columns[1],
      filters: [{ text: 'Ten', value: 10 }, { text: 'Thirty', value: 30 }],
      onFilter: (value, row) => row.score === value
    }
  ];

  it('combines values with OR within a column and columns with AND', () => {
    const result = getTableData(
      records,
      filterColumns,
      'id',
      null,
      { name: ['Anna', 'Clara'], score: [30] }
    );

    expect(result.rows.map((row) => row.key)).toEqual([0, 2]);
    expect(result.filters).toEqual({ name: ['Anna', 'Clara'], score: [30] });
  });

  it('filters before sorting and keeps the full source available for hidden selections', () => {
    const compared: number[] = [];
    const configured = [{
      ...filterColumns[1],
      sorter: (left: RecordRow, right: RecordRow) => {
        compared.push(left.score, right.score);
        return left.score - right.score;
      }
    }];
    const result = getTableData(
      records,
      configured,
      'id',
      { columnKey: 'score', order: 'descend' },
      { score: [10, 30] }
    );

    expect(result.rows.map((row) => row.key)).toEqual([0, 2, 1]);
    expect(result.allRows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
    expect(compared).not.toContain(20);
    expect(records.map((row) => row.id)).toEqual([0, 1, 2, 3]);
  });

  it('returns an empty collection when no record matches all columns', () => {
    const result = getTableData(
      records,
      filterColumns,
      'id',
      null,
      { name: ['Anna'], score: [10] }
    );

    expect(result.rows).toEqual([]);
    expect(result.allRows).toHaveLength(4);
  });

  it('ignores removed columns and unavailable values without mutating owner filters', () => {
    const filters = Object.freeze(
      { name: Object.freeze(['Anna', 'missing']), removed: Object.freeze([0]) }
    );

    expect(getTableFilters(filterColumns, filters)).toEqual({ name: ['Anna'] });
    expect(getTableFilters(filterColumns.slice(1), filters)).toEqual({});
    expect(filters).toEqual({ name: ['Anna', 'missing'], removed: [0] });
  });

  it('deduplicates selections and keeps only the first valid value in single mode', () => {
    expect(getTableFilters(filterColumns, { name: ['Anna', 'Anna', 'Clara'] })).toEqual(
      { name: ['Anna', 'Clara'] }
    );
    expect(
      getTableFilters(
        [{ ...filterColumns[0], filterMultiple: false }],
        { name: ['missing', 'Clara', 'Anna'] }
      )
    ).toEqual(
      { name: ['Clara'] }
    );
  });

  it('preserves false and numeric zero and distinguishes numeric and string options', () => {
    const configured: TableColumn<{ key: number; value: string | number | boolean; }>[] = [
      {
        key: 'value',
        title: 'Value',
        filters: [
          { text: 'False', value: false },
          { text: 'Zero', value: 0 },
          { text: 'Text zero', value: '0' }
        ],
        onFilter: (value, row) => row.value === value
      }
    ];
    const values = [{ key: 1, value: false }, { key: 2, value: 0 }, { key: 3, value: '0' }];

    expect(
      getTableData(values, configured, undefined, null, { value: [false, 0] }).rows.map(
        (row) => row.key
      )
    ).toEqual(
      [1, 2]
    );
    expect(getTableFilters(configured, { value: ['0'] })).toEqual({ value: ['0'] });
  });

  it('ignores empty selections and columns without both options and a predicate', () => {
    expect(getTableFilters(filterColumns, { name: [], score: [] })).toEqual({});
    expect(getTableFilters([{ ...filterColumns[0], onFilter: undefined }], { name: ['Anna'] }))
      .toEqual(
        {}
      );
    expect(getTableFilters([{ ...filterColumns[0], filters: [] }], { name: ['Anna'] })).toEqual(
      {}
    );
  });

  it('supports column keys matching Object prototype names', () => {
    const configured = [
      { ...filterColumns[0], key: 'constructor' },
      { ...filterColumns[1], key: '__proto__' }
    ];
    const filters = Object.fromEntries([['constructor', ['Anna']], ['__proto__', [30]]]);
    const result = getTableData(records, configured, 'id', null, filters);

    expect(result.rows.map((row) => row.key)).toEqual([0]);
    expect(Object.keys(result.filters)).toEqual(['constructor', '__proto__']);
    expect(getTableData(records, configured, 'id').rows).toHaveLength(4);
    expect(areTableFiltersEqual(result.filters, {})).toBe(false);
  });

  it('compares normalized filters without depending on option or column order', () => {
    expect(
      areTableFiltersEqual(
        { name: ['Anna', 'Clara'], score: [30] },
        { score: [30], name: ['Clara', 'Anna'] }
      )
    ).toBe(
      true
    );
    expect(areTableFiltersEqual({ score: [0] }, { score: ['0'] })).toBe(false);
    expect(areTableFiltersEqual({ score: [30] }, {})).toBe(false);
    expect(areTableFiltersEqual({}, {})).toBe(true);
  });
});

describe('getNextTableSorter', () => {
  it('cycles ascending, descending and unsorted and starts a new column ascending', () => {
    expect(getNextTableSorter('score', null)).toEqual({ columnKey: 'score', order: 'ascend' });
    expect(getNextTableSorter('score', { columnKey: 'score', order: 'ascend' })).toEqual(
      { columnKey: 'score', order: 'descend' }
    );
    expect(getNextTableSorter('score', { columnKey: 'score', order: 'descend' })).toBeNull();
    expect(getNextTableSorter('name', { columnKey: 'score', order: 'descend' })).toEqual(
      { columnKey: 'name', order: 'ascend' }
    );
  });
});

describe('Table server data', () => {
  it('preserves a supplied page and never calls local filtering or sorting callbacks', () => {
    const configured: TableColumn<RecordRow>[] = [
      {
        key: 'score',
        title: 'Score',
        sorter: () => {
          throw new Error('Unexpected local sort');
        },
        filters: [{ text: 'Ten', value: 10 }],
        onFilter: () => {
          throw new Error('Unexpected local filter');
        }
      }
    ];
    const result = getTableData(
      records,
      configured,
      'id',
      { columnKey: 'score', order: 'ascend' },
      { score: [10] },
      'server'
    );

    expect(result.rows.map((row) => row.key)).toEqual([0, 1, 2, 3]);
    expect(result.sorter).toEqual({ columnKey: 'score', order: 'ascend' });
    expect(result.filters).toEqual({ score: [10] });
  });

  it('supports interactive-only sorting and filters without local predicates', () => {
    const configured: TableColumn<RecordRow>[] = [
      { key: 'score', title: 'Score', sorter: true, filters: [{ text: 'Ten', value: 10 }] }
    ];
    const result = getTableData(
      records,
      configured,
      'id',
      { columnKey: 'score', order: 'descend' },
      { score: [10] },
      'server'
    );

    expect(result.sorter).toEqual({ columnKey: 'score', order: 'descend' });
    expect(result.filters).toEqual({ score: [10] });
    expect(result.rows).toHaveLength(4);
    expect(
      getTableData(
        records,
        configured,
        'id',
        { columnKey: 'score', order: 'descend' },
        { score: [10] }
      ).sorter
    ).toBeNull();
    expect(getTableFilters(configured, { score: [10] })).toEqual({});
  });

  it('normalizes server filter values while retaining their primitive types', () => {
    const configured: TableColumn<RecordRow>[] = [
      {
        key: 'state',
        title: 'State',
        filterMultiple: false,
        filters: [{ text: 'False', value: false }, { text: 'Zero', value: 0 }]
      }
    ];

    expect(getTableFilters(configured, { state: ['missing', false, 0, false] }, 'server')).toEqual(
      { state: [false] }
    );
  });

  it('validates row identity across a server page before rendering', () => {
    expect(() => getTableData(records, columns, () => 'duplicate', null, {}, 'server')).toThrow(
      'Table row key "duplicate" is not unique'
    );
    expect(() => getTableData(records, columns, undefined, null, {}, 'server')).toThrow(
      'Table rowKey must resolve'
    );
  });
});

describe('getTableSelection', () => {
  it('disables select-all when the page has no selectable rows', () => {
    expect(getTableSelection([], [1])).toEqual({ all: false, some: false, disabled: true });
  });

  it('computes mixed state only from selectable keys on the current page', () => {
    expect(getTableSelection([0, 1], [0, 5])).toEqual(
      { all: false, some: true, disabled: false }
    );
    expect(getTableSelection([0, 1], [5])).toEqual({ all: false, some: false, disabled: false });
  });

  it('checks select-all when every selectable page key is selected', () => {
    expect(getTableSelection([0, 1], [0, 1, 5])).toEqual(
      { all: true, some: false, disabled: false }
    );
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
