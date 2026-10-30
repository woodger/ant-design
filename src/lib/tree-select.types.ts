import type { Snippet } from 'svelte';
import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
import type { ComponentSize } from './types';
import type { TreeEventNode, TreeKey } from './tree.types';
export type TreeSelectRawValue = string | number;
export type TreeSelectLabel = string | number | Snippet;
export interface TreeSelectLabeledValue {
  value: TreeSelectRawValue;
  label?: TreeSelectLabel;
  halfChecked?: boolean;
  disabled?: boolean;
}
export type TreeSelectValue =
  TreeSelectRawValue
  | TreeSelectLabeledValue
  | readonly (TreeSelectRawValue | TreeSelectLabeledValue)[]
  | null
  | undefined;
export interface TreeSelectNode {
  value: TreeSelectRawValue;
  key?: TreeKey;
  title?: TreeSelectLabel;
  label?: TreeSelectLabel;
  children?: readonly TreeSelectNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  [property: string]: unknown;
}
export type TreeSelectStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
/** Поиск и фильтрация дерева TreeSelect, включая controlled searchValue. */
export interface TreeSelectSearchConfig {
  searchValue?: string;
  onSearch?: (value: string) => void;
  autoClearSearchValue?: boolean;
  filterTreeNode?: boolean | ((search: string, node: TreeSelectNode) => boolean);
  treeNodeFilterProp?: string;
}
export interface TreeSelectChangeInfo {
  preValue: TreeSelectLabeledValue[];
  triggerValue?: TreeSelectRawValue;
  selected?: boolean;
  checked?: boolean;
}
/** Single/multiple выбор узлов дерева с check strategies, поиском и lazy load. */
export interface TreeSelectProps<ValueType extends TreeSelectValue = TreeSelectValue> extends Omit<
  HTMLInputAttributes,
  'value' | 'defaultValue' | 'size' | 'type' | 'children' | 'onchange' | 'oninput'
> {
  treeData?: readonly TreeSelectNode[];
  /** Управляемое значение; владелец принимает результат через onChange. */
  value?: ValueType;
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultValue?: ValueType;
  /** @defaultValue false */
  multiple?: boolean;
  /** @defaultValue false */
  treeCheckable?: boolean;
  /** Независимые checkbox; также включает labelInValue. */
  treeCheckStrictly?: boolean;
  /** @defaultValue false */
  labelInValue?: boolean;
  showCheckedStrategy?: TreeSelectStrategy;
  onChange?: (
    value: ValueType,
    labels: TreeSelectLabel[] | null,
    extra: TreeSelectChangeInfo
  ) => void;
  onSelect?: (value: TreeSelectRawValue, node: TreeSelectNode | undefined) => void;
  onDeselect?: (value: TreeSelectRawValue, node: TreeSelectNode | undefined) => void;
  showSearch?: boolean | TreeSelectSearchConfig;
  /** Управляемая строка поиска; отсутствующее значение оставляет локальный поиск. */
  searchValue?: string;
  onSearch?: (search: string) => void;
  autoClearSearchValue?: boolean;
  filterTreeNode?: TreeSelectSearchConfig['filterTreeNode'];
  treeNodeFilterProp?: string;
  treeNodeLabelProp?: string;
  open?: boolean;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @defaultValue false */
  allowClear?: boolean;
  onClear?: () => void;
  notFoundContent?: TreeSelectLabel | null;
  /** @defaultValue false */
  loading?: boolean;
  treeExpandedKeys?: readonly TreeKey[];
  treeDefaultExpandedKeys?: readonly TreeKey[];
  /** @defaultValue false */
  treeDefaultExpandAll?: boolean;
  onTreeExpand?: (keys: TreeKey[]) => void;
  treeLoadedKeys?: readonly TreeKey[];
  onTreeLoad?: (keys: TreeKey[]) => void;
  /** Асинхронная загрузка children; во время поиска не запускается. */
  loadData?: (node: TreeEventNode & TreeSelectNode) => PromiseLike<unknown>;
  /** @defaultValue false */
  treeLine?: boolean | { showLeafIcon: boolean; };
  /** @defaultValue false */
  treeIcon?: boolean;
  switcherIcon?: Snippet<[TreeEventNode]>;
  treeTitleRender?: Snippet<[TreeSelectNode]>;
  /** @defaultValue 256 */
  listHeight?: number;
  /** @defaultValue true */
  popupMatchSelectWidth?: boolean | number;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  onPopupScroll?: HTMLAttributes<HTMLDivElement>['onscroll'];
  /** @defaultValue '' */
  popupClassName?: string;
  rootClassName?: string;
  size?: ComponentSize;
  status?: 'error' | 'warning';
  /** @defaultValue 'outlined' */
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLDivElement;
  /** Нативный ref доступен после mount и очищается при unmount. */
  inputElement?: HTMLInputElement;
}
