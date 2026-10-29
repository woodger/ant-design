import { render } from 'svelte/server';
import { describe, it, expect, vi } from 'vitest';
import Mentions from './Mentions.svelte';
import MentionsFixtures from '../../../../e2e/fixtures/MentionsFixtures.svelte';
describe('Mentions SSR', () => {
  it('renders native textarea text and constraints without measuring or opening a popup', () => {
    const body = render(Mentions, { props: { value: '<@alice>', name: 'note', required: true, rows: 3 } }).body;
    expect(body).toContain('&lt;@alice>'); expect(body).toContain('name="note"'); expect(body).toContain('required'); expect(body).toContain('rows="3"'); expect(body).not.toContain('role="listbox"');
  });
  it('keeps controlled empty text ahead of defaultValue and preserves readonly', () => {
    const body = render(Mentions, { props: { value: '', defaultValue: 'seed', readonly: true } }).body;
    expect(body).not.toContain('seed'); expect(body).toContain('readonly'); expect(body).toContain('aria-expanded="false"');
  });
  it('renders autosize fixtures without browser measurements or timers on the server', () => {
    vi.useFakeTimers(); try { const body = render(MentionsFixtures).body; expect(body).toContain('seed'); expect(body).toContain('Autosize mentions'); expect(vi.getTimerCount()).toBe(0); } finally { vi.useRealTimers(); }
  });
});
