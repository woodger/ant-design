import { describe, expect, it } from 'vitest';
import { stepsDataHasContent, stepsDataItems, stepsLayout } from './steps-data.engine';

describe('Steps expanded data and layout', () => {
  it('preserves existing string keys and first-wins deduplication while accepting unkeyed and numeric source items', () => {
    const original = Object.freeze([{ key: 'first', title: 'First' }, false, { key: 'first', title: 'Ignored' }, { key: 0, title: 0 }, { title: 'Unkeyed' }] as const);
    const items = stepsDataItems(original);
    expect(items.map(item => item.title)).toEqual(['First', 0, 'Unkeyed']);
    expect(items.map(item => item.key)).toEqual(['first', '@steps:number:0', '@steps:index:3']);
    expect(original).toHaveLength(5);
  });
  it('retains distinct explicit, numeric and generated keys', () => {
    const items = stepsDataItems([{ key: '@steps:index:3' }, { key: '@steps:number:0' }, { key: 0 }, {}]);
    expect(items).toHaveLength(4); expect(new Set(items.map(item => item.key)).size).toBe(4);
  });
  it('uses legacy description only for nullish content and retains valid falsy content', () => {
    expect(stepsDataItems([{ content: 0, description: 'Ignored' }, { content: false, description: 'Ignored' }, { content: null, description: 'Legacy' }]).map(item => item.content)).toEqual([0, false, 'Legacy']);
    for (const value of [0, false, '', true]) expect(stepsDataHasContent(value)).toBe(true);
    expect(stepsDataHasContent(null)).toBe(false);
  });
  it('gives explicit non-default type priority over progressDot and forces panel horizontal', () => {
    expect(stepsLayout('navigation', true, undefined, undefined, true, false, 'vertical')).toEqual({ type: 'navigation', dot: false, vertical: false, titlePlacement: 'horizontal' });
    expect(stepsLayout('panel', false, 'vertical', undefined, true, true)).toEqual({ type: 'panel', dot: false, vertical: false, titlePlacement: 'horizontal' });
    expect(stepsLayout('default', true, undefined, undefined, true, false)).toEqual({ type: 'dot', dot: true, vertical: false, titlePlacement: 'vertical' });
  });
  it('resolves orientation before direction and title placement after dot and vertical constraints', () => {
    expect(stepsLayout(undefined, false, 'horizontal', 'vertical', false, true, 'vertical').vertical).toBe(false);
    expect(stepsLayout('inline', false, undefined, undefined, true, true).titlePlacement).toBe('horizontal');
    expect(stepsLayout(undefined, false, 'vertical', undefined, false, false, 'vertical').titlePlacement).toBe('horizontal');
    expect(stepsLayout(undefined, false, undefined, undefined, false, false, undefined, 'vertical').titlePlacement).toBe('vertical');
  });
});
