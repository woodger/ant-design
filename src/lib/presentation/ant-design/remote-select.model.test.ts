import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRemoteSelect, type RemoteSelectLoader, type RemoteSelectPage } from './remote-select.model.svelte';
function source() {
  const requests: { query: { search: string; cursor?: string }; signal: AbortSignal; resolve: (page: RemoteSelectPage<number>) => void; reject: (error: Error) => void }[] = [];
  const load: RemoteSelectLoader<number> = (query, signal) => new Promise((resolve, reject) => { requests.push({ query, signal, resolve, reject }); });
  return { requests, load };
}
afterEach(() => vi.useRealTimers());
describe('Remote Select consumer model', () => {
  it('defers requests until load and merges overlapping pages in stable order without duplicate loads', async () => {
    const s = source(); const model = createRemoteSelect(s.load);
    expect(s.requests).toHaveLength(0);
    const first = model.load(); s.requests[0].resolve({ options: [{ value: 0, label: 'Zero' }], nextCursor: 'two' }); await first;
    const more = model.more(); model.more(); expect(s.requests).toHaveLength(2); expect(s.requests[1].query.cursor).toBe('two');
    s.requests[1].resolve({ options: [{ value: 0, label: 'Updated' }, { value: 1, label: 'One' }] }); await more;
    expect(model.options).toEqual([{ value: 0, label: 'Updated' }, { value: 1, label: 'One' }]); expect(model.hasMore).toBe(false); model.dispose();
  });
  it('invalidates old responses immediately during debounce and only requests the last query', async () => {
    vi.useFakeTimers(); const s = source(); const model = createRemoteSelect(s.load, 100);
    const old = model.load(); model.search('a'); model.search('ab'); expect(s.requests[0].signal.aborted).toBe(true);
    s.requests[0].resolve({ options: [{ value: 0, label: 'Stale' }] }); await old;
    expect(model.options).toEqual([]); expect(model.loading).toBe(true);
    await vi.advanceTimersByTimeAsync(100); expect(s.requests).toHaveLength(2); expect(s.requests[1].query.search).toBe('ab');
    s.requests[1].resolve({ options: [{ value: 2, label: 'Latest' }] }); await Promise.resolve();
    expect(model.options[0].label).toBe('Latest'); model.dispose();
  });
  it('ignores stale errors without clearing the new loading state', async () => {
    const s = source(); const model = createRemoteSelect(s.load); const old = model.load(); const next = model.load();
    s.requests[0].reject(new Error('old')); await old; expect(model.error).toBeNull(); expect(model.loading).toBe(true);
    s.requests[1].resolve({ options: [] }); await next; expect(model.loading).toBe(false); model.dispose();
  });
  it('retains existing options after a failed page and retries the same cursor', async () => {
    const s = source(); const model = createRemoteSelect(s.load); const first = model.load();
    s.requests[0].resolve({ options: [{ value: 0, label: 'Zero' }], nextCursor: 'next' }); await first;
    const more = model.more(); s.requests[1].reject(new Error('failed')); await more;
    expect(model.error).not.toBeNull(); expect(model.options).toHaveLength(1);
    const retry = model.retry(); expect(s.requests[2].query.cursor).toBe('next'); s.requests[2].resolve({ options: [{ value: 1, label: 'One' }] }); await retry;
    expect(model.options).toHaveLength(2); expect(model.error).toBeNull(); model.dispose();
  });
  it('cancels debounce and in-flight work on disposal, including late completions', async () => {
    vi.useFakeTimers(); const s = source(); const model = createRemoteSelect(s.load); const pending = model.load();
    model.search('later'); model.dispose(); await vi.runAllTimersAsync(); expect(s.requests).toHaveLength(1);
    s.requests[0].resolve({ options: [{ value: 0, label: 'Late' }] }); await pending;
    expect(model.options).toEqual([]); expect(model.loading).toBe(false); await model.retry(); expect(s.requests).toHaveLength(1);
  });
});
