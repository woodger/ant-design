import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { InputOTP } from 'antd-svelte';
import InputOTPFixtures from '../browser/fixtures/InputOTPFixtures.svelte';

describe('InputOTP public package SSR', () => {
  it('exports a group with formatted default cells and numeric separators', () => {
    const body = render(InputOTP, { props: { defaultValue: 'ab', length: 3, separator: 0 } }).body;

    expect(body).toContain('role="group"');
    expect(body).toContain('value="a"');
    expect(body).toContain('value="b"');
    expect(body.match(/ant-otp-separator/g)).toHaveLength(2);
  });

  it('renders inherited config and keeps FormItem associations on the group', () => {
    const body = render(InputOTPFixtures).body;
    const inputs = body.match(/<input[^>]*aria-label="OTP Input [^"]*"[^>]*>/g)!;

    expect(body).toContain('otp-context');
    expect(body).toContain('input-context');
    expect(body).toContain('ant-input-underlined');
    expect(body).toContain('ant-input-borderless');
    expect(body).toContain('aria-label="Form code"');
    expect(inputs.length).toBeGreaterThan(6);
    expect(inputs.every(input => !/\s(?:id|name|required)=/.test(input))).toBe(true);
  });
});
