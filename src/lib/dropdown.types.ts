import type { Snippet } from 'svelte';

export type DropdownPlacement =
  'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight';
export type DropdownTrigger = 'hover' | 'click';

export interface DropdownClickInfo {
  key: string;
  domEvent: MouseEvent;
}

export interface DropdownMenuItem {
  key: string;
  type?: 'item';
  label: string | Snippet;
  textValue?: string;
  icon?: Snippet;
  disabled?: boolean;
  danger?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (info: DropdownClickInfo) => void;
}

export interface DropdownDivider {
  key: string;
  type: 'divider';
}

export type DropdownItem = DropdownMenuItem | DropdownDivider;

/** Данные плоского меню команд Dropdown. */
export interface DropdownMenuProps {
  items: readonly DropdownItem[];
  onClick?: (info: DropdownClickInfo) => void;
}

/** Меню команд у trigger snippet с клавиатурой, hover/click и возвратом фокуса. */
export interface DropdownProps {
  children: Snippet;
  menu: DropdownMenuProps;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: DropdownTrigger | readonly DropdownTrigger[];
  disabled?: boolean;
  placement?: DropdownPlacement;
  /** @defaultValue false */
  arrow?: boolean;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean;
  /** @defaultValue 0.1 */
  mouseEnterDelay?: number;
  /** @defaultValue 0.1 */
  mouseLeaveDelay?: number;
  'aria-label'?: string;
  class?: string;
  style?: string;
}
