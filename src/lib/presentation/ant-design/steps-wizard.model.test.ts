import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStepsWizard } from './steps-wizard.model.svelte';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
async function advance(model: ReturnType<typeof createStepsWizard>) { await model.form.submit(() => { model.acceptData(); }); }

describe('Steps form workflow', () => {
  it('starts with only the data step unlocked and no timers', () => {
    const model = createStepsWizard(); expect(model.current).toBe(0); expect(model.unlocked).toBe(0); expect(model.busy).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps invalid data on its initial step and only advances after Form validates it', async () => {
    const model = createStepsWizard(); model.form.setFieldValue('name', ''); await advance(model);
    expect(model.current).toBe(0); expect(model.form.getFieldError('name')).toEqual(['Введите имя']); expect(await model.goTo(1)).toBe(false);
    model.form.setFieldValue('name', 'Мария'); await advance(model); expect(model.current).toBe(1); expect(model.unlocked).toBe(1); expect(model.review()).toBe(true); expect(model.current).toBe(2);
  });
  it('preserves the draft on return and revalidates jumps from edited data to an unlocked step', async () => {
    const model = createStepsWizard(); await advance(model); model.review(); await model.goTo(0);
    expect(model.form.values.email).toBe('anna@example.com'); model.form.setFieldValue('email', 'invalid');
    expect(await model.goTo(2)).toBe(false); expect(model.current).toBe(0); expect(model.validationFailed).toBe(true);
    model.form.setFieldValue('email', 'new@example.com'); expect(await model.goTo(2)).toBe(true); expect(model.current).toBe(2); expect(model.validationFailed).toBe(false);
  });
  it('rejects unavailable, invalid and duplicate navigation without submitting', async () => {
    const model = createStepsWizard(); for (const index of [-1, 0, 1, 2, 4, NaN, 0.5]) expect(await model.goTo(index)).toBe(false);
    expect(await model.send()).toBe(false); expect(model.review()).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('finishes all steps after sending once and keeps values when editing the result', async () => {
    const model = createStepsWizard(); model.form.setFieldValue('name', 'Мария'); await advance(model); model.review();
    const request = model.send(); expect(await model.send()).toBe(false); expect(await model.goTo(0)).toBe(false);
    await vi.advanceTimersByTimeAsync(700); expect(await request).toBe(true); expect(model.current).toBe(3); expect(model.status).toBe('success'); expect(model.submitted?.name).toBe('Мария');
    expect(await model.goTo(0)).toBe(true); expect(model.form.values.name).toBe('Мария'); expect(model.status).toBe('editing');
  });
  it('keeps the final step in error and successfully retries the preserved draft', async () => {
    const model = createStepsWizard(); await advance(model); model.review(); const failure = model.send(true);
    await vi.advanceTimersByTimeAsync(700); await failure; expect(model.current).toBe(2); expect(model.status).toBe('error');
    const retry = model.send(); await vi.advanceTimersByTimeAsync(700); await retry; expect(model.current).toBe(3); expect(model.submitted?.email).toBe('anna@example.com');
  });
  it('returns to invalid data if the owner changes hidden fields before sending', async () => {
    const model = createStepsWizard(); await advance(model); model.review(); model.form.setFieldValue('name', '');
    expect(await model.send()).toBe(false); expect(model.current).toBe(0); expect(model.validationFailed).toBe(true); expect(vi.getTimerCount()).toBe(0);
  });
  it('resets pending work and prevents an older result from finishing a newer workflow', async () => {
    const model = createStepsWizard(); await advance(model); model.review(); const old = model.send(); await vi.advanceTimersByTimeAsync(100); model.reset();
    expect(await old).toBe(false); expect(model.current).toBe(0); expect(model.unlocked).toBe(0); expect(model.submitted).toBeUndefined();
    model.form.setFieldValue('name', 'Новая'); await advance(model); model.review(); const next = model.send();
    await vi.advanceTimersByTimeAsync(600); expect(model.current).toBe(2); expect(model.busy).toBe(true);
    await vi.advanceTimersByTimeAsync(100); await next; expect(model.current).toBe(3); expect(model.submitted?.name).toBe('Новая'); expect(vi.getTimerCount()).toBe(0);
  });
  it('invalidates pending validation when reset or unmounted', async () => {
    for (const dispose of ['reset', 'destroy'] as const) {
      const model = createStepsWizard(); await advance(model); model.review(); await model.goTo(0); const next = model.goTo(2); model[dispose]();
      expect(await next).toBe(false); expect(model.current).toBe(0); expect(vi.getTimerCount()).toBe(0);
    }
  });
  it('settles pending work on unmount and ignores further actions', async () => {
    const model = createStepsWizard(); await advance(model); model.review(); const request = model.send(); await vi.advanceTimersByTimeAsync(100); model.destroy();
    expect(await request).toBe(false); await vi.advanceTimersByTimeAsync(1000); expect(model.current).toBe(2); expect(model.submitted).toBeUndefined(); expect(await model.goTo(0)).toBe(false); expect(model.acceptData()).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
});
