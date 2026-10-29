import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Select from './Select.svelte';
import RemoteSelectExample from '$lib/presentation/ant-design/RemoteSelectExample.svelte';

describe('remote Select SSR', () => {
  it('preserves a selected value outside the current results and omits behavioral props from native HTML', () => {
    const body = render(Select<number>, { props: { options: [], value: 0, name: 'person', searchValue: 'query', showSearch: true, filterOption: false, loading: true, notFoundContent: 'Retry later' } }).body;
    expect(body).toContain('value="0"'); expect(body).toContain('aria-busy="true"'); expect(body).toContain('ant-select-loading');
    expect(body).not.toContain('searchValue='); expect(body).not.toContain('filterOption='); expect(body).not.toContain('notFoundContent=');
  });
  it('uses object search configuration in multiple mode without leaking the query into form values', () => {
    const body = render(Select<number, 'multiple'>, { props: { options: [{ value: 0, label: 'Zero' }], mode: 'multiple', value: [0], name: 'people', showSearch: { searchValue: 'server query', filterOption: false } } }).body;
    expect(body).toContain('value="server query"'); expect(body).toContain('Zero'); expect(body).toContain('type="hidden" name="people" value="0"');
  });
  it('does not start consumer requests or debounce timers while rendering the gallery example', () => {
    vi.useFakeTimers();
    try { const body = render(RemoteSelectExample).body; expect(body).toContain('Поиск участников'); expect(vi.getTimerCount()).toBe(0); }
    finally { vi.useRealTimers(); }
  });
});
