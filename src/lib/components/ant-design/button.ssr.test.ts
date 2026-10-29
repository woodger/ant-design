import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button.svelte';
import ButtonFixtures from '../../../../e2e/fixtures/ButtonFixtures.svelte';

describe('Button SSR', () => {
  it('keeps native action buttons and zero content while adding href-based native links', () => {
    const action = render(Button, { props: { type: 'link', children: 0 } }).body;
    expect(action).toContain('<button'); expect(action).toContain('type="button"'); expect(action).not.toContain('ant-btn-icon-only');
    expect(action.replace(/<!--.*?-->/g, '')).toMatch(/>0<\/span>/);
    const href = render(Button, { props: { href: '#target', target: '_blank', rel: 'noreferrer', children: 'Go' } }).body;
    expect(href).toContain('<a'); expect(href).toContain('href="#target"'); expect(href).toContain('tabindex="0"'); expect(href).not.toContain('<button'); expect(href).toContain('rel="noreferrer"');
    expect(render(Button, { props: { href: undefined } }).body).toContain('<button');
  });
  it('removes disabled href and tab stop, retains source styles and invokes no callbacks', () => {
    const click = vi.fn();
    const body = render(Button, { props: { href: '#target', disabled: true, onclick: click, type: 'primary', ghost: true, children: 'Go' } }).body;
    expect(body).not.toContain('href='); expect(body).toContain('tabindex="-1"'); expect(body).toContain('aria-disabled="true"'); expect(body).toContain('ant-btn-disabled');
    expect(body).toContain('ant-btn-variant-outlined'); expect(body).toContain('ant-btn-background-ghost'); expect(click).not.toHaveBeenCalled();
  });
  it('keeps initial loading delays inert on the server and preserves native disabled loading v1', () => {
    vi.useFakeTimers();
    try {
      const delayed = render(Button, { props: { loading: { delay: 200 }, children: 'Wait' } }).body;
      expect(delayed).not.toContain('ant-btn-loading'); expect(delayed).not.toContain('disabled'); expect(vi.getTimerCount()).toBe(0);
      const immediate = render(Button, { props: { loading: true, children: 'Wait' } }).body;
      expect(immediate).toContain('ant-btn-loading'); expect(immediate).toContain('disabled'); expect(immediate).toContain('aria-busy="true"');
    } finally { vi.useRealTimers(); }
  });
  it('inserts Chinese spacing for scalar content, defers opaque snippets and preserves semantic style layers', () => {
    const children = createRawSnippet(() => ({ render: () => '<strong class="owner">按钮</strong>' }));
    expect(render(Button, { props: { children: '按钮' } }).body).toContain('按 钮');
    expect(render(Button, { props: { children: '按钮', autoInsertSpace: false } }).body).not.toContain('按 钮');
    const body = render(Button, { props: { children, icon: '★', iconPlacement: 'end', color: 'pink', variant: 'filled', classNames: { root: 'semantic', content: 'label' }, styles: { root: 'color:red' }, style: 'color:blue' } }).body;
    expect(body).toContain('<strong class="owner">按钮</strong>'); expect(body).toContain('ant-btn-color-pink'); expect(body).toContain('ant-btn-variant-filled'); expect(body).toContain('ant-btn-icon-end'); expect(body).toContain('semantic'); expect(body).toContain('color:red;color:blue');
  });
  it('renders composition with group size precedence and no automatic form submission', () => {
    const body = render(ButtonFixtures).body;
    expect(body).toMatch(/id="button-group"[^>]*class="ant-btn-group ant-btn-group-sm/);
    expect(body).toMatch(/class="[^"]*ant-btn-sm[^>]*>[\s\S]*?Group small/);
    expect(body).toContain('Group explicit large'); expect(body).toContain('Compact over group'); expect(body).toContain('Nested group resets size');
    expect(body).toContain('id="button-scalar-zero"'); expect(body).toContain('按 钮');
  });
});
