import { describe, expect, it, vi } from 'vitest';
import { createTreeLoader } from './tree-load.engine';
import type { TreeEventNode, TreeKey } from './tree.types';
const node: TreeEventNode = {
  key: 'p',
  expanded: false,
  selected: false,
  checked: false,
  halfChecked: false,
  loaded: false,
  loading: false,
  pos: '0-0',
  active: false,
  dragOver: false,
  dragOverGapTop: false,
  dragOverGapBottom: false
};
function setup(load: (node: TreeEventNode) => PromiseLike<unknown>) {
  let loaded: TreeKey[] = [];
  let loading: TreeKey[] = [];
  const finish = vi.fn();
  const fail = vi.fn();
  const controller = createTreeLoader({
    load,
    loaded: () => loaded,
    loading: () => loading,
    setLoading: keys => {
      loading = keys;
    },
    finish: (keys, event, success) => {
      finish(keys, event, success);
      loaded = keys;
    },
    fail
  });
  return {
    controller,
    finish,
    fail,
    get loading() {
      return loading;
    },
    get loaded() {
      return loaded;
    }
  };
}
describe('Tree async load lifecycle', () => {
  it('deduplicates in-flight loads and marks success after settlement', async () => {
    let resolve!: () => void;
    const load = vi.fn(() => new Promise<void>(done => {
      resolve = done;
    }));
    const h = setup(load);
    const pending = h.controller.load(node);

    expect(h.controller.load(node)).toBe(pending);
    expect(h.loading).toEqual(['p']);
    await Promise.resolve();

    expect(load).toHaveBeenCalledOnce();
    resolve();
    await pending;

    expect(h.loaded).toEqual(['p']);
    expect(h.loading).toEqual([]);
    expect(h.finish).toHaveBeenCalledWith(['p'], node, true);
    expect(h.controller.load(node)).toBeUndefined();
  });
  it(
    'clears loading and requests collapse on rejection without marking the key loaded',
    async () => {
      const h = setup(() => Promise.reject(Error('load failed')));
      await h.controller.load(node);

      expect(h.loading).toEqual([]);
      expect(h.loaded).toEqual([]);
      expect(h.fail).toHaveBeenCalledWith('p');
      expect(h.finish).not.toHaveBeenCalled();
    }
  );
  it(
    'allows retry and caps failed attempts at the source limit without an onLoad success event',
    async () => {
      const load = vi.fn(() => Promise.reject(Error('no')));
      const h = setup(load);
      for (let attempt = 0; attempt < 10; attempt++)
        await h.controller.load(node);

      expect(load).toHaveBeenCalledTimes(10);
      expect(h.fail).toHaveBeenCalledTimes(9);
      expect(h.finish).toHaveBeenLastCalledWith(['p'], node, false);
      expect(h.controller.load(node)).toBeUndefined();
    }
  );
  it('does not load existing children and ignores settlement after disposal', async () => {
    let resolve!: () => void;
    const load = vi.fn(() => new Promise<void>(done => {
      resolve = done;
    }));
    const h = setup(load);

    expect(h.controller.load({ ...node, children: [{ key: 'c' }] })).toBeUndefined();
    const pending = h.controller.load(node);
    await Promise.resolve();
    h.controller.dispose();
    resolve();
    await pending;

    expect(h.finish).not.toHaveBeenCalled();
    expect(h.fail).not.toHaveBeenCalled();
  });
});
