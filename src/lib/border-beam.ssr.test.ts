import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import BorderBeam from './BorderBeam.svelte';

describe('BorderBeam SSR', () => {
  it('renders content without a wrapper, decorative layers or DOM access', () => {
    const body = render(BorderBeam, {
      props: {
        count: 3,
        duration: 12,
        children: createRawSnippet(() => ({ render: () => '<article>Content</article>' }))
      }
    }).body;

    expect(body).toContain('<article>Content</article>');
    expect(body).not.toContain('<div');
    expect(body).not.toContain('ant-border-beam');
  });

  it('escapes scalar content and omits boolean and missing children', () => {
    const body = render(BorderBeam, { props: { children: '<unsafe>' } }).body;

    expect(body).toContain('&lt;unsafe');
    expect(body).not.toContain('<unsafe>');
    expect(render(BorderBeam, { props: { children: 0 } }).body).toContain('0');
    expect(render(BorderBeam, { props: { children: true } }).body).not.toContain('true');
    expect(render(BorderBeam).body).not.toContain('<div');
  });
});
