import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Descriptions from './Descriptions.svelte';

describe('Descriptions SSR', () => {
  it('renders numeric zero values and omits empty headers without subscribing to media', () => {
    const body = render(
      Descriptions,
      { props: { title: 0, extra: 0, items: [{ key: 'a', label: 0, children: 0 }] } }
    ).body;

    expect(body).toMatch(/ant-descriptions-title[^>]*>.*?0</s);
    expect(body).toMatch(/ant-descriptions-extra[^>]*>.*?0</s);
    expect(body).toContain('colspan="3"');
    expect(body).not.toContain('ant-descriptions-medium');
    expect(render(Descriptions).body).not.toContain('ant-descriptions-header');
  });
  it.each(['horizontal', 'vertical'] as const)(
    'places bordered %s item styles on the corresponding cells',
    layout => {
      const body = render(Descriptions, {
        props: {
          layout,
          bordered: true,
          column: 1,
          labelStyle: 'color:red',
          styles: { label: 'color:green', content: 'color:red' },
          items: [
            {
              label: 'Product',
              children: 'Database',
              style: 'background:yellow',
              labelStyle: 'color:blue',
              contentStyle: 'color:purple',
              styles: { content: 'color:black' }
            }
          ]
        }
      }).body;

      expect(body).toMatch(
        /<th[^>]*class="ant-descriptions-item-label"[^>]*style="background:yellow;color:red;color:green;color:blue"[^>]*>.*?<span>.*?Product/s
      );
      expect(body).toMatch(
        /<td[^>]*class="ant-descriptions-item-content"[^>]*style="background:yellow;color:red;color:purple;color:black"[^>]*>.*?<span>.*?Database/s
      );
      expect(body).not.toContain('<span style=');
    }
  );
  it('keeps empty bordered cells and applies root style after semantic styles', () => {
    const body = render(
      Descriptions,
      {
        props: {
          bordered: true,
          styles: { root: 'padding:1px' },
          style: 'padding:2px',
          items: [{ label: null, children: null }]
        }
      }
    ).body;

    expect(body).toContain('ant-descriptions-item-label');
    expect(body).toContain('ant-descriptions-item-content');
    expect(body).toContain('colspan="5"');
    expect(body).toContain('padding:1px;padding:2px');
  });
  it(
    'treats true as present content without printing a boolean string, as rc util does',
    () => {
      const body = render(
        Descriptions,
        { props: { title: true, items: [{ label: true, children: true }] } }
      ).body;

      expect(body).toContain('ant-descriptions-title');
      expect(body).toContain('ant-descriptions-item-label');
      expect(body).toContain('ant-descriptions-item-content');
      expect(body).not.toContain('>true<');
    }
  );
  it('passes resolved column, items and inherited size to semantic callbacks', () => {
    const body = render(
      Descriptions,
      {
        props: {
          column: { md: 2 },
          size: 'small',
          items: [{ span: { md: 2 } }],
          classNames: ({ props }) => ({
            root: `columns-${props.column}-span-${props.items?.[0].span}-size-${props.size}`
          })
        }
      }
    ).body;

    expect(body).toContain('columns-3-span-undefined-size-small');
  });
});
