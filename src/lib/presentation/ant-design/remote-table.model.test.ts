import { describe, expect, it, vi } from 'vitest';
import { createRemoteTable, type RemoteTableLoader, type RemoteTablePage, type RemoteTableQuery } from './remote-table.model.svelte';

interface Person { key: number; name: string }

function createSource() {
  const requests: {
    query: RemoteTableQuery;
    signal: AbortSignal;
    resolve: (page: RemoteTablePage<Person>) => void;
    reject: (error: Error) => void;
  }[] = [];
  const load: RemoteTableLoader<Person> = (query, signal) => new Promise((resolve, reject) => {
    requests.push({ query, signal, resolve, reject });
  });

  return { requests, load };
}

describe('Remote table presentation model', () => {
  it('waits for an explicit load and exposes the returned page and total', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    expect(source.requests).toEqual([]);
    expect(model.loading).toBe(false);

    const task = model.load();
    expect(model.loading).toBe(true);
    source.requests[0].resolve({ rows: [{ key: 0, name: 'Anna' }], total: 23 });
    await task;

    expect(model.rows).toEqual([{ key: 0, name: 'Anna' }]);
    expect(model.total).toBe(23);
    expect(model.loading).toBe(false);
    expect(model.error).toBeNull();
  });

  it('aborts an older request and ignores its late successful response', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const first = model.load();
    const second = model.load({ current: 2, pageSize: 5, sorter: null, filters: {} });
    expect(source.requests[0].signal.aborted).toBe(true);
    source.requests[1].resolve({ rows: [{ key: 6, name: 'Latest' }], total: 30 });
    await second;
    source.requests[0].resolve({ rows: [{ key: 0, name: 'Stale' }], total: 1000 });
    await first;

    expect(model.rows).toEqual([{ key: 6, name: 'Latest' }]);
    expect(model.current).toBe(2);
    expect(model.total).toBe(30);
  });

  it('does not clear loading or publish a stale error while a newer request is pending', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const first = model.load();
    const second = model.load();
    source.requests[0].reject(new Error('Old failure'));
    await first;

    expect(model.loading).toBe(true);
    expect(model.error).toBeNull();
    source.requests[1].resolve({ rows: [{ key: 1, name: 'Current' }], total: 1 });
    await second;
    expect(model.rows).toEqual([{ key: 1, name: 'Current' }]);
  });

  it('keeps a newer failure when an older request resolves afterward', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const first = model.load();
    const second = model.load();
    source.requests[1].reject(new Error('Latest failure'));
    await second;
    source.requests[0].resolve({ rows: [{ key: 1, name: 'Old data' }], total: 10 });
    await first;

    expect(model.rows).toEqual([]);
    expect(model.error).toBe('Не удалось загрузить данные. Попробуйте ещё раз.');
    expect(model.loading).toBe(false);
  });

  it('retries the failed query and clears the error after success', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const query: RemoteTableQuery = { current: 3, pageSize: 10, sorter: { columnKey: 'name', order: 'descend' }, filters: { active: [false], count: [0] } };
    const failed = model.load(query);
    source.requests[0].reject(new Error('Private backend details'));
    await failed;
    model.current = 99;

    const retry = model.retry();
    expect(source.requests[1].query).toEqual(query);
    expect(model.current).toBe(3);
    expect(model.error).toBeNull();
    source.requests[1].resolve({ rows: [{ key: 21, name: 'Recovered' }], total: 35 });
    await retry;

    expect(model.rows).toEqual([{ key: 21, name: 'Recovered' }]);
    expect(model.loading).toBe(false);
  });

  it('snapshots query objects and arrays for the owner and each request', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const query: RemoteTableQuery = { current: 1, pageSize: 5, sorter: { columnKey: 'name', order: 'ascend' }, filters: { name: ['Anna'] } };
    const task = model.load(query);
    query.filters.name.push('External mutation');
    query.sorter!.order = 'descend';
    expect(source.requests[0].query.filters).toEqual({ name: ['Anna'] });
    expect(source.requests[0].query.sorter?.order).toBe('ascend');
    source.requests[0].query.filters.name.push('Loader mutation');

    expect(model.filters).toEqual({ name: ['Anna'] });
    expect(model.sorter).toEqual({ columnKey: 'name', order: 'ascend' });
    source.requests[0].resolve({ rows: [], total: 0 });
    await task;
  });

  it('clears rows while a different page is loading', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const initial = model.load();
    source.requests[0].resolve({ rows: [{ key: 1, name: 'First page' }], total: 20 });
    await initial;
    const next = model.load({ current: 2, pageSize: 5, sorter: null, filters: {} });

    expect(model.rows).toEqual([]);
    expect(model.current).toBe(2);
    expect(model.loading).toBe(true);
    source.requests[1].resolve({ rows: [{ key: 6, name: 'Second page' }], total: 20 });
    await next;
    expect(model.rows[0].name).toBe('Second page');
  });

  it('loads the corrected page after total shrinks before publishing rows', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const task = model.load({ current: 8, pageSize: 10, sorter: null, filters: {} });
    source.requests[0].resolve({ rows: [{ key: 99, name: 'Wrong page' }], total: 15 });
    await vi.waitFor(() => expect(source.requests).toHaveLength(2));

    expect(source.requests[1].query.current).toBe(2);
    expect(model.current).toBe(2);
    expect(model.total).toBe(15);
    expect(model.rows).toEqual([]);
    expect(model.loading).toBe(true);
    source.requests[1].resolve({ rows: [{ key: 11, name: 'Correct page' }], total: 15 });
    await task;

    expect(model.rows).toEqual([{ key: 11, name: 'Correct page' }]);
    expect(model.loading).toBe(false);
  });

  it('ignores a late page correction after a new query starts', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const old = model.load({ current: 8, pageSize: 10, sorter: null, filters: {} });
    source.requests[0].resolve({ rows: [], total: 15 });
    await vi.waitFor(() => expect(source.requests).toHaveLength(2));
    const latest = model.load({ current: 1, pageSize: 5, sorter: null, filters: { active: [true] } });
    expect(source.requests[1].signal.aborted).toBe(true);
    source.requests[2].resolve({ rows: [{ key: 1, name: 'Latest query' }], total: 5 });
    await latest;
    source.requests[1].resolve({ rows: [{ key: 11, name: 'Old correction' }], total: 15 });
    await old;

    expect(model.current).toBe(1);
    expect(model.total).toBe(5);
    expect(model.rows[0].name).toBe('Latest query');
  });

  it('aborts and ignores pending work after disposal and does not start new requests', async () => {
    const source = createSource();
    const model = createRemoteTable(source.load);
    const task = model.load();
    model.dispose();
    expect(source.requests[0].signal.aborted).toBe(true);
    source.requests[0].resolve({ rows: [{ key: 1, name: 'Late data' }], total: 100 });
    await task;
    await model.load();

    expect(source.requests).toHaveLength(1);
    expect(model.rows).toEqual([]);
    expect(model.total).toBe(0);
    expect(model.loading).toBe(false);
    expect(model.error).toBeNull();
  });
});
