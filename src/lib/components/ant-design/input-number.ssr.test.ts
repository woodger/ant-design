import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import InputNumber, { type InputNumberProps } from './InputNumber.svelte';

describe('InputNumber server rendering', () => {
  it('renders an empty labelled spinbutton and a single empty native field', () => {
    const { body } = render(InputNumber, { props: { name: 'amount', 'aria-label': 'Amount' } });

    expect(body).toContain('role="spinbutton"');
    expect(body).toContain('type="text"');
    expect(body).toContain('aria-label="Amount"');
    expect(body).not.toContain('aria-valuenow=');
    expect(body).toMatch(/<input[^>]*type="hidden"[^>]*name="amount"[^>]*value=""/);
    expect(body.match(/name="amount"/g)).toHaveLength(1);
    expectTypeOf<NonNullable<InputNumberProps['onValueChange']>>().parameter(0).toEqualTypeOf<number | null>();
  });

  it('preserves zero instead of a default and formats precision without changing the native number', () => {
    const { body } = render(InputNumber, { props: { value: 0, defaultValue: 5, precision: 2, name: 'amount' } });

    expect(body).toContain('aria-valuenow="0"');
    expect(body).toContain('value="0.00"');
    expect(body).toMatch(/<input[^>]*type="hidden"[^>]*value="0"/);
  });

  it('uses a snapshotted default and respects an explicit empty owner value', () => {
    const defaults = render(InputNumber, { props: { defaultValue: 1.5 } }).body;
    const empty = render(InputNumber, { props: { value: null, defaultValue: 1.5 } }).body;

    expect(defaults).toContain('aria-valuenow="1.5"');
    expect(empty).not.toContain('aria-valuenow=');
  });

  it('retains an out-of-range owner value and exposes numeric bounds without notifying the owner', () => {
    const { body } = render(InputNumber, { props: {
      value: 12.001, min: 0, max: 12, precision: 2, name: 'amount',
      onValueChange: () => { throw new Error('Unexpected value callback'); }
    } });

    expect(body).toContain('value="12.00"');
    expect(body).toContain('aria-valuenow="12.001"');
    expect(body).toContain('aria-valuemin="0"');
    expect(body).toContain('aria-valuemax="12"');
    expect(body).toContain('ant-input-number-out-of-range');
    expect(body).toMatch(/ant-input-number-action-up[^>]*\sdisabled(?:[\s=>])/);
  });

  it('disables native submission and removes handlers while disabled', () => {
    const { body } = render(InputNumber, { props: { value: 3, disabled: true, name: 'amount', form: 'external' } });

    expect(body).toMatch(/<input[^>]*type="text"[^>]*\sdisabled(?:[\s=>])/);
    expect(body).toMatch(/<input[^>]*type="hidden"[^>]*\sdisabled(?:[\s=>])/);
    expect(body).toContain('form="external"');
    expect(body).not.toContain('<button');
  });

  it('keeps readonly values submittable and exposes size and validation status', () => {
    const { body } = render(InputNumber, { props: { value: -2, readonly: true, name: 'amount', size: 'small', status: 'error' } });

    expect(body).toMatch(/<input[^>]*type="text"[^>]*\sreadonly(?:[\s=>])/);
    expect(body).toContain('ant-input-number-sm');
    expect(body).toContain('aria-invalid="true"');
    expect(body).not.toContain('<button');
    expect(body).not.toMatch(/<input[^>]*type="hidden"[^>]*\sdisabled(?:[\s=>])/);
  });

  it('escapes caller content and keeps non-finite values out of the rendered numeric field', () => {
    const { body } = render(InputNumber, { props: { value: NaN, 'aria-label': '"><script>alert(1)</script>', name: 'amount', controls: false } });

    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).not.toContain('value="NaN"');
    expect(body).not.toContain('<button');
    expect(body).toContain('&quot;');
  });
});
