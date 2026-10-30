import dayjs from 'dayjs';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { RangePicker } from 'antd-svelte';
import RangePickerFixtures from '../browser/fixtures/RangePickerFixtures.svelte';

describe('RangePicker SSR', () => {
  it('renders two formatted Dayjs boundaries with native names and separate ids', () => {
    const body = render(
      RangePicker,
      {
        props: {
          value: [dayjs('2026-10-10T10:20:30'), dayjs('2026-10-20T14:15:16')],
          showTime: true,
          name: 'period',
          id: { start: 'from', end: 'to' }
        }
      }
    ).body;

    expect(body.match(/name="period"/g)).toHaveLength(2);
    expect(body).toContain('id="from"');
    expect(body).toContain('id="to"');
    expect(body).toContain('value="2026-10-10 10:20:30"');
    expect(body).toContain('value="2026-10-20 14:15:16"');
    expect(body).not.toContain('role="dialog"');
    expect(body).not.toContain('[object Object]');
  });
  it('gives controlled null priority over defaults and preserves disabled empty boundaries', () => {
    const body = render(
      RangePicker,
      {
        props: {
          value: null,
          defaultValue: [dayjs('2026-01-01'), dayjs('2026-01-02')],
          disabled: [true, false],
          allowEmpty: [true, false]
        }
      }
    ).body;

    expect(body.match(/value=""/g)).toHaveLength(2);
    expect(body.match(/ disabled/g)).toHaveLength(1);
    expect(body).not.toContain('value="2026-01-01"');
  });
  it('renders initially open twin panels hidden until browser positioning', () => {
    const body = render(
      RangePicker,
      { props: { defaultOpen: true, defaultPickerValue: dayjs('2026-10-01') } }
    ).body;

    expect(body).toMatch(/role="dialog"[^>]*hidden/);
    expect(body.match(/role="grid"/g)).toHaveLength(2);
    expect(body).toContain('data-picker-date="2026-11-15"');
    expect(body).not.toContain('ant-picker-now-btn');
  });
  it('renders locale and Form examples without browser APIs or timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(RangePickerFixtures).body;
      expect(body).toContain('Начальная дата');
      expect(body).toContain('Конечная дата');
      expect(body).toContain('2026-10-10 10:20:30');
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
