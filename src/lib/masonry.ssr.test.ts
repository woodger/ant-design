import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Masonry from './Masonry.svelte';

describe('Masonry SSR', () => {
  it('renders an empty root before client measurement without invoking renderers or callbacks', () => {
    const events: unknown[] = [];
    const body = render(Masonry, {
      props: {
        children: createRawSnippet(() => {
          events.push('children');

          return { render: () => '<p>Unused root children</p>' };
        }),
        items: [{ key: 'a', data: 40 }],
        itemRender: createRawSnippet(() => {
          events.push('render');

          return { render: () => '<p>Measured content</p>' };
        }),
        onLayoutChange: value => events.push(value)
      }
    }).body;

    expect(body).toContain('ant-masonry ant-masonry-css-var');
    expect(body).toContain('height:0px');
    expect(body).not.toContain('ant-masonry-item');
    expect(body).not.toContain('Measured content');
    expect(body).not.toContain('Unused root children');
    expect(events).toEqual([]);
  });

  it('resolves semantic columns for SSR and gives local style priority over the layout height', () => {
    const body = render(Masonry, {
      props: {
        columns: { xs: 2, md: 4 },
        class: 'owner',
        rootClassName: 'root',
        classNames: ({ props }) => ({ root: `columns-${props.columns}` }),
        styles: { root: 'height:80px;opacity:0.5' },
        style: 'height:120px'
      }
    }).body;

    expect(body).toContain('columns-2 root owner');
    expect(body).toContain('height:0px;height:80px;opacity:0.5;height:120px');
  });
});
