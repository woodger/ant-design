import { render } from 'svelte/server';
import { describe, it, expect, vi } from 'vitest';
import ImagePreviewGroup from './ImagePreviewGroup.svelte';
import ImageGroupFixtures from '../../../../e2e/fixtures/ImageGroupFixtures.svelte';
describe('ImagePreviewGroup SSR', () => {
  it('does not create a portal or enumerate browser registrations during SSR even with controlled open', () => {
    const body = render(ImagePreviewGroup, { props: { items: ['a.svg', 'b.svg'], preview: { open: true, current: 1 } } }).body;
    expect(body).not.toContain('<dialog'); expect(body).not.toContain('<img');
  });
  it('renders original thumbnail children and does not create timers or preview controls', () => {
    vi.useFakeTimers(); try { const body = render(ImageGroupFixtures).body; expect(body).toContain('Group one'); expect(body).toContain('Group disabled'); expect(body).not.toContain('ant-image-preview-switch'); expect(vi.getTimerCount()).toBe(0); } finally { vi.useRealTimers(); }
  });
});
