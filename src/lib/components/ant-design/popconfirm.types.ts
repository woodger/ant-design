import type { Snippet } from 'svelte';
import type { ButtonProps } from './Button.svelte';
import type { PopoverContent, PopoverPlacement } from './popover.types';

export interface PopconfirmProps {
  children: Snippet;
  title: PopoverContent;
  description?: PopoverContent | null;
  icon?: Snippet | null;
  open?: boolean | undefined;
  defaultOpen?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
  okText?: string;
  cancelText?: string;
  okType?: ButtonProps['type'];
  okButtonProps?: Omit<ButtonProps, 'children' | 'htmlType' | 'loading'>;
  cancelButtonProps?: Omit<ButtonProps, 'children' | 'htmlType' | 'loading'>;
  placement?: PopoverPlacement;
  arrow?: boolean;
  autoAdjustOverflow?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (event: MouseEvent) => void | PromiseLike<unknown>;
  onCancel?: (event: MouseEvent) => void;
  onError?: (error: unknown) => void;
  class?: string;
  style?: string;
}
