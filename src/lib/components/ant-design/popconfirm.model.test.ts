import { describe, expect, it } from 'vitest';
import { createPopconfirmAction } from './popconfirm.model.svelte';

function setup() {
  let session: object | null = {};
  const results: unknown[] = [];
  const requests: { resolve: () => void; reject: (error: Error) => void }[] = [];
  const action = () => new Promise<void>((resolve, reject) => { requests.push({ resolve, reject }); });
  const model = createPopconfirmAction(() => session, { onSuccess: () => results.push('confirmed'), onError: (error) => results.push(error) });

  return { model, action, requests, results, setSession: (next: object | null) => { session = next; } };
}

describe('Popconfirm action model', () => {
  it('completes a synchronous confirmation immediately', () => {
    const { model, results } = setup();
    model.run(() => {});

    expect(model.loading).toBe(false);
    expect(results).toEqual(['confirmed']);
  });

  it('keeps a Promise pending and completes only after success', async () => {
    const { model, action, requests, results } = setup();
    const task = model.run(action);

    expect(model.loading).toBe(true);
    expect(results).toEqual([]);
    requests[0].resolve();
    await task;
    expect(model.loading).toBe(false);
    expect(results).toEqual(['confirmed']);
  });

  it('ignores overlapping confirmation attempts in the same opening', async () => {
    const { model, action, requests, results } = setup();
    const task = model.run(action);
    model.run(action);
    model.run(action);

    expect(requests).toHaveLength(1);
    requests[0].resolve();
    await task;
    expect(results).toEqual(['confirmed']);
  });

  it('reports a synchronous failure without throwing and allows retry', () => {
    const { model, results } = setup();
    const error = new Error('Failed action');
    model.run(() => { throw error; });

    expect(model.loading).toBe(false);
    expect(results).toEqual([error]);
    model.run(() => {});
    expect(results).toEqual([error, 'confirmed']);
  });

  it('handles a rejected Promise and accepts a new attempt', async () => {
    const { model, action, requests, results } = setup();
    const failed = model.run(action);
    const error = new Error('Request failed');
    requests[0].reject(error);
    await failed;

    expect(model.loading).toBe(false);
    expect(results).toEqual([error]);
    const retry = model.run(action);
    expect(model.loading).toBe(true);
    requests[1].resolve();
    await retry;
    expect(results).toEqual([error, 'confirmed']);
  });

  it('does not start an action without an active opening', () => {
    const { model, action, requests, setSession } = setup();
    setSession(null);
    model.run(action);

    expect(requests).toEqual([]);
    expect(model.loading).toBe(false);
  });

  it.each(['resolve', 'reject'] as const)('ignores a late %s after closing', async (completion) => {
    const { model, action, requests, results, setSession } = setup();
    const task = model.run(action);
    setSession(null);

    expect(model.loading).toBe(false);
    if (completion === 'resolve') requests[0].resolve();
    else requests[0].reject(new Error('Late failure'));
    await task;
    expect(results).toEqual([]);
  });

  it.each(['resolve', 'reject'] as const)('keeps a newer attempt pending after an older %s', async (completion) => {
    const { model, action, requests, results, setSession } = setup();
    const old = model.run(action);
    setSession({});
    const current = model.run(action);

    if (completion === 'resolve') requests[0].resolve();
    else requests[0].reject(new Error('Stale failure'));
    await old;
    expect(model.loading).toBe(true);
    expect(results).toEqual([]);
    requests[1].resolve();
    await current;
    expect(model.loading).toBe(false);
    expect(results).toEqual(['confirmed']);
  });

  it.each(['resolve', 'reject'] as const)('ignores a late %s after disposal', async (completion) => {
    const { model, action, requests, results } = setup();
    const task = model.run(action);
    model.dispose();

    if (completion === 'resolve') requests[0].resolve();
    else requests[0].reject(new Error('Late failure'));
    await task;
    model.run(action);
    expect(model.loading).toBe(false);
    expect(requests).toHaveLength(1);
    expect(results).toEqual([]);
  });

  it('registers an attempt before invoking a reentrant owner callback', async () => {
    const { model, action, requests, results } = setup();
    const task = model.run(() => { model.run(action); return action(); });

    expect(requests).toHaveLength(1);
    requests[0].resolve();
    await task;
    expect(results).toEqual(['confirmed']);
  });

});
