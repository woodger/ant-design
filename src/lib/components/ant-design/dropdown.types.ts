import type { Snippet } from 'svelte';

export type DropdownPlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
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
  onClick?: (info: DropdownClickInfo) => void;
}

export interface DropdownDivider {
  key: string;
  type: 'divider';
}

export type DropdownItem = DropdownMenuItem | DropdownDivider;

export interface DropdownMenuProps {
  items: readonly DropdownItem[];
  onClick?: (info: DropdownClickInfo) => void;
}

export interface DropdownProps {
  children: Snippet;
  menu: DropdownMenuProps;
  open?: boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: DropdownTrigger | readonly DropdownTrigger[];
  disabled?: boolean;
  placement?: DropdownPlacement;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  'aria-label'?: string;
  class?: string;
  style?: string;
}
