import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Tooltip from './Tooltip.svelte';
import type { TooltipProps } from './tooltip.types';

const children = createRawSnippet(() => ({ render: () => '<button type="button" aria-describedby="existing-help">Save</button>' }));

describe('Tooltip server rendering', () => {
  it('renders its trigger and a hidden text tooltip without adding a focus stop', () => {
    const { body } = render(Tooltip, { props: { title: 'Save changes', children } });

    expect(body).toContain('aria-describedby="existing-help"');
    expect(body).toContain('role="tooltip"');
    expect(body).toContain('popover="manual"');
    expect(body).toMatch(/<span[^>]*role="tooltip"[^>]*\shidden(?:[\s=>])/);
    expect(body).toContain('Save changes');
    expect(body).not.toContain('tabindex="0"');
    expectTypeOf<NonNullable<TooltipProps['onOpenChange']>>().parameter(0).toEqualTypeOf<boolean>();
  });

  it('keeps defaultOpen safe before hydration without invoking the owner', () => {
    const { body } = render(Tooltip, { props: { title: 'Initially open', children, defaultOpen: true, onOpenChange: () => { throw new Error('Unexpected callback'); } } });

    expect(body).toContain('Initially open');
    expect(body).toMatch(/role="tooltip"[^>]*\shidden(?:[\s=>])/);
  });

  it('renders zero as text and permits an empty title', () => {
    expect(render(Tooltip, { props: { title: 0, children } }).body).toContain('>0</span>');
    expect(render(Tooltip, { props: { title: null, children } }).body).toContain('role="tooltip"');
  });

  it('supports all four placement names and optional arrow', () => {
    const { body } = render(Tooltip, { props: { title: 'Below', children, placement: 'bottom', arrow: false } });

    expect(body).toContain('ant-tooltip-placement-bottom');
    expect(body).not.toContain('class="ant-tooltip-arrow');
  });

  it('escapes plain tooltip text instead of rendering caller HTML', () => {
    const { body } = render(Tooltip, { props: { title: '<script>alert(1)</script>', children } });

    expect(body).not.toContain('<script>alert(1)</script>');
    expect(body).toContain('&lt;script');
  });

  it('assigns distinct popup identifiers to separate instances', () => {
    const first = render(Tooltip, { idPrefix: 'first-', props: { title: 'First', children } }).body;
    const second = render(Tooltip, { idPrefix: 'second-', props: { title: 'Second', children } }).body;

    expect(first.match(/id="(ant-tooltip-[^"]+)"/)?.[1]).not.toBe(second.match(/id="(ant-tooltip-[^"]+)"/)?.[1]);
  });
});
