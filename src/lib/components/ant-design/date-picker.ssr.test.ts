import dayjs from 'dayjs';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import DatePicker from './DatePicker.svelte';
import DatePickerFixtures from '../../../../e2e/fixtures/DatePickerFixtures.svelte';

describe('DatePicker SSR', () => {
  it('renders Dayjs values and native form names without serializing the object as ISO', () => {
    const body = render(DatePicker, { props: { value: dayjs('2026-10-15T12:34:56.789'), showTime: true, name: 'when', 'aria-label': 'Date' } }).body;
    expect(body).toContain('value="2026-10-15 12:34:56"'); expect(body).toContain('name="when"'); expect(body).toContain('aria-haspopup="dialog"'); expect(body).toContain('aria-expanded="false"');
    expect(body).not.toContain('role="dialog"'); expect(body).not.toContain('[object Object]');
  });
  it('gives null priority over defaultValue and supports callback display formats', () => {
    const empty = render(DatePicker, { props: { value: null, defaultValue: dayjs('2026-01-01') } }).body;
    expect(empty).toContain('value=""'); expect(empty).not.toContain('value="2026-01-01"');
    const custom = render(DatePicker, { props: { value: dayjs('2026-01-02'), format: value => `Date ${value.date()}` } }).body;
    expect(custom).toContain('value="Date 2"'); expect(custom).toContain('readonly');
  });
  it('renders locale, disabled and datetime defaults without browser APIs or timers', () => {
    vi.useFakeTimers();
    try { const body = render(DatePickerFixtures).body; expect(body).toContain('Выберите дату'); expect(body).toContain('2026-10-15 10:20:30'); expect(vi.getTimerCount()).toBe(0); }
    finally { vi.useRealTimers(); }
  });
});

it('renders an initially open datetime panel for SSR without opening a browser surface', () => {
  const body = render(DatePicker, { props: { defaultOpen: true, defaultValue: dayjs('2026-10-15T10:20:30.123'), showTime: true } }).body;
  expect(body).toContain('aria-expanded="true"'); expect(body).toContain('role="dialog"'); expect(body).toMatch(/role="dialog"[^>]*hidden/);
  expect(body).toContain('role="grid"'); expect(body).toContain('data-picker-date="2026-10-15"'); expect(body).toContain('ant-picker-time-panel');
});
