import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Table from './Table.svelte';
import type { TableColumn, TableKey } from './table.types';

interface Person { key: TableKey; name: string; score: number }
const columns: TableColumn<Person>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'score', title: 'Score', dataIndex: 'score', sorter: (left, right) => left.score - right.score }
];
const people: Person[] = [
  { key: 0, name: 'Anna', score: 30 },
  { key: 1, name: 'Boris', score: 10 },
  { key: 2, name: 'Clara', score: 20 }
];
const details = createRawSnippet<[Person, number]>((record, index) => ({ render: () => `<p>Details ${record().name}:${index()}</p>` }));
const unusedDetails = createRawSnippet<[Person, number]>(() => { throw new Error('Unexpected detail render'); });

describe('Table expanded row rendering', () => {
  it('renders collapsed native buttons without creating detail content or notifying its owner', () => {
    const { body } = render(Table<Person>, { props: {
      columns, dataSource: people, expandable: { expandedRowRender: unusedDetails },
      onExpand: () => { throw new Error('Unexpected expansion'); },
      onExpandedRowsChange: () => { throw new Error('Unexpected keys callback'); },
      onChange: () => { throw new Error('Unexpected data callback'); }
    } });

    expect(body).toContain('aria-label="Подробности"');
    expect(body).toMatch(/<button type="button"[^>]*aria-label="Раскрыть строку 0"[^>]*aria-expanded="false"/);
    expect(body).not.toContain('aria-controls=');
    expect(body).not.toContain('class="ant-table-expanded-row"');
  });

  it('renders a default expanded key including zero and spans data, selection and expansion columns', () => {
    const defaults = Object.freeze([0]);
    const { body } = render(Table<Person>, { props: { columns, dataSource: people, rowSelection: true, expandable: { expandedRowRender: details }, defaultExpandedRowKeys: defaults } });

    expect(body).toContain('<p>Details Anna:0</p>');
    expect(body).not.toContain('<p>Details Boris');
    expect(body).toContain('aria-label="Свернуть строку 0"');
    expect(body).toContain('aria-expanded="true"');
    expect(body).toContain('colspan="4"');
    const target = body.match(/aria-controls="([^"]+)"/)?.[1];
    expect(target).toBeTruthy();
    expect(body).toContain(`id="${target}"`);
    expect(defaults).toEqual([0]);
  });

  it('uses explicit keys instead of defaults without mutating either array', () => {
    const keys: TableKey[] = [];
    const { body } = render(Table<Person>, { props: { columns, dataSource: people, expandedRowKeys: keys, defaultExpandedRowKeys: [0], expandable: { expandedRowRender: unusedDetails } } });

    expect(body).not.toContain('class="ant-table-expanded-row"');
    expect(keys).toEqual([]);
  });

  it('renders only visible expanded records after local sorting and pagination with a page-relative index', () => {
    const { body } = render(Table<Person>, { props: {
      columns, dataSource: people, expandedRowKeys: [0, 2], expandable: { expandedRowRender: details },
      sorter: { columnKey: 'score', order: 'ascend' }, current: 2, pageSize: 1
    } });

    expect(body).toContain('<p>Details Clara:0</p>');
    expect(body).not.toContain('Anna');
    expect(body).not.toContain('Boris');
    expect(body).toContain('colspan="3"');
  });

  it('renders expanded content from the supplied server page without locally paginating it', () => {
    const { body } = render(Table<Person>, { props: {
      columns, dataSource: people, mode: 'server', total: 95, current: 4, pageSize: 1,
      expandedRowKeys: [2], expandable: { expandedRowRender: details }
    } });

    expect(body).toContain('<p>Details Clara:2</p>');
    expect(body).toContain('Anna');
    expect(body).toContain('Boris');
    expect(body).toMatch(/aria-label="Страница 4"[^>]*aria-current="page"/);
  });

  it('does not expose unavailable expansion while retaining the owner keys', () => {
    const keys: TableKey[] = [0];
    const { body } = render(Table<Person>, { props: {
      columns, dataSource: people, expandedRowKeys: keys,
      expandable: { expandedRowRender: unusedDetails, rowExpandable: () => false }
    } });

    expect(body).not.toContain('aria-label="Раскрыть строку');
    expect(body).not.toContain('class="ant-table-expanded-row"');
    expect(keys).toEqual([0]);
    const plain = render(Table<Person>, { props: { columns, dataSource: people, expandedRowKeys: keys } }).body;
    expect(plain).not.toContain('ant-table-row-expand-icon-cell');
  });

  it('accounts for the expansion column in empty, loading and fixed layouts', () => {
    const { body } = render(Table<Person>, { props: {
      columns: [{ ...columns[0], fixed: true }], dataSource: [], rowSelection: { fixed: true },
      expandable: { expandedRowRender: unusedDetails, fixed: true, columnTitle: 'Record details', columnWidth: '4rem' }, loading: true
    } });

    expect(body).toContain('colspan="3"');
    expect(body).toContain('width: 4rem');
    expect(body).toContain('var(--ant-table-fixed-0, auto)');
    expect(body).toContain('var(--ant-table-fixed-1, auto)');
    expect(body).toContain('var(--ant-table-fixed-2, auto)');
    expect(body).toContain('aria-label="Record details"');
    const loaded = render(Table<Person>, { props: { columns, dataSource: people, expandable: { expandedRowRender: details }, loading: true } }).body;
    expect(loaded).toMatch(/<button[^>]*disabled[^>]*aria-label="Раскрыть строку 0"/);
  });

  it('generates distinct safe control targets for numeric, string and Unicode keys', () => {
    const keys: TableKey[] = [0, '0', '😀', '😁', '\ud800', 'a"\u0000'];
    const { body } = render(Table<Person>, { props: {
      columns, dataSource: keys.map((key) => ({ key, name: 'Person', score: 0 })),
      expandedRowKeys: keys, expandable: { expandedRowRender: details }, pagination: false
    } });
    const targets = [...body.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);

    expect(targets).toHaveLength(keys.length);
    expect(new Set(targets).size).toBe(keys.length);
    expect(targets.every((target) => body.includes(`id="${target}"`))).toBe(true);
  });
});
