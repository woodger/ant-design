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

export interface AlertProps {
  type?: AlertType;
  variant?: AlertVariant;
  title?: AlertContent;
  description?: AlertContent;
  showIcon?: boolean;
  icon?: Snippet;
  action?: Snippet;
  banner?: boolean;
  closable?: boolean | AlertClosable;
  role?: 'alert' | 'status';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-atomic'?: boolean;
  class?: string;
  style?: string;
}
