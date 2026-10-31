import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import InputOTP from './InputOTP.svelte';

describe('InputOTP SSR', () => {
  it('renders six labelled text inputs with native size rather than maxLength', () => {
    const body = render(InputOTP).body;
    const inputs = body.match(/<input[^>]*>/g)!;

    expect(body).toContain('role="group"');
    expect(body).toContain('ant-otp-css-var');
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toContain('aria-label="OTP Input 1"');
    expect(inputs[5]).toContain('aria-label="OTP Input 6"');
    expect(inputs[0]).toContain('type="text"');
    expect(inputs[0]).toContain('size="1"');
    expect(body).not.toMatch(/\s(?:name|maxlength)=/);
  });

  it(
    'formats defaultValue and leaves controlled value synchronization to mount like upstream',
    () => {
      const body = render(InputOTP, {
        props: {
          length: 4,
          defaultValue: 'ab',
          value: '1234',
          formatter: text => text.toUpperCase(),
          onInput: () => {
            throw new Error('input callback on SSR');
          },
          onChange: () => {
            throw new Error('change callback on SSR');
          }
        }
      }).body;
      const inputs = body.match(/<input[^>]*>/g)!;

      expect(inputs).toHaveLength(4);
      expect(inputs[0]).toContain('value="A"');
      expect(inputs[1]).toContain('value="B"');
      expect(inputs[2]).toContain('value=""');
      expect(body).not.toContain('1234');
    }
  );

  it(
    'renders decorative masks without replacing the field values and permits an explicit type',
    () => {
      const body = render(InputOTP, {
        props: {
          length: 3,
          defaultValue: '12',
          mask: '🔒',
          type: 'number',
          autoComplete: 'one-time-code'
        }
      }).body;

      expect(body.match(/ant-otp-mask-icon/g)).toHaveLength(2);
      expect(body).toContain('aria-hidden="true"');
      expect(body).toContain('🔒');
      expect(body).toContain('value="1"');
      expect(body.match(/type="number"/g)).toHaveLength(3);
      expect(body.match(/autocomplete="one-time-code"/g)).toHaveLength(3);
      expect(body).toContain('ant-otp-mask-input');
    }
  );

  it('renders numeric zero separators and skips false null and empty separators', () => {
    const body = render(InputOTP, { props: { length: 4, separator: index => index } }).body;

    expect(body.match(/ant-otp-separator/g)).toHaveLength(3);
    expect(body).toContain('>0<');
    expect(body).toContain('>1<');
    expect(body).toContain('>2<');
    expect(render(InputOTP, { props: { separator: false } }).body)
      .not.toContain('ant-otp-separator');
    expect(render(InputOTP, { props: { separator: '' } }).body)
      .not.toContain('ant-otp-separator');
    expect(render(InputOTP, { props: { separator: true } }).body.match(/ant-otp-separator/g))
      .toHaveLength(5);
  });

  it('resolves variant and length for semantics and keeps root attributes out of inputs', () => {
    const body = render(InputOTP, {
      props: {
        length: 2,
        variant: 'filled',
        size: 'large',
        id: 'code',
        class: 'owner',
        rootClassName: 'root-only',
        'aria-label': 'Code',
        classNames: ({ props }) => ({
          root: props.length === 2 && props.variant === 'filled' ? 'resolved' : 'incorrect',
          input: 'custom-cell'
        }),
        styles: { root: 'color:red', input: 'color:blue' },
        style: 'color:green'
      }
    }).body;
    const input = body.match(/<input[^>]*>/)![0];

    expect(body).toContain('resolved');
    expect(body).toContain('ant-otp-lg');
    expect(body).toContain('color:red;color:green');
    expect(input).toContain('ant-input-filled');
    expect(input).toContain('custom-cell');
    expect(input).not.toMatch(/id="code"|root-only|aria-label="Code"/);
    expect(render(InputOTP, { props: { length: 0 } }).body).not.toContain('<input');
  });
});
