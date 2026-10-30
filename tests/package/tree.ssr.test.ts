import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Tree } from 'antd-svelte';
import TreeFixtures from '../browser/fixtures/TreeFixtures.svelte';

describe('Tree SSR', () => {
  it('renders only expanded rows with logical ARIA hierarchy and linked mixed checks', () => {
    const body = render(
      Tree,
      {
        props: {
          treeData: [
            {
              key: 'root',
              title: '<Root>',
              children: [{ key: 'a', title: 'Alpha' }, { key: 'b', title: 'Beta' }]
            }
          ],
          defaultExpandedKeys: ['root'],
          defaultCheckedKeys: ['a'],
          checkable: true,
          'aria-label': 'Folders'
        }
      }
    ).body;

    expect(body).toContain('role="tree"');
    expect(body).toContain('aria-level="2"');
    expect(body).toContain('aria-setsize="2"');
    expect(body).toContain('aria-checked="mixed"');
    expect(body).toContain('&lt;Root>');
  });
  it('gives controlled empty arrays priority over default keys', () => {
    const body = render(
      Tree,
      {
        props: {
          treeData: [{ key: 'root', title: 'Root', children: [{ key: 'a', title: 'Hidden' }] }],
          expandedKeys: [],
          defaultExpandAll: true,
          selectedKeys: [],
          defaultSelectedKeys: ['root'],
          checkable: true,
          checkedKeys: [],
          defaultCheckedKeys: ['root']
        }
      }
    ).body;

    expect(body).not.toContain('Hidden');
    expect(body).toContain('aria-expanded="false"');
    expect(body).toContain('aria-selected="false"');
    expect(body).not.toContain('aria-checked="true"');
  });
  it('does not load default expanded nodes or create timers on the server', () => {
    vi.useFakeTimers();

    const load = vi.fn(() => Promise.resolve());

    try {
      const body = render(
        Tree,
        {
          props: {
            treeData: [{ key: 0, title: 'Zero', isLeaf: false }],
            defaultExpandedKeys: [0],
            loadData: load
          }
        }
      ).body;
      expect(body).toContain('Zero');
      expect(body).toContain('aria-expanded="true"');
      expect(load).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it(
    'renders defaults, locale and Form disabled through the isolated fixture',
    () => {
      const body = render(TreeFixtures).body;

      expect(body).toContain('Развернуть');
      expect(body).toContain('Default child');
      expect(body).toContain('ant-tree-disabled');
      expect(body).toContain('aria-label="Enabled override tree"');
    }
  );
});
