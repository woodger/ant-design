import type { Snippet } from 'svelte';

export type AlertType = 'success' | 'info' | 'warning' | 'error';
export type AlertVariant = 'outlined' | 'filled';
export type AlertContent = string | Snippet;

export interface AlertClosable {
  disabled?: boolean;
  closeIcon?: AlertContent;
  onClose?: (event: MouseEvent) => void;
  afterClose?: () => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** Сообщение со статусом, действием и отменяемым закрытием с завершением анимации. */
export interface AlertProps {
  type?: AlertType;
  /** @defaultValue 'outlined' */
  variant?: AlertVariant;
  title?: AlertContent;
  description?: AlertContent;
  showIcon?: boolean;
  icon?: Snippet;
  action?: Snippet;
  /** @defaultValue false */
  banner?: boolean;
  /** @defaultValue false */
  closable?: boolean | AlertClosable;
  role?: 'alert' | 'status';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  /** @defaultValue true */
  'aria-atomic'?: boolean;
  class?: string;
  style?: string;
}
