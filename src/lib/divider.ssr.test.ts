import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Divider from './Divider.svelte';
import type { DividerProps } from './divider.types';

describe('Divider server rendering', () => {
  it('keeps the upstream default spacing without an explicit size', () => {
    const body = render(Divider, {
      props: {
        classNames: ({ props }) => ({
          root: props.size === undefined ? 'default-size' : 'explicit-size'
        })
      }
    }).body;

    expect(body).toContain('ant-divider-horizontal');
    expect(body).toContain('default-size');
    expect(body).not.toMatch(/\bant-divider-(?:md|sm)\b/);
  });

  it('renders an empty separator without content rails and preserves native attributes', () => {
    const body = render(
      Divider,
      {
        props: {
          id: 'divider',
          'aria-label': 'Sections',
          title: 'Title',
          class: 'custom',
          style: 'opacity:0.5'
        }
      }
    ).body;

    expect(body).toContain('role="separator"');
    expect(body).toContain('aria-orientation="horizontal"');
    expect(body).toContain('ant-divider-rail');
    expect(body).toContain('aria-label="Sections"');
    expect(body).toContain('id="divider"');
    expect(body).toContain('custom');
    expect(body).toContain('opacity:0.5');
    expect(body).not.toContain('ant-divider-inner-text');
    expect(body).not.toContain('tabindex');
  });

  it.each([undefined, null, false, ''] as const)(
    'keeps %s content as an empty divider',
    children => {
      const body = render(Divider, { props: { children } }).body;

      expect(body).not.toContain('ant-divider-with-text');
      expect(body).not.toContain('ant-divider-inner-text');
    }
  );

  it('renders numeric zero and escapes string content', () => {
    const zero = render(Divider, { props: { children: 0 } }).body;
    const text = render(Divider, { props: { children: '<script>unsafe</script>' } }).body;

    expect(zero).toContain('ant-divider-with-text-center');
    expect(zero.replace(/<!--.*?-->/g, '')).toContain('>0</span>');
    expect(text).toContain('&lt;script>unsafe&lt;/script>');
    expect(text).not.toContain('<script>');
  });

  it('renders rich snippets and both rails without browser APIs', () => {
    const children = createRawSnippet(() => ({ render: () => '<strong>Details</strong>' }));
    const body = render(Divider, { props: { children, plain: true, dashed: true } }).body;

    expect(body).toContain('<strong>Details</strong>');
    expect(body).toContain('ant-divider-rail-start');
    expect(body).toContain('ant-divider-rail-end');
    expect(body).toContain('ant-divider-plain');
    expect(body).toContain('ant-divider-dashed');
  });

  it.each<DividerProps>([
    { orientation: 'vertical', vertical: false, type: 'horizontal' },
    { vertical: true, type: 'horizontal' },
    { type: 'vertical' }
  ])('hides vertical content with props %j', props => {
    const body = render(Divider, { props: { ...props, children: 'Hidden' } }).body;

    expect(body).toContain('ant-divider-vertical');
    expect(body).toContain('aria-orientation="vertical"');
    expect(body).not.toContain('Hidden');
    expect(body).not.toContain('ant-divider-inner-text');
  });

  it.each<DividerProps>([
    { orientation: 'horizontal', vertical: true, type: 'vertical' },
    { vertical: false, type: 'vertical' }
  ])('keeps explicit horizontal precedence with props %j', props => {
    const body = render(Divider, { props: { ...props, children: 'Visible' } }).body;

    expect(body).toContain('ant-divider-horizontal');
    expect(body).toContain('Visible');
  });

  it('supports legacy placement and normalizes numeric margins to pixels', () => {
    const body = render(
      Divider,
      { props: { orientation: 'right', orientationMargin: '10', children: 'Title' } }
    ).body;
    const centered = render(
      Divider,
      { props: { titlePlacement: 'center', orientationMargin: 20, children: 'Title' } }
    ).body;

    expect(body).toContain('ant-divider-with-text-end');
    expect(body).toContain('ant-divider-no-default-orientation-margin-end');
    expect(body).toContain('margin-inline-end:10px');
    expect(centered).not.toContain('no-default-orientation-margin');
    expect(centered).not.toContain('margin-inline-');
  });

  it(
    'passes normalized props to semantic callbacks and merges slot styles in upstream order',
    () => {
      const body = render(Divider, {
        props: {
          size: 'small',
          titlePlacement: 'left',
          children: 'Title',
          orientationMargin: 10,
          classNames: ({ props }) => ({
            root: `root-${props.orientation}-${props.titlePlacement}-${props.size}`,
            rail: 'custom-rail',
            content: 'custom-content'
          }),
          styles: {
            root: 'opacity:0.5',
            rail: 'border-color:red',
            content: 'margin-inline-start:20px'
          },
          style: 'opacity:1'
        }
      }).body;
      const empty = render(
        Divider,
        {
          props: {
            styles: () => ({ root: 'opacity:0.5', rail: 'opacity:0.8' }),
            style: 'opacity:1'
          }
        }
      ).body;

      expect(body).toContain('root-horizontal-start-small');
      expect(body).toContain('custom-rail');
      expect(body).toContain('custom-content');
      expect(body).toContain('opacity:0.5;opacity:1');
      expect(body).toContain('margin-inline-start:10px;margin-inline-start:20px');
      expect(empty).toContain('opacity:0.5;opacity:0.8;opacity:1');
    }
  );
});
