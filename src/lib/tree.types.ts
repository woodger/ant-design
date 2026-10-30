import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type TreeKey = string | number | bigint;
export interface TreeDataNode {
  key: TreeKey;
  title?: string | number | Snippet<[TreeDataNode]>;
  children?: readonly TreeDataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  icon?: Snippet<[TreeEventNode]>;
  class?: string;
  style?: string;
}
export interface TreeEventNode extends TreeDataNode {
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  halfChecked: boolean;
  loaded: boolean;
  loading: boolean;
  pos: string;
  active: boolean;
  dragOver: false;
  dragOverGapTop: false;
  dragOverGapBottom: false;
}
export interface TreeCheckedKeys {
  checked: readonly TreeKey[];
  halfChecked: readonly TreeKey[];
}
export interface TreeCheckInfo {
  event: 'check';
  node: TreeEventNode;
  checked: boolean;
  nativeEvent?: MouseEvent | KeyboardEvent;
  checkedNodes: TreeDataNode[];
  checkedNodesPositions?: { node: TreeDataNode; pos: string; }[];
  halfCheckedKeys?: TreeKey[];
}
/** Дерево со стабильными keys, раскрытием, выбором, отметками и lazy children. */
export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onselect'> {
  treeData?: readonly TreeDataNode[];
  /** Управляемые ключи раскрытия; изменения запрашиваются через onExpand. */
  expandedKeys?: readonly TreeKey[];
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultExpandedKeys?: readonly TreeKey[];
  /** @defaultValue false */
  defaultExpandAll?: boolean;
  /** @defaultValue true */
  defaultExpandParent?: boolean;
  /** @defaultValue false */
  autoExpandParent?: boolean;
  /** Управляемые ключи выбора; стабильные keys обязательны. */
  selectedKeys?: readonly TreeKey[];
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultSelectedKeys?: readonly TreeKey[];
  /** @defaultValue true */
  selectable?: boolean;
  /** @defaultValue false */
  multiple?: boolean;
  /** @defaultValue false */
  checkable?: boolean;
  /** @defaultValue false */
  checkStrictly?: boolean;
  checkedKeys?: readonly TreeKey[] | TreeCheckedKeys;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultCheckedKeys?: readonly TreeKey[];
  disabled?: boolean;
  loadedKeys?: readonly TreeKey[];
  /** Promise загрузки детей; обновление treeData остаётся у потребителя. */
  loadData?: (node: TreeEventNode) => PromiseLike<unknown>;
  onExpand?: (
    keys: TreeKey[],
    info: { expanded: boolean; node: TreeEventNode; nativeEvent?: MouseEvent | KeyboardEvent; }
  ) => void;
  onSelect?: (
    keys: TreeKey[],
    info: {
      event: 'select';
      selected: boolean;
      node: TreeEventNode;
      selectedNodes: TreeDataNode[];
      nativeEvent?: MouseEvent | KeyboardEvent;
    }
  ) => void;
  onCheck?: (keys: TreeKey[] | TreeCheckedKeys, info: TreeCheckInfo) => void;
  onLoad?: (keys: TreeKey[], info: { event: 'load'; node: TreeEventNode; }) => void;
  onClick?: (event: MouseEvent, node: TreeEventNode) => void;
  onDoubleClick?: (event: MouseEvent, node: TreeEventNode) => void;
  onRightClick?: (info: { event: MouseEvent; node: TreeEventNode; }) => void;
  onActiveChange?: (key: TreeKey | null) => void;
  activeKey?: TreeKey | null;
  /** @defaultValue false */
  showIcon?: boolean;
  /** @defaultValue false */
  showLine?: boolean | { showLeafIcon: boolean; };
  /** @defaultValue false */
  blockNode?: boolean;
  icon?: Snippet<[TreeEventNode]>;
  switcherIcon?: Snippet<[TreeEventNode]>;
  switcherLoadingIcon?: Snippet<[TreeEventNode]>;
  titleRender?: Snippet<[TreeDataNode]>;
  filterTreeNode?: (node: TreeEventNode) => boolean;
  /** @defaultValue true */
  focusable?: boolean;
  height?: number;
  rootClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
}
