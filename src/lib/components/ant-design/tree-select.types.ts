import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TreeEventNode, TreeKey } from './tree.types';
export type TreeSelectRawValue = string | number;
export type TreeSelectLabel = string | number | Snippet;
export interface TreeSelectLabeledValue { value: TreeSelectRawValue; label?: TreeSelectLabel; halfChecked?: boolean; disabled?: boolean; }
export type TreeSelectValue = TreeSelectRawValue | TreeSelectLabeledValue | readonly (TreeSelectRawValue | TreeSelectLabeledValue)[] | null | undefined;
export interface TreeSelectNode {
  value: TreeSelectRawValue; key?: TreeKey; title?: TreeSelectLabel; label?: TreeSelectLabel; children?: readonly TreeSelectNode[];
  disabled?: boolean; disableCheckbox?: boolean; checkable?: boolean; selectable?: boolean; isLeaf?: boolean;
  [property: string]: unknown;
}
export type TreeSelectStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
export interface TreeSelectSearchConfig {
  searchValue?: string; onSearch?: (value: string) => void; autoClearSearchValue?: boolean;
  filterTreeNode?: boolean | ((search: string, node: TreeSelectNode) => boolean); treeNodeFilterProp?: string;
}
export interface TreeSelectChangeInfo { preValue: TreeSelectLabeledValue[]; triggerValue?: TreeSelectRawValue; selected?: boolean; checked?: boolean; }
export interface TreeSelectProps<ValueType extends TreeSelectValue = TreeSelectValue> extends Omit<HTMLInputAttributes, 'value' | 'defaultValue' | 'size' | 'type' | 'children' | 'onchange' | 'oninput'> {
  treeData?: readonly TreeSelectNode[]; value?: ValueType; defaultValue?: ValueType; multiple?: boolean;
  treeCheckable?: boolean; treeCheckStrictly?: boolean; labelInValue?: boolean; showCheckedStrategy?: TreeSelectStrategy;
  onChange?: (value: ValueType, labels: TreeSelectLabel[] | null, extra: TreeSelectChangeInfo) => void;
  onSelect?: (value: TreeSelectRawValue, node: TreeSelectNode | undefined) => void;
  onDeselect?: (value: TreeSelectRawValue, node: TreeSelectNode | undefined) => void;
  showSearch?: boolean | TreeSelectSearchConfig; searchValue?: string; onSearch?: (search: string) => void;
  autoClearSearchValue?: boolean; filterTreeNode?: TreeSelectSearchConfig['filterTreeNode']; treeNodeFilterProp?: string; treeNodeLabelProp?: string;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  allowClear?: boolean; onClear?: () => void; notFoundContent?: TreeSelectLabel | null; loading?: boolean;
  treeExpandedKeys?: readonly TreeKey[]; treeDefaultExpandedKeys?: readonly TreeKey[]; treeDefaultExpandAll?: boolean; onTreeExpand?: (keys: TreeKey[]) => void;
  treeLoadedKeys?: readonly TreeKey[]; onTreeLoad?: (keys: TreeKey[]) => void; loadData?: (node: TreeEventNode & TreeSelectNode) => PromiseLike<unknown>;
  treeLine?: boolean | {showLeafIcon: boolean}; treeIcon?: boolean; switcherIcon?: Snippet<[TreeEventNode]>; treeTitleRender?: Snippet<[TreeSelectNode]>;
  listHeight?: number; popupMatchSelectWidth?: boolean | number; placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll']; popupClassName?: string; rootClassName?: string;
  size?: ComponentSize; status?: 'error' | 'warning'; variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  nativeElement?: HTMLDivElement; inputElement?: HTMLInputElement;
}
