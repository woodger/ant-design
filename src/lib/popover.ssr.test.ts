import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, expectTypeOf, it } from 'vitest';
import Popover from './Popover.svelte';
import type { PopoverProps } from './popover.types';

const children = createRawSnippet(() => ({ render: () => '<button type="button" aria-describedby="existing-help">Open card</button>' }));

describe('Popover server rendering', () => {
  it('renders a named hidden nonmodal dialog and preserves its native trigger', () => {
    const { body } = render(Popover, { props: { children, title: 'Profile', content: 'Additional information' } });

    expect(body).toContain('aria-describedby="existing-help"');
    expect(body).toContain('role="dialog"');
    expect(body).toContain('popover="manual"');
    expect(body).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
    expect(body).toContain('aria-labelledby="ant-popover-');
    expect(body).toContain('Profile');
    expect(body).toContain('Additional information');
    expect(body).not.toContain('aria-modal="true"');
    expect(body).not.toContain('tabindex="0"');
    expectTypeOf<NonNullable<PopoverProps['onOpenChange']>>().parameter(0).toEqualTypeOf<boolean>();
  });

  it('renders interactive content and rich title snippets', () => {
    const title = createRawSnippet(() => ({ render: () => '<strong>Edit profile</strong>' }));
    const content = createRawSnippet(() => ({ render: () => '<div><input aria-label="Name" /><button type="button">Save</button></div>' }));
    const { body } = render(Popover, { props: { children, title, content, trigger: 'click' } });

    expect(body).toContain('<strong>Edit profile</strong>');
    expect(body).toContain('aria-label="Name"');
    expect(body).toContain('>Save</button>');
  });

  it('accepts an explicit accessible name for a card without a title', () => {
    const { body } = render(Popover, { props: { children, content: 'Information', 'aria-label': 'Details' } });

    expect(body).toContain('aria-label="Details"');
    expect(body).not.toContain('aria-labelledby=');
    expect(body).not.toContain('class="ant-popover-title');
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('supports %s placement without an arrow', (placement) => {
    const { body } = render(Popover, { props: { children, title: 'Details', content: 'Text', placement, arrow: false } });

    expect(body).toContain(`ant-popover-placement-${placement}`);
    expect(body).not.toContain('class="ant-popover-arrow');
  });

  it('renders numeric zero as a title and body and permits empty content', () => {
    const zero = render(Popover, { props: { children, title: 0, content: 0 } }).body;
    const empty = render(Popover, { props: { children, title: '  ', content: null } }).body;

    expect(zero.replace(/<!--[\s\S]*?-->/g, '').match(/>0<\/div>/g)).toHaveLength(2);
    expect(empty).not.toContain('class="ant-popover-title');
    expect(empty).not.toContain('class="ant-popover-content');
  });

  it('keeps defaultOpen hidden before hydration and never invokes the owner during rendering', () => {
    const { body } = render(Popover, { props: { children, title: 'Details', content: 'Text', defaultOpen: true, onOpenChange: () => { throw new Error('Unexpected callback'); } } });

    expect(body).toMatch(/role="dialog"[^>]*\shidden(?:[\s=>])/);
  });

  it('escapes string titles and content', () => {
    const { body } = render(Popover, { props: { children, title: '<script>title</script>', content: '<script>content</script>' } });

    expect(body).not.toContain('<script>');
    expect(body).toContain('&lt;script>title');
    expect(body).toContain('&lt;script>content');
  });

  it('assigns distinct identifiers across independently rendered roots', () => {
    const first = render(Popover, { idPrefix: 'first-', props: { children, title: 'First' } }).body;
    const second = render(Popover, { idPrefix: 'second-', props: { children, title: 'Second' } }).body;

    expect(first.match(/id="(ant-popover-[^"]+)"/)?.[1]).not.toBe(second.match(/id="(ant-popover-[^"]+)"/)?.[1]);
  });
});
