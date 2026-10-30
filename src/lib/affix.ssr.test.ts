import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Affix from './Affix.svelte';

describe('Affix SSR', () => {
  it(
    'renders one content container without fixed classes or cloned form fields and never resolves browser targets',
    () => {
      const target = vi.fn(() => {
        throw new Error('Browser target accessed during SSR');
      });
      const onChange = vi.fn();
      const children = createRawSnippet(
        () => ({ render: () => '<input name="draft" value="Server draft" />' })
      );
      const body = render(
        Affix,
        {
          props: {
            children,
            target,
            onChange,
            class: 'outer',
            rootClassName: 'fixed-only',
            style: 'width:50%',
            id: 'affix'
          }
        }
      ).body;

      expect(body).toContain('id="affix"');
      expect(body).toContain('class="outer"');
      expect(body).toContain('width:50%');
      expect(body.match(/name="draft"/g)).toHaveLength(1);
      expect(body).not.toContain('fixed-only');
      expect(body).not.toContain('position:fixed');
      expect(body).not.toContain('aria-hidden');
      expect(target).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    }
  );
});
