import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Layout from './Layout.svelte';
import LayoutHeader from './LayoutHeader.svelte';
import LayoutFooter from './LayoutFooter.svelte';
import LayoutContent from './LayoutContent.svelte';
import LayoutSider from './LayoutSider.svelte';

describe('Layout SSR', () => {
  it.each([[LayoutHeader, 'header'], [LayoutFooter, 'footer'], [LayoutContent, 'main']] as const)('renders semantic layout part %s', (component, tag) => {
    const body = render(component, { props: { id: 'part', children: createRawSnippet(() => ({ render: () => '<p>Content</p>' })) } }).body;
    expect(body).toContain(`<${tag}`); expect(body).toContain('id="part"'); expect(body).toContain('<p>Content</p>');
  });
  it('honors an explicit hasSider flag without inspecting or executing snippets early', () => {
    const body = render(Layout, { props: { hasSider: true } }).body;
    expect(body).toContain('ant-layout-has-sider');
    expect(render(Layout, { props: { hasSider: false } }).body).toContain('data-ant-has-sider="false"');
  });
  it('renders stable collapsed dimensions and native named triggers without media subscriptions or callbacks', () => {
    const onBreakpoint = vi.fn(); const onCollapse = vi.fn();
    const body = render(LayoutSider, { props: { defaultCollapsed: true, collapsedWidth: 0, breakpoint: 'md', collapsible: true, onBreakpoint, onCollapse } }).body;
    expect(body).toContain('width:0px'); expect(body).toContain('ant-layout-sider-zero-width-trigger');
    expect(body).toContain('type="button"'); expect(body).toContain('aria-expanded="false"'); expect(body).toContain('aria-controls=');
    expect(body).toContain('inert'); expect(onBreakpoint).not.toHaveBeenCalled(); expect(onCollapse).not.toHaveBeenCalled();
  });
  it('allows hiding the trigger and merges semantic root styles before forced dimensions', () => {
    const body = render(LayoutSider, { props: { collapsible: true, trigger: null, width: '35%', styles: { root: 'width:10px', body: 'padding:4px' }, style: 'width:20px' } }).body;
    expect(body).not.toContain('<button'); expect(body).toContain('width:10px;width:20px;flex:0 0 35%'); expect(body).toContain('padding:4px');
  });
});
