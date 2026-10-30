import type { Snippet } from 'svelte';
import type { ButtonProps } from './Button.svelte';
import type { PopoverContent, PopoverPlacement } from './popover.types';

/** Подтверждение действия с Promise, состоянием ожидания и защитой от позднего результата. */
export interface PopconfirmProps {
  children: Snippet;
  title: PopoverContent;
  description?: PopoverContent | null;
  icon?: Snippet | null;
  /** Поддерживает bind:open. */
  open?: boolean | undefined;
  /** @defaultValue false */
  defaultOpen?: boolean;
  disabled?: boolean;
  /** @defaultValue true */
  showCancel?: boolean;
  okText?: string;
  cancelText?: string;
  /** @defaultValue 'primary' */
  okType?: ButtonProps['type'];
  okButtonProps?: Omit<ButtonProps, 'children' | 'htmlType' | 'loading'>;
  cancelButtonProps?: Omit<ButtonProps, 'children' | 'htmlType' | 'loading'>;
  /** @defaultValue 'top' */
  placement?: PopoverPlacement;
  /** @defaultValue true */
  arrow?: boolean;
  /** @defaultValue true */
  autoAdjustOverflow?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Promise удерживает loading; rejection сохраняет возможность повтора. */
  onConfirm?: (event: MouseEvent) => void | PromiseLike<unknown>;
  onCancel?: (event: MouseEvent) => void;
  onError?: (error: unknown) => void;
  class?: string;
  style?: string;
}
