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
  onTitleClick?: (info: { key: string; domEvent: MouseEvent | KeyboardEvent; }) => void;
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
export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: string[];
}
/** Дерево пунктов навигации со ссылками, выбором, подменю и клавиатурой. */
export interface MenuProps extends Omit<
  HTMLAttributes<HTMLUListElement>,
  'children' | 'onselect'
> {
  items?: readonly MenuItemType[];
  /** @defaultValue 'vertical' */
  mode?: MenuMode;
  /** @defaultValue 'light' */
  theme?: MenuTheme;
  /** @defaultValue false */
  disabled?: boolean;
  selectedKeys?: readonly string[];
  /** Начальное локальное значение; последующие изменения prop не переинициализируют состояние. */
  defaultSelectedKeys?: readonly string[];
  /** @defaultValue false */
  multiple?: boolean;
  /** @defaultValue true */
  selectable?: boolean;
  openKeys?: readonly string[];
  defaultOpenKeys?: readonly string[];
  onOpenChange?: (keys: string[]) => void;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onDeselect?: (info: MenuSelectInfo) => void;
  /** @defaultValue 24 */
  inlineIndent?: number;
  inlineCollapsed?: boolean;
  /** @defaultValue false */
  forceSubMenuRender?: boolean;
  /** @defaultValue 'hover' */
  triggerSubMenuAction?: 'hover' | 'click';
  /** @defaultValue 0.1 */
  subMenuOpenDelay?: number;
  /** @defaultValue 0.1 */
  subMenuCloseDelay?: number;
  rootClassName?: string;
  /** Нативный ref доступен после mount и очищается при unmount. */
  nativeElement?: HTMLUListElement;
}
