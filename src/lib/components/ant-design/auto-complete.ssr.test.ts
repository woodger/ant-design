import { render } from 'svelte/server';
import { describe, it, expect, vi } from 'vitest';
import AutoComplete from './AutoComplete.svelte';
import AutoCompleteFixtures from '../../../../e2e/fixtures/AutoCompleteFixtures.svelte';
describe('AutoComplete SSR', () => {
  it('renders arbitrary text as native form value and gives controlled empty value priority', () => {
    const body = render(AutoComplete, { props: { value: 'free text', name: 'query', options: [] } }).body;
    expect(body).toContain('value="free text"'); expect(body).toContain('name="query"'); expect(body).toContain('role="combobox"');
    expect(render(AutoComplete, { props: { value: '', defaultValue: 'seed' } }).body).not.toContain('value="seed"');
  });
  it('keeps even a default-open popup closed during SSR without timers', () => {
    vi.useFakeTimers();
    try {
      const body = render(AutoComplete, { props: { defaultOpen: true, options: [{ value: 'a' }] } }).body;
      expect(body).toContain('aria-expanded="false"'); expect(body).not.toContain('role="listbox"'); expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it('renders a custom native textarea without changing its rows or class', () => {
    const body = render(AutoCompleteFixtures).body;
    expect(body).toContain('rows="3"'); expect(body).toContain('custom-completion'); expect(body).toContain('value="seed"');
  });
});
