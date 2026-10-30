import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type TreeKey = string | number | bigint;
export interface TreeDataNode {
  key: TreeKey; title?: string | number | Snippet<[TreeDataNode]>; children?: readonly TreeDataNode[];
  disabled?: boolean; disableCheckbox?: boolean; checkable?: boolean; selectable?: boolean; isLeaf?: boolean;
  icon?: Snippet<[TreeEventNode]>; class?: string; style?: string;
}
export interface TreeEventNode extends TreeDataNode {
  expanded: boolean; selected: boolean; checked: boolean; halfChecked: boolean; loaded: boolean; loading: boolean;
  pos: string; active: boolean; dragOver: false; dragOverGapTop: false; dragOverGapBottom: false;
}
export interface TreeCheckedKeys { checked: readonly TreeKey[]; halfChecked: readonly TreeKey[]; }
export interface TreeCheckInfo {
  event: 'check'; node: TreeEventNode; checked: boolean; nativeEvent?: MouseEvent | KeyboardEvent;
  checkedNodes: TreeDataNode[]; checkedNodesPositions?: {node: TreeDataNode; pos: string}[]; halfCheckedKeys?: TreeKey[];
}
export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onselect'> {
  treeData?: readonly TreeDataNode[];
  expandedKeys?: readonly TreeKey[]; defaultExpandedKeys?: readonly TreeKey[];
  defaultExpandAll?: boolean; defaultExpandParent?: boolean; autoExpandParent?: boolean;
  selectedKeys?: readonly TreeKey[]; defaultSelectedKeys?: readonly TreeKey[]; selectable?: boolean; multiple?: boolean;
  checkable?: boolean; checkStrictly?: boolean; checkedKeys?: readonly TreeKey[] | TreeCheckedKeys; defaultCheckedKeys?: readonly TreeKey[];
  disabled?: boolean; loadedKeys?: readonly TreeKey[];
  loadData?: (node: TreeEventNode) => PromiseLike<unknown>;
  onExpand?: (keys: TreeKey[], info: {expanded: boolean; node: TreeEventNode; nativeEvent?: MouseEvent | KeyboardEvent}) => void;
  onSelect?: (keys: TreeKey[], info: {event:'select'; selected:boolean; node:TreeEventNode; selectedNodes:TreeDataNode[]; nativeEvent?:MouseEvent | KeyboardEvent}) => void;
  onCheck?: (keys: TreeKey[] | TreeCheckedKeys, info: TreeCheckInfo) => void;
  onLoad?: (keys: TreeKey[], info: {event:'load'; node:TreeEventNode}) => void;
  onClick?: (event: MouseEvent, node: TreeEventNode) => void; onDoubleClick?: (event: MouseEvent, node: TreeEventNode) => void;
  onRightClick?: (info: {event: MouseEvent; node: TreeEventNode}) => void;
  onActiveChange?: (key: TreeKey | null) => void;
  activeKey?: TreeKey | null;
  showIcon?: boolean; showLine?: boolean | {showLeafIcon: boolean}; blockNode?: boolean;
  icon?: Snippet<[TreeEventNode]>; switcherIcon?: Snippet<[TreeEventNode]>; switcherLoadingIcon?: Snippet<[TreeEventNode]>;
  titleRender?: Snippet<[TreeDataNode]>; filterTreeNode?: (node: TreeEventNode) => boolean;
  focusable?: boolean; height?: number; rootClassName?: string; nativeElement?: HTMLDivElement;
}
