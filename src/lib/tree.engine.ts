import type { TreeCheckedKeys, TreeDataNode, TreeKey } from './tree.types';
export interface TreeEntity { key: TreeKey; node: TreeDataNode; parent?: TreeEntity; children: TreeEntity[]; level: number; pos: string; index: number; siblings: number; ends: boolean[]; }
export function buildTreeEntities(nodes: readonly TreeDataNode[]) {
  const entities = new Map<string, TreeEntity>();
  function walk(list: readonly TreeDataNode[], parent?: TreeEntity) {
    return list.map((node, index): TreeEntity => {
      const entry: TreeEntity = { key: node.key, node, parent, children: [], level: parent ? parent.level + 1 : 0, pos: `${parent?.pos ?? '0'}-${index}`, index, siblings: list.length, ends: [...parent?.ends ?? [], index === list.length - 1] };
      entities.set(String(node.key), entry); entry.children = walk(node.children ?? [], entry); return entry;
    });
  }
  const roots = walk(nodes);
  // Entity index upstream — object: integer keys обходятся раньше строковых.
  const ordered = Object.keys(Object.fromEntries(entities)).map(key => entities.get(key)!);
  return { entities, ordered, roots };
}
export type TreeIndex = ReturnType<typeof buildTreeEntities>;
export function flattenTree(index: TreeIndex, keys: readonly TreeKey[]) {
  const expanded = new Set(keys); const result: TreeEntity[] = [];
  function walk(entries: readonly TreeEntity[]) { for (const entry of entries) { result.push(entry); if (expanded.has(entry.key)) walk(entry.children); } }
  walk(index.roots); return result;
}
export function expandTreeParents(keys: readonly TreeKey[], index: TreeIndex): TreeKey[] {
  const expanded = new Set<TreeKey>();
  function up(key: TreeKey) { if (expanded.has(key)) return; const entry = index.entities.get(String(key)); if (!entry) return; expanded.add(key); if (!entry.node.disabled && entry.parent) up(entry.parent.key); }
  keys.forEach(up); return [...expanded];
}
export function treeLeaf(node: TreeDataNode, loadData: boolean, loaded: boolean): boolean {
  if (node.isLeaf === false) return false;
  return Boolean(node.isLeaf || !loadData && !node.children?.length || loadData && loaded && !node.children?.length);
}
export function treeCheckDisabled(node: TreeDataNode): boolean { return Boolean(node.disabled || node.disableCheckbox || node.checkable === false); }
export function parseTreeChecked(keys: readonly TreeKey[] | TreeCheckedKeys): TreeCheckedKeys { return Array.isArray(keys) ? { checked: keys, halfChecked: [] } : keys as TreeCheckedKeys; }
// conductUtil из rc-tree 1.4.0; MIT, vendor/LICENSE.rc-tree. Disabled nodes разрывают conduction.
export function conductTreeCheck(keys: readonly TreeKey[], index: TreeIndex, cleanHalf?: readonly TreeKey[]): {checked: TreeKey[]; halfChecked: TreeKey[]} {
  const checked = new Set(keys.filter(key => index.entities.has(String(key))));
  let half = new Set(cleanHalf); const clean = cleanHalf !== undefined;
  const levels = new Map<number, TreeEntity[]>(); let max = 0;
  for (const entry of index.ordered) { const level = levels.get(entry.level) ?? []; level.push(entry); levels.set(entry.level, level); max = Math.max(max, entry.level); }
  for (let level = 0; level <= max; level++) for (const entry of levels.get(level) ?? []) {
    if (treeCheckDisabled(entry.node)) continue;
    if (clean ? !checked.has(entry.key) && !half.has(entry.key) : checked.has(entry.key)) for (const child of entry.children.filter(child => !treeCheckDisabled(child.node))) { if (clean) checked.delete(child.key); else checked.add(child.key); }
  }
  half = new Set(); const visited = new Set<TreeKey>();
  for (let level = max; level >= 0; level--) for (const entry of levels.get(level) ?? []) {
    const parent = entry.parent;
    if (treeCheckDisabled(entry.node) || !parent || visited.has(parent.key)) continue;
    if (treeCheckDisabled(parent.node)) { visited.add(parent.key); continue; }
    const children = parent.children.filter(child => !treeCheckDisabled(child.node));
    const all = children.every(child => checked.has(child.key)); const partial = children.some(child => checked.has(child.key) || half.has(child.key));
    if (all && !clean) checked.add(parent.key); if (!all && clean) checked.delete(parent.key); if (partial) half.add(parent.key); visited.add(parent.key);
  }
  return { checked: [...checked], halfChecked: [...half].filter(key => !checked.has(key)) };
}
export function toggleTreeCheck(key: TreeKey, checked: readonly TreeKey[], index: TreeIndex, next: boolean) {
  const filled = conductTreeCheck([...checked, key], index);
  return next ? filled : conductTreeCheck(filled.checked.filter(item => item !== key), index, filled.halfChecked);
}
export function selectTreeKeys(keys: readonly TreeKey[], key: TreeKey, multiple: boolean): TreeKey[] { return keys.includes(key) ? keys.filter(item => item !== key) : multiple ? [...keys, key] : [key]; }
