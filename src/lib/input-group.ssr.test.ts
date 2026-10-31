import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import InputGroup from './InputGroup.svelte';

describe('InputGroup SSR', () => {
  it('renders a Compact root with source legacy classes and scalar items', () => {
    const body = render(InputGroup, {
      props: { items: ['Before', 'After'], size: 'large', compact: true, class: 'owner' }
    }).body;

    expect(body.match(/<div\b/g)).toHaveLength(1);
    expect(body).toContain('ant-space-compact');
    expect(body).toContain('ant-input-group');
    expect(body).toContain('ant-input-css-var');
    expect(body).toContain('ant-input-group-lg');
    expect(body).toContain('ant-input-group-compact');
    expect(body).toContain('owner');
    expect(body).toContain('Before');
    expect(body).toContain('After');
  });

  it('keeps the Compact root when the legacy compact flag is false', () => {
    const body = render(InputGroup, {
      props: { items: ['Content'], size: 'small', compact: false, style: 'width:320px' }
    }).body;

    expect(body).toContain('ant-space-compact');
    expect(body).toContain('ant-input-group-sm');
    expect(body).not.toContain('ant-input-group-compact');
    expect(body).toContain('width:320px');
  });

  it(
    'omits empty groups like SpaceCompact and leaves default size without a legacy modifier',
    () => {
      expect(render(InputGroup).body).not.toContain('<div');
      expect(render(InputGroup, { props: { items: [] } }).body).not.toContain('<div');
      expect(render(InputGroup, { props: { size: 'default', items: ['Content'] } }).body)
        .not.toMatch(/ant-input-group-(?:sm|lg)/);
    }
  );
});
