import { describe, expect, it } from 'vitest';
import { createSwitchSetting, type SwitchSettingSaver } from './switch-setting.model.svelte';

function createSource() {
  const requests: { checked: boolean; signal: AbortSignal; resolve: () => void; reject: (error: Error) => void }[] = [];
  const save: SwitchSettingSaver = (checked, signal) => new Promise((resolve, reject) => {
    requests.push({ checked, signal, resolve, reject });
  });

  return { requests, save };
}

describe('Switch setting presentation model', () => {
  it('shows the requested state immediately and commits the saved state only after success', async () => {
    const source = createSource();
    const model = createSwitchSetting(source.save);
    const task = model.change(true);

    expect(model.checked).toBe(true);
    expect(model.saved).toBe(false);
    expect(model.loading).toBe(true);
    expect(source.requests[0].checked).toBe(true);
    expect(source.requests[0].signal.aborted).toBe(false);
    source.requests[0].resolve();
    await task;

    expect(model.saved).toBe(true);
    expect(model.loading).toBe(false);
    expect(model.error).toBeNull();
  });

  it('ignores unchanged values and overlapping requests while saving', async () => {
    const source = createSource();
    const model = createSwitchSetting(source.save);
    await model.change(false);
    expect(source.requests).toEqual([]);
    const task = model.change(true);
    await model.change(false);
    await model.change(true);

    expect(source.requests).toHaveLength(1);
    expect(model.checked).toBe(true);
    source.requests[0].resolve();
    await task;
    expect(model.saved).toBe(true);
  });

  it('rolls back a failed change, reports a safe error and clears it when retrying', async () => {
    const source = createSource();
    const model = createSwitchSetting(source.save);
    const failed = model.change(true);
    source.requests[0].reject(new Error('Private backend details'));
    await failed;

    expect(model.checked).toBe(false);
    expect(model.saved).toBe(false);
    expect(model.loading).toBe(false);
    expect(model.error).toBe('Не удалось сохранить настройку. Попробуйте ещё раз.');
    const retry = model.change(true);
    expect(model.error).toBeNull();
    source.requests[1].resolve();
    await retry;
    expect(model.checked).toBe(true);
    expect(model.saved).toBe(true);
  });

  it('saves false as a real value from an initially enabled setting', async () => {
    const source = createSource();
    const model = createSwitchSetting(source.save, true);
    const task = model.change(false);

    expect(source.requests[0].checked).toBe(false);
    expect(model.checked).toBe(false);
    expect(model.saved).toBe(true);
    source.requests[0].resolve();
    await task;
    expect(model.saved).toBe(false);
  });

  it.each(['resolve', 'reject'] as const)('aborts pending work and ignores a late %s after disposal', async (completion) => {
    const source = createSource();
    const model = createSwitchSetting(source.save);
    const task = model.change(true);
    model.dispose();

    expect(source.requests[0].signal.aborted).toBe(true);
    if (completion === 'resolve') source.requests[0].resolve();
    else source.requests[0].reject(new Error('Late failure'));
    await task;
    await model.change(true);

    expect(source.requests).toHaveLength(1);
    expect(model.checked).toBe(false);
    expect(model.saved).toBe(false);
    expect(model.loading).toBe(false);
    expect(model.error).toBeNull();
  });
});
