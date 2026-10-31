import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { InputGroup } from 'antd-svelte';
import InputGroupFixtures from '../browser/fixtures/InputGroupFixtures.svelte';

describe('InputGroup public package SSR', () => {
  it('exports the legacy Compact wrapper', () => {
    const body = render(InputGroup, { props: { items: ['Content'], compact: true } }).body;

    expect(body).toContain('ant-input-group-compact');
    expect(body).toContain('ant-space-compact');
  });

  it('retains form status without assigning the group identity to all controls', () => {
    const body = render(InputGroupFixtures).body;
    const implicit = body.match(/<input[^>]*aria-label="Group sibling one"[^>]*>/)![0];
    const explicit = body.match(/<input[^>]*aria-label="Group sibling two"[^>]*>/)![0];

    expect(implicit).not.toMatch(/\s(?:id|name|required)=/);
    expect(explicit).toContain('id="explicit-input"');
    expect(explicit).toContain('name="explicit"');
    expect(explicit).toMatch(/\srequired(?:="")?(?:\s|>)/);
    expect(body).toContain('ant-input-group');
  });
});
