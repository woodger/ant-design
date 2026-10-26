import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemberSource } from './remote-members';
import type { RemoteTableQuery } from './remote-table.model.svelte';

afterEach(() => { vi.useRealTimers(); });

const query: RemoteTableQuery = { current: 1, pageSize: 5, sorter: null, filters: {} };

describe('Remote member demo source', () => {
  it('returns a page and the full filtered count after applying query parameters', async () => {
    vi.useFakeTimers();
    const source = createMemberSource();
    const request = source.load({ current: 1, pageSize: 2, sorter: { columnKey: 'tasks', order: 'descend' }, filters: { team: ['Дизайн'], active: [false] } }, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(350);
    const page = await request;

    expect(page.total).toBe(3);
    expect(page.rows.map((row) => row.key)).toEqual([17, 2]);
  });

  it('fails one requested attempt and allows the next request to succeed', async () => {
    vi.useFakeTimers();
    const source = createMemberSource();
    source.failNextRequest();
    const failure = expect(source.load(query, new AbortController().signal)).rejects.toThrow('Demo request failed');
    await vi.advanceTimersByTimeAsync(350);
    await failure;
    const retry = source.load(query, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(350);

    expect((await retry).rows).toHaveLength(5);
  });

  it('rejects an aborted request and releases its pending timer', async () => {
    vi.useFakeTimers();
    const source = createMemberSource();
    const controller = new AbortController();
    const failure = expect(source.load(query, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await failure;

    expect(vi.getTimerCount()).toBe(0);
  });
});
