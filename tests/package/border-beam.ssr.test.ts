import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { BorderBeam, type BorderBeamProps } from 'antd-svelte';
import BorderBeamFixtures from '../browser/fixtures/BorderBeamFixtures.svelte';

describe('BorderBeam package SSR', () => {
  it('renders snippet content without DOM layers or a container wrapper', () => {
    const props: BorderBeamProps = {
      count: 2,
      color: [{ color: 'red', percent: 50 }],
      children: createRawSnippet(() => ({ render: () => '<p>Decorated content</p>' }))
    };

    const body = render(BorderBeam, { props }).body;

    expect(body).toContain('<p>Decorated content</p>');
    expect(body).not.toContain('<div');
    expect(body).not.toContain('ant-border-beam');
  });

  it('renders the owned fixture and leaves decorative layers to the browser', () => {
    const body = render(BorderBeamFixtures).body;

    expect(body).toContain('id="border-beam-fixture"');
    expect(body).toContain('id="border-beam-host"');
    expect(body).toContain('Decorated card');
    expect(body).toContain('Plain beam content');
    expect(body).not.toContain('class="ant-border-beam ');
  });
});
