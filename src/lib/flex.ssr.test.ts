import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Flex from './Flex.svelte';

const children = createRawSnippet(
  () => ({
    render: () => '<button type="button">First</button><button type="button">Second</button>'
  })
);

describe('Flex server rendering', () => {
  it(
    'keeps native children directly inside a single root without layout props leaking into HTML',
    () => {
      const body = render(
        Flex,
        {
          props: {
            children,
            id: 'layout',
            justify: 'space-between',
            align: 'center',
            wrap: true,
            class: 'custom',
            rootClassName: 'outer'
          }
        }
      ).body;

      expect(body.match(/<div\b/g)).toHaveLength(1);
      expect(body.match(/<button\b/g)).toHaveLength(2);
      expect(body).toContain('id="layout"');
      expect(body).toContain('custom outer');
      expect(body).toContain('ant-flex-justify-space-between');
      expect(body).toContain('ant-flex-align-center');
      expect(body).toContain('ant-flex-wrap-wrap');
      expect(body).not.toMatch(/ (justify|align|wrap)=/);
      expect(body).not.toContain('role=');
      expect(body).not.toContain('tabindex');
    }
  );

  it(
    'gives explicit orientation precedence and stretches only the default vertical alignment',
    () => {
      const vertical = render(Flex, { props: { children, orientation: 'vertical' } }).body;
      const horizontal = render(
        Flex,
        { props: { children, orientation: 'horizontal', vertical: true } }
      ).body;
      const aligned = render(Flex, { props: { children, vertical: true, align: 'center' } }).body;

      expect(vertical).toContain('ant-flex-vertical');
      expect(vertical).toContain('ant-flex-align-stretch');
      expect(horizontal).not.toContain('ant-flex-vertical');
      expect(horizontal).not.toContain('ant-flex-align-stretch');
      expect(aligned).toContain('ant-flex-align-center');
      expect(aligned).not.toContain('ant-flex-align-stretch');
    }
  );

  it.each(['small', 'middle', 'medium', 'large'])(
    'renders preset gap %s through upstream classes',
    gap => {
      const body = render(Flex, { props: { gap, children } }).body;

      expect(body).toContain(`ant-flex-gap-${gap}`);
      expect(body).not.toContain('gap:');
    }
  );

  it.each([0, 12, 'inherit', '2px 1em'])(
    'preserves custom gap %s and gives layout props precedence over root style',
    gap => {
      const body = render(Flex, { props: { children, gap, flex: 0, style: 'gap:99px;flex:1' } })
        .body;

      expect(body).toContain(
        `gap:99px;flex:1;flex:0;gap:${typeof gap === 'number' ? `${gap}px` : gap}`
      );
      expect(body).not.toContain('ant-flex-gap-');
    }
  );

  it(
    'supports native root selection and keeps empty content empty for the upstream :empty rule',
    () => {
      const body = render(Flex, { props: { component: 'section', 'aria-label': 'Layout' } })
        .body
        .replace(
          /<!--.*?-->/g,
          ''
        );

      expect(body).toContain('<section');
      expect(body).toContain('aria-label="Layout"');
      expect(body).toContain('></section>');
      expect(body).not.toContain('<div');
    }
  );

  it.each([false, 'nowrap', 'wrap-reverse'] as const)(
    'preserves explicit wrapping %s',
    wrap => {
      const body = render(Flex, { props: { children, wrap } }).body;

      expect(body).not.toContain('ant-flex-wrap-wrap ');
      if (wrap)
        expect(body).toContain(`ant-flex-wrap-${wrap}`);
      else expect(body).not.toContain('ant-flex-wrap-');
    }
  );
});
