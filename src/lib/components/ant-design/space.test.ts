import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Space from './Space.svelte';
import { spaceGap, spaceOrientation } from './space.engine';

describe('Space SSR', () => {
  it('omits the root only for an empty item list and keeps a root for explicit empty children', () => {
    expect(render(Space).body).not.toContain('<div');
    expect(render(Space, { props: { items: [] } }).body).not.toContain('<div');
    const body = render(Space, { props: { items: [null, false, ''] } }).body;
    expect(body).toContain('ant-space-horizontal'); expect(body).not.toContain('class="ant-space-item"');
  });
  it('keeps zero while omitting normalized boolean and empty entries without a trailing separator', () => {
    const body = render(Space, { props: { items: [0, false, 'A', null, true, undefined], separator: '|' } }).body;
    expect(body.match(/class="ant-space-item"/g)).toHaveLength(2);
    expect(body.match(/ant-space-item-separator/g)).toHaveLength(1);
    expect(body).not.toContain('>true<'); expect(body).not.toContain('>false<');
  });
  it('does not render numeric-zero separators and gives separator precedence over legacy split', () => {
    expect(render(Space, { props: { items: ['A', 'B'], separator: 0 } }).body).not.toContain('ant-space-item-separator');
    expect(render(Space, { props: { items: ['A', 'B'], separator: '', split: '|' } }).body).not.toContain('ant-space-item-separator');
    expect(render(Space, { props: { items: ['A', 'B'], split: '|' } }).body).toContain('ant-space-item-separator');
  });
  it('merges gap before semantic/root styles and passes resolved orientation and default alignment to semantic callbacks', () => {
    const body = render(Space, { props: { items: ['A'], size: [12, 'large'], styles: { root: 'column-gap:20px' }, style: 'column-gap:99px', classNames: ({ props }) => ({ root: `resolved-${props.orientation}-${props.align}` }) } }).body;
    expect(body).toContain('column-gap:12px;column-gap:20px;column-gap:99px');
    expect(body).toContain('ant-space-gap-row-large'); expect(body).toContain('resolved-horizontal-center');
  });
  it('treats a children snippet as one group and item snippets as independent wrappers', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Group</p>' }));
    expect(render(Space, { props: { children } }).body).toContain('<p>Group</p>');
    const body = render(Space, { props: { items: [{ key: 'a', children }, { key: 'b', children }] } }).body;
    expect(body.match(/class="ant-space-item"/g)).toHaveLength(2);
  });
  it('keeps explicit numeric keys separate from generated positional keys', () => {
    const body = render(Space, { props: { items: [{ key: 1, children: 'A' }, 'B'] } }).body;
    expect(body.match(/class="ant-space-item"/g)).toHaveLength(2);
  });
});

describe('Space orientation and gap', () => {
  it('prioritizes orientation, explicit vertical and then the legacy direction', () => {
    expect(spaceOrientation('horizontal', true, 'vertical')).toBe('horizontal');
    expect(spaceOrientation(undefined, false, 'vertical')).toBe('horizontal');
    expect(spaceOrientation(undefined, undefined, 'vertical')).toBe('vertical');
    expect(spaceOrientation()).toBe('horizontal');
  });
  it('uses numeric styles only for nonzero numbers and separate preset axes for tuples', () => {
    expect(spaceGap(0)).toEqual({ classes: [], style: '' });
    expect(spaceGap(Number.NaN)).toEqual({ classes: [], style: '' });
    expect(spaceGap([8, 24])).toEqual({ classes: [], style: 'column-gap:8px;row-gap:24px' });
    expect(spaceGap(['medium', 'small'])).toEqual({ classes: ['ant-space-gap-col-medium', 'ant-space-gap-row-small'], style: '' });
  });
});
