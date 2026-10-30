import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type MenuMode = 'vertical' | 'horizontal' | 'inline';
export type MenuTheme = 'light' | 'dark';
export type MenuContent = string | number | Snippet;

interface MenuCommon {
  key?: string | number;
  label?: MenuContent;
  class?: string;
  style?: string;
}
export interface MenuItem extends MenuCommon {
  type?: 'item';
  key: string | number;
  icon?: Snippet;
  extra?: MenuContent;
  title?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: (info: MenuClickInfo) => void;
}
export interface MenuSubMenu extends MenuCommon {
  type?: 'submenu';
  key: string | number;
  children: readonly MenuItemType[];
  icon?: Snippet;
  title?: string;
  disabled?: boolean;
  theme?: MenuTheme;
  popupClassName?: string;
  onClick?: (info: MenuClickInfo) => void;
  onTitleClick?: (info: { key: string; domEvent: MouseEvent | KeyboardEvent }) => void;
}
export interface MenuGroup extends MenuCommon {
  type: 'group';
  children?: readonly MenuItemType[];
}
export interface MenuDivider extends Omit<MenuCommon, 'label'> {
  type: 'divider';
  dashed?: boolean;
}
export type MenuItemType = MenuItem | MenuSubMenu | MenuGroup | MenuDivider | null;

export interface MenuClickInfo {
  key: string;
  keyPath: string[];
  domEvent: MouseEvent | KeyboardEvent;
  itemData: MenuItem;
}
export interface MenuSelectInfo extends MenuClickInfo { selectedKeys: string[]; }
export interface MenuProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children' | 'onselect'> {
  items?: readonly MenuItemType[];
  mode?: MenuMode;
  theme?: MenuTheme;
  disabled?: boolean;
  selectedKeys?: readonly string[];
  defaultSelectedKeys?: readonly string[];
  multiple?: boolean;
  selectable?: boolean;
  openKeys?: readonly string[];
  defaultOpenKeys?: readonly string[];
  onOpenChange?: (keys: string[]) => void;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onDeselect?: (info: MenuSelectInfo) => void;
  inlineIndent?: number;
  inlineCollapsed?: boolean;
  forceSubMenuRender?: boolean;
  triggerSubMenuAction?: 'hover' | 'click';
  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  rootClassName?: string;
  nativeElement?: HTMLUListElement;
}
