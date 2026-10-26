import { describe, expect, it } from 'vitest';
import { createForm } from './form.model.svelte';
import { FormValidationError } from './FormValidationError';

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((complete) => { resolve = complete; });

  return { promise, resolve };
}

describe('createForm', () => {
  it('keeps values and errors isolated between form instances', async () => {
    const first = createForm({ initialValues: { email: '' }, rules: { email: [{ required: true }] } });
    const second = createForm({ initialValues: { email: '' } });

    first.setFieldValue('email', 'first@example.com');
    await first.validateFields();

    expect(first.values.email).toBe('first@example.com');
    expect(second.values.email).toBe('');
    expect(second.errors).toEqual({});
  });

  it('returns validation errors without invoking the submission callback', async () => {
    const form = createForm({ initialValues: { email: '' }, rules: { email: [{ required: true, message: 'Email required' }] } });
    let submitted = false;

    const result = await form.submit(() => { submitted = true; });

    expect(result.status).toBe('invalid');
    expect(form.getFieldError('email')).toEqual(['Email required']);
    expect(form.isFieldTouched('email')).toBe(true);
    expect(submitted).toBe(false);
    expect(form.isSubmitting).toBe(false);
  });

  it('submits validated values once while an earlier submission is pending', async () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    const pending = deferred<void>();
    const entered = deferred<void>();
    const submitted: string[] = [];
    const first = form.submit(async (values) => {
      submitted.push(values.name);
      entered.resolve();
      await pending.promise;
    });
    await entered.promise;

    const second = await form.submit(() => { submitted.push('duplicate'); });

    expect(second.status).toBe('busy');
    expect(form.isSubmitting).toBe(true);
    expect(submitted).toEqual(['Anna']);

    pending.resolve();

    expect((await first).status).toBe('success');
    expect(form.isSubmitting).toBe(false);
  });

  it('does not apply an asynchronous error after a field value changes', async () => {
    const pending = deferred<string>();
    const form = createForm({
      initialValues: { email: 'old@example.com' },
      rules: { email: [{ validator: () => pending.promise }] }
    });
    const validation = form.validateFields().catch((error: unknown) => error);

    form.setFieldValue('email', 'new@example.com');
    pending.resolve('Email is taken');
    const error = await validation;

    expect(error).toBeInstanceOf(FormValidationError);
    expect((error as FormValidationError).outOfDate).toBe(true);
    expect(form.getFieldError('email')).toEqual([]);
    expect(form.values.email).toBe('new@example.com');
  });

  it('keeps the newest validation result when requests finish in reverse order', async () => {
    const older = deferred<string>();
    const newer = deferred<void>();
    let attempt = 0;
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => ++attempt === 1 ? older.promise : newer.promise }] }
    });
    const first = form.validateFields().catch((error: unknown) => error);
    const second = form.validateFields();

    newer.resolve();
    await second;
    older.resolve('Stale error');
    await first;

    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('invalidates pending validation when the form is reset', async () => {
    const pending = deferred<string>();
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => pending.promise }] }
    });
    const validation = form.validateFields().catch((error: unknown) => error);

    form.resetFields();
    pending.resolve('Stale error');
    await validation;

    expect(form.values).toEqual({ name: 'Anna' });
    expect(form.getFieldError('name')).toEqual([]);
    expect(form.isFieldTouched('name')).toBe(false);
    expect(form.isFieldValidating('name')).toBe(false);
  });

  it('rejects submission of values changed during asynchronous validation', async () => {
    const pending = deferred<void>();
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => pending.promise }] }
    });
    let submitted = false;
    const submission = form.submit(() => { submitted = true; });

    form.resetFields();
    pending.resolve();
    const result = await submission;

    expect(result.status).toBe('invalid');
    expect(submitted).toBe(false);
  });

  it('keeps an active submission valid when disabling a field causes it to blur', async () => {
    const pending = deferred<void>();
    const form = createForm({
      initialValues: { name: 'Anna' },
      rules: { name: [{ validator: () => pending.promise }] }
    });
    let submitted = false;
    const submission = form.submit(() => { submitted = true; });

    form.touchField('name');
    pending.resolve();
    const result = await submission;

    expect(result.status).toBe('success');
    expect(submitted).toBe(true);
  });

  it('revalidates touched dependent fields after another field changes', async () => {
    const form = createForm({
      initialValues: { password: 'first', confirmation: 'first' },
      rules: { confirmation: [{ validator: (value, values) => value === values.password ? undefined : 'Mismatch' }] }
    });
    form.touchField('confirmation');
    await form.validateFields(['confirmation']);

    form.setFieldValue('password', 'second');
    await expect(form.validateFields(['confirmation'])).rejects.toMatchObject({ errors: { confirmation: ['Mismatch'] } });

    expect(form.getFieldError('confirmation')).toEqual(['Mismatch']);
  });

  it('restores initial values and clears errors and touched state', async () => {
    const form = createForm({ initialValues: { name: 'Anna' }, rules: { name: [{ required: true }] } });
    form.setFieldValue('name', '');
    await form.submit(() => {});

    form.resetFields();

    expect(form.values).toEqual({ name: 'Anna' });
    expect(form.errors).toEqual({});
    expect(form.isFieldTouched('name')).toBe(false);
  });

  it('preserves untouched fields when applying partial values', () => {
    const form = createForm({ initialValues: { name: 'Anna', role: 'developer' } });

    form.setFieldsValue({ role: 'designer' });

    expect(form.values).toEqual({ name: 'Anna', role: 'designer' });
  });

  it('exposes submission failures and releases the submission lock for retry', async () => {
    const form = createForm({ initialValues: { name: 'Anna' } });
    const error = new Error('Save failed');

    const failed = await form.submit(async () => { throw error; });

    expect(failed).toEqual({ status: 'failed', error });
    expect(form.submissionError).toBe(error);
    expect(form.isSubmitting).toBe(false);

    const retry = await form.submit(() => {});

    expect(retry.status).toBe('success');
    expect(form.submissionError).toBeUndefined();
  });
});
