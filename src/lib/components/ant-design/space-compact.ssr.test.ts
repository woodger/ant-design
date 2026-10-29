import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import SpaceCompact from './SpaceCompact.svelte';
import SpaceAddon from './SpaceAddon.svelte';
import Fixtures from '../../../../e2e/fixtures/SpaceCompactFixtures.svelte';

function inputTag(body: string, label: string) {
  return body.match(new RegExp(`<input[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';
}

describe('Space Compact SSR', () => {
  it('omits empty groups while preserving source empty-string positions and primitive zero', () => {
    expect(render(SpaceCompact).body).not.toContain('<div');
    expect(render(SpaceCompact, { props: { items: [false, true, null] } }).body).not.toContain('<div');
    expect(render(SpaceCompact, { props: { items: [''], block: true } }).body).toContain('ant-space-compact-block');
    expect(render(SpaceCompact, { props: { items: [0] } }).body).toMatch(/>.*?0</s);
  });
  it('propagates size and boundary classes without adding item wrappers around controls', () => {
    const body = render(Fixtures).body;
    expect(inputTag(body, 'Compact draft')).toContain('ant-input-sm');
    expect(inputTag(body, 'Compact draft')).toContain('ant-input-compact-first-item');
    expect(inputTag(body, 'Compact draft')).not.toContain('ant-input-compact-last-item');
    expect(body).toMatch(/class="[^"]*ant-input-number-compact-item[^"]*fixture-compact-number/);
    expect(body).toMatch(/class="[^"]*ant-select-compact-item[^"]*fixture-compact-select/);
    expect(body).toMatch(/aria-label="Apply compact group"[^>]*class="[^"]*ant-btn-compact-last-item/);
    expect(body).not.toContain('class="ant-space-item"');
  });
  it('passes only outer boundary flags through nested groups and uses vertical Button classes', () => {
    const body = render(Fixtures).body;
    expect(inputTag(body, 'Nested first')).toContain('ant-input-compact-first-item');
    expect(inputTag(body, 'Nested end input')).not.toContain('ant-input-compact-first-item');
    expect(body).toMatch(/id="nested-compact-last"[^>]*class="[^"]*ant-btn-compact-last-item/);
    expect(body).toContain('ant-btn-compact-vertical-first-item');
    expect(body).toContain('ant-btn-compact-vertical-last-item');
  });
  it('isolates Modal Drawer and Popover content from Compact while retaining the global provider size', () => {
    const body = render(Fixtures).body;
    for (const label of ['Modal independent input', 'Drawer independent input', 'Popover independent input']) {
      const tag = inputTag(body, label);
      expect(tag).toContain('ant-input-lg');
      expect(tag).not.toContain('ant-input-compact-item');
    }
  });
  it('applies Addon variants and explicit status/disabled without requiring a Compact context', () => {
    const body = render(SpaceAddon, { props: { variant: 'filled', status: 'error', disabled: true } }).body;
    expect(body).toContain('ant-space-addon-variant-filled'); expect(body).toContain('ant-space-addon-status-error'); expect(body).toContain('ant-space-addon-disabled');
    expect(body).not.toContain('ant-space-addon-compact-item'); expect(body).not.toContain('inert');
  });
});
