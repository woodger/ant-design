import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Table from './Table.svelte';
import type { TableColumn } from './table.types';

interface RecordRow { key: number; name: string; score: number }
const columns: TableColumn<RecordRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'score', title: 'Score', dataIndex: 'score', sorter: (left, right) => left.score - right.score }
];
const dataSource: RecordRow[] = [
  { key: 0, name: 'Anna', score: 30 },
  { key: 1, name: 'Boris', score: 10 },
  { key: 2, name: 'Clara', score: 20 }
];

describe('Table server rendering', () => {
  it('renders a labelled native table and escapes default cell content', () => {
    const { body } = render(Table<RecordRow>, { props: { columns, dataSource: [{ key: 0, name: '<script>alert(1)</script>', score: 0 }], caption: 'People' } });

    expect(body).toMatch(/<caption\b[^>]*>People<\/caption>/);
    expect(body).toContain('scope="col"');
    expect(body).toContain('&lt;script>');
    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/<td\b[^>]*>0<\/td>/);
  });

  it('sorts the entire collection before taking the requested page without callbacks', () => {
    const events: string[] = [];
    const { body } = render(Table<RecordRow>, {
      props: { columns, dataSource, sorter: { columnKey: 'score', order: 'ascend' }, current: 2, pageSize: 1, onChange: () => events.push('change') }
    });

    expect(body).toContain('aria-sort="ascending"');
    expect(body).toContain('Clara');
    expect(body).not.toContain('Boris');
    expect(body).not.toContain('Anna');
    expect(body).toMatch(/aria-label="Страница 2"[^>]*aria-current="page"/);
    expect(events).toEqual([]);
  });

  it('renders default selection and a mixed header while ignoring disabled rows', () => {
    const { body } = render(Table<RecordRow>, {
      props: { columns, dataSource, rowSelection: { getCheckboxProps: (row) => ({ disabled: row.key === 1 }) }, defaultSelectedRowKeys: [0], onSelectionChange: () => { throw new Error('Unexpected selection callback'); } }
    });

    expect(body).toContain('aria-checked="mixed"');
    expect(body).toContain('aria-label="Выбрать строку 0"');
    expect(body).toContain('ant-table-row-selected');
    const disabledInput = body.match(/<input\b[^>]*>/g)?.find((input) => input.includes('aria-label="Выбрать строку 1"'));
    expect(disabledInput).toMatch(/\sdisabled(?:[\s=>])/);
  });

  it('renders cell snippets with the record and page-relative index', () => {
    const name = createRawSnippet<[RecordRow, number]>((row, index) => ({ render: () => `<strong>${row().name}:${index()}</strong>` }));
    const { body } = render(Table<RecordRow>, { props: { dataSource, columns: [{ key: 'name', title: 'Name', render: name }], current: 2, pageSize: 1 } });

    expect(body).toContain('<strong>Boris:0</strong>');
  });

  it('renders all records when pagination is disabled', () => {
    const { body } = render(Table<RecordRow>, { props: { columns, dataSource, pageSize: 1, current: 99, pagination: false } });

    expect(body).toContain('Anna');
    expect(body).toContain('Boris');
    expect(body).toContain('Clara');
    expect(body).not.toContain('<nav');
  });

  it('renders an empty cell spanning all data and selection columns', () => {
    const { body } = render(Table<RecordRow>, { props: { columns, dataSource: [], rowSelection: true } });

    expect(body).toContain('colspan="3"');
    expect(body).toContain('Нет данных');
  });

  it('renders loading as busy and disables managed controls before hydration', () => {
    const { body } = render(Table<RecordRow>, { props: { columns, dataSource: [], rowSelection: true, loading: true } });

    expect(body).toContain('aria-busy="true"');
    expect(body).toContain('Загрузка данных…');
    expect(body).not.toContain('Нет данных');
    expect(body).toMatch(/<button[^>]*disabled/);
  });

  it('filters and sorts before selecting the requested page without emitting callbacks', () => {
    const filteredColumns = [{ ...columns[1], filters: [{ text: 'At least twenty', value: 20 }], onFilter: (value: string | number | boolean, row: RecordRow) => row.score >= Number(value) }];
    const { body } = render(Table<RecordRow>, { props: {
      dataSource, columns: filteredColumns, defaultFilters: { score: [20] }, defaultSorter: { columnKey: 'score', order: 'ascend' }, current: 2, pageSize: 1,
      onChange: () => { throw new Error('Unexpected filter callback'); }
    } });

    expect(body.replace(/<!--[\s\S]*?-->/g, '')).toMatch(/<td\b[^>]*>30<\/td>/);
    expect(body).toContain('ant-table-filter-trigger active');
    expect(body).toContain('popover="auto"');
    expect(body).toContain('aria-expanded="false"');
    expect(body).toContain('aria-label="Фильтр: Score"');
  });

  it('renders an entire server page and an external total without repeating data processing', () => {
    const { body } = render(Table<RecordRow>, { props: {
      mode: 'server', total: 95, current: 4, pageSize: 10, dataSource,
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name', sorter: true, filters: [{ text: 'Other', value: 'other' }] }],
      sorter: { columnKey: 'name', order: 'descend' }, filters: { name: ['other'] },
      onChange: () => { throw new Error('Unexpected server callback'); }
    } });

    expect(body).toContain('Anna');
    expect(body).toContain('Boris');
    expect(body).toContain('Clara');
    expect(body.indexOf('Anna')).toBeLessThan(body.indexOf('Boris'));
    expect(body).toContain('aria-sort="descending"');
    expect(body).toContain('aria-label="Фильтр: Name"');
    expect(body).toMatch(/aria-label="Страница 4"[^>]*aria-current="page"/);
    expect(body).toContain('aria-label="Страница 10"');
  });

  it('clamps a shrinking server total without replacing supplied records or notifying its owner', () => {
    const { body } = render(Table<RecordRow>, { props: { mode: 'server', total: 15, current: 4, pageSize: 10, columns, dataSource, onChange: () => { throw new Error('Unexpected server callback'); } } });

    expect(body).toContain('Anna');
    expect(body).toMatch(/aria-label="Страница 2"[^>]*aria-current="page"/);
  });

  it('uses local processing and the local record count by default even with an external total', () => {
    const { body } = render(Table<RecordRow>, { props: { total: 95, current: 2, pageSize: 1, columns, dataSource } });

    expect(body).toContain('Boris');
    expect(body).not.toContain('Anna');
    expect(body).not.toContain('Clara');
    expect(body).not.toContain('aria-label="Страница 4"');
  });

  it('renders one complete native table with scroll constraints and fixed column metadata before measurement', () => {
    const { body } = render(Table<RecordRow>, { props: {
      dataSource, caption: 'Fixed people', pagination: false, scroll: { x: 900, y: '18rem' }, rowSelection: { fixed: true },
      columns: [{ ...columns[0], fixed: true, width: 180 }, { ...columns[1], fixed: 'end', width: '8rem' }],
      onChange: () => { throw new Error('Unexpected layout callback'); },
      onSelectionChange: () => { throw new Error('Unexpected selection callback'); }
    } });

    expect(body.match(/<table\b/g)).toHaveLength(1);
    expect(body.match(/<thead\b/g)).toHaveLength(1);
    expect(body).toContain('table-scroll-y');
    expect(body).toContain('max-height: 18rem');
    expect(body).toContain('min-width: 900px');
    expect(body).toContain('ant-table-cell-fix-start');
    expect(body).toContain('ant-table-cell-fix-end');
    expect(body).toContain('var(--ant-table-fixed-1, auto)');
    expect(body).toContain('Anna');
    expect(body).toContain('Boris');
    expect(body).toContain('Clara');
    expect(body).not.toContain('--ant-table-fixed-position:');
  });

  it('keeps an empty server page intact when only the header is fixed', () => {
    const { body } = render(Table<RecordRow>, { props: { columns, dataSource: [], mode: 'server', total: 95, current: 4, rowSelection: true, scroll: { y: 240 } } });

    expect(body).toContain('max-height: 240px');
    expect(body).toContain('colspan="3"');
    expect(body).toContain('Нет данных');
    expect(body).not.toContain('table-fixed-cell');
    expect(body).toMatch(/aria-label="Страница 4"[^>]*aria-current="page"/);
  });
});
