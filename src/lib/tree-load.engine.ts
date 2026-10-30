import type { TreeEventNode, TreeKey } from './tree.types';
// onNodeLoad rc-tree 1.4.0; MIT, vendor/LICENSE.rc-tree.
export function createTreeLoader(options: {
  load: (node: TreeEventNode) => PromiseLike<unknown> | undefined;
  loaded: () => readonly TreeKey[]; loading: () => readonly TreeKey[];
  setLoading: (keys: TreeKey[]) => void;
  finish: (keys: TreeKey[], node: TreeEventNode, success: boolean) => void;
  fail: (key: TreeKey) => void;
}) {
  let disposed = false; const pending = new Map<TreeKey, Promise<void>>(); const retries = new Map<TreeKey, number>();
  function load(node: TreeEventNode): Promise<void> | undefined {
    const { key } = node;
    if (disposed || options.loaded().includes(key) || node.children?.length || (retries.get(key) ?? 0) >= 10) return;
    if (pending.has(key)) return pending.get(key);
    options.setLoading([...options.loading(), key]);
    const promise = Promise.resolve().then(() => options.load(node)).then(() => {
      if (!disposed) { options.finish([...new Set([...options.loaded(), key])], node, true); options.setLoading(options.loading().filter(item => item !== key)); }
    }, () => {
      if (disposed) return;
      const retry = (retries.get(key) ?? 0) + 1; retries.set(key, retry);
      options.setLoading(options.loading().filter(item => item !== key));
      if (retry >= 10) options.finish([...new Set([...options.loaded(), key])], node, false);
      else options.fail(key);
    }).finally(() => { pending.delete(key); });
    pending.set(key, promise); return promise;
  }
  return { load, dispose: () => { disposed = true; pending.clear(); } };
}
