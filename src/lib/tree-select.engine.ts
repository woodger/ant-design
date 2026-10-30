import { buildTreeEntities, conductTreeCheck, treeCheckDisabled } from './tree.engine';
import type { TreeDataNode, TreeKey } from './tree.types';
import type {
  TreeSelectNode,
  TreeSelectRawValue,
  TreeSelectValue,
  TreeSelectLabeledValue,
  TreeSelectStrategy,
  TreeSelectSearchConfig,
  TreeSelectLabel
} from './tree-select.types';
// rc-tree-select 1.16.1; MIT, vendor/LICENSE.rc-tree-select.
export const TREE_SELECT_SHOW_ALL = 'SHOW_ALL';
export const TREE_SELECT_SHOW_PARENT = 'SHOW_PARENT';
export const TREE_SELECT_SHOW_CHILD = 'SHOW_CHILD';
export function treeSelectIndex(nodes: readonly TreeSelectNode[]) {
  const values = new Map<TreeSelectRawValue, TreeSelectNode>();
  function map(list: readonly TreeSelectNode[]): TreeDataNode[] {
    return list.map(node => {
      values.set(node.value, node);
      return {
        ...node,
        key: node.value,
        title: node.title ?? node.label,
        children: node.children ? map(node.children) : undefined
      };
    });
  }
  const data = map(nodes);
  return { ...buildTreeEntities(data), data, values };
}
export type TreeSelectIndex = ReturnType<typeof treeSelectIndex>;
export function treeSelectLabeled(value: TreeSelectValue): TreeSelectLabeledValue[] {
  const values = value === undefined || value === null
    ? []
    : Array.isArray(value) ? value : [value];
  return values.map(item => typeof item === 'object' ? { ...item } : { value: item });
}
export function treeSelectChecks(
  items: readonly TreeSelectLabeledValue[],
  conduction: boolean,
  index: TreeSelectIndex
) {
  const raw = items.filter(item => !item.halfChecked).map(item => item.value);
  if (!conduction) return {
    checked: raw,
    halfChecked: items.filter(item => item.halfChecked).map(item => item.value)
  };
  const checked = conductTreeCheck(raw, index);
  return {
    checked: [...new Set([...raw
      .filter(value => !index
        .values
        .has(value)), ...checked
          .checked])] as TreeSelectRawValue[],
    halfChecked: checked.halfChecked as TreeSelectRawValue[]
  };
}
export function treeSelectStrategy(
  values: readonly TreeSelectRawValue[],
  strategy: TreeSelectStrategy,
  index: TreeSelectIndex
): TreeSelectRawValue[] {
  const selected = new Set<TreeKey>(values);
  return values.filter(key => {
    const entry = index.entities.get(String(key));
    if (!entry) return true;
    if (strategy === 'SHOW_CHILD') return !entry.children.some(child => selected.has(child.key))
      || !entry.children.every(
        child => treeCheckDisabled(child.node) || selected.has(child.key)
      );
    if (strategy === 'SHOW_PARENT') return !entry.parent
      || treeCheckDisabled(entry.node)
      || treeCheckDisabled(
        entry.parent.node
      )
      || !selected.has(
        entry.parent.key
      );
    return true;
  });
}
export function treeSelectLabels(
  items: readonly TreeSelectLabeledValue[],
  index: TreeSelectIndex,
  labelProp?: string,
  previous: readonly TreeSelectLabeledValue[] = items
): TreeSelectLabeledValue[] {
  return items.map(item => {
    const node = index.values.get(item.value);
    return {
      label: item.label
        ?? (node
          ? labelProp ? node[labelProp] as TreeSelectLabel | undefined : node.title ?? node.label
          : previous.find(old => old.value === item.value)?.label),
      value: item.value,
      halfChecked: item.halfChecked,
      disabled: node?.disabled
    };
  });
}
export function filterTreeSelect(
  nodes: readonly TreeSelectNode[],
  search: string,
  config: TreeSelectSearchConfig
): readonly TreeSelectNode[] {
  if (!search || config.filterTreeNode === false) return nodes;
  const filter = typeof config.filterTreeNode === 'function'
    ? config.filterTreeNode
    : (text: string, node: TreeSelectNode) => String(node[config.treeNodeFilterProp
      ?? 'value']).toUpperCase().includes(
        text.toUpperCase()
      );
  function visit(list: readonly TreeSelectNode[], keepAll = false): TreeSelectNode[] {
    return list.flatMap(node => {
      const match = keepAll || filter(search, { ...node });
      const children = visit(node.children ?? [], match);
      return match || children.length ? [{ ...node, isLeaf: undefined, children }] : [];
    });
  }
  return visit(nodes);
}
export function toggleTreeSelect(
  value: TreeSelectRawValue,
  selected: boolean,
  items: readonly TreeSelectLabeledValue[],
  checks: ReturnType<typeof treeSelectChecks>,
  conduction: boolean,
  index: TreeSelectIndex
): TreeSelectRawValue[] {
  const raw = selected
    ? [...items.filter(item => !item.halfChecked).map(item => item.value), value]
    : checks.checked.filter(item => item !== value);
  if (!conduction) return raw;
  const missing = raw.filter(item => !index.values.has(item));
  const known = raw.filter(item => index.values.has(item));
  const result = selected
    ? conductTreeCheck(known, index)
    : conductTreeCheck(known, index, checks.halfChecked);
  return [...missing, ...result.checked as TreeSelectRawValue[]];
}
