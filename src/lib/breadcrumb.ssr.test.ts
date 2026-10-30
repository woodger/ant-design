import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Breadcrumb from './Breadcrumb.svelte';
import type { BreadcrumbItem } from './breadcrumb.types';

describe('Breadcrumb SSR', () => {
  it('uses native nav/ol/links, retains a final href and forwards item aria/data attributes', () => {
    const body = render(Breadcrumb, { props: { 'aria-label': 'Location', items: [{ path: 'home', title: 'Home' }, { href: '/current', title: 'Current', class: 'custom', 'aria-current': 'page', 'data-current': 'id' }] } }).body;
    expect(body).toContain('<nav'); expect(body).toContain('<ol>'); expect(body).toContain('href="#/home"'); expect(body).toContain('href="/current"');
    expect(body).toContain('aria-current="page"'); expect(body).toContain('data-current="id"'); expect(body).toContain('ant-breadcrumb-link custom');
    expect(body.match(/ant-breadcrumb-separator/g)).toHaveLength(1);
  });
  it('renders numeric zero and stringified true, omits falsy default items and retains separators after nonfinal visible items', () => {
    const body = render(Breadcrumb, { props: { items: [{ title: 0 }, { title: true }, { title: false }, { title: null }] } }).body;
    expect(body.match(/class="ant-breadcrumb-item(?:\s|")/g)).toHaveLength(2);
    expect(body).toMatch(/ant-breadcrumb-link[^>]*>.*?0</s); expect(body).toMatch(/ant-breadcrumb-link[^>]*>.*?true</s);
    expect(body.match(/ant-breadcrumb-separator/g)).toHaveLength(2);
  });
  it('renders explicit separators even when automatic separators are hidden', () => {
    const body = render(Breadcrumb, { props: { separator: '', items: [{ title: 'A' }, { type: 'separator', separator: ':' }, { title: 'B' }, { type: 'separator' }] } }).body;
    expect(body.match(/ant-breadcrumb-separator/g)).toHaveLength(2); expect(body.match(/aria-hidden="true"/g)).toHaveLength(2);
    const markup = body.replace(/<!--.*?-->/g, '');
    expect(markup).toContain(':</li>'); expect(markup).toContain('/</li>');
  });
  it('passes original routes and prefix path snapshots to a custom snippet without imposing link wrappers', () => {
    const itemRender = createRawSnippet<[BreadcrumbItem, Record<string, unknown>, readonly BreadcrumbItem[], readonly string[]]>((item, params, items, paths) => ({ render: () => `<a href="/${paths().join('/')}" data-size="${items().length}">${String(item().title)}:${params().id}</a>` }));
    const body = render(Breadcrumb, { props: { items: [{ path: 'a', title: 'A' }, { path: ':id', title: 'B' }], params: { id: 2 }, itemRender } }).body;
    expect(body).toContain('href="/a"'); expect(body).toContain('href="/a/2"'); expect(body).toContain('data-size="2"'); expect(body).toContain('B:2'); expect(body).not.toContain('ant-breadcrumb-link');
  });
  it('keeps semantic styles on li and root style after semantic root while matching ignored upstream item.style', () => {
    const body = render(Breadcrumb, { props: { style: 'color:blue', styles: { root: 'color:red', item: 'padding:1px', separator: 'padding:2px' }, items: [{ title: 'A', style: 'color:magenta' }, { title: 'B' }] } }).body;
    expect(body).toContain('color:red;color:blue'); expect(body).toContain('padding:1px'); expect(body).toContain('padding:2px'); expect(body).not.toContain('magenta');
  });
  it('uses a native action button for a non-link item with an onClick handler', () => {
    const body = render(Breadcrumb, { props: { items: [{ title: 'Action', onClick: () => {} }] } }).body;
    expect(body).toContain('<button'); expect(body).toContain('type="button"'); expect(body).not.toContain('role="button"');
  });
  it.each([
    [{}, '/child'], [{ href: '/parent' }, '/parent/child'], [{ path: 'parent' }, '#/parent/child']
  ] as const)('concatenates a menu child path with its resolved parent %j', (parent, href) => {
    const body = render(Breadcrumb, { props: { items: [{ ...parent, title: 'Parent', menu: { items: [{ title: 'Child', path: '/child' }] } }] } }).body;
    expect(body).toContain(`href="${href}"`);
    expect(body).toMatch(/<a[^>]*role="menuitem"/);
  });
});
